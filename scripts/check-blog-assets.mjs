import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { routes } from '../.ssr/entry-server.js';

const config = await readFile('netlify.toml', 'utf8');
const redirects = [...config.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\n\[|$)/g)].map(([, block]) => ({
  from: block.match(/from\s*=\s*"([^"]+)"/)?.[1],
  to: block.match(/to\s*=\s*"([^"]+)"/)?.[1],
  status: Number(block.match(/status\s*=\s*(\d+)/)?.[1]),
  force: /force\s*=\s*true/.test(block),
}));
const match = (pattern, path) => pattern && new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '(.*)') + '$').test(path);
const assets = new Set();
for (const page of routes.filter(page => page.section === 'blogs')) {
  const html = await readFile(`dist${page.path}.html`, 'utf8');
  assert.ok(!html.includes('/blogs/images/'), 'Rendered images must avoid the blog page renderer namespace');
  for (const image of html.matchAll(/<img\b[^>]+>/g)) {
    const src = image[0].match(/src="([^"]+)"/)?.[1];
    assert.ok(src?.startsWith('/blog-images/') && src.endsWith('.webp'), `Blog images must be WebP: ${src}`);
  }
  for (const path of html.matchAll(/\/blog-images\/[a-z0-9-]+\.webp/g)) assets.add(path[0]);
}
assert.ok(assets.size >= 11, 'Covers, responsive variants, body art and app screens are checked');
for (const path of assets) {
  const bytes = await readFile('dist' + path);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', path);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', path);
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, `Complete WebP payload: ${path}`);
  assert.ok(!redirects.some(rule => rule.force && match(rule.from, path)), `Static asset intercepted by a forced redirect: ${path}`);
  const oldPath = path.replace('/blog-images/', '/blogs/images/');
  const legacy = redirects.find(rule => match(rule.from, oldPath));
  assert.equal(legacy?.status, 301, `Cached HTML image links must still resolve: ${oldPath}`);
  assert.equal(legacy?.to, '/blog-images/:splat');
}
const pageRule = redirects.find(rule => match(rule.from, '/blogs/unknown-entry'));
assert.equal(pageRule?.to, '/.netlify/functions/render', 'Unknown articles retain server-rendered 404s');
console.log(`PASS ${assets.size} built WebP assets, Netlify routing isolation and legacy image redirects`);
