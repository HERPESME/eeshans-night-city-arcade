import { createCoffeeService } from '../lib/coffee.mjs';

export default request => createCoffeeService({ getStore: () => { throw new Error('Config does not access storage'); } }).config(request);
export const config = { path: '/.netlify/functions/coffee-config', rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
