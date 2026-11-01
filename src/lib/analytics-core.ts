// No browser or Firebase imports: this state machine can also be tested in Node.
export type AnalyticsValue = string | number;
export type AnalyticsParams = Record<string, AnalyticsValue>;
export interface AnalyticsPage { path: string; title: string; section: string; article?: string }
export interface AnalyticsTransport {
  context: (page: AnalyticsPage, referrer: string) => void;
  event: (name: string, params: AnalyticsParams) => void;
  stop: () => void;
}
export const ANALYTICS_ORIGIN = 'https://technightcity.com';

export class AnalyticsTracker {
  private allowed = false;
  private transport?: AnalyticsTransport;
  private loading = false;
  private generation = 0;
  private page?: AnalyticsPage;
  private reportedVisit = -1;
  private visit = 0;
  private referrer: string;

  constructor(private enabled: boolean, private load: (active: () => boolean, page: AnalyticsPage, referrer: string) => Promise<AnalyticsTransport | undefined>, initialReferrer = '') {
    // External referral origins are sufficient for attribution; never send their query strings.
    try { this.referrer = new URL(initialReferrer).origin + '/'; } catch { this.referrer = ''; }
  }

  async consent(allowed: boolean) {
    const wasAllowed = this.allowed;
    this.allowed = allowed && this.enabled;
    if (!this.allowed) {
      this.generation++;
      try { this.transport?.stop(); } catch { /* A blocked tag cannot prevent withdrawal. */ }
      this.transport = undefined;
      this.reportedVisit = -1;
      if (wasAllowed) this.referrer = '';
      return;
    }
    await this.start();
  }

  pageView(page?: AnalyticsPage) {
    if (page?.path === this.page?.path) return;
    this.page = page;
    this.visit++;
    if (this.allowed) void this.start();
  }

  private async start() {
    if (!this.allowed || !this.page) return;
    if (!this.transport && !this.loading) {
      this.loading = true;
      const generation = this.generation;
      const active = () => this.allowed && generation === this.generation;
      try {
        const transport = await this.load(active, this.page, this.referrer);
        if (!active()) transport?.stop();
        else this.transport = transport;
      } catch { /* A blocked analytics service must not affect the portfolio. */ }
      finally {
        this.loading = false;
        if (this.allowed && generation !== this.generation) void this.start();
      }
    }
    if (!this.allowed || !this.transport || !this.page || this.reportedVisit === this.visit) return;
    this.reportedVisit = this.visit;
    try { this.transport.context(this.page, this.referrer); } catch { return; }
    this.event('page_view');
    if (this.page.article) this.event('article_view', { article_slug: this.page.article });
    this.referrer = ANALYTICS_ORIGIN + this.page.path;
  }

  event(name: string, params: AnalyticsParams = {}) {
    if (!this.allowed || !this.transport || !this.page) return;
    try {
      this.transport.event(name, {
        ...params, page_location: ANALYTICS_ORIGIN + this.page.path,
        page_title: this.page.title, page_path: this.page.path, page_section: this.page.section,
      });
    } catch { /* Tracking is optional, including when an extension blocks it. */ }
  }
}
