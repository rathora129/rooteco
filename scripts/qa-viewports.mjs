import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = 'http://localhost:3000';
const PORT = 9334;
const OUT = '/tmp/rooteco-qa';
mkdirSync(OUT, { recursive: true });

const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const login = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: env.OWNER_EMAIL, password: env.OWNER_PASSWORD }),
});
if (login.status !== 200) throw new Error(`login failed ${login.status}`);
const cookieHeader = login.headers.getSetCookie().find((c) => c.startsWith('rooteco_session='));
const sessionValue = cookieHeader.split(';')[0].split('=').slice(1).join('=');

const cats = await fetch(`${BASE}/api/categories?pageSize=50`, { headers: { cookie: cookieHeader } }).then((r) => r.json());
const richCategory = (cats.data || [])
  .filter((c) => (c._count?.products || 0) > 0 && !c.parentId)
  .sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0))[0];
console.log('category', richCategory?.slug, richCategory?._count?.products);

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/rooteco-qa-chrome2',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

for (let i = 0; i < 60; i += 1) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) break; } catch {}
  await sleep(250);
}
const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json());
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = (message) => {
  const payload = JSON.parse(message.data);
  if (payload.id && pending.has(payload.id)) {
    const { resolve, reject } = pending.get(payload.id);
    pending.delete(payload.id);
    if (payload.error) reject(new Error(payload.error.message)); else resolve(payload.result);
  } else if (payload.method) events.push(payload);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const messageId = ++id;
  pending.set(messageId, { resolve, reject });
  ws.send(JSON.stringify({ id: messageId, method, params }));
});

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Network.setCookie', { name: 'rooteco_session', value: sessionValue, domain: 'localhost', path: '/', httpOnly: true, secure: false });

async function waitForLoad() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const state = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
    if (state.result?.value === 'complete') return;
    await sleep(150);
  }
}

const report = [];
async function shot(name, path, width, height, scrollY = 0, mobile = false) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
  events.length = 0;
  await send('Page.navigate', { url: BASE + path });
  await waitForLoad();
  await sleep(1500);
  if (scrollY) {
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${scrollY}); new Promise(r => setTimeout(r, 600))`, awaitPromise: true });
  }
  const capture = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(capture.data, 'base64'));
  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const doc = document.documentElement;
      const broken = [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 5);
      return { path: location.pathname, width: innerWidth, docWidth: doc.scrollWidth, overflow: doc.scrollWidth - innerWidth, scrollY, broken };
    })()`,
    returnByValue: true,
  });
  const consoleErrors = events.filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error'))
    .map((e) => e.params?.exceptionDetails?.exception?.description || e.params?.args?.map((a) => a.value || a.description).join(' ')).slice(0, 4);
  const failed = events.filter((e) => e.method === 'Network.loadingFailed').map((e) => `${e.params.type} ${e.params.errorText}`).slice(0, 4);
  report.push({ name, ...info.result.value, consoleErrors, failed });
  console.log(`shot ${name} ${JSON.stringify(info.result.value)} errors=${JSON.stringify(consoleErrors)} failed=${JSON.stringify(failed)}`);
}

const rich = `/categories/${richCategory.slug}`;
await shot('home-390-top', '/', 390, 844, 0, true);
await shot('home-390-mid1', '/', 390, 844, 900, true);
await shot('home-390-mid2', '/', 390, 844, 1800, true);
await shot('home-390-mid3', '/', 390, 844, 2700, true);
await shot('home-390-products', '/', 390, 844, 3600, true);
await shot('home-1440-top', '/', 1440, 1000, 0);
await shot('home-1440-mid', '/', 1440, 1000, 1000);
await shot('category-rich-390', rich, 390, 844, 0, true);
await shot('category-rich-390-grid', rich, 390, 844, 700, true);
await shot('category-rich-1440', rich, 1440, 1000, 0);
await shot('quote-390-top', '/get-a-quote', 390, 844, 0, true);
await shot('quote-390-form', '/get-a-quote', 390, 844, 800, true);
await shot('cart-390', '/cart', 390, 844, 0, true);

// logged-out login page
await send('Network.clearBrowserCookies');
await shot('login-390', '/login', 390, 844, 0, true);

writeFileSync(`${OUT}/summary-viewports.json`, JSON.stringify(report, null, 2));
ws.close();
chrome.kill();
console.log('DONE');
