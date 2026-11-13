import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { handler } from '../netlify/functions/render.mjs';
import { routes } from '../.ssr/entry-server.js';
const blogs = routes.filter(page => page.section === 'blogs');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const articleCount = blogs.filter(page => page.blogSlug).length;
assert.ok(articleCount >= 112, 'The published journal retains its article inventory');
assert.ok(blogs.every(page => page.indexable !== false), 'Approved blogs must be indexable');
assert.equal((sitemap.match(/<loc>/g) || []).length, routes.filter(page => page.indexable !== false).length, 'Sitemap covers the published route inventory');
const titles = new Set();
const descriptions = new Set();
const journalNotes = new Set();
const educationCovers = new Set();
const trendCovers = new Set();
const currentTechCovers = new Set();
for (const page of blogs) {
 const result = await handler({ rawUrl: `https://technightcity.com${page.path}`, httpMethod: 'GET' });
 assert.equal(result.statusCode, 200);
 const draft = page.indexable === false;
 assert.equal(result.headers['X-Robots-Tag'], draft ? 'noindex' : undefined);
 assert.equal(result.body.includes('content="noindex, follow"'), draft);
 assert.equal(sitemap.includes(`<loc>https://technightcity.com${page.path}</loc>`), !draft);
 assert.equal((result.body.match(/<h1\b/g) || []).length, 1);
 const schema = JSON.parse(result.body.match(/id="page-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 const trail = schema['@graph'].find(item => item['@type'] === 'BreadcrumbList');
 assert.equal(trail.itemListElement.length, page.blogSlug ? 3 : 2);
 if (page.blogSlug) {
  assert.equal(result.body.includes('DRAFT FOR REVIEW'), draft);
  assert.ok(!/placeholder text|sample entry|Layout preview/i.test(result.body));
  const article = schema['@graph'].find(item => item['@type'] === 'BlogPosting');
  assert.ok(article, 'Written articles have BlogPosting metadata');
  assert.equal(article.creativeWorkStatus, draft ? 'Draft' : 'Published');
  if (draft) assert.ok(!article.datePublished, 'An editorial draft must not claim a publication date');
  else assert.match(article.datePublished || '', /^\d{4}-\d{2}-\d{2}$/, 'A published article needs its actual publication date');
  if (page.blogSlug === 'nvidia-investigation-ai-race-local-llms') {
    assert.equal(article.datePublished, '2026-11-09');
    for (const section of ['confirmed-facts', 'information-risk', 'china-ai-race', 'local-llms', 'privacy-boundary']) assert.ok(result.body.includes(`id="${section}"`));
    assert.ok(result.body.includes('hypothetical'));
    assert.ok(result.body.includes('does not identify a person'));
    assert.equal(schema['@graph'].find(item => item['@type'] === 'FAQPage').mainEntity.length, 3);
  }
  if (page.blogSlug === 'claude-fable-5-2-benchmarks-pricing-coding') {
    assert.equal(article.datePublished, '2026-11-10');
    assert.ok(article.wordCount >= 1800);
    for (const id of ['specifications', 'pricing', 'coding-benchmarks', 'independent-evaluations', 'migration-checks']) assert.ok(result.body.includes(`id="${id}"`));
    for (const phrase of ['49.1%', '32.4%', '16.7 percentage points', '22.4%', '31.4%', 'different reported comparisons', '30-day retention']) assert.ok(result.body.includes(phrase));
    assert.equal(schema['@graph'].find(item => item['@type'] === 'FAQPage').mainEntity.length, 3);
  }
  const educationCover = article.image.url.match(/\/blog-images\/education-(\d+)\.webp/);
  const trendCover = article.image.url.match(/\/blog-images\/trend-([a-z0-9-]+)\.webp$/);
  const currentTechCover = article.image.url.match(/\/blog-images\/news-([a-z0-9-]+)\.webp$/);
  if (currentTechCover) {
    assert.equal(currentTechCover[1], page.blogSlug, 'The current explainer has its own relevant cover');
    currentTechCovers.add(page.blogSlug);
    assert.ok(result.body.includes(`/blog-images/news-${page.blogSlug}-720.webp`), 'The new cover has a responsive variant');
    assert.ok(result.body.includes('class="blog-diagram '), 'Each current explainer includes a readable explanatory figure');
    assert.equal(article.datePublished, '2026-11-08', 'New articles retain their actual publication date');
  }
  if (trendCover) {
    assert.equal(trendCover[1], page.blogSlug, 'The guide has its own topic-specific cover');
    trendCovers.add(trendCover[1]);
    assert.ok(result.body.includes(`/blog-images/trend-${page.blogSlug}-720.webp`), 'The responsive cover is rendered');
  }
  assert.ok(article.wordCount >= (educationCover ? 200 : 1000), 'Long-form articles and concise labs must meet their editorial depth checks');
  if (educationCover) {
    educationCovers.add(educationCover[1]);
    for (const section of ['implementation', 'failure-boundary', 'verification']) assert.ok(result.body.includes(`id="${section}"`));
  }
  assert.equal(article.author['@id'], 'https://technightcity.com/#person');
  assert.equal(article.headline, page.label);
  assert.ok(article.citation.length >= (educationCover ? 1 : 3));
  assert.ok(article.dateModified >= article.datePublished, 'Modification date cannot predate initial publication');
  assert.ok(result.body.includes('property="article:author"'));
  assert.equal(result.body.includes('article:published_time'), !draft);
  const faq = schema['@graph'].find(item => item['@type'] === 'FAQPage');
  if (faq) {
    assert.equal(faq.mainEntity.length, 3);
    for (const q of faq.mainEntity) {
      assert.ok(result.body.includes(q.name.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\"', '&quot;').replaceAll("'", '&#x27;')), 'FAQ question is visible');
      assert.ok(q.acceptedAnswer.text.length > 60, 'FAQ has a useful answer');
      assert.ok(result.body.includes(q.acceptedAnswer.text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\"', '&quot;').replaceAll("'", '&#x27;')), 'FAQ answer is visible');
    }
  }
  titles.add(page.title); descriptions.add(page.description);
  assert.ok(result.body.includes('AI Full Stack Developer') && result.body.includes('CoFounder of UltraFit360'), 'Author bio reflects the stated role and venture');
  const note = result.body.match(/class="blog-entry-perspective">(.*?)<\/p>/s)?.[1];
  assert.ok(note && note.length > 80, 'Each article has its own meaningful author perspective');
  journalNotes.add(note);
  assert.ok(result.body.includes('href="/blogs"'));
  assert.ok(result.body.includes('id="blog-article-body"'));
  assert.ok(result.body.includes('class="blog-art-scene"'), 'Articles retain their cover; supporting visuals are selected for relevance, not an image quota');
  const artPaths = [...result.body.matchAll(/src="(\/blog-images\/[^"]+)"/g)].map(match => match[1]);
  for (const path of new Set(artPaths)) {
   const file = await readFile('public' + path);
   assert.ok(file.length > 1000, `Nonempty image asset: ${path}`);
   if (path.endsWith('.webp')) assert.equal(file.toString('ascii', 8, 12), 'WEBP');
  }
  assert.ok(result.body.includes('id="blog-references-title">Sources</h2>'));
  assert.ok(!/api\.ultrafit360|backend-python|confirm_token|client_secret|DATABASE_URL|ghp_[A-Za-z0-9]|github_pat_/.test(result.body), 'Articles must not disclose backend addresses, code paths, token payloads or credentials');
  assert.ok(!/github\.com\/(?:rsamant07\/UltraFit360|UltraFit360\/(?:UltraFit360_Website|Aptixlabs))/i.test(result.body), 'Private product repository URLs must never appear in articles or metadata');
  if (page.blogSlug === 'expo-react-native-production-problems-ultrafit360') {
   assert.ok(article.wordCount >= 2200, 'Production guide contains a detailed discussion');
   for (const concept of ['fictional editorial fixtures', 'not a device capture', '24 combinations', 'Those are the authors’ experiences', 'native code', 'Flutter', 'Capacitor']) assert.ok(result.body.includes(concept), concept);
   assert.ok(result.body.includes('expo-dashboard-screen.webp') && result.body.includes('expo-nutrition-screen.webp'));
  }
  if (page.blogSlug === 'build-ai-coach-prompt-engineering-rag-guardrails') {
   for (const concept of ['model’s weights', 'Retrieval-augmented generation', 'Prompt engineering', 'authorised', 'invented teaching examples', 'not a copy of UltraFit360']) assert.ok(result.body.includes(concept), concept);
   assert.ok(article.wordCount >= 2500, 'The AI coach guide explains the full workflow in detail');
   assert.ok(result.body.includes('ai-coach-web-screen.webp') && result.body.includes('ai-coach-mobile-screen.webp'));
   assert.ok((result.body.match(/class="blog-art-screen"/g) || []).length >= 3);
  }
  if (page.blogSlug.includes('figma-mcp')) {
   for (const tool of ['get_metadata', 'get_design_context', 'get_screenshot', 'get_variable_defs', 'get_code_connect_map', 'add_code_connect_map']) assert.ok(result.body.includes(tool));
   assert.ok(result.body.includes('Example IDE prompt'));
  }
  if (page.blogSlug === 'ultrafit360-srs-to-react-native-app') {
   assert.ok((result.body.match(/class="blog-art-screen"/g) || []).length >= 3, 'Original app screen layers appear inside generated phone art');
   assert.ok(result.body.includes('ultrafit-dashboard-screen.webp'));
   assert.ok(result.body.includes('ultrafit-metrics-screen.webp'));
   assert.ok(result.body.includes('active native iOS TabView'), 'Implementation claims follow the active native-tab path');
   assert.ok(result.body.includes('NativeTabsLayout.tsx') && result.body.includes('renderAndroidTabBar'), 'The platform split is supported by an actual source excerpt');
  }
 } else {
  assert.equal((result.body.match(/class="blog-card blog-card--/g) || []).length, 6, 'The archive initially renders just six cards');
  assert.ok(result.body.includes('aria-controls="blog-archive-grid">Show more</button>'));
  assert.ok(result.body.includes('<details class="blog-title-index">'), 'The full archive keeps a text-only directory');
  for (const article of blogs.filter(item => item.blogSlug)) assert.ok(result.body.includes(`href="${article.path}"`));
 }
 console.log('PASS blog review route', page.path);
}
assert.equal(educationCovers.size, 65, 'Each new lab has its own cover');
assert.equal(trendCovers.size, 10, 'Each November guide has its own cover');
assert.equal(currentTechCovers.size, 5, 'Five new explainers have distinct covers and figures');
assert.equal(journalNotes.size, articleCount, 'Every article has a distinct journal note');
assert.equal(titles.size, articleCount, 'Every article has a distinct title');
assert.equal(descriptions.size, articleCount, 'Every article has a distinct description');
const missing = await handler({ rawUrl: 'https://technightcity.com/blogs/not-a-real-entry', httpMethod: 'GET' });
assert.equal(missing.statusCode, 404, 'Unknown article slugs are true 404s');
assert.equal(missing.headers['X-Robots-Tag'], 'noindex');
assert.ok(missing.body.includes('blog-music-control'), 'Unknown blog URLs render the same route-aware shell as the browser');
console.log('PASS complete drafts, truthful article metadata, assets, tools, screen layers, links, indexing protection and 404');

const publishedPaths = new Set(blogs.filter(page => page.blogSlug && page.indexable !== false).map(page => page.path));
const expoSources = new Set();
const fableSources = new Set();
const linkedTrendPaths = new Set();
const linkedCurrentTechPaths = new Set();
for (const page of blogs.filter(page => page.blogSlug && page.indexable !== false)) {
 const html = await readFile(`dist${page.path}.html`, 'utf8');
 const relatedSection = html.match(/<section class="blog-related"[\s\S]*?<\/section>/)?.[0];
 assert.ok(relatedSection, `${page.path} has related reading`);
 const relatedPaths = [...new Set([...relatedSection.matchAll(/href="(\/blogs\/[^"#]+)"/g)].map(match => match[1]))];
 assert.equal(relatedPaths.length, 2, `${page.path} has two distinct related articles`);
 for (const target of relatedPaths) {
  assert.notEqual(target, page.path, 'Related articles exclude self');
  assert.ok(publishedPaths.has(target), 'Related articles exclude drafts and unknown destinations');
  if (target === '/blogs/claude-fable-5-2-benchmarks-pricing-coding') fableSources.add(page.path);
  if (target === '/blogs/expo-react-native-production-problems-ultrafit360') expoSources.add(page.path);
  if (trendCovers.has(target.slice('/blogs/'.length))) linkedTrendPaths.add(target);
  if (currentTechCovers.has(target.slice('/blogs/'.length))) linkedCurrentTechPaths.add(target);
 }
}
assert.ok(fableSources.size >= 2, 'Fable release has contextual incoming related-reading links');
assert.ok(expoSources.has('/blogs/ultrafit360-srs-to-react-native-app'), 'Mobile case study links to production lessons');
assert.ok(expoSources.has('/blogs/expo-google-play-photo-permission-rejection'), 'Permissions guide links to production lessons');
assert.equal(linkedTrendPaths.size, trendCovers.size, 'Every November guide has an incoming article link');
assert.equal(linkedCurrentTechPaths.size, currentTechCovers.size, 'Every new explainer has an incoming article link');
console.log('PASS related article discovery, distinct published destinations and Expo incoming links');
