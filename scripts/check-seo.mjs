import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { routes, origin } from '../.ssr/entry-server.js';
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const page of routes) {
 const html = await readFile(`dist${page.path === '/' ? '' : page.path}/index.html`, 'utf8');
 assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
 assert.ok(html.includes(`href="${origin}${page.path}"`));
 assert.equal((html.match(/<h1\b/g) || []).length, 1);
 assert.ok(!html.includes('<div id="root"></div>'));
 assert.ok(!html.includes('content="noindex"'));
 assert.ok(html.includes('LUpHn6bus1tMwNleZ6RnWERGtTEbmygMdcyAdggKxGU'));
 for (const target of routes) assert.ok(html.includes(`href="${target.path}"`), `${page.path} links to ${target.path}`);
 JSON.parse(html.match(/<script id="page-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert.ok(sitemap.includes(`<loc>${origin}${page.path}</loc>`));
 console.log('PASS', page.path, 'canonical, headings, links, schema, verification, sitemap, static content');
}
const profile = await readFile('dist/profile/index.html','utf8');
assert.ok(profile.includes('href="/files/Res-3.pdf"'));
const projects = await readFile('dist/projects/index.html','utf8');
for (const title of ['CareerBoostAI','UltraFit360','QuantTrader']) assert.ok(projects.includes(title));
const missing = await readFile('dist/404.html','utf8');
assert.ok(missing.includes('content="noindex"'));
assert.ok(!missing.includes('rel="canonical"'));
const gif = await readFile('dist/media/night-city-social.gif');
assert.ok(gif.length < 5_000_000);
assert.match(gif.toString('ascii',0,6), /^GIF8[79]a$/);
console.log('PASS résumé link, project text, 404 metadata, GIF format and size');
