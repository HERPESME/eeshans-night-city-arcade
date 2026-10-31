import { dirname } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { renderDocument, routes, origin } from '../.ssr/entry-server.js';
const template = await readFile('dist/index.html', 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('A fresh Vite build is required.');
await writeFile('.ssr/template.html', template);
for (const page of routes) {
  const file = page.path === '/' ? 'dist/index.html' : `dist${page.path}.html`;
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, renderDocument(template, page));
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(page => page.indexable !== false).map(page => `\n  <url><loc>${origin}${page.path}</loc></url>`).join('')}\n</urlset>\n`);
await writeFile('dist/404.html', renderDocument(template));
console.log(`Generated ${routes.length} static fallback pages, SSR template, sitemap, and 404.`);
