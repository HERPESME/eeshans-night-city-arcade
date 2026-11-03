import { getStore } from '@netlify/blobs';
import { createCoffeeService, runtimeEnvironment } from '../lib/coffee.mjs';

// Razorpay authenticates with raw-body HMAC, not the visitor Origin header.
// Do not apply per-IP limits: legitimate webhook deliveries share provider IPs.
export default (request, context) => createCoffeeService({ readEnv: () => runtimeEnvironment(context), getStore }).webhook(request);
export const config = { path: '/.netlify/functions/coffee-webhook' };
