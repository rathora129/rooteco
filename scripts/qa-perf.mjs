import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.env.QA_BASE || 'http://localhost:3000';
const PORT = 9336;
const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}
const login = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: env.OWNER_EMAIL, password: env.OWNER_PASSWORD }),
});
const sessionValue = login.headers.getSetCookie().find((c) => c.startsWith('rooteco_session=')).split(';')[0].split('=').slice(1).join('=');

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/rooteco-qa-chrome4',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank',
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
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Network.setCookie', { name: 'rooteco_session', value: sessionValue, domain: 'localhost', path: '/', httpOnly: true, secure: false });
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.__lcp = 0; new PerformanceObserver((list) => { const e = list.getEntries().pop(); if (e) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });`,
});

async function run(path, width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600, screenWidth: width, screenHeight: height });
  events.length = 0;
  await send('Page.navigate', { url: BASE + path });
  await sleep(4500);
  const metrics = await send('Runtime.evaluate', {
    expression: `(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const res = performance.getEntriesByType('resource');
      const api = res.filter(r => r.name.includes('/api/')).map(r => new URL(r.name).pathname + new URL(r.name).search);
      const counts = {};
      for (const a of api) counts[a] = (counts[a] || 0) + 1;
      const dupes = Object.entries(counts).filter(([, n]) => n > 1);
      return {
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
        load: Math.round(nav.loadEventEnd || 0),
        lcp: Math.round(window.__lcp || 0),
        resources: res.length,
        apiCalls: api.length,
        duplicateApi: dupes,
        transferKB: Math.round(res.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
      };
    })()`,
    returnByValue: true,
  });
  const scriptRequests = events.filter((e) => e.method === 'Network.requestWillBeSent' && /\.(js|css)(\?|$)/.test(e.params.request.url)).length;
  console.log(path, width, JSON.stringify({ ...metrics.result.value, jsCss: scriptRequests }));
}
await run('/dashboard', 1440, 1000);
await run('/dashboard', 390, 844);
await run('/', 1440, 1000);
await run('/', 390, 844);
ws.close();
chrome.kill();
