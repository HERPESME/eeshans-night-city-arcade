import { createCoffeeService, runtimeEnvironment } from '../lib/coffee.mjs';

export default (request, context) => createCoffeeService({ readEnv: () => runtimeEnvironment(context), getStore: () => { throw new Error('Config does not access storage'); } }).config(request);
export const config = { path: '/.netlify/functions/coffee-config', rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
