import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = 'http://localhost:3000';
const PORT = 9333;
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

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/rooteco-qa-chrome',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--hide-scrollbars',
  'about:blank',
], { stdio: 'ignore' });

async function waitForDebugger() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return res.json();
    } catch {}
    await sleep(250);
  }
  throw new Error('chrome debugger not reachable');
}
await waitForDebugger();

const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json());
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = (message) => {
  const payload = JSON.parse(message.data);
  if (payload.id && pending.has(payload.id)) {
    const { resolve, reject } = pending.get(payload.id);
    pending.delete(payload.id);
    if (payload.error) reject(new Error(payload.error.message));
    else resolve(payload.result);
  } else if (payload.method) {
    events.push(payload);
  }
};
function send(method, params = {}) {
  const messageId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(messageId, { resolve, reject });
    ws.send(JSON.stringify({ id: messageId, method, params }));
  });
}

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Network.setCookie', {
  name: 'rooteco_session',
  value: sessionValue,
  domain: 'localhost',
  path: '/',
  httpOnly: true,
  secure: false,
});

async function waitForLoad() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const state = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
    if (state.result?.value === 'complete') return;
    await sleep(150);
  }
}

const pages = [];
async function shot(name, path, width, height = 900, mobile = false) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
  events.length = 0;
  await send('Page.navigate', { url: BASE + path });
  await waitForLoad();
  await sleep(1800);
  const metrics = await send('Page.getLayoutMetrics');
  const size = metrics.cssContentSize;
  const fullHeight = Math.min(size.height, 12000);
  const capture = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height: fullHeight, scale: 1 },
  });
  const file = `${OUT}/${name}.png`;
  writeFileSync(file, Buffer.from(capture.data, 'base64'));

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const doc = document.documentElement;
      const path = location.pathname;
      const broken = [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 5);
      const overflow = doc.scrollWidth - window.innerWidth;
      return { path, title: document.title, width: window.innerWidth, docWidth: doc.scrollWidth, overflow, broken, height: doc.scrollHeight };
    })()`,
    returnByValue: true,
  });
  const consoleErrors = events
    .filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error'))
    .map((e) => e.params?.exceptionDetails?.exception?.description || e.params?.args?.map((a) => a.value || a.description).join(' '))
    .slice(0, 5);
  const failed = events
    .filter((e) => e.method === 'Network.loadingFailed')
    .map((e) => `${e.params.type} ${e.params.errorText}`)
    .slice(0, 5);

  pages.push({ name, ...info.result.value, consoleErrors, failed });
  console.log(`shot ${name} ${width}px -> ${file} ${JSON.stringify({ ...info.result.value, consoleErrors, failed })}`);
}

const cats = await fetch(`${BASE}/api/categories`, { headers: { cookie: cookieHeader } }).then((r) => r.json());
const products = await fetch(`${BASE}/api/products?pageSize=5`, { headers: { cookie: cookieHeader } }).then((r) => r.json());
const categorySlug = cats.data?.[0]?.slug;
const productSlug = products.data?.[0]?.slug;

await shot('dashboard-1440', '/dashboard', 1440, 1000);
await shot('dashboard-1024', '/dashboard', 1024, 900);
await shot('dashboard-820', '/dashboard', 820, 900);
await shot('dashboard-390', '/dashboard', 390, 844, true);
await shot('home-1440', '/', 1440, 1000);
await shot('home-390', '/', 390, 844, true);
await shot('products-1440', `/categories/${categorySlug}`, 1440, 1000);
await shot('products-390', `/categories/${categorySlug}`, 390, 844, true);
await shot('product-1440', `/products/${productSlug}`, 1440, 1000);
await shot('product-390', `/products/${productSlug}`, 390, 844, true);
await shot('quote-390', '/get-a-quote', 390, 844, true);
await shot('login-390', '/login', 390, 844, true);

writeFileSync(`${OUT}/summary.json`, JSON.stringify(pages, null, 2));
ws.close();
chrome.kill();
console.log('DONE');
