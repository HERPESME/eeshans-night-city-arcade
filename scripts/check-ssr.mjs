import assert from 'node:assert/strict';
import { handler } from '../netlify/functions/render.mjs';
import { routes } from '../.ssr/entry-server.js';
import { readFile } from 'node:fs/promises';
for (const page of routes) {
 const result = await handler({rawUrl:'https://technightcity.com'+page.path,httpMethod:'GET'});
 assert.equal(result.statusCode,200);
 assert.ok(result.body.includes(`<link rel="canonical" href="https://technightcity.com${page.path}"`));
 assert.equal((result.body.match(/<h1\b/g)||[]).length,1);
 assert.ok(!result.body.includes('noindex'));
 const json=JSON.parse(result.body.match(/id="page-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 if(page.path!=='/') assert.ok(json['@graph'].some(entity=>entity['@type']==='BreadcrumbList'));
 if(page.path==='/profile') {
  const faq=json['@graph'].find(entity=>entity['@type']==='FAQPage');assert.ok(faq.mainEntity.length);
  for(const q of faq.mainEntity) assert.ok(result.body.includes(q.name)&&result.body.includes(q.acceptedAnswer.text));
  assert.ok(!result.body.includes('5+ years'));
 }
 for(const img of result.body.matchAll(/<img\b[^>]*>/g)) {assert.match(img[0],/alt="[^"]+"/);assert.match(img[0],/width="\d+"/);assert.match(img[0],/height="\d+"/);}
 const head=await handler({rawUrl:'https://technightcity.com'+page.path,httpMethod:'HEAD'});assert.equal(head.body,'');
 if(page.path!=='/') {const redirect=await handler({rawUrl:'https://technightcity.com'+page.path+'/',httpMethod:'GET'});assert.equal(redirect.statusCode,301);assert.equal(redirect.headers.Location,'https://technightcity.com'+page.path);}
 console.log('PASS request-time SSR',page.path);
}
const missing=await handler({rawUrl:'https://technightcity.com/missing',httpMethod:'GET'});assert.equal(missing.statusCode,404);assert.equal(missing.headers['X-Robots-Tag'],'noindex');assert.ok(!missing.body.includes('rel="canonical"'));
const post=await handler({rawUrl:'https://technightcity.com/',httpMethod:'POST'});assert.equal(post.statusCode,405);
const robots=await readFile('public/robots.txt','utf8');assert.ok(!/Disallow:\s*\//.test(robots));
console.log('PASS 404 status/noindex, HTTP methods, Googlebot crawling');
