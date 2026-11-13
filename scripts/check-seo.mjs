import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { routes, origin } from '../.ssr/entry-server.js';
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
// Keep one sitemap source: the publication-aware route manifest at build time.
// A hand-maintained public copy can silently become an outdated fallback.
await assert.rejects(access('public/sitemap.xml'), { code: 'ENOENT' });
const listedURLs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const expectedURLs = routes.filter(page => page.indexable !== false).map(page => `${origin}${page.path}`);
assert.equal(new Set(listedURLs).size, listedURLs.length, 'Sitemap URLs must be unique');
assert.deepEqual([...listedURLs].sort(), [...expectedURLs].sort(), 'Sitemap must exactly match published routes');
for (const page of routes) {
 const html = await readFile(page.path === '/' ? 'dist/index.html' : `dist${page.path}.html`, 'utf8');
 assert.ok(page.description.length >= 100 && page.description.length <= 160, `${page.path} has a useful snippet length`);
 assert.ok(page.title.length < 70, `${page.path} has a concise search title`);
 assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
 assert.ok(html.includes(`href="${origin}${page.path}"`));
 assert.equal((html.match(/<h1\b/g) || []).length, 1);
 assert.ok(!html.includes('<div id="root"></div>'));
 assert.equal(html.includes('content="noindex, follow"'), page.indexable === false);
 assert.ok(html.includes('LUpHn6bus1tMwNleZ6RnWERGtTEbmygMdcyAdggKxGU'));
 for (const target of routes.filter(route => !route.blogSlug)) assert.ok(html.includes(`href="${target.path}"`), `${page.path} links to ${target.path}`);
 const graph = JSON.parse(html.match(/<script id="page-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
 if (page.path === '/') {
  const person = graph.find(item => item['@type'] === 'Person');
  assert.ok(person?.affiliation.sameAs.includes('https://www.linkedin.com/company/ultrafit360'));
  assert.equal(graph.find(item => item['@type'] === 'WebSite').author['@id'], person['@id']);
 }
 assert.equal(sitemap.includes(`<loc>${origin}${page.path}</loc>`), page.indexable !== false);
 console.log('PASS', page.path, 'canonical, headings, links, schema, verification, sitemap, static content');
}
const home = await readFile('dist/index.html', 'utf8');
assert.ok(home.includes('AI FULL STACK DEVELOPER') && home.includes('CoFounder - UltraFit360') && home.includes('30+'));
const profile = await readFile('dist/profile.html','utf8');
assert.ok(profile.includes('href="/files/Res-3.pdf"'));
const projects = await readFile('dist/projects.html','utf8');
for (const title of ['ClearFrame','UltraFit360','Amanat','QuantTrader','Manoday','REAL-TIME MESSENGER']) assert.ok(projects.includes(title));
const missing = await readFile('dist/404.html','utf8');
assert.ok(missing.includes('content="noindex"'));
assert.ok(!missing.includes('rel="canonical"'));
const gif = await readFile('dist/media/night-city-social.gif');
assert.ok(gif.length < 5_000_000);
assert.match(gif.toString('ascii',0,6), /^GIF8[79]a$/);
console.log('PASS résumé link, project text, 404 metadata, GIF format and size');
