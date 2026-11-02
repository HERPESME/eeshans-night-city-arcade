import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {handler} from '../netlify/functions/render.mjs';
import {routes} from '../.ssr/entry-server.js';
const render=async path=>(await handler({rawUrl:`https://technightcity.com${path}`,httpMethod:'GET'})).body;
const project=await render('/projects');
const ordered=['ClearFrame','UltraFit360','Amanat','QuantTrader','Manoday','REAL-TIME MESSENGER'];
let position=0;for(const title of ordered){const at=project.indexOf(title,position);assert.ok(at>=position,`Project order: ${title}`);position=at+title.length;}
const profile=await render('/profile');assert.ok(profile.includes('eeshan-big-ben.webp'));assert.ok(profile.includes('Big Ben'));
const terminal=await render('/terminal');assert.ok(terminal.includes('mailto:eeshan@technightcity.com'));assert.ok(!terminal.includes('eeshan.singh53@gmail.com'));
for(const subject of JSON.parse(await readFile('src/content/contact-subjects.json','utf8'))) assert.ok(terminal.includes(subject));
assert.ok(terminal.includes('type="email"')&&terminal.includes('required=""'));
const image=await readFile('public/blog-images/eeshan-big-ben.webp');assert.equal(image.toString('ascii',8,12),'WEBP');
for(const route of routes.filter(r=>r.blogSlug)) {const html=await render(route.path);assert.ok(html.includes('blog-coffee-card'));assert.ok(html.includes('Support link coming soon.'));assert.ok(html.includes('eeshan-big-ben.webp'));}
console.log('PASS project ordering, London portrait, contact fields, fixed email and all thirty author/support panels');
