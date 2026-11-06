import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { renderDocument, routes } from '../../.ssr/entry-server.js';
const reportOnlyPolicy = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://checkout.razorpay.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googleapis.com https://*.razorpay.com; frame-src https://*.razorpay.com; font-src 'self' data:; media-src 'self' blob:";
let templatePromise;
export async function handler(event) {
  const url = new URL(event.rawUrl || `https://technightcity.com${event.path}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const page = routes.find(route => route.path === path);
  if (page && url.pathname !== path) return { statusCode: 301, headers: { Location: `https://technightcity.com${path}${url.search}` }, body: '' };
  if (event.httpMethod && !['GET', 'HEAD'].includes(event.httpMethod)) return { statusCode: 405, headers: { Allow: 'GET, HEAD' }, body: 'Method not allowed' };
  templatePromise ||= readFile(resolve(process.cwd(), '.ssr/template.html'), 'utf8').catch(error => { templatePromise = undefined; throw error; });
  const html = renderDocument(await templatePromise, page, path);
  return {
    statusCode: page ? 200 : 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': page ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Content-Security-Policy-Report-Only': reportOnlyPolicy, ...(page && page.indexable !== false ? {} : { 'X-Robots-Tag': 'noindex' }) },
    body: event.httpMethod === 'HEAD' ? '' : html,
  };
}
