import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes, randomUUID, createHmac } from 'node:crypto';
import { build } from 'esbuild';
import { createCoffeeService } from '../netlify/lib/coffee.mjs';

const SITE = 'https://technightcity.com';
const ARTICLE = 'figma-to-frontend-web-mobile-workflow';
const clone = value => structuredClone(value);
const sign = (secret, value) => createHmac('sha256', secret).update(value).digest('hex');
function fixture() {
  const values = new Map(); let revision = 0, orderCalls = 0, providerCalls = 0, offline = false;
  const orders = new Map(), payments = new Map(), refunds = new Map();
  const env = { COFFEE_ENABLED: 'true', COFFEE_MODE: 'test', RAZORPAY_KEY_ID: 'rzp_test_fixturekey123', RAZORPAY_KEY_SECRET: randomBytes(24).toString('hex'), RAZORPAY_WEBHOOK_SECRET: randomBytes(32).toString('hex'), CONTEXT: 'deploy-preview', DEPLOY_PRIME_URL: 'https://coffee-preview.netlify.app' };
  const store = {
    async get(key, options) { assert.equal(options.consistency, 'strong'); if (offline) throw new Error('offline'); return clone(values.get(key)?.data ?? null); },
    async setJSON(key, value, options = {}) {
      if (offline) throw new Error('offline');
      if ((options.onlyIfNew && values.has(key)) || (options.onlyIfMatch && values.get(key)?.etag !== options.onlyIfMatch)) return { modified: false };
      const etag = String(++revision); values.set(key, { data: clone(value), etag }); return { modified: true, etag };
    },
  };
  let providerFailure = false, badOrder = false;
  const fetcher = async (url, options) => {
    providerCalls++; assert.equal(options.redirect, 'error'); assert.equal(options.headers.Authorization, 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64'));
    if (providerFailure) throw new TypeError('simulated connection failure');
    const path = new URL(url).pathname.replace('/v1', '');
    let data;
    if (path === '/orders' && options.method === 'POST') {
      orderCalls++; const input = JSON.parse(options.body); assert.equal(input.partial_payment, false);
      const id = 'order_' + String(orderCalls).padStart(12, '0');
      data = { ...input, id, status: 'created', amount_paid: 0, amount_due: input.amount };
      if (badOrder) data.amount++;
      orders.set(id, clone(data));
    } else if (/^\/orders\/[^/]+\/payments$/.test(path)) data = { items: [...payments.values()].filter(p => p.order_id === path.split('/')[2]) };
    else if (path.startsWith('/orders/')) data = orders.get(path.slice(8));
    else if (path.startsWith('/payments/')) data = payments.get(path.slice(10));
    else if (path.startsWith('/refunds/')) data = refunds.get(path.slice(9));
    return new Response(JSON.stringify(data || {}), { status: data ? 200 : 404 });
  };
  const service = createCoffeeService({ getStore(options) { assert.equal(options.consistency, 'strong'); assert.equal(options.name, `coffee-${env.COFFEE_MODE}-v1`); return store; }, articles: new Set([ARTICLE]), readEnv: () => env, fetch: fetcher, now: () => 1800000000000 });
  const intent = () => ({ amount: 10000, currency: 'INR', article: ARTICLE, requestId: randomUUID(), token: randomBytes(32).toString('base64url') });
  const request = (name, body, headers = {}, method = 'POST') => new Request(`${SITE}/.netlify/functions/coffee-${name}`, { method, headers: { Origin: SITE, 'Content-Type': 'application/json', ...headers }, ...(method !== 'GET' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
  const invoke = async (name, body, headers, method) => { const response = await service[name](request(name, body, headers, method)); return { response, data: await response.json() }; };
  async function create(input = intent()) { const r = await invoke('order', input); assert.equal(r.response.status, 201); return { input, order: r.data, record: values.get(`orders/${r.data.orderId}`).data }; }
  function pay(order, state = 'captured', extra = {}) {
    const id = 'pay_123456789abc';
    const payment = { id, order_id: order.orderId, amount: order.amount, currency: 'INR', status: state, captured: state === 'captured' || state === 'refunded', created_at: 1800000000, amount_refunded: state === 'refunded' ? order.amount : 0, email: 'private@example.invalid', contact: '+00000000000', ...extra };
    payments.set(id, payment);
    const record = orders.get(order.orderId);
    if (payment.captured) Object.assign(record, { status: 'paid', amount_paid: order.amount, amount_due: 0 });
    return payment;
  }
  const verify = (input, order, payment, extra = {}) => invoke('verify', { action: 'verify', orderId: order.orderId, token: input.token, paymentId: payment.id, signature: sign(env.RAZORPAY_KEY_SECRET, `${order.orderId}|${payment.id}`), ...extra });
  const status = (input, order) => invoke('verify', { action: 'status', orderId: order.orderId, token: input.token });
  const webhook = (payment, event = 'payment.captured', eventId = 'evt_' + randomBytes(10).toString('hex'), extra = {}, secret = env.RAZORPAY_WEBHOOK_SECRET) => {
    const body = JSON.stringify({ event, payload: { payment: { entity: payment }, ...extra } });
    return invoke('webhook', body, { 'x-razorpay-signature': sign(secret, body), 'x-razorpay-event-id': eventId, Origin: '' });
  };
  return { env, store, values, orders, payments, refunds, service, request, invoke, intent, create, pay, verify, status, webhook, setOffline: value => { offline = value; }, setProviderFailure: value => { providerFailure = value; }, setBadOrder: value => { badOrder = value; }, counts: () => ({ orderCalls, providerCalls }) };
}

test('disabled by default; secrets and key never leak from unavailable config', async () => {
  const f = fixture(); f.env.COFFEE_ENABLED = 'false';
  const c = await f.invoke('config', undefined, {}, 'GET'); assert.equal(c.data.enabled, false); assert.ok(!JSON.stringify(c.data).includes(f.env.RAZORPAY_KEY_SECRET));
  assert.equal((await f.invoke('order', f.intent())).response.status, 503); assert.equal(f.counts().providerCalls, 0);
});
test('live checkout is blocked in previews and requires explicit approval in production', async () => {
  const f = fixture(); f.env.COFFEE_MODE = 'live'; f.env.RAZORPAY_KEY_ID = 'rzp_live_fixturekey123'; f.env.COFFEE_LIVE_APPROVED = 'true';
  assert.equal((await f.invoke('config', undefined, {}, 'GET')).data.enabled, false);
  f.env.CONTEXT = 'production'; delete f.env.COFFEE_LIVE_APPROVED;
  assert.equal((await f.invoke('config', undefined, {}, 'GET')).data.enabled, false);
  f.env.COFFEE_LIVE_APPROVED = 'true'; assert.equal((await f.invoke('config', undefined, {}, 'GET')).data.enabled, true);
});
test('wrong mode keys and missing webhook credentials fail closed', async () => {
  const f = fixture(); f.env.RAZORPAY_KEY_ID = 'rzp_live_fixturekey123';
  assert.equal((await f.invoke('config', undefined, {}, 'GET')).data.enabled, false);
  f.env.RAZORPAY_KEY_ID = 'rzp_test_fixturekey123'; delete f.env.RAZORPAY_WEBHOOK_SECRET;
  assert.equal((await f.invoke('config', undefined, {}, 'GET')).data.enabled, false);
});
test('strict origins, methods, content types, body size and JSON shape', async () => {
  const f = fixture();
  for (const headers of [{ Origin: '' }, { Origin: 'https://evil.example' }, { 'sec-fetch-site': 'cross-site' }]) assert.equal((await f.invoke('order', f.intent(), headers)).response.status, 403);
  assert.equal((await f.invoke('order', undefined, {}, 'GET')).response.status, 405);
  assert.equal((await f.invoke('order', f.intent(), { 'Content-Type': 'text/plain' })).response.status, 415);
  assert.equal((await f.invoke('order', 'x'.repeat(4097))).response.status, 413);
  for (const body of ['{', 'null', '[]', JSON.stringify({ ...f.intent(), secret: 'extra' })]) assert.equal((await f.invoke('order', body)).response.status, 400);
  assert.equal(f.counts().providerCalls, 0);
});
test('server rejects price/currency tampering and unpublished articles', async () => {
  const f = fixture();
  for (const amount of [0, -1, 4999, 500001, 5000.1, '10000', null, Number.MAX_SAFE_INTEGER]) assert.equal((await f.invoke('order', { ...f.intent(), amount })).response.status, 400);
  assert.equal((await f.invoke('order', { ...f.intent(), currency: 'USD' })).response.status, 400);
  assert.equal((await f.invoke('order', { ...f.intent(), article: 'unknown-private-slug' })).response.status, 400);
  for (const amount of [5000, 500000]) assert.equal((await f.invoke('order', { ...f.intent(), amount })).response.status, 201);
});
test('retry and concurrent create requests create only one Razorpay order', async () => {
  const f = fixture(); const input = f.intent();
  const pair = await Promise.all([f.invoke('order', input), f.invoke('order', input)]);
  assert.deepEqual(pair.map(r => r.response.status).sort(), [201, 409]);
  const retry = await f.invoke('order', input); assert.equal(retry.response.status, 200); assert.equal(f.counts().orderCalls, 1);
  assert.equal((await f.invoke('order', { ...input, token: randomBytes(32).toString('base64url') })).response.status, 409);
  assert.equal((await f.invoke('order', { ...input, amount: 25000 })).response.status, 409);
});
test('storage failure or an uncertain provider create never opens checkout or blindly retries', async () => {
  const f = fixture(); f.setOffline(true);
  assert.equal((await f.invoke('order', f.intent())).response.status, 503); assert.equal(f.counts().providerCalls, 0);
  f.setOffline(false); f.setProviderFailure(true); const input = f.intent();
  assert.equal((await f.invoke('order', input)).response.status, 503);
  f.setProviderFailure(false); assert.equal((await f.invoke('order', input)).response.status, 409); assert.equal(f.counts().orderCalls, 0);
});
test('provider order amount must match before an order is offered', async () => {
  const f = fixture(); f.setBadOrder(true); const r = await f.invoke('order', f.intent());
  assert.equal(r.response.status, 409); assert.ok(!r.data.orderId);
});

test('captured success is verified against provider order/payment and stored without donor data', async () => {
  const f = fixture(); const { input, order } = await f.create(); const payment = f.pay(order);
  const r = await f.verify(input, order, payment); assert.equal(r.response.status, 200); assert.equal(r.data.state, 'paid');
  assert.equal(f.values.get(`payments/${payment.id}`).data.amount, input.amount);
  assert.equal((await f.verify(input, order, payment)).data.state, 'paid');
  assert.equal([...f.values.keys()].filter(key => key.startsWith('payments/')).length, 1);
  const records = JSON.stringify([...f.values.values()]);
  for (const privateValue of [input.token, f.env.RAZORPAY_KEY_SECRET, f.env.RAZORPAY_WEBHOOK_SECRET, payment.email, payment.contact]) assert.ok(!records.includes(privateValue));
  assert.equal(r.response.headers.get('Cache-Control'), 'no-store'); assert.equal(r.response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
});
test('international captured INR payment follows the same verified flow', async () => {
  const f = fixture(); const { input, order } = await f.create();
  assert.equal((await f.verify(input, order, f.pay(order, 'captured', { international: true }))).data.state, 'paid');
});
test('authorized payment and incomplete paid order never become success', async () => {
  const f = fixture(); const { input, order } = await f.create(); const payment = f.pay(order, 'authorized');
  assert.equal((await f.verify(input, order, payment)).data.state, 'pending'); assert.ok(!f.values.has(`payments/${payment.id}`));
  f.pay(order); f.orders.get(order.orderId).amount_due = 1;
  assert.equal((await f.verify(input, order, payment)).data.state, 'pending');
});
test('failed/cancelled payments remain unpaid and can recover the same order', async () => {
  const f = fixture(); const { input, order } = await f.create();
  assert.equal((await f.status(input, order)).data.state, 'unpaid');
  const payment = f.pay(order, 'failed'); assert.equal((await f.verify(input, order, payment)).data.state, 'unpaid');
  assert.equal((await f.status(input, order)).data.orderId, order.orderId);
});
test('reject invalid callback signature and a different session token before provider calls', async () => {
  const f = fixture(); const { input, order } = await f.create(); const payment = f.pay(order); const count = f.counts().providerCalls;
  for (const signature of ['', '0'.repeat(64), 'z'.repeat(64), sign(f.env.RAZORPAY_KEY_SECRET, `order_other1234|${payment.id}`)]) assert.equal((await f.verify(input, order, payment, { signature })).response.status, 403);
  assert.equal((await f.verify(input, order, payment, { token: randomBytes(32).toString('base64url') })).response.status, 403);
  assert.equal(f.counts().providerCalls, count);
});
test('reject captured payments from a different order, price or currency', async () => {
  const f = fixture(); const { input, order } = await f.create();
  for (const extra of [{ order_id: 'order_another1234' }, { amount: 20000 }, { currency: 'USD' }]) {
    const payment = f.pay(order, 'captured', extra); assert.equal((await f.verify(input, order, payment)).response.status, 409);
  }
  assert.equal([...f.values.keys()].filter(key => key.startsWith('payments/')).length, 0);
});
test('provider failure and failed durable capture write do not claim paid', async () => {
  const f = fixture(); const { input, order } = await f.create(); const payment = f.pay(order);
  f.setProviderFailure(true); assert.equal((await f.verify(input, order, payment)).response.status, 503); f.setProviderFailure(false);
  const original = f.store.setJSON; f.store.setJSON = async (key, ...args) => { if (key.startsWith('payments/')) throw new Error('storage interrupted'); return original(key, ...args); };
  assert.equal((await f.verify(input, order, payment)).response.status, 503);
  f.store.setJSON = original; assert.equal((await f.status(input, order)).data.state, 'paid');
});
test('status recovery works without the browser callback, but not without its session token', async () => {
  const f = fixture(); const { input, order } = await f.create(); f.pay(order);
  assert.equal((await f.status(input, order)).data.state, 'paid');
  assert.equal((await f.invoke('verify', { action: 'status', orderId: order.orderId, token: '' })).response.status, 403);
  assert.equal((await f.invoke('verify', { action: 'status', orderId: order.orderId, token: input.token, signature: 'extra' })).response.status, 400);
});
test('expired sessions are explicit and do not initiate another order', async () => {
  const f = fixture(); const { input, order } = await f.create(); f.values.get(`orders/${order.orderId}`).data.expiresAt = 1;
  assert.equal((await f.status(input, order)).response.status, 410); assert.equal(f.counts().orderCalls, 1);
});
test('refunded/partly refunded current payment is not shown as paid', async () => {
  const f = fixture(); const { input, order } = await f.create(); f.pay(order, 'refunded');
  assert.equal((await f.status(input, order)).data.state, 'refunded');
  f.pay(order, 'captured', { amount_refunded: 1000 }); assert.equal((await f.status(input, order)).data.state, 'refunded');
});
test('webhook raw-body signature is mandatory, including for unknown events', async () => {
  const f = fixture(); const body = JSON.stringify({ event: 'unknown' });
  for (const signature of ['', '0'.repeat(64), sign(f.env.RAZORPAY_WEBHOOK_SECRET, body + ' ')]) assert.equal((await f.invoke('webhook', body, { 'x-razorpay-signature': signature, 'x-razorpay-event-id': 'evt_test123456' })).response.status, 403);
  const r = await f.invoke('webhook', body, { 'x-razorpay-signature': sign(f.env.RAZORPAY_WEBHOOK_SECRET, body), 'x-razorpay-event-id': 'evt_test123456' }); assert.equal(r.data.ignored, true);
});
test('concurrent webhook redelivery is idempotent across service invocations', async () => {
  const f = fixture(); const { order } = await f.create(); const payment = f.pay(order); const event = 'evt_duplicate123';
  const pair = await Promise.all([f.webhook(payment, 'payment.captured', event), f.webhook(payment, 'payment.captured', event)]);
  assert.ok(pair.every(r => r.response.status === 200)); assert.equal((await f.webhook(payment, 'payment.captured', event)).data.duplicate, true);
  assert.equal([...f.values.keys()].filter(key => key.startsWith('payments/')).length, 1);
  assert.equal([...f.values.keys()].filter(key => key.startsWith('events/')).length, 1);
  assert.equal((await f.webhook({ ...payment, changed: true }, 'payment.captured', event)).response.status, 409);
});
test('retry after failed event write does not duplicate the captured payment', async () => {
  const f = fixture(); const { order } = await f.create(); const payment = f.pay(order); const event = 'evt_retry123456';
  const original = f.store.setJSON; f.store.setJSON = async (key, ...args) => { if (key.startsWith('events/')) throw new Error('event write failure'); return original(key, ...args); };
  assert.equal((await f.webhook(payment, 'payment.captured', event)).response.status, 503);
  assert.equal([...f.values.keys()].filter(key => key.startsWith('events/')).length, 0);
  f.store.setJSON = original; assert.equal((await f.webhook(payment, 'payment.captured', event)).response.status, 200);
  assert.equal([...f.values.keys()].filter(key => key.startsWith('payments/')).length, 1);
});
test('refund and late failed/captured webhooks never roll a refund back to paid', async () => {
  const f = fixture(); const { input, order } = await f.create(); const payment = f.pay(order);
  assert.equal((await f.webhook(payment)).response.status, 200);
  const refund = { id: 'rfnd_123456789abc', payment_id: payment.id, currency: 'INR', amount: order.amount, status: 'processed' }; f.refunds.set(refund.id, refund); f.pay(order, 'refunded');
  assert.equal((await f.webhook(payment, 'refund.processed', undefined, { refund: { entity: refund } })).response.status, 200);
  assert.equal((await f.webhook(payment, 'payment.failed')).response.status, 200);
  assert.equal((await f.webhook(payment, 'payment.captured')).response.status, 200);
  assert.equal((await f.status(input, order)).data.state, 'refunded');
  assert.equal([...f.values.keys()].filter(key => key.startsWith('refunds/')).length, 1);
});
test('unrelated merchant payments and unsupported events do not enter this site ledger', async () => {
  const f = fixture(); const payment = { id: 'pay_unrelated123', order_id: 'order_unrelated123', amount: 9900, currency: 'INR', status: 'captured', captured: true }; f.payments.set(payment.id, payment);
  assert.equal((await f.webhook(payment)).data.ignored, true); assert.equal(f.values.size, 0);
});
test('previous webhook secret works during rotation, and turning off new orders keeps recovery working', async () => {
  const f = fixture(); const { input, order } = await f.create(); const payment = f.pay(order);
  const old = f.env.RAZORPAY_WEBHOOK_SECRET; f.env.RAZORPAY_WEBHOOK_SECRET_PREVIOUS = old; f.env.RAZORPAY_WEBHOOK_SECRET = randomBytes(32).toString('hex'); f.env.COFFEE_ENABLED = 'false';
  assert.equal((await f.webhook(payment, 'payment.captured', undefined, {}, old)).response.status, 200);
  assert.equal((await f.status(input, order)).data.state, 'paid');
  assert.equal((await f.invoke('order', f.intent())).response.status, 503);
});

// Bundle the real browser client for direct boundary and request tests, no vendor calls.
const bundled = await build({ entryPoints: ['src/lib/coffee.ts'], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const client = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
test('client money parser accepts exact paise and rejects floats/exponents/bounds', () => {
  for (const [input, expected] of [['50', 5000], ['50.01', 5001], ['100.1', 10010], ['5000', 500000]]) assert.equal(client.coffeeAmount(input), expected);
  for (const input of ['49.99', '5000.01', '1e3', 'NaN', '-100', '100.001', '₹100', ' 100', '100 ']) assert.equal(client.coffeeAmount(input), undefined);
});
test('browser recovery stores no donor data and rejects malformed saved references', () => {
  const saved = new Map(); globalThis.sessionStorage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) };
  const attempt = client.newCoffeeAttempt(ARTICLE, 10000, 'test'); client.rememberCoffee(attempt);
  assert.equal(attempt.token.length, 43); assert.equal(client.readCoffeeAttempt(ARTICLE).requestId, attempt.requestId);
  client.rememberCoffee({ ...attempt, amount: -1 }); assert.equal(client.readCoffeeAttempt(ARTICLE), undefined);
  client.forgetCoffee(ARTICLE); assert.equal(saved.size, 0); delete globalThis.sessionStorage;
});
test('client rejects mismatched callback order before making any network request', async () => {
  const attempt = { ...client.newCoffeeAttempt(ARTICLE, 10000, 'test'), orderId: 'order_original123' };
  await assert.rejects(client.checkCoffee(attempt, { razorpay_order_id: 'order_wrong12345', razorpay_payment_id: 'pay_wrong12345', razorpay_signature: 'anything' }), /does not match/);
});

test('real client/server boundary creates and confirms the bound order without exposing server secrets', async () => {
  const f = fixture(); const originalFetch = globalThis.fetch;
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.fetch = async (path, options) => {
    assert.equal(options.credentials, 'omit'); assert.equal(options.redirect, 'error'); assert.equal(options.cache, 'no-store');
    const endpoint = path.split('coffee-')[1];
    return f.service[endpoint](f.request(endpoint, options.body, {}, options.method));
  };
  try {
    const cfg = await client.getCoffeeConfig(); assert.equal(cfg.enabled, true);
    const attempt = client.newCoffeeAttempt(ARTICLE, 10050, 'test');
    const order = await client.createCoffeeOrder(attempt); const bound = { ...attempt, orderId: order.orderId };
    const payment = f.pay(order);
    const result = await client.checkCoffee(bound, { razorpay_order_id: order.orderId, razorpay_payment_id: payment.id, razorpay_signature: sign(f.env.RAZORPAY_KEY_SECRET, `${order.orderId}|${payment.id}`) });
    assert.equal(result.state, 'paid'); assert.equal(result.amount, 10050);
    assert.equal((await client.checkCoffee(bound)).state, 'paid');
    assert.ok(!JSON.stringify({ cfg, order, result }).includes(f.env.RAZORPAY_KEY_SECRET));
    globalThis.fetch = async () => { throw new TypeError('offline'); };
    await assert.rejects(client.checkCoffee(bound), /connection was interrupted/);
    globalThis.fetch = async () => new Response('not json', { status: 502 });
    await assert.rejects(client.checkCoffee(bound), /temporarily unavailable/);
    globalThis.fetch = async () => Response.json({ ...order, state: 'paid', amount: 1 });
    await assert.rejects(client.checkCoffee(bound), /could not be verified/);
  } finally { globalThis.fetch = originalFetch; delete globalThis.window; }
});
