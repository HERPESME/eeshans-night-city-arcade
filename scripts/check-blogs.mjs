import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { handler } from '../netlify/functions/render.mjs';
import { routes } from '../.ssr/entry-server.js';
const blogs = routes.filter(page => page.section === 'blogs');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.equal(blogs.length, 8, 'Hub and seven review articles are available');
for (const page of blogs) {
 const result = await handler({ rawUrl: `https://technightcity.com${page.path}`, httpMethod: 'GET' });
 assert.equal(result.statusCode, 200);
 assert.equal(result.headers['X-Robots-Tag'], 'noindex', 'Drafts must remain excluded from indexing');
 assert.ok(result.body.includes('content="noindex, follow"'));
 assert.ok(!sitemap.includes(`<loc>https://technightcity.com${page.path}</loc>`));
 assert.equal((result.body.match(/<h1\b/g) || []).length, 1);
 const schema = JSON.parse(result.body.match(/id="page-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 const trail = schema['@graph'].find(item => item['@type'] === 'BreadcrumbList');
 assert.equal(trail.itemListElement.length, page.blogSlug ? 3 : 2);
 assert.ok(!schema['@graph'].some(item => ['Article', 'BlogPosting'].includes(item['@type'])), 'Samples must not claim to be published articles');
 if (page.blogSlug) {
  assert.ok(result.body.includes('SAMPLE ENTRY'));
  assert.ok(result.body.includes('href="/blogs"'));
  assert.ok(result.body.includes('id="blog-article-body"'));
  assert.ok((result.body.match(/<img\b/g) || []).length >= 2, 'Reading view has cover and supporting illustration');
 } else {
  for (const article of blogs.filter(item => item.blogSlug)) assert.ok(result.body.includes(`href="${article.path}"`));
 }
 console.log('PASS blog review route', page.path);
}
const missing = await handler({ rawUrl: 'https://technightcity.com/blogs/not-a-real-entry', httpMethod: 'GET' });
assert.equal(missing.statusCode, 404, 'Unknown article slugs are true 404s');
assert.equal(missing.headers['X-Robots-Tag'], 'noindex');
assert.ok(missing.body.includes('blog-music-control'), 'Unknown blog URLs render the same route-aware shell as the browser');
console.log('PASS draft indexing protection, breadcrumb depth, images, archive links and missing article 404');
