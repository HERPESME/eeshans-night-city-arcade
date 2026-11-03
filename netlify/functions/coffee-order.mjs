import { getStore } from '@netlify/blobs';
import { blogEntries } from '../../src/content/blogs.ts';
import { createCoffeeService, runtimeEnvironment } from '../lib/coffee.mjs';

const articles = new Set(blogEntries.filter(entry => !entry.isPreview).map(entry => entry.slug));
export default (request, context) => createCoffeeService({ readEnv: () => runtimeEnvironment(context), getStore, articles }).order(request);
export const config = { path: '/.netlify/functions/coffee-order', rateLimit: { windowLimit: 5, windowSize: 180, aggregateBy: ['ip', 'domain'] } };
