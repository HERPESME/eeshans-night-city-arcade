# Production field notes and gaming expansion — 2 November 2026

Adds twenty research-based engineering/product/founder essays and two gaming/technology essays. London remains reserved for the author. Existing eight article URLs are retained; the archive now contains thirty articles and the generated sitemap contains thirty-five public canonical URLs.

## Editorial scope

Each new article contains more than 1,000 words when headings and reference tables are included, with a distinct author perspective, useful examples and three public references. Generic code snippets are independent teaching examples. Articles distinguish historical implementation, current source inspection, proposals and live verification; they do not disclose private product repository URLs, prompts, credentials, infrastructure addresses, customer conversations or internal cohort figures. Existing broad guides remain intact and receive relevant inward links from the new pieces.

The gaming articles compare Ocarina of Time's design legacy with GTA VI anticipation, and explain AI frame generation versus input response. GTA VI is explicitly upcoming on the publication date; no hands-on experience, PC feature support or benchmark is fabricated. Release/platform facts were checked against Rockstar's official site.

## Artwork and interface evidence

Twenty-four original GPT-generated Japanese-inspired pixel-art scenes provide twenty-two covers and two gaming body illustrations. Full-size and 720-pixel variants are WebP; existing GIFs remain unchanged. Prompts and output paths are recorded in `journal-art-prompts.json`. New assets are isolated in the existing `/blog-images/` namespace.

Four additional WebP figures capture actual website components assembled with fictional records and invented assistant messages. They are explicitly labelled editorial component studies, not complete production-screen captures. The mobile permission article also uses the existing source-rendered React Native dashboard and nutrition figures with the established pixel-art field-kit frame. These are not native-device tests. No live API, customer account or real conversation was used for the new figures.

## Delivery and SEO

The existing renderer generates article HTML, metadata, one H1, canonical, Article/Breadcrumb schema and sitemap entries. Each new essay also has FAQ schema derived from the three questions and answers visible in its final section; no rich-result or ranking guarantee is made. New articles link to appropriate established guides and same-category peers. The existing category filters, search, music control and visual design are retained.

Initial hydration now preserves a valid URL fragment instead of resetting a deep-linked section to the top. Malformed fragments are handled literally. This supports links into the longer articles without changing route structure.

## Validation

- TypeScript check and production client/server build pass.
- Article checks pass for all thirty entries: content length, unique titles/descriptions/perspectives, schema, publication state, images and privacy rules.
- SEO and request-time SSR checks pass across all thirty-five public routes; unknown routes retain real 404/noindex behaviour.
- All eighty referenced built WebP assets pass format/completeness and Netlify routing-isolation checks.
- Internal-link audit passes 551 page links across all thirty-five routes.
- Existing analytics consent, blocked-SDK, route-deduplication and private-data checks pass.
- Desktop browser review confirms the archive, featured illustration, search and exactly two gaming-filter results. Representative article metadata and native-screen asset loading were inspected.
- An embedded 390-pixel layout viewport verifies readable article layout, no document-width overflow and the mobile navigation. This is browser layout QA, not real-device or field performance evidence.
- All twenty-four illustrations were visually reviewed as a contact sheet. Four source-component figures were reviewed separately.
- Thirty-two unique public reference URLs were checked. Thirty returned HTTP 200 directly; Search Console Help rate-limited and Microsoft refused the automated request. Their official pages were also retrieved through web research. These access responses are not classified as broken internal links.

The build retains a large-main-chunk warning (approximately 792 kB minified, 251 kB gzip). No runtime dependency or framework migration was added. This release does not claim a universal two-second load, field Core Web Vitals or search-ranking improvement.

## Publication and indexing

Use one production publication after review, rather than repeated deploys. The existing `https://technightcity.com/sitemap.xml` is updated in place. If already submitted successfully, keep that submission; it can discover new URLs. New article URLs are listed in `src/content/journal-stories.json`. Request indexing of priority URLs as quota permits, and use the existing Bing sitemap submission. No Search Console/Bing submissions or account changes are part of this content implementation.
