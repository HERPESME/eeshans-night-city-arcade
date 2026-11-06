import { blogEntries, blogPath, blogWordCount, findBlogEntry } from '@/content/blogs';
import { faqs } from './faqs';
import { projects } from './projects';
import { author } from '@/content/author';
export const origin = 'https://technightcity.com';
export const sectionPaths: Record<string, string> = { home: '/', about: '/profile', projects: '/projects', contact: '/terminal', blogs: '/blogs' };
export interface Page {
  path: string;
  section: 'home' | 'about' | 'projects' | 'contact' | 'blogs';
  label: string;
  title: string;
  description: string;
  indexable?: boolean;
  blogSlug?: string;
  lastModified?: string;
}
// Search metadata can be concise without changing article headings or URLs.
const articleMetadata: Record<string, { title?: string; description?: string }> = {
  "add-field-level-citations-to-ai-extracted-data": { description: "Attach field-level citations to AI-extracted data with source versions, excerpts, and offsets. Handle contradictory evidence and missing sources." },
  "api-polling-with-exponential-backoff-and-retry-after": { description: "Build API polling that handles HTTP 429 and 503 with exponential backoff, jitter, and Retry-After. Test cancellation and a fixed retry budget." },
  "build-a-gym-trading-environment-with-transaction-costs": { description: "Build a Gymnasium trading environment with explicit execution timing and transaction costs. Verify fees and rewards on a fictional price series." },
  "build-a-held-out-test-set-for-llm-extraction": { description: "Build a held-out test set for LLM extraction by splitting product families, checking for leakage, and reporting precision, recall, and coverage by field." },
  "build-a-human-review-queue-for-ai-video-findings": { description: "Build a review queue for AI video findings. Connect findings to clips and timestamps, version reviewer decisions, and handle conflicting edits." },
  "build-a-meal-photo-upload-flow-with-progress-and-retry": { description: "Build a React Native meal photo upload that shows progress, supports cancellation and retry, and confirms when the server has saved the result." },
  "build-a-related-articles-graph-without-guessing-relevance": { description: "Build a related-articles graph around reader tasks. Check for orphan pages and invalid destinations, then measure which links readers follow." },
  "build-an-ai-resume-editor-that-preserves-user-facts": { description: "Build an AI resume editor that ties suggested edits to user-supplied facts. Review changes side by side and flag unsupported claims before saving." },
  "collect-evidence-links-for-multimodal-ai-findings": { description: "Attach frame references and external evidence to multimodal AI findings. Show what each source supports and flag claims that remain unresolved." },
  "design-a-coach-dashboard-for-many-clients": { description: "Design a coach dashboard that supports daily triage and long-term client planning. Test filters, role-based access, and navigation with dummy records." },
  "design-a-workout-plan-editor-with-reorder-and-undo": { description: "Design a workout plan editor with stable exercise IDs, keyboard-accessible reordering, and undo. Test moving rows during edits and handling stale saves." },
  "evaluate-a-ranker-with-recall-k-and-ndcg": { description: "Calculate Recall@K and NDCG on a worked ranking example. See why the same retrieved documents can score differently when their order changes." },
  "explain-a-fraud-risk-score-without-claiming-causation": { description: "Explain a fraud risk score with feature contributions and a clear reference population. Test whether the explanation changes after a small input edit." },
  "expo-environment-variables-that-work-in-eas-builds": { description: "Configure Expo environment variables for EAS preview and production builds. Verify the installed bundle and distinguish client values from secrets." },
  "fgsm-vs-pgd-a-reproducible-robustness-test": { description: "Compare FGSM and PGD in PyTorch with the same perturbation budget. Check pixel-space bounds and measure both attacks against clean accuracy." },
  "figma-auto-layout-to-react-native-flexbox-step-by-step": { description: "Translate Figma Auto Layout into React Native Flexbox. Build a card with fixed and flexible regions, then test long text and smaller screens." },
  "gemini-video-analysis-with-timestamps-and-structured-output": { description: "Use Gemini to extract timestamped video findings as structured output. Validate ranges and compare each finding with the source frames." },
  "grad-cam-for-deepfake-detection-what-the-heatmap-shows": { description: "Use Grad-CAM to inspect a deepfake detector. Learn what its heatmap shows and test whether the model responds to a watermark or other spurious cue." },
  "how-to-choose-fitness-coaching-software-a-trial-checklist": { description: "Compare fitness coaching software with a repeatable trial. Score client invites, plans, check-ins, exports, and handoff using the same dummy account." },
  "how-to-evaluate-fraud-models-when-positives-are-rare": { description: "Evaluate a fraud model on rare positives with precision, recall, and alert counts. Use a synthetic example to compare detection with review workload." },
  "merge-duplicate-detections-across-video-chunks": { description: "Merge duplicate AI findings from overlapping video chunks. Align timestamps and test whether two same-label detections refer to the same object." },
  "model-payment-status-as-a-state-machine": { description: "Model payment status as a state machine that handles late, duplicate, and out-of-order events. Keep a verified capture from being applied twice." },
  "payment-authorization-vs-capture-with-a-partial-capture-example": { description: "Understand payment authorization versus capture with a partial capture example. Track held and captured amounts and verify the final provider status." },
  "polling-vs-sse-vs-websockets-for-job-progress": { description: "Compare polling, server-sent events, and WebSockets for job progress. Test reconnects, status updates, and request load with one job model." },
  "react-native-ui-libraries-compared-with-one-screen": { description: "Compare React Native Paper and Tamagui by building the same settings screen. Test accessibility, theming, and layout on iOS and Android." },
  "react-query-polling-stop-refetchinterval": { description: "Use TanStack Query v5 refetchInterval to poll a job until it succeeds, fails, or is cancelled. Test terminal states and job changes with fake timers." },
  "read-search-console-when-you-have-fewer-than-100-impressions": { description: "Read Search Console with fewer than 100 impressions. Compare complete windows and use raw clicks and impressions to interpret small changes in CTR." },
  "run-a-daily-seo-audit-with-github-actions-and-node-js": { description: "Run a scheduled SEO audit with GitHub Actions and Node.js. Check sitemap URLs, response codes, canonicals, and robots directives after deployment." },
  "set-a-fraud-alert-threshold-for-a-fixed-review-budget": { description: "Set a fraud alert threshold around a fixed review budget. Compare threshold and top-K queues, then test overflow on unusually busy days." },
  "show-evidence-behind-a-search-result-score": { description: "Show the evidence behind a search result with a source passage and document version. Test whether keyword overlap actually supports the result." },
  "store-nutrition-quantities-without-unit-conversion-bugs": { description: "Model nutrition quantities in grams and servings without rounding or conversion errors. Preserve the original unit and version the serving definition." },
  "structured-llm-extraction-with-json-schema-and-validation": { description: "Validate structured LLM extraction with JSON Schema, unit and range checks, and source evidence. Test valid JSON that still contains the wrong value." },
  "test-an-image-classifier-against-compression-and-resizing": { description: "Test image classifier robustness by running paired JPEG and resizing experiments. Compare score changes and label flips at a fixed threshold." },
  "track-outbound-links-and-contact-intent-with-ga4": { description: "Track outbound clicks, contact intent, and confirmed form submissions in GA4. Test each event separately and avoid sending personal information." },
  "verify-trailing-slash-redirects-and-canonicals-on-netlify": { description: "Use curl to verify trailing-slash redirects and canonical URLs on Netlify. Check each hop, spot redirect loops, and confirm real HTTP 404s." },
  'duplicate-notifications-atomic-claims': { title: 'Debug Duplicate Notifications with Atomic Claims' },
  'opentelemetry-missing-ai-request-spans': { title: 'OpenTelemetry: Debug Missing AI Request Spans', description: 'Debug missing AI traces: distinguish logs from spans, check provider ownership and import order, and verify the path with a synthetic request.' },
  'react-query-wrong-tab-cache-identity': { title: 'React Query Wrong Data: Fix Query-Key Collisions' },
  'expo-google-play-photo-permission-rejection': { title: 'Expo Photo Permissions: Diagnose Google Play Rejections' },
  'llm-token-accounting-cost-dashboard': { title: 'LLM Token Accounting: Reported Usage vs Estimates' },
  'ai-memory-authoritative-state-context-engineering': { description: 'Keep AI memory accurate with authoritative state, relevant context and explicit correction paths. A practical guide to stale-data failures.' },
  'postgres-cloud-migration-logical-replication': { description: 'Plan a PostgreSQL cloud migration with logical replication, sequence checks, rollback criteria and product-level verification.' },
  'startup-signups-versus-activation-metrics': { description: 'Define startup activation around useful customer actions, clean cohorts and reliable events, rather than treating every signup as success.' },
};
const journalTitleSuffix = ' | Night City Journal';
function articleTitle(title: string) {
  return title.length + journalTitleSuffix.length < 70 ? title + journalTitleSuffix : title;
}

