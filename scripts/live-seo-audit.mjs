import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const origin = 'https://technightcity.com';
const maxPages = 100;
const concurrency = 3;
const timeout = 20000;
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|#39|#x[\da-f]+|#\d+);/gi, entity => {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&#39;': "'" };
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  const hex = entity.toLowerCase().startsWith('&#x');
  const n = parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
  return Number.isFinite(n) && n <= 0x10ffff ? String.fromCodePoint(n) : entity;
});
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match => [match[1].toLowerCase(), decode(match[2] ?? match[3])]));
const text = html => decode(html.replace(/<[^>]*>/g, '')).trim();

export function inspectPage(url, status, html, headers = {}) {
  const errors = [], warnings = [], notices = [];
  if (status !== 200) errors.push(`Expected 200, received ${status}`);
  const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0])).filter(a => a.rel?.toLowerCase() === 'canonical');
  if (canonical.length !== 1 || canonical[0].href !== url) errors.push('Canonical must appear once and match the sitemap URL');
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0]));
  const robots = metas.filter(a => /^(robots|googlebot|bingbot)$/i.test(a.name || '')).map(a => a.content || '').join(',');
  if (/\b(noindex|none)\b/i.test(robots + ',' + (headers['x-robots-tag'] || ''))) errors.push('Page is excluded by a robots directive');
  if ((html.match(/<h1\b/gi) || []).length !== 1) errors.push('Expected one H1');
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const title = titles.length === 1 ? text(titles[0][1]) : '';
  if (!title) errors.push('Expected one nonempty title');
  const descriptions = metas.filter(a => a.name?.toLowerCase() === 'description');
  const description = descriptions[0]?.content || '';
  if (descriptions.length !== 1 || !description.trim()) errors.push('Expected one nonempty description');
  if (title.length > 60) notices.push(`Title is ${title.length} characters; review display, not an automatic ranking penalty`);
  if (description.length > 160) notices.push(`Description is ${description.length} characters; review clarity`);
  for (const image of [...html.matchAll(/<img\b[^>]*>/gi)].map(m => attrs(m[0]))) {
    if (!Object.hasOwn(image, 'alt')) warnings.push('Image lacks alt attribute');
    if (!image.width || !image.height) warnings.push('Image lacks explicit dimensions');
  }
  return { url, status, title, description, errors, warnings, notices };
}

async function request(url) {
  const started = Date.now();
  // Audit only the public website; never attach account credentials or analytics.
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout), redirect: 'manual', headers: { 'User-Agent': 'TechNightCity-SEO-Health/1.0' } });
  const body = await response.text();
  return { response, body, elapsedMs: Date.now() - started };
}

export async function runAudit() {
  const report = { date: new Date().toISOString(), origin, errors: [], pages: [], notes: ['Public technical response audit only. Does not establish Google/Bing indexing, keyword volume, CPC, Core Web Vitals, rendered behaviour or every image download.'] };
  try {
    const sitemap = await request(origin + '/sitemap.xml');
    if (sitemap.response.status !== 200) throw new Error(`Sitemap returned ${sitemap.response.status}`);
    const urls = [...sitemap.body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m => decode(m[1].trim()));
    if (!urls.length) throw new Error('Sitemap contains no URLs');
    if (urls.length > maxPages) throw new Error(`Sitemap has ${urls.length} URLs; raise the reviewed ${maxPages}-page limit before auditing`);
    if (new Set(urls).size !== urls.length) report.errors.push('Sitemap contains duplicate URLs');
    for (const url of urls) {
      const parsed = new URL(url);
      if (parsed.origin !== origin || parsed.search || parsed.hash) throw new Error('Sitemap contains a noncanonical or off-site URL');
    }
    let index = 0;
    await Promise.all(Array.from({ length: concurrency }, async () => {
      while (index < urls.length) {
        const url = urls[index++];
        try {
          const { response, body, elapsedMs } = await request(url);
          report.pages.push({ ...inspectPage(url, response.status, body, { 'x-robots-tag': response.headers.get('x-robots-tag') }), elapsedMs });
        } catch (error) { report.pages.push({ url, errors: [String(error.message)], warnings: [], notices: [] }); }
      }
    }));
    const robots = await request(origin + '/robots.txt');
    if (robots.response.status !== 200 || !robots.body.includes(`Sitemap: ${origin}/sitemap.xml`)) report.errors.push('Robots file or sitemap declaration is missing');
    if (/^Disallow:\s*\/\s*$/im.test(robots.body)) report.errors.push('Robots contains a root disallow; inspect its user-agent scope');
    const missing = await request(origin + '/seo-health-nonexistent-route');
    if (missing.response.status !== 404) report.errors.push(`Missing route returned ${missing.response.status}, expected 404`);
  } catch (error) { report.errors.push(String(error.message)); }
  report.pages.sort((a, b) => a.url.localeCompare(b.url));
  const errors = report.errors.length + report.pages.reduce((sum, page) => sum + page.errors.length, 0);
  const warnings = report.pages.reduce((sum, page) => sum + page.warnings.length, 0);
  const summary = `# Public SEO health\n\n${report.date}\n\nChecked ${report.pages.length} pages. Errors: ${errors}; warnings: ${warnings}.\n\n${report.notes.join('\n')}\n\n` + report.pages.filter(p => p.errors.length || p.warnings.length || p.notices.length).map(p => `- ${p.url}: ${[...p.errors, ...p.warnings, ...p.notices].join('; ')}`).join('\n') + (report.errors.length ? '\n\n' + report.errors.join('\n') : '') + '\n';
  await mkdir('seo-audit-results', { recursive: true });
  await writeFile('seo-audit-results/report.json', JSON.stringify(report, null, 2) + '\n');
  await writeFile('seo-audit-results/summary.md', summary);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(summary);
  if (errors || warnings) process.exitCode = 1;
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await runAudit();
