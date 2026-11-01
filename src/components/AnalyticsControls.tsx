import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsEnabled, analyticsPage, applyAnalyticsChoice, privacySignal, readAnalyticsChoice, saveAnalyticsChoice, track, trackPage, analyticsChoiceKey, type AnalyticsChoice } from '@/lib/analytics';
import { projects } from '@/lib/projects';
import './analytics.css';

let vitalsStarted = false;
function startVitals() {
  if (vitalsStarted) return;
  vitalsStarted = true;
  const landing = analyticsPage(window.location.pathname)?.path;
  if (!landing) return;
  void import('web-vitals').then(({ onCLS, onINP, onLCP }) => {
    const report = (metric: import('web-vitals').Metric) => track('web_vital', {
      metric_name: metric.name, metric_value: metric.value, metric_rating: metric.rating,
      navigation_type: metric.navigationType, metric_page: landing,
    });
    onCLS(report); onINP(report); onLCP(report);
  }).catch(() => { /* Optional performance reporting. */ });
}

export default function AnalyticsControls() {
  const { pathname } = useLocation();
  // Start identically on server and client to preserve hydration.
  const [choice, setChoice] = useState<AnalyticsChoice>('unknown');
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refresh = () => { const current = readAnalyticsChoice(); setChoice(current); applyAnalyticsChoice(current); };
    const changed = (event: Event) => setChoice((event as CustomEvent<AnalyticsChoice>).detail);
    const storage = (event: StorageEvent) => { if (event.key === analyticsChoiceKey || event.key === null) refresh(); };
    refresh(); setReady(true);
    window.addEventListener('storage', storage);
    window.addEventListener('nightcity:analytics-choice', changed);
    return () => { window.removeEventListener('storage', storage); window.removeEventListener('nightcity:analytics-choice', changed); };
  }, []);

  useEffect(() => { trackPage(pathname); }, [pathname]);
  useEffect(() => { if (choice === 'accepted' && analyticsEnabled()) startVitals(); }, [choice]);

  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest('a[href]');
      if (!anchor) return;
      const url = new URL(anchor.getAttribute('href')!, window.location.origin);
      if (url.origin === window.location.origin && url.pathname === '/files/Res-3.pdf') {
        track('file_download', { file_name: 'Eeshan_Singh_CV.pdf', file_extension: 'pdf' });
      } else if (url.protocol === 'mailto:') {
        track('contact_intent', { method: 'email' });
      } else {
        for (const project of projects) {
          for (const [destination, href] of Object.entries({ website: project.websiteUrl, code: project.codeUrl, app: project.appUrl, demo: project.demoUrl })) {
            if (href && url.href === new URL(href).href) {
              track('project_click', { project_id: project.id, destination }); return;
            }
          }
        }
      }
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);

  useEffect(() => {
    const page = analyticsPage(pathname);
    if (choice !== 'accepted' || !page?.article || !analyticsEnabled()) return;
    const sent = new Set<number>();
    let activeSeconds = 0, furthest = 0, engaged = false, frame = 0;
    const measure = () => {
      const article = document.getElementById('blog-article-body');
      if (!article || document.visibilityState !== 'visible') return;
      const rect = article.getBoundingClientRect();
      // Viewport progress through the real article, excluding cover and related cards.
      const progress = Math.min(100, Math.max(0, (window.innerHeight - rect.top) / rect.height * 100));
      furthest = Math.max(furthest, progress);
      for (const threshold of [25, 50, 75, 90]) {
        if (progress >= threshold && !sent.has(threshold)) {
          sent.add(threshold); track('article_progress', { article_slug: page.article, percent_scrolled: threshold });
        }
      }
      if (!engaged && activeSeconds >= 30 && furthest >= 50) {
        engaged = true; track('article_engaged', { article_slug: page.article, active_seconds: activeSeconds });
      }
    };
    const scroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && document.hasFocus()) activeSeconds++;
      measure();
    }, 1000);
    measure();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    return () => { clearInterval(timer); cancelAnimationFrame(frame); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); };
  }, [pathname, choice]);

  if (!ready || !analyticsEnabled()) return null;
  const showPanel = open || choice === 'unknown';
  const choose = (value: 'accepted' | 'declined') => { saveAnalyticsChoice(value); setOpen(false); };
  return <aside className="analytics-controls" aria-label="Analytics preferences">
    {showPanel ? <section className="analytics-panel" aria-labelledby="analytics-heading">
      <h2 id="analytics-heading">A little signal?</h2>
      <p>Allow Google Analytics to measure page visits, reading progress and performance. Form contents and search text are excluded. Your choice won’t affect the site.</p>
      <p className="analytics-detail">Google processes usage data for this site. You can change your choice here anytime. <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses data</a></p>
      {privacySignal() && <p className="analytics-detail">Your browser’s privacy signal keeps analytics off.</p>}
      <div className="analytics-actions"><button type="button" onClick={() => choose('declined')}>Keep analytics off</button><button type="button" disabled={privacySignal()} onClick={() => choose('accepted')}>Allow analytics</button></div>
      {open && <button className="analytics-close" type="button" onClick={() => setOpen(false)}>Close preferences</button>}
    </section> : <button type="button" className="analytics-preferences" aria-expanded={false} onClick={() => setOpen(true)}>Analytics: {choice === 'accepted' ? 'on' : 'off'}</button>}
  </aside>;
}
