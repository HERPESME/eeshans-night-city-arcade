import type { BlogEntry } from '@/content/blogs';

// Editorial reading paths connect focused lessons rather than repeatedly
// selecting the first two articles in a broad category.
const readingPaths = [
  ['figma-to-frontend-web-mobile-workflow', 'figma-mcp-ide-design-to-code', 'scoped-design-tokens-css-regression', 'react-query-wrong-tab-cache-identity', 'dashboard-empty-loading-error-accessibility', 'react-prerender-seo-canonical-real-404', 'blog-image-workflow-webp-semantic-audit'],
  ['ultrafit360-srs-to-react-native-app', 'expo-react-native-production-problems-ultrafit360', 'expo-google-play-photo-permission-rejection', 'duplicate-notifications-atomic-claims', 'cron-job-first-event-schedule-state'],
  ['build-ai-coach-prompt-engineering-rag-guardrails', 'ai-memory-authoritative-state-context-engineering', 'llm-token-accounting-cost-dashboard', 'opentelemetry-missing-ai-request-spans', 'ai-agent-evaluations-tool-calls', 'ai-agent-false-confirmations-verify-writes', 'mcp-coach-tools-authorization-boundaries', 'read-only-ai-copilot-human-decisions', 'ultrafit360-chatgpt-claude-mcp-guide'],
  ['startup-credits-app-cost-myth', 'startup-credits-reversible-architecture', 'postgres-cloud-migration-logical-replication', 'startup-signups-versus-activation-metrics', 'lifecycle-messages-notification-fatigue', 'indexed-pages-clicks-qualified-enquiries', 'fitness-coaching-apps-ultrafit360-comparison'],
  ['ocarina-of-time-gta-6-worlds-generations', 'ai-frame-generation-fps-input-latency'],
];

const stopWords = new Set(['the', 'and', 'with', 'from', 'that', 'this', 'our', 'how', 'why', 'for', 'your', 'ultrafit360']);
function terms(entry: BlogEntry) {
  return new Set(`${entry.title} ${entry.keywords.join(' ')}`.toLowerCase().match(/[a-z0-9]+/g)?.filter(word => word.length > 2 && !stopWords.has(word)) || []);
}

export function relatedBlogEntries(entry: BlogEntry, entries: BlogEntry[], limit = 2): BlogEntry[] {
  const available = entries.filter(candidate => candidate.slug !== entry.slug && !candidate.isPreview);
  const path = readingPaths.find(items => items.includes(entry.slug));
  const position = path?.indexOf(entry.slug) ?? -1;
  const preferred = path && position >= 0
    ? [path[(position + 1) % path.length], path[(position + path.length - 1) % path.length]]
    : [];
  const selected = [...new Set(preferred)].flatMap(slug => {
    const candidate = available.find(item => item.slug === slug);
    return candidate ? [candidate] : [];
  });
  const sourceTerms = terms(entry);
  const score = (candidate: BlogEntry) => [...terms(candidate)].filter(word => sourceTerms.has(word)).length * 2 + Number(candidate.category === entry.category);
  const remaining = available.filter(candidate => !selected.some(item => item.slug === candidate.slug)).sort((a, b) =>
    score(b) - score(a) || (b.publishedOn || '').localeCompare(a.publishedOn || '') || a.slug.localeCompare(b.slug));
  return [...selected, ...remaining].slice(0, Math.max(0, limit));
}
