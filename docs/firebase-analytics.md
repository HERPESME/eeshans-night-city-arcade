# Firebase Analytics and the SEO feedback loop

Branch: `firebase-analytics`. Hosting stays on Netlify. The merged `blogs` branch was deleted; all six published articles remain. No Firebase Hosting initialization, Firestore database or new service account is needed.

## What was learned from UltraFit360

Reviewed `UltraFit360_Website/src/lib/analytics.js`, its tests, `index.html`, the coach CTA usage and the coach SEO design. That website uses Firebase for Auth/Firestore and a separate Google tag for GA4. Its useful pattern is small, failure-safe events tied to actual user actions, alongside crawlable pages with distinct search intent. This portfolio uses the same event approach with Firebase’s modular Analytics SDK. UltraFit360’s measurement IDs, advertising tags, databases, credentials and customer data are not copied.

## Before this branch is released: owner account setup

Use the Google account that owns `technightcity` in [Firebase](https://console.firebase.google.com/project/technightcity/analytics) and the corresponding property in [Google Analytics](https://analytics.google.com/). Browser config alone does not give code access to private reporting or permission to change GA4 settings.

1. Confirm Analytics is enabled for Firebase project `technightcity` and the linked GA4 web stream has measurement ID **G-FCGWB3XBCP**. Do not create a second property or add another Google tag/GTM snippet to the site.
2. GA4 → Admin → Data collection and modification → Data streams → this web stream → Enhanced measurement. **Turn enhanced measurement off** for this implementation. The app sends its own page views, scroll milestones, outbound project clicks and downloads. Leaving browser-history page measurement enabled duplicates SPA page views even with `send_page_view: false`. Disabling automatic form and site-search measurement also prevents accidental collection of inputs. Basic GA4 automatic events such as engagement remain.
3. Review the web stream’s Google tag settings for any additional automatic event detection or third-party tags. Enable GA4 data redaction for email and sensitive URL parameters as an additional safeguard. Do not enable user-provided data collection, Google Signals or advertising personalization for this portfolio.
4. GA4 → Admin → Product links → Search Console links → Link. Select the verified **technightcity.com** property and the web stream above. You need appropriate access to both services. GA4 → Reports → Library: publish the **Search Console** collection to see Queries and Google Organic Search Traffic. Search Console data can lag by about 48 hours; this cannot recover uncollected historical GA4 events.
5. GA4 → Admin → Data display → Custom definitions: create **event-scoped dimensions** `page_section`, `article_slug`, `percent_scrolled`, `project_id`, `destination`, `category`, `metric_name`, `metric_rating`, `navigation_type`, `metric_page`. Event-scoped custom metrics: **Active reading seconds** using parameter `reading_time_seconds` (Seconds), and **Web vital value** using parameter `web_vital_value` (Standard; filter by metric name before interpreting). The original `active_seconds` and `metric_value` event parameters remain compatible with existing dimension definitions. GA4 rejects using the same parameter as both a dimension and a metric, so the SDK helper also emits the distinct numeric parameters. CLS is unitless; LCP/INP values are milliseconds. Do not aggregate unlike vital metrics together.
6. GA4 → Admin → Data display → Key events: add **generate_lead**. This fires only after a successful contact-server response. A résumé download, mail click or project click is an intent signal, not proof of a lead; keep those as events unless you deliberately choose otherwise.
7. Set property timezone/report retention to suit your reporting needs. Use internal/developer traffic filters carefully: test a filter before activating it, since excluded data cannot be recovered.

These account settings are not changed by installing the SDK. The Firebase linkage, canonical web stream URL, disabled enhanced measurement, Search Console domain linkage and custom definitions were inspected in the owner account before release. The previously blank stream URL was corrected to `https://technightcity.com`. No real performance metrics or indexing claims have been invented.

## Collection and visitor controls

- Only canonical production hostname `technightcity.com` collects. Localhost, Netlify branch previews and SSR never load Firebase Analytics. A copied consent choice on a preview still cannot send events.
- Firebase modules and Google’s tag load **after opt-in**. Decline is equally accessible. The persistent “Analytics: on/off” control allows withdrawal; collection is disabled and first-party GA cookies are cleared. DNT/GPC privacy signals keep analytics off. Blocked storage means the choice lasts only for the session.
- Consent is synchronized across tabs when browser storage is available. No pre-consent event backlog is replayed. Actions during SDK startup can be missed; optional measurement must never delay interaction.
- Known canonical route paths and authored titles replace raw locations. Query strings, hashes, arbitrary 404 paths, email addresses, terminal commands, contact payloads and archive-search text are excluded from custom events. External referrers are reduced to their origin. This intentionally sacrifices campaign-parameter detail to avoid leaking URL contents.
- No advertising integrations, user IDs, Firestore writes or public reporting endpoints are added. Google Analytics still processes normal browser/device and consented usage data; it is not anonymous simply because form text is excluded.
- Firebase’s browser configuration is public by design. No service-account keys or reporting credentials belong in Vite variables, browser bundles or this repository.

| Event | Meaning | Useful parameters |
|---|---|---|
| `page_view` | One view per canonical pathname transition, including Back/Forward; not hash/filter changes | page_path, page_title, page_section, page_referrer |
| `article_view` | An article is opened after consent | article_slug |
| `article_progress` | Viewport reaches 25/50/75/90% of article body, once per visit | article_slug, percent_scrolled |
| `article_engaged` | At least 30 focused visible seconds and ≥50% viewport progress | article_slug, active_seconds, reading_time_seconds |
| `share` | Article URL successfully copied | article_slug, method |
| `blog_filter` | A category button is selected; not the typed search text | category |
| `project_click` | A curated project’s code/site/demo/app link is clicked | project_id, destination |
| `file_download` | Résumé download link clicked; not proof the download completed | file_name, file_extension |
| `contact_intent` | Email link clicked; no address sent | method |
| `generate_lead` | Contact endpoint returned success; not just submit/validation | method |
| `web_vital` | Browser field measurements: LCP, CLS, INP | metric_name, metric_value, web_vital_value, metric_rating, navigation_type, metric_page |

Performance metrics describe the document lifecycle, not an independently measured Core Web Vital for every SPA navigation. `metric_page` identifies the landing page when measurement starts. They represent consenting visitors, may miss visitors who leave before consenting, and are not a substitute for Search Console/CrUX field reports. Scroll and engagement are proxies, not proof that someone read every word. GA4 totals will differ from Search Console clicks because of consent, blockers, definitions and reporting delays.

## Verify once after the approved production release

1. In a fresh browser session, decline: there should be no Firebase Analytics/Google tag requests and no `_ga` cookie. Reload and navigate: still no analytics. Open preferences and accept: one current-page view, not a replay of previous pages.
2. Use Google Tag Assistant or a temporary `VITE_ANALYTICS_DEBUG=true` production build to inspect DebugView. This variable enables debug mode only; it **never bypasses hostname or consent checks**. Remove it after verification. Do not send repeated synthetic submissions to the real contact inbox.
3. Navigate Home → Blogs → an article → Back. Check exactly one `page_view` per route, correct titles/referrers, no page view for TOC anchors. Read/scroll, copy the URL, download the résumé and click a project link. Realtime/DebugView should show the corresponding events.
4. Withdraw consent; inspect collection and cookies again. Test keyboard controls and a narrow mobile viewport. GPC/DNT should keep collection disabled even if an old stored choice says accepted.
5. Standard GA4 reports may take 24–48 hours. Check Search Console’s Pages report separately. Existing sitemap: [https://technightcity.com/sitemap.xml](https://technightcity.com/sitemap.xml). This analytics branch does not create indexable content URLs, so it does not require another indexing request or sitemap resubmission by itself.

## Reports to use each week

In **Search Console → Performance → Search results**, choose Web and the last complete 28 days; compare with the preceding equivalent period. Look at both Queries and Pages, splitting country/device when relevant. Metrics: impressions, clicks, CTR, average position. Filter a query then open Pages to identify its actual landing page. Do not assume query-page pairs from unrelated aggregate tables, and do not infer per-query leads.

In **GA4**, inspect organic landing pages, acquisition source/medium, engagement, article milestones, project clicks, résumé intent and successful contacts. Use Explorations for event name + article_slug/project_id/destination, and use the Search Console collection for search queries. GA4 alone cannot reveal all Google organic keywords.

Keep a private weekly change log: date, URL, observed evidence, proposed explanation, one change, and the next review date. Prioritize:

- Lots of impressions and a useful position but weak CTR: inspect actual results and search intent, then test an accurate title/description.
- Positions roughly 8–20: improve the existing answer and evidence; link relevant existing pages to it.
- Clicks with weak article engagement: check loading, mobile reading and whether the intro answers the query.
- Good engagement but little contact/project interest: make the existing relevant CTA clearer.
- Falling clicks: separate a fall in demand/impressions from a fall in position or CTR before changing a page.
- New canonical/indexing or poor Core Web Vitals warnings: investigate those before writing more keyword pages.

No keyword stuffing, fake FAQs, automatic backlink claims, duplicate pages or made-up statistics. Analytics supports decisions; it does not itself improve rankings.

## Private CSV review tool

No additional package or API key is needed; Python 3.9+ is sufficient. In Search Console’s English interface, export the Queries and Pages tables as CSV. Extract the archive under `analytics-private/2026-11-current/` and the preceding window under `analytics-private/2026-10-previous/`. These files and reports are gitignored and never copied by Vite into the deployed site.

```bash
python3 scripts/seo-report.py \
  --current analytics-private/2026-11-current/Queries.csv \
  --previous analytics-private/2026-10-previous/Queries.csv \
  --out analytics-private/reports/queries-2026-11.md

python3 scripts/seo-report.py \
  --current analytics-private/2026-11-current/Pages.csv \
  --previous analytics-private/2026-10-previous/Pages.csv \
  --out analytics-private/reports/pages-2026-11.md
```

Use equal windows and matching property/country/device/search-type filters. `--days` and `--previous-days` default to 28; set them accurately if different. Omit `--previous` for a first baseline. Outputs show observed winners, snippet-review candidates, near-page-one opportunities and comparable declines. Thresholds are explicitly heuristics; missing query rows are not treated as zero. Reports stay inside `analytics-private/` even if another output path is requested. Do not put account exports into public assets.

A direct reporting connection through Windsor.ai with the owner’s GA4/Search Console authorization can replace manual exports. Windsor.ai is installed; its GA4/Search Console source connections need their own authorization. Signing into Google in the browser does not automatically connect those accounts to Windsor.ai. No dashboard access or recurring analysis is implied by installation or the browser Firebase config. Reuse existing working Google connections when reporting tools are available; do not create duplicate properties.

## References

- [Firebase web Analytics](https://firebase.google.com/docs/analytics/get-started?platform=web) and [modular API](https://firebase.google.com/docs/reference/js/analytics)
- [Manual page views and duplicate prevention](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Link Search Console to GA4](https://support.google.com/analytics/answer/10737381)
- [Search Console performance metrics](https://support.google.com/webmasters/answer/7576553)
- [GoogleChrome web-vitals](https://github.com/GoogleChrome/web-vitals)

## Validation commands

```bash
npm run test:analytics
npm run test:seo-report
npm run build
npm run test:seo
npm run test:ssr
npm run test:blogs
npx tsc --noEmit -p tsconfig.app.json
```

Pushes for this development branch use `[skip netlify]`; merge and deploy together only after owner settings and review are ready. All existing GIFs, WebP artwork, 11 canonical routes, request SSR and sitemap entries remain.

Implementation validation completed on 1 November 2026: production client/SSR builds; TypeScript; lint on the new analytics modules and edited blog components; analytics state-machine/privacy tests; CSV parsing, comparison and private-output tests; existing SEO, request SSR, blog publication and WebP routing checks. A Chromium browser run used the real Firebase SDK with Google endpoints mocked, so it sent no synthetic traffic to the live property. It verified desktop/mobile controls, no SDK requests before consent or on previews/GPC, deduplicated route views, hash anchors, article progress and 30-second focused engagement, copying, résumé/project clicks, failed-versus-successful contact responses and withdrawal. No browser JavaScript or hydration errors were observed. Production delivery to GA4 is checked after the single approved release; standard reports can lag behind Realtime. Separate Google account checks on release day exposed the dimension/metric parameter conflict; dedicated numeric parameter aliases and regression checks were added for it.
