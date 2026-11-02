import policy from '@/content/coffee-policy.json';

export interface CoffeeConfig {
  enabled: boolean; recoverable: boolean; mode?: 'test' | 'live'; keyId?: string;
  currency: 'INR'; minimum: number; maximum: number; presets: number[];
}
export interface CoffeeAttempt {
  requestId: string; token: string; article: string; amount: number;
  mode: 'test' | 'live'; createdAt: number; orderId?: string;
}
export interface CoffeeOrder { orderId: string; amount: number; currency: 'INR'; keyId: string; mode: 'test' | 'live' }
export interface CoffeeResult extends CoffeeOrder { state: 'paid' | 'pending' | 'unpaid' | 'refunded'; paymentId?: string }
interface CheckoutReply { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }
interface CheckoutOptions {
  key: string; order_id: string; amount: number; currency: 'INR'; name: string; description: string;
  theme: { color: string }; timeout: number;
  handler: (response: CheckoutReply) => void;
  modal: { confirm_close: boolean; ondismiss: () => void };
}
export interface RazorpayCheckout { open: () => void; on: (event: 'payment.failed', callback: () => void) => void }
type CheckoutConstructor = new (options: CheckoutOptions) => RazorpayCheckout;
type PaymentWindow = Window & { Razorpay?: CheckoutConstructor };
const orderPattern = /^order_[A-Za-z0-9]{8,40}$/;
const storageKey = (article: string) => `nightcity.coffee.v1.${article}`;

export function coffeeAmount(value: string): number | undefined {
  if (!/^\d{1,4}(?:\.\d{1,2})?$/.test(value)) return;
  const [whole, decimal = ''] = value.split('.');
  const amount = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  return Number.isSafeInteger(amount) && amount >= policy.minimum && amount <= policy.maximum ? amount : undefined;
}
export function newCoffeeAttempt(article: string, amount: number, mode: 'test' | 'live'): CoffeeAttempt {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return { requestId: crypto.randomUUID(), token, article, amount, mode, createdAt: Date.now() };
}
export function rememberCoffee(attempt: CoffeeAttempt) {
  try { sessionStorage.setItem(storageKey(attempt.article), JSON.stringify(attempt)); } catch { /* In-memory recovery still works while this tab remains open. */ }
}
export function forgetCoffee(article: string) { try { sessionStorage.removeItem(storageKey(article)); } catch { /* Storage may be blocked. */ } }
export function readCoffeeAttempt(article: string): CoffeeAttempt | undefined {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey(article)) || 'null');
    if (!value || value.article !== article || !/^[0-9a-f-]{36}$/i.test(value.requestId) || !/^[A-Za-z0-9_-]{43}$/.test(value.token)
      || !Number.isSafeInteger(value.amount) || value.amount < policy.minimum || value.amount > policy.maximum
      || !['test', 'live'].includes(value.mode) || !Number.isFinite(value.createdAt) || value.createdAt > Date.now()
      || (value.orderId !== undefined && !orderPattern.test(value.orderId))) return;
    // Retain expired references for support instead of silently encouraging a second payment.
    return value;
  } catch { return; }
}
async function request<T>(endpoint: string, body?: unknown): Promise<T> {
  const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(`/.netlify/functions/coffee-${endpoint}`, {
      method: body ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store', redirect: 'error', signal: controller.signal,
      headers: body ? { 'Content-Type': 'application/json' } : {}, ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json().catch(() => undefined);
    if (!response.ok || !data || data.ok === false) throw new Error(typeof data?.message === 'string' ? data.message : 'Coffee support is temporarily unavailable. Check an existing payment before trying again.');
    return data;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError' && error.name !== 'TypeError') throw error;
    throw new Error('The connection was interrupted. Check this checkout before trying to pay again.');
  } finally { window.clearTimeout(timeout); }
}
export async function getCoffeeConfig() {
  const data = await request<CoffeeConfig>('config');
  if (typeof data.enabled !== 'boolean' || typeof data.recoverable !== 'boolean' || data.currency !== policy.currency
    || data.minimum !== policy.minimum || data.maximum !== policy.maximum || !Array.isArray(data.presets)
    || (data.recoverable && (!['test', 'live'].includes(data.mode || '') || !new RegExp(`^rzp_${data.mode}_[A-Za-z0-9]{8,40}$`).test(data.keyId || '')))) throw new Error('Coffee support is temporarily unavailable.');
  return data;
}
function validateOrder(data: CoffeeOrder, attempt: CoffeeAttempt) {
  if (!orderPattern.test(data.orderId || '') || (attempt.orderId && data.orderId !== attempt.orderId)
    || data.amount !== attempt.amount || data.currency !== policy.currency || data.mode !== attempt.mode
    || !new RegExp(`^rzp_${attempt.mode}_[A-Za-z0-9]{8,40}$`).test(data.keyId || '')) throw new Error('Checkout details could not be verified. Please contact support before paying again.');
  return data;
}
export async function createCoffeeOrder(attempt: CoffeeAttempt) {
  return validateOrder(await request<CoffeeOrder>('order', { requestId: attempt.requestId, token: attempt.token, amount: attempt.amount, currency: policy.currency, article: attempt.article }), attempt);
}
export async function checkCoffee(attempt: CoffeeAttempt, reply?: CheckoutReply): Promise<CoffeeResult> {
  if (!attempt.orderId || (reply && reply.razorpay_order_id !== attempt.orderId)) throw new Error('The payment response does not match this checkout. Check its status before paying again.');
  const result = await request<CoffeeResult>('verify', { action: reply ? 'verify' : 'status', orderId: attempt.orderId, token: attempt.token,
    ...(reply ? { paymentId: reply.razorpay_payment_id, signature: reply.razorpay_signature } : {}) });
  validateOrder(result, attempt);
  if (!['paid', 'pending', 'unpaid', 'refunded'].includes(result.state)) throw new Error('Payment status is not available. Please check again shortly.');
  return result;
}

let checkoutScript: Promise<CheckoutConstructor> | undefined;
export function loadRazorpay(): Promise<CheckoutConstructor> {
  if ((window as PaymentWindow).Razorpay) return Promise.resolve((window as PaymentWindow).Razorpay!);
  checkoutScript ??= new Promise<CheckoutConstructor>((resolve, reject) => {
    const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.async = true; script.referrerPolicy = 'no-referrer';
    const timeout = window.setTimeout(() => finish(false), 15000);
    const finish = (loaded: boolean) => {
      window.clearTimeout(timeout); script.onload = null; script.onerror = null;
      const constructor = (window as PaymentWindow).Razorpay;
      if (loaded && constructor) resolve(constructor);
      else { script.remove(); reject(new Error('Razorpay checkout could not load. Please allow it in your browser and try again.')); }
    };
    script.onload = () => finish(true); script.onerror = () => finish(false); document.head.appendChild(script);
  }).catch(error => { checkoutScript = undefined; throw error; });
  return checkoutScript;
}
export function openCoffeeCheckout(Constructor: CheckoutConstructor, order: CoffeeOrder, onReply: (reply: CheckoutReply) => void, onDismiss: () => void, onFailure: () => void) {
  const checkout = new Constructor({ key: order.keyId, order_id: order.orderId, amount: order.amount, currency: order.currency,
    name: 'TechNightCity', description: 'One-time support for the journal', theme: { color: '#ffdc99' }, timeout: 900,
    handler: onReply, modal: { confirm_close: true, ondismiss: onDismiss } });
  checkout.on('payment.failed', onFailure); checkout.open();
}
