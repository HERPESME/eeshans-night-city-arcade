import type { BlogEntry } from '@/content/blogs';

// Editorial reading paths connect focused lessons rather than repeatedly
// selecting the first two articles in a broad category.
const readingPaths = [
  // Topic-specific reading paths for the November practical guides.
  ["gta-6-game-sharing-ps5-xbox-rules", "gta-6-pc-release-fake-download-checklist", "gta-6-offline-disc-digital-licence-checks", "gta-6-xbox-one-cloud-vs-native-port", "gta-6-ps5-pro-graphics-vs-60-fps", "ps5-disc-digital-gta-6-total-cost", "gta-6-downloaded-locked-ps5-licence", "gta-6-remote-play-vs-cloud-gaming", "gta-6-accessibility-first-session-checklist", "psn-down-gta-6-launch-diagnosis"],
  ["open-webui-tether-local-model-connection", "tether-mcp-local-command-sandbox-boundary", "tether-windows-terminal-startup-diagnostics", "open-webui-tether-model-id-missing"],
  ["vllm-0-34-upgrade-breaking-changes-checklist", "vllm-extensible-kv-cache-throughput-latency", "vllm-out-of-memory-after-startup-triage", "ttft-tpot-tokens-per-second-local-llm-benchmark", "vllm-rocm-image-migration-reproducible-deploy"],
  ["ollama-windows-environment-variables-restart", "ollama-local-only-disable-cloud-verify-path", "ollama-cpu-gpu-placement-diagnostics", "ollama-503-overloaded-queue-bounded-retry"],
  ["deepseek-chat-demo-browser-api-key-production", "deepseek-streaming-citations-block-safe-rendering", "deepseek-file-parsing-upload-ui-lifecycle", "deepseek-responses-api-stateless-migration", "deepseek-safety-checks-application-guardrails"],
  ["github-copilot-evals-skills-mcp-regression-tests", "github-copilot-evals-vs-copilot-studio", "gemini-4-neon-copilot-missing-plan-rollout-policy", "mai-code-2-vs-flash-copilot-task-selection"],
  ["copilot-adaptive-code-review-policy-ceiling", "copilot-secret-detection-review-security-boundary", "copilot-team-plugins-child-team-inheritance", "supabase-mcp-copilot-schema-before-migration", "github-cli-event-streams-pr-review-without-polling", "copilot-cross-repository-review-public-private-context", "github-team-security-risk-assessment-remediation"],
  ["prompt-injection-tool-result-harmless-agent-test", "rag-data-retention-delete-source-derived-copies", "local-mcp-stdio-vs-http-transport-security", "firebase-email-verified-firestore-permission-token-refresh"],
  ["developer-offer-rsus-first-year-cash-vesting", "software-engineer-salary-median-sample-bias", "joining-bonus-vs-base-two-year-developer-offer", "ai-era-developer-portfolio-bug-fix-evidence", "startup-internship-vs-product-role-questions"],
  ["measure-google-ai-search-impressions-engagement", "bing-discovered-live-url-pass-not-indexed"],

  ['run-a-daily-seo-audit-with-github-actions-and-node-js', 'dependabot-alerts-inactive-repository', 'github-actions-arm32-raspberry-pi-build'],
  ['store-nutrition-quantities-without-unit-conversion-bugs', 'pandera-parsedfield-derived-columns', 'structured-llm-extraction-with-json-schema-and-validation'],
  ['figma-to-frontend-web-mobile-workflow', 'figma-make-vs-mcp-existing-react-app', 'figma-mcp-ide-design-to-code', 'scoped-design-tokens-css-regression', 'react-query-wrong-tab-cache-identity', 'dashboard-empty-loading-error-accessibility', 'react-prerender-seo-canonical-real-404', 'blog-image-workflow-webp-semantic-audit', 'frontend-developer-salary-india-base-vs-ctc'],
  ['ultrafit360-srs-to-react-native-app', 'expo-react-native-production-problems-ultrafit360', 'expo-google-play-photo-permission-rejection', 'expo-sdk-58-upgrade-checklist', 'duplicate-notifications-atomic-claims', 'cron-job-first-event-schedule-state', 'react-native-health-connect-duplicate-steps'],
  ['build-ai-coach-prompt-engineering-rag-guardrails', 'ai-memory-authoritative-state-context-engineering', 'llm-token-accounting-cost-dashboard', 'opentelemetry-missing-ai-request-spans', 'ai-agent-evaluations-tool-calls', 'claude-fable-5-2-benchmarks-pricing-coding', 'weight-space-programming-astra-qwen', 'nvidia-investigation-ai-race-local-llms', 'openshell-local-inference-ollama-verification', 'sam-altman-ram-local-ai-cloud', 'geoffrey-hinton-ai-blackout-warning', 'gpt-6-cyber-access-authorized-code-review', 'ai-agent-false-confirmations-verify-writes', 'mcp-coach-tools-authorization-boundaries', 'claude-personal-finance-plaid-privacy', 'read-only-ai-copilot-human-decisions', 'ultrafit360-chatgpt-claude-mcp-guide'],
  ['startup-credits-app-cost-myth', 'startup-credits-reversible-architecture', 'postgres-cloud-migration-logical-replication', 'startup-signups-versus-activation-metrics', 'lifecycle-messages-notification-fatigue', 'indexed-pages-clicks-qualified-enquiries', 'fitness-coaching-apps-ultrafit360-comparison'],
  ['ocarina-of-time-gta-6-worlds-generations', 'gta-6-preload-ps5-xbox-storage', 'xbox-cloud-gaming-phone-controller', 'ai-frame-generation-fps-input-latency', 'discord-rust-electron-rewrite', 'ocarina-of-time-switch-2-update', 'ocarina-of-time-master-quest-dlc', 'pikmin-bloom-dandori-academy-demo-rewards'],
  ['gemini-video-analysis-with-timestamps-and-structured-output', 'gemini-omni-1-2-flash-15-second-video', 'merge-duplicate-detections-across-video-chunks'],
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
