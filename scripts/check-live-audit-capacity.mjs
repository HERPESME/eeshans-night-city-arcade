import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { routes } from '../.ssr/entry-server.js';
import { runAudit } from './live-seo-audit.mjs';

const checkout = process.cwd();
const scratch = await mkdtemp(join(tmpdir(), 'nightcity-audit-test-'));
const originalFetch = globalThis.fetch;
const originalExitCode = process.exitCode;
const originalSummary = process.env.GITHUB_STEP_SUMMARY;
const origin = 'https://technightcity.com';
const published = routes.filter(page => page.indexable !== false);
const html = new Map(await Promise.all(published.map(async page => [
  page.path,
  await readFile(page.path === '/' ? 'dist/index.html' : `dist${page.path}.html`, 'utf8'),
])));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const robots = await readFile('public/robots.txt', 'utf8');
const requested = new Set();

try {
  process.chdir(scratch);
  delete process.env.GITHUB_STEP_SUMMARY;
  // Use the actual built catalogue, not a hard-coded list that could silently
  // keep testing the old inventory after future publications.
  globalThis.fetch = async url => {
    const path = new URL(url).pathname;
    requested.add(path);
    if (path === '/sitemap.xml') return new Response(sitemap);
    if (path === '/robots.txt') return new Response(robots);
    if (html.has(path)) return new Response(html.get(path));
    return new Response('Not found', { status: 404 });
  };
  const report = await runAudit();
  assert.equal(report.pages.length, published.length, 'Audit reaches every published route');
  assert.equal(report.errors.length, 0);
  assert.ok(report.pages.every(page => page.errors.length === 0 && page.warnings.length === 0));
  for (const page of published) assert.ok(requested.has(page.path), page.path);

  // An unexpectedly large feed must still stop before fetching article URLs.
  // This guards the resource boundary without mirroring the exact ceiling.
  requested.clear();
  const oversized = `<urlset>${Array.from({ length: 1001 }, (_, i) => `<url><loc>${origin}/unexpected-${i}</loc></url>`).join('')}</urlset>`;
  globalThis.fetch = async url => { requested.add(new URL(url).pathname); return new Response(oversized); };
  const rejected = await runAudit();
  assert.ok(rejected.errors.some(error => error.includes('reviewed') && error.includes('limit')));
  assert.equal(rejected.pages.length, 0);
  assert.deepEqual([...requested], ['/sitemap.xml']);
} finally {
  globalThis.fetch = originalFetch;
  process.exitCode = originalExitCode;
  if (originalSummary === undefined) delete process.env.GITHUB_STEP_SUMMARY;
  else process.env.GITHUB_STEP_SUMMARY = originalSummary;
  process.chdir(checkout);
  await rm(scratch, { recursive: true, force: true });
}
console.log(`PASS audit covers all ${published.length} built routes and refuses an oversized feed before crawling`);
