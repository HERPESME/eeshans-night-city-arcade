import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { render, routes, metadata, schema, origin } from '../.ssr/entry-server.js';
const template = await readFile('dist/index.html', 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('Prerender requires a fresh Vite client build.');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const base = template.replace(/<title>.*?<\/title>/s, '').replace(/<meta\s+(?:name|property)="(?:description|keywords|og:[^"]+|twitter:[^"]+)"[^>]*>/g, '').replace(/<link rel="canonical"[^>]*>/g, '').replace(/<script type="application\/ld\+json">.*?<\/script>/s, '');
for (const page of routes) {
  const tags = Object.entries(metadata(page)).map(([key, value]) => `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escape(value)}" />`).join('\n');
  const head = `<link rel="preload" as="image" href="/media/night-city-mobile.gif" media="(max-width: 767px)" /><title>${escape(page.title)}</title>\n<link rel="canonical" href="${origin}${page.path}" />\n${tags}\n<script id="page-schema" type="application/ld+json">${JSON.stringify(schema(page)).replaceAll('<', '\\u003c')}</script>`;
  const html = base.replace('</head>', head + '\n</head>').replace('<div id="root"></div>', () => `<div id="root">${render(page.path)}</div>`);
  const dir = page.path === '/' ? 'dist' : 'dist' + page.path;
  await mkdir(dir, { recursive: true });
  await writeFile(dir + '/index.html', html);
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(page => `\n  <url><loc>${origin}${page.path}</loc></url>`).join('')}\n</urlset>\n`);
await writeFile('dist/404.html', base.replace('</head>', '<title>Page not found | Night City Arcade</title><meta name="robots" content="noindex" /></head>').replace('<div id="root"></div>', `<div id="root">${render('/page-not-found')}</div>`).replace('<meta name="robots" content="index, follow" />', ''));
console.log(`Prerendered ${routes.length} canonical pages and a 404 page.`);
