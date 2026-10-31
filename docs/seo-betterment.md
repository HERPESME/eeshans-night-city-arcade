# SEO betterment

## Scope

Preserves React/Vite, existing section design, terminal, project filters and dialogs, keyboard shortcuts, animated GIFs, and persistent music. The four existing views now have independent URLs: `/`, `/profile`, `/projects`, `/terminal`. No thin pages were added merely to increase sitemap size.

## Implementation

- Build-time React rendering and browser hydration for real content in initial HTML.
- Shared route definitions drive per-page titles, descriptions, canonicals, social metadata, schema, and the production sitemap.
- Crawlable navigation, home actions, résumé and contact links.
- Person, WebSite, ProfilePage, CollectionPage/ItemList, and ContactPage JSON-LD based on existing content.
- First-visit intro is an overlay instead of replacing the content. Navigation preserves the app and audio element.
- Netlify serves generated section HTML; there is no catch-all 200 rewrite. Unknown routes retain HTTP 404 behavior.
- Original GIF retained. A 36-frame 800×450 GIF (~1.01 MiB) is used for social previews. A separate 36-frame 480×270 mobile GIF (~390 KiB) reduces the original 6.57 MiB transfer, with a responsive preload. Desktop keeps the original background.
- The same Press Start 2P typeface is self-hosted (Latin WOFF2 with OFL license), removing the render-blocking Google Fonts stylesheet dependency.
- Uploaded EeshanSinghPokharia.pdf replaces the résumé at the existing `/files/Res-3.pdf` URL.
- README contains direct links to the canonical site and section pages. External profile backlinks are not automatically created.

## Validation

Run `npm ci`, `npm run build`, `npm run test:seo`, `npm run lint`, and `npx tsc -p tsconfig.app.json --noEmit`.

The static checks cover each route's canonical, main heading, navigation links, schema JSON, verification token, readable HTML, sitemap inclusion, résumé link, project text, 404 metadata, and social GIF format/size.

## Deployment checks

1. Check direct navigation and refresh on all four routes in a Netlify preview. Confirm slash variants resolve without loops and canonicals consistently use the non-trailing-slash form.
2. Check arbitrary missing paths return 404 and functions still work. Local tests do not exercise Netlify's infrastructure or real message delivery.
3. Test the résumé download, music, project dialogs/filters, terminal commands, keyboard menu, and mobile navigation.
4. After merging/deploying, submit `/sitemap.xml` and inspect each URL in Search Console. Compare declared and Google-selected canonicals. Google controls indexing and timing.
5. Add the canonical site URL to relevant owned profiles and project READMEs where appropriate. Avoid bulk backlinks or fabricated project claims.

No live deployment, DNS change, Search Console submission, or external account profile edit is part of this branch.

## Measured local results (2026-10-31)

Production builds were checked with Chromium and Lighthouse's default mobile simulation over a local HTTP server. Final route checks passed for initial rendering/hydration, metadata, Profile → Terminal, browser back, Ctrl+K navigation, persistent audio element, and mobile menu navigation. TypeScript, ESLint, build, static SEO assertions, and whitespace checks passed. Uploaded and replacement résumé SHA-256 hashes match.

| Metric | Baseline | SEO branch |
| --- | --- | --- |
| Lighthouse performance | 86 | 82 |
| Lighthouse SEO | 100 | 100 |
| Lighthouse accessibility | 100 | 100 |
| First contentful paint | 1.5 s | 1.2 s |
| Largest contentful paint | 4.2 s | 4.8 s |
| Total blocking time | 20 ms | 10 ms |
| Cumulative layout shift | 0.008 | 0.008 |
| Captured transfer | 602 KiB | 1,029 KiB |

These are single-run lab observations, not production Core Web Vitals. The baseline loader delays mounting the portfolio and background, so its early capture includes less content; the new pages mount content immediately. The mobile animation is much smaller than the original, but LCP still needs production measurement and further work. No claim of an overall performance score increase is made. Lighthouse SEO alone cannot verify discovery of interaction-only sections or actual indexing. Netlify redirects/functions, social preview rendering, and Search Console indexing still need deployment-side checks.
