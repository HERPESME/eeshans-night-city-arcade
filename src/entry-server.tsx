import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
export { routes, metadata, schema, origin } from './lib/seo';
export function render(path: string) {
  return renderToString(<StaticRouter location={path}><App /></StaticRouter>);
}
