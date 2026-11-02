import { getStore } from '@netlify/blobs';
import { createCoffeeService } from '../lib/coffee.mjs';

export default request => createCoffeeService({ getStore }).verify(request);
export const config = { path: '/.netlify/functions/coffee-verify', rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
