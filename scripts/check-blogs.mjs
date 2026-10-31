import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { handler } from '../netlify/functions/render.mjs';
import { routes } from '../.ssr/entry-server.js';
const blogs = routes.filter(page => page.section === 'blogs');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.equal(blogs.length, 4, 'Hub and three complete articles are available');
const titles = new Set();
const descriptions = new Set();
for (const page of blogs) {
 const result = await handler({ rawUrl: `https://technightcity.com${page.path}`, httpMethod: 'GET' });
 assert.equal(result.statusCode, 200);
 const draft = page.indexable === false;
 assert.equal(result.headers['X-Robots-Tag'], draft ? 'noindex' : undefined);
 assert.equal(result.body.includes('content="noindex, follow"'), draft);
 assert.equal(sitemap.includes(`<loc>https://technightcity.com${page.path}</loc>`), !draft);
 assert.equal((result.body.match(/<h1\b/g) || []).length, 1);
 const schema = JSON.parse(result.body.match(/id="page-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 const trail = schema['@graph'].find(item => item['@type'] === 'BreadcrumbList');
 assert.equal(trail.itemListElement.length, page.blogSlug ? 3 : 2);
 if (page.blogSlug) {
  assert.equal(result.body.includes('DRAFT FOR REVIEW'), draft);
  assert.ok(!/placeholder text|sample entry|Layout preview/i.test(result.body));
  const article = schema['@graph'].find(item => item['@type'] === 'BlogPosting');
  assert.ok(article, 'Written articles have BlogPosting metadata');
  assert.equal(article.creativeWorkStatus, draft ? 'Draft' : 'Published');
  if (draft) assert.ok(!article.datePublished, 'An editorial draft must not claim a publication date');
  else assert.match(article.datePublished || '', /^\d{4}-\d{2}-\d{2}$/, 'A published article needs its actual publication date');
  assert.ok(article.wordCount >= 1000, 'Each article contains a substantial original draft');
  assert.equal(article.author['@id'], 'https://technightcity.com/#person');
  assert.equal(article.headline, page.label);
  assert.ok(article.citation.length >= 3);
  assert.ok(result.body.includes('property="article:author"'));
  assert.equal(result.body.includes('article:published_time'), !draft);
  titles.add(page.title); descriptions.add(page.description);
  assert.ok(result.body.includes('href="/blogs"'));
  assert.ok(result.body.includes('id="blog-article-body"'));
  assert.ok((result.body.match(/class="blog-art-scene"/g) || []).length >= 2, 'Reading view has cover and supporting generated artwork');
  const artPaths = [...result.body.matchAll(/src="(\/blogs\/images\/[^"]+)"/g)].map(match => match[1]);
  for (const path of new Set(artPaths)) {
   const file = await readFile('public' + path);
   assert.ok(file.length > 1000, `Nonempty image asset: ${path}`);
   if (path.endsWith('.webp')) assert.equal(file.toString('ascii', 8, 12), 'WEBP');
  }
  assert.ok(result.body.includes('Sources &amp; project links'));
  if (page.blogSlug.includes('figma-mcp')) {
   for (const tool of ['get_metadata', 'get_design_context', 'get_screenshot', 'get_variable_defs', 'get_code_connect_map', 'add_code_connect_map']) assert.ok(result.body.includes(tool));
   assert.ok(result.body.includes('Example IDE prompt'));
  }
  if (page.blogSlug.startsWith('ultrafit360')) {
   assert.ok((result.body.match(/class="blog-art-screen"/g) || []).length >= 3, 'Original app screen layers appear inside generated phone art');
   assert.ok(result.body.includes('ultrafit-dashboard-original.png'));
   assert.ok(result.body.includes('ultrafit-metrics-original.jpg'));
   assert.ok(result.body.includes('active native iOS TabView'), 'Implementation claims follow the active native-tab path');
   assert.ok(result.body.includes('NativeTabsLayout.tsx') && result.body.includes('renderAndroidTabBar'), 'The platform split is supported by an actual source excerpt');
  }
 } else {
  for (const article of blogs.filter(item => item.blogSlug)) assert.ok(result.body.includes(`href="${article.path}"`));
 }
 console.log('PASS blog review route', page.path);
}
assert.equal(titles.size, 3, 'Every article has a distinct title');
assert.equal(descriptions.size, 3, 'Every article has a distinct description');
const missing = await handler({ rawUrl: 'https://technightcity.com/blogs/not-a-real-entry', httpMethod: 'GET' });
assert.equal(missing.statusCode, 404, 'Unknown article slugs are true 404s');
assert.equal(missing.headers['X-Robots-Tag'], 'noindex');
assert.ok(missing.body.includes('blog-music-control'), 'Unknown blog URLs render the same route-aware shell as the browser');
console.log('PASS complete drafts, truthful article metadata, assets, tools, screen layers, links, indexing protection and 404');
