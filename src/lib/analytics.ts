import { AnalyticsTracker, type AnalyticsPage, type AnalyticsParams } from './analytics-core';
import { routes } from './seo';

export type AnalyticsChoice = 'accepted' | 'declined' | 'unknown';
export const analyticsChoiceKey = 'nightcity.analytics-consent.v1';
let tracker: AnalyticsTracker | undefined;
export function analyticsEnabled() {
  return typeof window !== 'undefined' && window.location.hostname === 'technightcity.com';
}
export function privacySignal() {
  return typeof navigator !== 'undefined' && ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || navigator.doNotTrack === '1');
}
export function readAnalyticsChoice(): AnalyticsChoice {
  if (privacySignal()) return 'declined';
  try {
    const saved = localStorage.getItem(analyticsChoiceKey);
    return saved === 'accepted' || saved === 'declined' ? saved : 'unknown';
  } catch { return 'unknown'; }
}
export function analyticsPage(pathname: string): AnalyticsPage | undefined {
  // Only authored public routes. Arbitrary URLs, queries and terminal input never enter reports.
  const path = pathname.replace(/\/$/, '') || '/';
  const page = routes.find(item => item.path === path && item.indexable !== false);
  return page && { path, title: page.title, section: page.section, ...(page.blogSlug ? { article: page.blogSlug } : {}) };
}
function getTracker() {
  if (typeof window === 'undefined') return;
  tracker ??= new AnalyticsTracker(analyticsEnabled(), async (active, page, referrer) => {
    const { loadFirebaseAnalytics } = await import('./analytics-firebase');
    return loadFirebaseAnalytics(active, page, referrer);
  }, document.referrer);
  return tracker;
}
export function trackPage(pathname: string) { getTracker()?.pageView(analyticsPage(pathname)); }
export function applyAnalyticsChoice(choice: AnalyticsChoice) {
  void getTracker()?.consent(choice === 'accepted' && !privacySignal());
}
export function saveAnalyticsChoice(choice: Exclude<AnalyticsChoice, 'unknown'>) {
  try { localStorage.setItem(analyticsChoiceKey, choice); } catch { /* Session-only choice if storage is unavailable. */ }
  applyAnalyticsChoice(choice);
  if (choice === 'declined') clearAnalyticsCookies();
  window.dispatchEvent(new CustomEvent('nightcity:analytics-choice', { detail: choice }));
}
function clearAnalyticsCookies() {
  for (const entry of document.cookie.split(';')) {
    const name = entry.split('=')[0].trim();
    if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(name)) continue;
    for (const domain of ['', ';domain=technightcity.com', ';domain=.technightcity.com']) {
      document.cookie = `${name}=;max-age=0;path=/${domain};SameSite=Lax;Secure`;
    }
  }
}

// An allowlist is intentional: no callers can accidentally send form values, emails or search text.
const fields: Record<string, string[]> = {
  article_progress: ['article_slug', 'percent_scrolled'], article_engaged: ['article_slug', 'active_seconds'],
  share: ['article_slug', 'method'], blog_filter: ['category'],
  project_click: ['project_id', 'destination'], file_download: ['file_name', 'file_extension'],
  contact_intent: ['method'], generate_lead: ['method'],
  web_vital: ['metric_name', 'metric_value', 'metric_rating', 'navigation_type', 'metric_page'],
};
export function track(name: string, params: AnalyticsParams = {}) {
  const allowed = fields[name];
  if (!allowed) return;
  const clean = Object.fromEntries(Object.entries(params).filter(([key, value]) => allowed.includes(key) && (typeof value === 'number' ? Number.isFinite(value) : /^[a-zA-Z0-9_. /-]{1,100}$/.test(value))));
  getTracker()?.event(name, clean);
}
