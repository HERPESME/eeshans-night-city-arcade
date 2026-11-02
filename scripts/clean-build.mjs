import { rm } from 'node:fs/promises';

// Prerender replaces dist/index.html with rendered markup. Always start the next
// production build with fresh generated output, never a previous page/template.
// Resolve from this file so another working directory cannot widen deletion.
await Promise.all(['../dist/', '../.ssr/'].map(path => rm(new URL(path, import.meta.url), { recursive: true, force: true })));
