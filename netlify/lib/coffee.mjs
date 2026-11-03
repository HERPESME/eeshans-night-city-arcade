import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import policy from '../../src/content/coffee-policy.json' with { type: 'json' };

const SITE = 'https://technightcity.com';
const PURPOSE = 'technightcity-coffee-v1';
const ORDER = /^order_[A-Za-z0-9]{8,40}$/;
const PAYMENT = /^pay_[A-Za-z0-9]{8,40}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const sha = value => createHash('sha256').update(value).digest('hex');
const hexEqual = (a, b) => typeof a === 'string' && /^[a-f0-9]{64}$/i.test(a) && typeof b === 'string' && /^[a-f0-9]{64}$/i.test(b) && timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
const hmac = (secret, value) => createHmac('sha256', secret).update(value).digest('hex');
const amountValid = amount => Number.isSafeInteger(amount) && amount >= policy.minimum && amount <= policy.maximum;

class PaymentError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
function fail(status, code, message) { throw new PaymentError(status, code, message); }
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', ...extra,
  } });
}
function configuration(env) {
  const mode = env.COFFEE_MODE || 'test';
  const key = env.RAZORPAY_KEY_ID || '';
  const configured = ['test', 'live'].includes(mode) && new RegExp(`^rzp_${mode}_[A-Za-z0-9]{8,40}$`).test(key)
    && (env.RAZORPAY_KEY_SECRET || '').length >= 16 && (env.RAZORPAY_WEBHOOK_SECRET || '').length >= 32;
  // Never let production credentials activate on a PR or branch preview.
  const safeContext = mode !== 'live' || (env.CONTEXT === 'production' && env.COFFEE_LIVE_APPROVED === 'true');
  return { enabled: env.COFFEE_ENABLED === 'true' && configured && safeContext, operational: configured && safeContext, mode, key,
    secret: env.RAZORPAY_KEY_SECRET, webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
    previousWebhookSecret: env.RAZORPAY_WEBHOOK_SECRET_PREVIOUS, env };
}
function checkOrigin(request, cfg, required = true) {
  const allowed = new Set([SITE]);
  if (cfg.mode === 'test' && cfg.env.CONTEXT !== 'production') {
    try { const url = new URL(cfg.env.DEPLOY_PRIME_URL); if (url.protocol === 'https:') allowed.add(url.origin); } catch { /* No preview configured. */ }
    try {
      const url = new URL(cfg.env.COFFEE_DEV_ORIGIN);
      if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && ['http:', 'https:'].includes(url.protocol)) allowed.add(url.origin);
    } catch { /* No development origin configured. */ }
  }
  const origin = request.headers.get('origin');
  if ((required && !origin) || (origin && !allowed.has(origin)) || request.headers.get('sec-fetch-site') === 'cross-site') fail(403, 'origin', 'Open checkout from TechNightCity.');
}
function checkMethod(request, method) {
  if (request.method !== method) fail(405, 'method', `Use ${method} for this endpoint.`);
}
async function readBody(request, maximum = 4096) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) fail(415, 'content_type', 'Send a JSON request.');
  if (Number(request.headers.get('content-length')) > maximum) fail(413, 'body_size', 'Request is too large.');
  const chunks = []; let size = 0;
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); fail(413, 'body_size', 'Request is too large.'); }
      chunks.push(Buffer.from(value));
    }
  }
  return Buffer.concat(chunks);
}
function parseBody(raw, allowed) {
  let data; try { data = JSON.parse(raw.toString('utf8')); } catch { fail(400, 'json', 'Invalid JSON request.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data) || (allowed && Object.keys(data).some(key => !allowed.includes(key)))) fail(400, 'fields', 'Invalid request fields.');
  return data;
}

// Dependencies are injected for deterministic tests. No in-memory payment ledger.
export function createCoffeeService({ getStore, articles = new Set(), readEnv = () => process.env, fetch: fetcher = globalThis.fetch, now = Date.now, report = () => {} }) {
  const getConfig = () => configuration(readEnv());
  const storeFor = cfg => getStore({ name: `coffee-${cfg.mode}-v1`, consistency: 'strong' });
  const get = (store, key) => store.get(key, { type: 'json', consistency: 'strong' });
  function ready(cfg) { if (!cfg.enabled) fail(503, 'unavailable', 'Coffee support is not available yet. Please try again later.'); }
  function recoverable(cfg) { if (!cfg.operational) fail(503, 'unavailable', 'Payment confirmation is temporarily unavailable. Please contact support with your payment reference.'); }
  const wrap = handler => async request => {
    try { return await handler(request); }
    catch (error) {
      if (error instanceof PaymentError) return json({ ok: false, code: error.code, message: error.message }, error.status, error.status === 405 ? { Allow: request.url.includes('coffee-config') ? 'GET' : 'POST' } : {});
      // Never log request bodies, provider responses, tokens, email or secrets.
      report('coffee_dependency_unavailable');
      return json({ ok: false, code: 'dependency', message: 'Payment confirmation is unavailable. Check the status before trying to pay again.' }, 503);
    }
  };
  async function api(cfg, path, body) {
    let response;
    try {
      response = await fetcher(`https://api.razorpay.com/v1${path}`, { method: body ? 'POST' : 'GET', redirect: 'error',
        headers: { Authorization: `Basic ${Buffer.from(`${cfg.key}:${cfg.secret}`).toString('base64')}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(10000) });
    } catch { fail(503, 'provider', 'Razorpay is taking longer than expected. Check this payment before trying again.'); }
    if (!response.ok) fail(503, 'provider', 'Razorpay could not confirm this request. Please try again shortly.');
    const data = await response.json();
    if (!data || typeof data !== 'object') fail(502, 'provider_response', 'Unable to confirm the payment details.');
    return data;
  }
  const checkout = (record, cfg) => ({ orderId: record.id, amount: record.amount, currency: record.currency, keyId: cfg.key, mode: cfg.mode });
  function orderMatches(order, record) {
    if (order.id !== record.id || order.amount !== record.amount || order.currency !== record.currency || order.receipt !== record.receipt || order.partial_payment === true || order.notes?.purpose !== PURPOSE)
      fail(409, 'order_mismatch', 'The payment details do not match this checkout. Contact support before paying again.');
  }
  function paymentMatches(payment, record) {
    if (!PAYMENT.test(payment.id || '') || payment.order_id !== record.id || payment.amount !== record.amount || payment.currency !== record.currency)
      fail(409, 'payment_mismatch', 'The payment details do not match this checkout. Contact support before paying again.');
  }
  async function saveCapture(store, record, payment, order) {
    paymentMatches(payment, record); orderMatches(order, record);
    if (!['captured', 'refunded'].includes(payment.status) || payment.captured !== true || order.status !== 'paid' || order.amount_paid !== record.amount || order.amount_due !== 0) return false;
    const captured = { paymentId: payment.id, orderId: record.id, amount: record.amount, currency: record.currency, article: record.article, mode: record.mode, paymentCreatedAt: payment.created_at, recordedAt: now() };
    const result = await store.setJSON(`payments/${payment.id}`, captured, { onlyIfNew: true });
    if (!result.modified) {
      const previous = await get(store, `payments/${payment.id}`);
      if (!previous || previous.orderId !== record.id || previous.amount !== record.amount || previous.currency !== record.currency) fail(409, 'ledger_mismatch', 'Payment reconciliation needs review. Please contact support.');
    }
    return true;
  }
  async function findOrder(store, id, cfg) {
    if (!ORDER.test(id || '')) fail(400, 'order_id', 'Invalid checkout reference.');
    const record = await get(store, `orders/${id}`);
    if (!record || record.mode !== cfg.mode) fail(404, 'order_missing', 'This checkout could not be found.');
    return record;
  }
  async function authenticateOrder(store, data, cfg) {
    const record = await findOrder(store, data.orderId, cfg);
    if (!TOKEN.test(data.token || '') || !hexEqual(sha(data.token), record.tokenHash)) fail(403, 'checkout_token', 'This checkout cannot be verified from this session.');
    if (record.expiresAt < now()) fail(410, 'expired', 'This checkout session has expired. Contact support with your Razorpay payment reference before trying again.');
    return record;
  }

  return {
    config: wrap(async request => {
      checkMethod(request, 'GET'); const cfg = getConfig(); checkOrigin(request, cfg, false);
      return json({ enabled: cfg.enabled, recoverable: cfg.operational, ...policy, ...(cfg.operational ? { mode: cfg.mode, keyId: cfg.key } : {}) });
    }),
    order: wrap(async request => {
      checkMethod(request, 'POST'); const cfg = getConfig(); checkOrigin(request, cfg); ready(cfg);
      const data = parseBody(await readBody(request), ['amount', 'currency', 'article', 'requestId', 'token']);
      if (!amountValid(data.amount) || data.currency !== policy.currency) fail(400, 'amount', 'Choose an amount between ₹1 and ₹5,000 in INR.');
      if (typeof data.article !== 'string' || !articles.has(data.article)) fail(400, 'article', 'Open support from a published article.');
      if (!UUID.test(data.requestId || '') || !TOKEN.test(data.token || '')) fail(400, 'intent', 'Invalid checkout session.');
      const store = storeFor(cfg); const key = `intents/${data.requestId}`;
      const intent = { amount: data.amount, currency: policy.currency, article: data.article, tokenHash: sha(data.token), createdAt: now(), expiresAt: now() + policy.checkoutLifetimeSeconds * 1000 };
      const reserved = await store.setJSON(key, intent, { onlyIfNew: true });
      if (!reserved.modified) {
        const previous = await get(store, key);
        if (!previous || !hexEqual(previous.tokenHash, intent.tokenHash) || previous.amount !== intent.amount || previous.article !== intent.article) fail(409, 'intent_mismatch', 'This checkout session has different details.');
        if (previous.expiresAt < now()) fail(410, 'expired', 'This checkout session has expired.');
        if (!previous.orderId) fail(409, 'preparing', 'This checkout is still being prepared or was interrupted before opening. Wait a moment, then retry this session.');
        return json({ ok: true, ...checkout(await findOrder(store, previous.orderId, cfg), cfg) });
      }
      const receipt = `tnc_${data.requestId.replaceAll('-', '')}`;
      const order = await api(cfg, '/orders', { amount: intent.amount, currency: intent.currency, receipt, partial_payment: false, notes: { purpose: PURPOSE, article: intent.article } });
      if (!ORDER.test(order.id || '')) fail(502, 'provider_response', 'Unable to prepare checkout.');
      const record = { ...intent, id: order.id, receipt, mode: cfg.mode };
      orderMatches(order, record);
      if (order.status !== 'created') fail(502, 'provider_response', 'Unable to prepare a new checkout.');
      const saved = await store.setJSON(`orders/${order.id}`, record, { onlyIfNew: true });
      if (!saved.modified) fail(409, 'order_exists', 'This checkout needs reconciliation. Please contact support.');
      const linked = await store.setJSON(key, { ...intent, orderId: order.id }, { onlyIfMatch: reserved.etag });
      if (!linked.modified) fail(503, 'order_link', 'Checkout was interrupted before opening. Please contact support if this continues.');
      return json({ ok: true, ...checkout(record, cfg) }, 201);
    }),
    verify: wrap(async request => {
      checkMethod(request, 'POST'); const cfg = getConfig(); checkOrigin(request, cfg); recoverable(cfg);
      const data = parseBody(await readBody(request), ['action', 'orderId', 'token', 'paymentId', 'signature']);
      if (!['verify', 'status'].includes(data.action)) fail(400, 'action', 'Invalid payment action.');
      const store = storeFor(cfg); const record = await authenticateOrder(store, data, cfg);
      if (data.action === 'verify') {
        if (!PAYMENT.test(data.paymentId || '') || !hexEqual(data.signature, hmac(cfg.secret, `${record.id}|${data.paymentId}`))) fail(403, 'signature', 'The payment response could not be verified. Check status before trying again.');
      } else if (data.paymentId !== undefined || data.signature !== undefined) fail(400, 'fields', 'Unexpected status request fields.');
      const order = await api(cfg, `/orders/${record.id}`); orderMatches(order, record);
      let payment;
      if (data.action === 'verify') payment = await api(cfg, `/payments/${data.paymentId}`);
      else {
        const payments = await api(cfg, `/orders/${record.id}/payments`);
        if (!Array.isArray(payments.items)) fail(502, 'provider_response', 'Unable to check this payment.');
        for (const item of payments.items) paymentMatches(item, record);
        payment = payments.items.find(item => item.status === 'captured' || item.status === 'refunded') || payments.items.find(item => item.status === 'authorized');
      }
      if (!payment) return json({ ok: true, state: 'unpaid', ...checkout(record, cfg) });
      paymentMatches(payment, record);
      // Order stays paid after a refund. Always use current payment state as well.
      if (payment.status === 'refunded' || payment.amount_refunded > 0) return json({ ok: true, state: 'refunded', paymentId: payment.id, ...checkout(record, cfg) });
      const paid = await saveCapture(store, record, payment, order);
      return json({ ok: true, state: paid ? 'paid' : payment.status === 'failed' ? 'unpaid' : 'pending', paymentId: payment.id, ...checkout(record, cfg) });
    }),
    webhook: wrap(async request => {
      checkMethod(request, 'POST'); const cfg = getConfig(); recoverable(cfg);
      const raw = await readBody(request, 131072); const signature = request.headers.get('x-razorpay-signature');
      const valid = hexEqual(signature, hmac(cfg.webhookSecret, raw)) || (typeof cfg.previousWebhookSecret === 'string' && cfg.previousWebhookSecret.length >= 32 && hexEqual(signature, hmac(cfg.previousWebhookSecret, raw)));
      if (!valid) fail(403, 'webhook_signature', 'Invalid webhook signature.');
      const data = parseBody(raw); const eventId = request.headers.get('x-razorpay-event-id');
      if (!eventId || !/^[A-Za-z0-9_-]{8,120}$/.test(eventId)) fail(400, 'event_id', 'Missing webhook event reference.');
      if (!['payment.captured', 'order.paid', 'payment.failed', 'refund.processed'].includes(data.event)) return json({ ok: true, ignored: true });
      const store = storeFor(cfg); const eventKey = `events/${sha(eventId)}`; const digest = sha(raw);
      const previous = await get(store, eventKey);
      if (previous) {
        if (!hexEqual(previous.digest, digest)) fail(409, 'event_mismatch', 'Conflicting webhook event.');
        return json({ ok: true, duplicate: true });
      }
      const entity = data.payload?.payment?.entity;
      const refund = data.payload?.refund?.entity;
      const paymentId = data.event === 'refund.processed' ? refund?.payment_id : entity?.id;
      if (!PAYMENT.test(paymentId || '')) fail(400, 'webhook_payload', 'Invalid payment event.');
      const payment = await api(cfg, `/payments/${paymentId}`);
      if (payment.id !== paymentId) fail(409, 'payment_mismatch', 'Invalid payment event.');
      if (!ORDER.test(payment.order_id || '')) return json({ ok: true, ignored: true });
      const record = await get(store, `orders/${payment.order_id}`);
      // A merchant may use this account for other products. Do not record their data.
      if (!record || record.mode !== cfg.mode) return json({ ok: true, ignored: true });
      paymentMatches(payment, record);
      const order = await api(cfg, `/orders/${record.id}`); orderMatches(order, record);
      if (['payment.captured', 'order.paid'].includes(data.event)) {
        if (!await saveCapture(store, record, payment, order)) fail(503, 'capture_pending', 'The captured payment is not available yet. Retry this event.');
      } else if (data.event === 'refund.processed') {
        if (!/^rfnd_[A-Za-z0-9]{8,40}$/.test(refund?.id || '')) fail(400, 'webhook_payload', 'Invalid refund event.');
        const current = await api(cfg, `/refunds/${refund.id}`);
        if (current.id !== refund.id || current.payment_id !== payment.id || current.status !== 'processed' || current.currency !== record.currency || !Number.isSafeInteger(current.amount) || current.amount <= 0 || current.amount > record.amount) fail(409, 'refund_mismatch', 'Refund reconciliation needs review.');
        await store.setJSON(`refunds/${current.id}`, { refundId: current.id, paymentId: payment.id, orderId: record.id, amount: current.amount, currency: record.currency, recordedAt: now() }, { onlyIfNew: true });
      }
      // Mark complete only after durable writes. Retries safely repeat the preceding steps.
      const saved = await store.setJSON(eventKey, { digest, event: data.event, paymentId: payment.id, orderId: record.id, processedAt: now() }, { onlyIfNew: true });
      if (!saved.modified) {
        const concurrent = await get(store, eventKey);
        if (!concurrent || !hexEqual(concurrent.digest, digest)) fail(409, 'event_mismatch', 'Conflicting webhook event.');
      }
      return json({ ok: true });
    }),
  };
}
