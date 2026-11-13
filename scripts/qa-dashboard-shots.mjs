import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = 'http://localhost:3000';
const PORT = 9335;
const OUT = '/tmp/rooteco-qa';
mkdirSync(OUT, { recursive: true });
const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}
const login = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: env.OWNER_EMAIL, password: env.OWNER_PASSWORD }),
});
const cookieHeader = login.headers.getSetCookie().find((c) => c.startsWith('rooteco_session='));
const sessionValue = cookieHeader.split(';')[0].split('=').slice(1).join('=');

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/rooteco-qa-chrome3',
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
async function shot(name, path, width, height = 1000) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600, screenWidth: width, screenHeight: height });
  events.length = 0;
  await send('Page.navigate', { url: BASE + path });
  await waitForLoad();
  await sleep(2200);
  const capture = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(capture.data, 'base64'));
  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const doc = document.documentElement;
      const tables = [...document.querySelectorAll('table')].map(t => ({ scroll: t.parentElement.scrollWidth, client: t.parentElement.clientWidth, overflow: getComputedStyle(t.parentElement).overflowX }));
      const broken = [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 5);
      const empty = document.body.innerText.includes('Something went wrong');
      return { path: location.pathname, width: innerWidth, overflow: doc.scrollWidth - innerWidth, tables, broken, errorState: empty };
    })()`,
    returnByValue: true,
  });
  const consoleErrors = events.filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error'))
    .map((e) => e.params?.exceptionDetails?.exception?.description || e.params?.args?.map((a) => a.value || a.description).join(' ')).slice(0, 3);
  const failed = events.filter((e) => e.method === 'Network.loadingFailed').map((e) => `${e.params.type} ${e.params.errorText}`).slice(0, 3);
  report.push({ name, ...info.result.value, consoleErrors, failed });
  console.log(`${name} ${JSON.stringify(info.result.value)} errors=${JSON.stringify(consoleErrors)}`);
}

const modules = ['products', 'orders', 'quotes', 'leads', 'marketing', 'media', 'settings', 'banners', 'pages', 'blogs', 'categories', 'collections', 'testimonials', 'faqs', 'whatsapp'];
for (const moduleName of modules) await shot(`dash-${moduleName}-1440`, `/dashboard/${moduleName}`, 1440);
for (const moduleName of ['products', 'orders', 'marketing', 'settings']) await shot(`dash-${moduleName}-390`, `/dashboard/${moduleName}`, 390, 844);

writeFileSync(`${OUT}/summary-dashboard.json`, JSON.stringify(report, null, 2));
ws.close();
chrome.kill();
console.log('DONE');
