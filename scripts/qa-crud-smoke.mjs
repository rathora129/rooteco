import { readFileSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:3000';
const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

let cookie = '';
async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const setCookie = res.headers.getSetCookie?.() || [];
  for (const c of setCookie) {
    if (c.startsWith('rooteco_session=')) cookie = c.split(';')[0];
  }
  let json = null;
  const text = await res.text();
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 200) }; }
  return { status: res.status, json };
}

const results = [];
const record = (name, step, status, ok) => {
  results.push({ name, step, status, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${step} ${status}`);
};

async function login() {
  const res = await req('POST', '/api/auth/login', {
    email: env.OWNER_EMAIL,
    password: env.OWNER_PASSWORD,
  });
  record('auth', 'login', res.status, res.status === 200 && Boolean(cookie));
}

async function crud(name, base, payload, patch) {
  let createdId = null;
  try {
    const list = await req('GET', `${base}?page=1&pageSize=5`);
    record(name, 'list', list.status, list.status === 200 && Array.isArray(list.json?.data));

    if (list.status === 200) {
      const search = await req('GET', `${base}?q=${encodeURIComponent(payload.__q || 'a')}&page=1&pageSize=5`);
      record(name, 'search', search.status, search.status === 200);
    }

    const create = await req('POST', base, payload);
    record(name, 'create', create.status, create.status === 201);
    createdId = create.json?.data?.id || null;
    if (!createdId) return;

    const read = await req('GET', `${base}/${createdId}`);
    record(name, 'read', read.status, read.status === 200 && read.json?.data?.id === createdId);

    const update = await req('PATCH', `${base}/${createdId}`, patch);
    record(name, 'update', update.status, update.status === 200);

    const remove = await req('DELETE', `${base}/${createdId}`);
    record(name, 'delete', remove.status, remove.status === 200 && remove.json?.data?.id === createdId);
    createdId = null;

    const gone = await req('GET', `${base}/${createdId ?? remove.json?.data?.id}`);
    record(name, 'read-after-delete', gone.status, gone.status === 404);
  } finally {
    if (createdId) await req('DELETE', `${base}/${createdId}`);
  }
}

await login();
if (!cookie) {
  console.log('ABORT: no session cookie');
  process.exit(1);
}

const cats = await req('GET', '/api/categories?page=1&pageSize=1');
const categoryId = cats.json?.data?.[0]?.id;
if (!categoryId) {
  console.log('ABORT: no category to attach product');
  process.exit(1);
}

const stamp = Date.now().toString(36).toUpperCase();
await crud('products', '/api/products', {
  name: `QA Product ${stamp}`,
  categoryId,
  price: 1234,
  status: 'draft',
  __q: 'QA Product',
}, { price: 1300, name: `QA Product ${stamp} edited` });

await crud('categories', '/api/categories', {
  name: `QA Category ${stamp}`,
  status: 'draft',
}, { tagline: 'QA edited' });

await crud('collections', '/api/collections', {
  name: `QA Collection ${stamp}`,
  status: 'draft',
}, { description: 'QA edited' });

await crud('pages', '/api/content/pages', {
  title: `QA Page ${stamp}`,
  content: 'QA page body',
  status: 'draft',
}, { content: 'QA page body edited' });

await crud('banners', '/api/banners', {
  title: `QA Banner ${stamp}`,
  desktopImage: 'https://example.com/qa.jpg',
  primaryLabel: 'Shop',
  primaryUrl: '/products',
}, { subtitle: 'QA edited' });

await crud('blogs', '/api/blogs', {
  title: `QA Blog ${stamp}`,
  content: 'QA blog body',
  status: 'draft',
}, { excerpt: 'QA edited' });

await crud('testimonials', '/api/testimonials', {
  client: `QA Client ${stamp}`,
  review: 'QA review body',
}, { review: 'QA review edited' });

await crud('faqs', '/api/faqs', {
  question: `QA Question ${stamp}?`,
  answer: 'QA answer',
}, { answer: 'QA answer edited' });

await crud('coupons', '/api/marketing/coupons', {
  code: `QA${stamp.slice(-8)}`,
  type: 'percent',
  value: 10,
}, { value: 12 });

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('Failures:');
  for (const f of failed) console.log(` - ${f.name} ${f.step} -> ${f.status}`);
  process.exit(1);
}