export const routes: Page[] = [
  { path: '/', section: 'home', label: 'Home', title: 'Eeshan Singh | AI Full Stack Developer & UltraFit360 CoFounder', description: 'Eeshan Singh Pokharia, AI Full Stack Developer and CoFounder of UltraFit360. Explore AI projects, web and mobile builds, and practical product stories.' },
  { path: '/profile', section: 'about', label: 'Profile', title: 'Profile | Eeshan Singh — Night City Arcade', description: 'Meet Eeshan Singh Pokharia, AI Full Stack Developer and CoFounder of UltraFit360. Explore his background, projects, coding profiles and résumé.' },
  { path: '/projects', section: 'projects', label: 'Projects', title: 'Projects | Eeshan Singh — Full-Stack & AI/ML', description: `Explore ${projects.slice(0, 3).map(project => project.title).join(', ')} and Eeshan Singh’s development projects, technologies and available demos.` },
  { path: '/terminal', section: 'contact', label: 'Contact', title: 'Contact Eeshan Singh | Night City Terminal', description: 'Connect with Eeshan Singh through his interactive contact terminal, email, GitHub, LinkedIn, and LeetCode profiles.' },
  { path: '/blogs', section: 'blogs', label: 'Blogs', title: 'Blogs | Eeshan Singh — Night City Journal', description: 'AI engineering, React Native, frontend debugging, startup lessons and gaming: detailed field notes by Eeshan Singh at Night City Journal.', indexable: blogEntries.some(entry => !entry.isPreview) },
  ...blogEntries.map((entry): Page => ({ path: blogPath(entry), section: 'blogs', label: entry.title, title: articleMetadata[entry.slug]?.title || articleTitle(entry.title), description: articleMetadata[entry.slug]?.description || entry.excerpt, indexable: !entry.isPreview, blogSlug: entry.slug, lastModified: entry.reviewedOn })),
];
export const socialImage = origin + '/media/night-city-social.gif';
export function metadata(page: Page) {
  const entry = page.blogSlug ? findBlogEntry(page.blogSlug) : undefined;
  return { description: page.description, 'og:title': page.title, 'og:description': page.description, 'og:url': origin + page.path, 'og:type': entry ? 'article' : 'website', 'og:site_name': 'Night City Arcade', 'og:image': socialImage, 'og:image:secure_url': socialImage, 'og:image:type': 'image/gif', 'og:image:width': '800', 'og:image:height': '450', 'og:image:alt': 'Animated pixel-art Night City skyline', 'twitter:card': 'summary_large_image', 'twitter:title': page.title, 'twitter:description': page.description, 'twitter:image': socialImage, 'twitter:image:alt': 'Animated pixel-art Night City skyline', ...(entry ? { 'article:author': origin + '/profile', 'article:modified_time': entry.reviewedOn + 'T00:00:00Z', ...(!entry.isPreview && entry.publishedOn ? { 'article:published_time': entry.publishedOn + 'T00:00:00Z' } : {}) } : {}) };
}
export function schema(page: Page) {
  const entry = page.blogSlug ? findBlogEntry(page.blogSlug) : undefined;
  const articleId = origin + page.path + '#article';
  const person = { '@type': 'Person', '@id': origin + '/#person', name: 'Eeshan Singh Pokharia', alternateName: 'Eeshan Singh', url: origin + '/profile', image: origin + author.photo, email: author.email, jobTitle: author.role, description: author.bio, affiliation: { '@type': 'Organization', name: 'UltraFit360', url: 'https://ultrafit360.com', sameAs: ['https://www.linkedin.com/company/ultrafit360'] }, knowsAbout: ['React', 'TypeScript', 'Node.js', 'Python', 'AI/ML'], sameAs: ['https://github.com/HERPESME', 'https://www.linkedin.com/in/eeshan-singh-pokharia-926790285', 'https://leetcode.com/u/EeshanSingh/'] };
  const mainEntity = page.section === 'projects' ? { '@type': 'ItemList', itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': p.codeUrl ? 'SoftwareSourceCode' : 'CreativeWork', name: p.title, description: p.description, creativeWorkStatus: p.status, ...(p.codeUrl ? { codeRepository: p.codeUrl } : {}), ...(p.websiteUrl || p.demoUrl ? { url: p.websiteUrl || p.demoUrl } : {}), creator: { '@id': person['@id'] } } })) } : { '@id': person['@id'] };
  return { '@context': 'https://schema.org', '@graph': [
    ...(entry?.faqs?.length ? [{ '@type': 'FAQPage', '@id': origin + page.path + '#faq', mainEntity: entry.faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }] : []),
    ...(entry ? [{ '@type': 'BlogPosting', '@id': articleId, headline: entry.title, description: entry.excerpt, url: origin + page.path, mainEntityOfPage: { '@id': origin + page.path + '#webpage' }, author: { '@id': person['@id'] }, publisher: { '@id': person['@id'] }, image: { '@type': 'ImageObject', url: origin + entry.cover.src, width: entry.cover.width, height: entry.cover.height, caption: entry.cover.caption }, inLanguage: 'en', keywords: entry.keywords, wordCount: blogWordCount(entry), dateModified: entry.reviewedOn, creativeWorkStatus: entry.isPreview ? 'Draft' : 'Published', ...(!entry.isPreview && entry.publishedOn ? { datePublished: entry.publishedOn } : {}), citation: entry.references.map(link => link.href.startsWith('/') ? origin + link.href : link.href) }] : []),
    ...(page.path !== '/' ? [{ '@type': 'BreadcrumbList', '@id': origin + page.path + '#breadcrumbs', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' }, ...(page.blogSlug ? [{ '@type': 'ListItem', position: 2, name: 'Blogs', item: origin + '/blogs' }] : []), { '@type': 'ListItem', position: page.blogSlug ? 3 : 2, name: page.label, item: origin + page.path }] }] : []),
    ...(page.section === 'about' ? [{ '@type': 'FAQPage', '@id': origin + page.path + '#faq', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }] : []), person, { '@type': 'WebSite', '@id': origin + '/#website', name: 'Night City Arcade', url: origin + '/', author: { '@id': person['@id'] } }, { '@type': page.section === 'about' ? 'ProfilePage' : page.section === 'projects' || (page.section === 'blogs' && !page.blogSlug) ? 'CollectionPage' : page.section === 'contact' ? 'ContactPage' : 'WebPage', '@id': origin + page.path + '#webpage', url: origin + page.path, name: page.title, description: page.description, isPartOf: { '@id': origin + '/#website' }, author: { '@id': person['@id'] }, ...(page.path !== '/' ? { breadcrumb: { '@id': origin + page.path + '#breadcrumbs' } } : {}), mainEntity: entry ? { '@id': articleId } : mainEntity }] };
}
export function updateHead(page: Page) {
  document.title = page.title;
  document.querySelector('meta[name="robots"]')?.setAttribute("content", page.indexable === false ? "noindex, follow" : "index, follow");
  document.head.querySelectorAll('meta[property^="article:"]').forEach(el => el.remove());
  for (const [key, content] of Object.entries(metadata(page))) {
    const attr = key.startsWith('og:') || key.startsWith('article:') ? 'property' : 'name';
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.append(el); }
    el.content = content;
  }
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
  canonical.href = origin + page.path;
  let json = document.getElementById('page-schema');
  if (!json) { json = document.createElement('script'); json.id = 'page-schema'; json.setAttribute('type', 'application/ld+json'); document.head.append(json); }
  json.textContent = JSON.stringify(schema(page));
}
