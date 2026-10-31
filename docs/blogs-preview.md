# Blogs frontend preview

## Review scope

The `blogs` branch adds the Blogs tab immediately after Terminal in desktop/mobile navigation and as shortcut 5 in the command palette. It contains a blog archive and seven sample reading pages. All copy and illustrative imagery are for layout review; no finished personal stories or publication dates are claimed.

The design keeps the existing dark-purple palette, pixel headings, neon edges, shared navigation, and music. Long-form text uses a system font, a constrained reading column, and quieter surfaces. On blog routes the music control is compact so it does not cover the text; the audio element and current playback persist during client navigation.

## Main views

- `/blogs`: featured entry, thumbnail grid, six category controls, case-insensitive search, clear/reset controls and an empty state.
- `/blogs/from-figma-to-a-working-app`: representative reading view with cover, short text, supporting SVG illustration, contents links, reading-progress indicator, copy-link feedback, author panel and related entries.
- The other sample URLs are defined in `src/content/blogs.ts` and exercise categories and image/text combinations.

`src/components/blog/blogs.css` contains the scoped visual system. Existing page typography and GIF assets are unchanged. The navigation switches to its mobile menu below 1024px so the additional tab fits without crowding.

## Content and SEO protection

Every sample has `isPreview: true`. The hub remains a preview while there are no completed entries. Preview pages return `noindex, follow` in the HTML and `X-Robots-Tag: noindex`; they are excluded from the sitemap. Samples use WebPage/CollectionPage and breadcrumb descriptions rather than pretending to be published BlogPosting records.

The existing four public pages remain indexable and retain their canonical URLs. Unknown blog slugs return real 404 responses. Server rendering uses the actual request path for the error shell, preventing a mismatch between server and browser controls on unknown blog URLs.

After layout approval, replace sample copy/images and add actual publication metadata and BlogPosting structured data as part of the content phase. Flip `isPreview` only for reviewed, finished content. The hub becomes indexable when at least one entry is no longer a preview. Do not publish the samples just to increase sitemap size.

## Validation completed

- TypeScript, ESLint, production build and whitespace checks.
- Existing `test:seo` and `test:ssr` checks, extended to account for draft routes.
- `npm run test:blogs`: route status, indexing protection, breadcrumb depth, archive links, supporting images and unknown-slug 404 behavior.
- Browser testing against the production renderer at 320, 390, 768, 1024 and 1440 CSS pixels: no horizontal overflow and related-card content stays inside its borders.
- Category selection, combined search/filter behavior, case/whitespace search, clearing, empty-state reset, direct article loading, contents anchors, reading progress, copy-link behavior, back navigation, command shortcuts and mobile navigation.
- Persistent audio across client navigation; compact blog controls.
- Existing sections and reading without JavaScript; no hydration or page errors.
- Desktop/mobile screenshots were inspected and the mobile related-card layout was corrected.

## Local review

```sh
npm ci
npm run dev
```

Open the address Vite prints, then choose Blogs. For generated pages and route checks:

```sh
npm run build
npm run test:seo
npm run test:ssr
npm run test:blogs
```

## Publishing constraint

Keep interim commits marked `[skip netlify]` and avoid opening an ordinary PR while the layout/content is under review. Netlify supports this commit marker to skip automatic branch/production deploys. If a review PR becomes necessary, its title also needs the marker to suppress the automatic Deploy Preview.

After the author approves the layout and content is ready, perform one final merge with a merge message/title that does not contain a skip marker, then verify that single production deployment. This frontend preview is not a production release.
