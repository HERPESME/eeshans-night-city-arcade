import { getStore } from '@netlify/blobs';
import { createCoffeeService, runtimeEnvironment } from '../lib/coffee.mjs';

export default (request, context) => createCoffeeService({ readEnv: () => runtimeEnvironment(context), getStore }).verify(request);
export const config = { path: '/.netlify/functions/coffee-verify', rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
