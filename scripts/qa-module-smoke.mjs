import { readFileSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:3000';
const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

let cookie = '';
async function req(method, path, body, useCookie = true) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(useCookie && cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const setCookie = res.headers.getSetCookie?.() || [];
  for (const c of setCookie) if (c.startsWith('rooteco_session=')) cookie = c.split(';')[0];
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 300) }; }
  return { status: res.status, json };
}

const results = [];
function check(name, step, status, ok, detail) {
  results.push({ name, step, status, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${step} ${status}${detail ? ` ${detail}` : ''}`);
}

async function login() {
  const res = await req('POST', '/api/auth/login', { email: env.OWNER_EMAIL, password: env.OWNER_PASSWORD }, false);
  check('auth', 'login', res.status, res.status === 200 && Boolean(cookie));
}

await login();
if (!cookie) { console.log('ABORT: no session cookie'); process.exit(1); }

// unauthenticated protection
{
  const orders = await req('GET', '/api/orders', null, false);
  check('auth', 'orders requires session', orders.status, orders.status === 401);
  const create = await req('POST', '/api/products', { name: 'x' }, false);
  check('auth', 'product create requires session', create.status, create.status === 401);
  const settings = await req('GET', '/api/settings', null, false);
  const pub = settings.json?.data;
  check(
    'auth',
    'settings public view returns safe groups',
    settings.status,
    settings.status === 200 && pub?.general?.siteName === 'RootEco' && typeof pub?.contact?.email === 'string'
  );
}

// products for order line item
const catalog = await req('GET', '/api/products?status=published&pageSize=20');
const product = (catalog.json?.data || []).find((p) => p.stock > 0) || (catalog.json?.data || [])[0];
check('catalog', 'published product available', catalog.status, Boolean(product));
if (!product) process.exit(1);

const stamp = Date.now().toString(36).toUpperCase();

// == ORDERS ==
let orderId = null;
{
  const create = await req('POST', '/api/orders', {
    customerName: `QA Order ${stamp}`,
    email: `qa.${stamp.toLowerCase()}@example.com`,
    phone: '9876500001',
    addressLine1: '1 QA Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    paymentMethod: 'cod',
    items: [{ slug: product.slug, qty: 1 }],
  });
  check('orders', 'public create', create.status, create.status === 201);
  orderId = create.json?.data?.id || null;
  if (orderId) {
    const list = await req('GET', '/api/orders?page=1&pageSize=5&q=' + encodeURIComponent(stamp));
    check('orders', 'admin list/search', list.status, list.status === 200 && (list.json?.data || []).some((o) => o.id === orderId));
    const read = await req('GET', `/api/orders/${orderId}`);
    check('orders', 'read', read.status, read.status === 200 && read.json?.data?.items?.length === 1);
    const patch = await req('PATCH', `/api/orders/${orderId}`, { status: 'processing', notes: 'QA note' });
    check('orders', 'update status + notes', patch.status, patch.status === 200 && patch.json?.data?.status === 'processing');
    const blocked = await req('PATCH', `/api/orders/${orderId}`, { paymentStatus: 'paid' });
    check('orders', 'paid blocked without provider', blocked.status, blocked.status === 422);
    const remove = await req('DELETE', `/api/orders/${orderId}`);
    check('orders', 'delete', remove.status, remove.status === 200 && remove.json?.data?.id === orderId);
    orderId = null;
  }
}

// == QUOTES ==
let quoteId = null;
let convertedOrderId = null;
{
  const create = await req('POST', '/api/quotes', {
    name: `QA Quote ${stamp}`,
    email: `qa.${stamp.toLowerCase()}@example.com`,
    phone: '9876500002',
    quantity: 2,
    productId: product.id,
    message: 'QA quote request',
  });
  check('quotes', 'public create', create.status, create.status === 201);
  quoteId = create.json?.data?.id || null;
  if (quoteId) {
    const list = await req('GET', '/api/quotes?page=1&pageSize=5&q=' + encodeURIComponent(stamp));
    check('quotes', 'admin list/search', list.status, list.status === 200 && (list.json?.data || []).some((q) => q.id === quoteId));
    const read = await req('GET', `/api/quotes/${quoteId}`);
    check('quotes', 'read with events', read.status, read.status === 200);
    const patch = await req('PATCH', `/api/quotes/${quoteId}`, { status: 'quoted', amount: 2400, internalNotes: 'QA note' });
    check('quotes', 'update amount/status', patch.status, patch.status === 200 && Number(patch.json?.data?.amount) === 2400);
    const convert = await req('POST', `/api/quotes/${quoteId}/convert`, {
      addressLine1: '1 QA Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', paymentMethod: 'bank-transfer',
    });
    check('quotes', 'convert to order', convert.status, convert.status === 201);
    convertedOrderId = convert.json?.data?.id || null;
    if (convertedOrderId) {
      const again = await req('POST', `/api/quotes/${quoteId}/convert`, {
        addressLine1: '1 QA Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001',
      });
      check('quotes', 'double convert blocked', again.status, again.status === 409);
      await req('DELETE', `/api/orders/${convertedOrderId}`);
      convertedOrderId = null;
    }
    const remove = await req('DELETE', `/api/quotes/${quoteId}`);
    check('quotes', 'delete', remove.status, remove.status === 200);
    quoteId = null;
  }
}

// == LEADS + FOLLOW-UPS + CLIENT ==
let leadId = null;
let clientId = null;
{
  const create = await req('POST', '/api/leads', {
    name: `QA Lead ${stamp}`,
    company: 'QA Co',
    email: `qa.${stamp.toLowerCase()}@example.com`,
    phone: '9876500003',
    city: 'Pune',
    source: 'qa',
    requirement: 'QA requirement',
  });
  check('leads', 'create', create.status, create.status === 201);
  leadId = create.json?.data?.id || null;
  clientId = create.json?.data?.clientId || null;
  if (leadId) {
    for (const [step, qs, want] of [
      ['list/search', `q=${encodeURIComponent(stamp)}`, 200],
      ['filter source', `source=qa`, 200],
      ['filter due', `due=true`, 200],
    ]) {
      const res = await req('GET', `/api/leads?page=1&pageSize=5&${qs}`);
      check('leads', step, res.status, res.status === want);
    }
    const patch = await req('PATCH', `/api/leads/${leadId}`, { status: 'contacted', notes: 'QA note' });
    check('leads', 'update', patch.status, patch.status === 200 && patch.json?.data?.status === 'contacted');

    let followUpId = null;
    const fu = await req('POST', `/api/leads/${leadId}/followups`, { dueDate: new Date().toISOString(), note: 'QA follow-up' });
    check('leads', 'follow-up create', fu.status, fu.status === 201);
    followUpId = fu.json?.data?.id || null;
    if (followUpId) {
      const fuPatch = await req('PATCH', `/api/leads/${leadId}/followups/${followUpId}`, { status: 'done' });
      check('leads', 'follow-up update', fuPatch.status, fuPatch.status === 200);
      const foreign = await req('PATCH', `/api/leads/${followUpId}/followups/${followUpId}`, { status: 'pending' });
      check('leads', 'follow-up scoped to lead', foreign.status, foreign.status === 404);
      const fuDelete = await req('DELETE', `/api/leads/${leadId}/followups/${followUpId}`);
      check('leads', 'follow-up delete', fuDelete.status, fuDelete.status === 200);
    }

    const csv = await fetch(BASE + '/api/leads/export?source=qa', { headers: { cookie } });
    const csvText = await csv.text();
    check('leads', 'export csv honours source filter', csv.status, csv.status === 200 && csvText.includes('QA Lead'));

    if (clientId) {
      const client = await req('GET', `/api/clients/${clientId}`);
      check('clients', 'read from lead', client.status, client.status === 200 && client.json?.data?.leads?.length >= 1);
      const cPatch = await req('PATCH', `/api/clients/${clientId}`, { notes: 'QA client note' });
      check('clients', 'update', cPatch.status, cPatch.status === 200);
    }

    const convert = await req('POST', `/api/leads/${leadId}/convert`, { status: 'won' });
    check('leads', 'convert to client', convert.status, convert.status === 200 && convert.json?.data?.lead?.status === 'won');

    const remove = await req('DELETE', `/api/leads/${leadId}`);
    check('leads', 'delete', remove.status, remove.status === 200);
    leadId = null;

    if (clientId) {
      const cDelete = await req('DELETE', `/api/clients/${clientId}`);
      check('clients', 'delete', cDelete.status, cDelete.status === 200);
      if (cDelete.status !== 200) check('clients', 'delete detail', cDelete.status, false, JSON.stringify(cDelete.json).slice(0, 160));
      clientId = null;
    }
  }
}

// == MEDIA (external record) ==
let mediaId = null;
{
  const create = await req('POST', '/api/media', { url: 'https://example.com/qa-image.jpg', alt: 'QA image', filename: 'qa-image.jpg' });
  check('media', 'create external', create.status, create.status === 201);
  mediaId = create.json?.data?.id || null;
  if (mediaId) {
    const list = await req('GET', '/api/media?q=qa-image');
    check('media', 'list/search', list.status, list.status === 200 && (list.json?.data || []).some((m) => m.id === mediaId));
    const patch = await req('PATCH', `/api/media/${mediaId}`, { alt: 'QA image edited' });
    check('media', 'update', patch.status, patch.status === 200 && patch.json?.data?.alt === 'QA image edited');
    const remove = await req('DELETE', `/api/media/${mediaId}`);
    check('media', 'delete', remove.status, remove.status === 200);
    mediaId = null;
  }
}

// == MARKETING / DASHBOARD / WHATSAPP ==
{
  const overview = await req('GET', '/api/dashboard/stats');
  check('dashboard', 'overview stats', overview.status, overview.status === 200);
  const marketing = await req('GET', '/api/marketing');
  check('marketing', 'overview', marketing.status, marketing.status === 200 && Boolean(marketing.json?.data?.events));
  const events = await req('GET', '/api/marketing/events?page=1&pageSize=5');
  check('marketing', 'events list', events.status, events.status === 200 && Array.isArray(events.json?.data));
  const waConfig = await req('GET', '/api/whatsapp/config');
  check('whatsapp', 'config', waConfig.status, waConfig.status === 200 && 'ready' in (waConfig.json?.data || {}));
  const waMessages = await req('GET', '/api/whatsapp/messages?page=1&pageSize=5');
  check('whatsapp', 'messages list', waMessages.status, waMessages.status === 200 && Array.isArray(waMessages.json?.data));
}

// == SETTINGS (round-trip, no value changes) ==
{
  const current = await req('GET', '/api/settings');
  check('settings', 'read owner view', current.status, current.status === 200 && Boolean(current.json?.data?.general));
  if (current.status === 200) {
    const data = current.json.data;
    const payload = {};
    for (const key of ['general', 'contact', 'social', 'footer', 'seo', 'marketing', 'whatsapp', 'store']) {
      if (data[key] !== undefined) payload[key] = data[key];
    }
    const put = await req('PUT', '/api/settings', payload);
    check('settings', 'update round-trip', put.status, put.status === 200, put.status !== 200 ? JSON.stringify(put.json).slice(0, 200) : '');
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('Failures:');
  for (const f of failed) console.log(` - ${f.name} ${f.step} -> ${f.status}`);
  process.exit(1);
}
