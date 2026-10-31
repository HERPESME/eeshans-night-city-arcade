import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { routes, metadata, schema, origin, type Page } from './lib/seo';
export { routes, metadata, schema, origin };
export function render(path: string) {
  return renderToString(<StaticRouter location={path}><App /></StaticRouter>);
}
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function renderDocument(template: string, page?: Page) {
  const base = template.replace(/<title>.*?<\/title>/s, '').replace(/<meta\s+(?:name|property)="(?:description|keywords|robots|og:[^"]+|twitter:[^"]+)"[^>]*>/g, '').replace(/<link rel="canonical"[^>]*>/g, '').replace(/<script type="application\/ld\+json">.*?<\/script>/s, '');
  const head = page ? `<title>${escape(page.title)}</title><meta name="robots" content="index, follow" /><link rel="canonical" href="${origin}${page.path}" />${Object.entries(metadata(page)).map(([key, value]) => `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escape(value)}" />`).join('')}<script id="page-schema" type="application/ld+json">${JSON.stringify(schema(page)).replace(/</g, '\\u003c')}</script>` : '<title>Page not found | Night City Arcade</title><meta name="robots" content="noindex" />';
  return base.replace('</head>', () => '<link rel="preload" as="image" fetchpriority="high" href="/media/night-city-small.gif" media="(max-width: 767px)" /><link rel="preload" as="image" fetchpriority="high" href="/media/night-city-social.gif" media="(min-width: 768px)" />' + head + '</head>').replace('<div id="root"></div>', () => `<div id="root">${render(page?.path || '/page-not-found')}</div>`);
}
