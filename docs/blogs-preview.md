# Blogs frontend preview

## Review scope

The `blogs` branch adds the Blogs tab immediately after Terminal in desktop/mobile navigation and as shortcut 5 in the command palette. The archive now contains three complete first-person editorial drafts with six original GPT-generated illustrations. Publication remains paused for author review.

The design keeps the existing dark-purple palette, pixel headings, neon edges, shared navigation, and music. Long-form text uses a system font, a constrained reading column, and quieter surfaces. On blog routes the music control is compact so it does not cover the text; the audio element and current playback persist during client navigation.

## Main views

- `/blogs`: featured entry, thumbnail grid, six category controls, keyword-aware search, clear/reset controls and an empty state. Unwritten categories correctly return an empty state.
- `/blogs/figma-to-frontend-web-mobile-workflow`: Figma, wireframing, UI/UX, reusable components, surface styles, React/React Native and Figma Make.
- `/blogs/ultrafit360-srs-to-react-native-app`: the confirmed SRS starting point, Figma-first mobile frontend ownership, source-backed components, Android/iOS safe areas and glass-layout distinctions.
- `/blogs/figma-mcp-ide-design-to-code`: current official MCP tools, design-file preparation, example IDE prompt, framework adaptation, Code Connect, scope and visual review.

All reading pages include a cover, supporting artwork, contents links, reading progress, copy-link feedback, author bio, related articles, contextual internal links and technical sources. Tables and the example prompt have responsive, keyboard-accessible layouts.

`src/components/blog/blogs.css` contains the scoped visual system. Existing page typography and GIF assets are unchanged. The navigation switches to its mobile menu below 1024px so the additional tab fits without crowding.

## Content and SEO protection

Every article has `isPreview: true` pending author approval. Preview pages return `noindex, follow` in HTML and `X-Robots-Tag: noindex`; they are excluded from the sitemap. Written articles now have BlogPosting records with `creativeWorkStatus: Draft`, author, image, sources, keywords, word count and review date. They do not claim a publication date. Client navigation clears article-specific social tags when leaving an article.

The existing four public pages remain indexable and retain their canonical URLs. Unknown blog slugs return real 404 responses. Server rendering uses the actual request path for the error shell, preventing a mismatch between server and browser controls on unknown blog URLs.

For release, obtain author review of the personal narrative, set each approved article’s `isPreview: false`, and set `publishedOn` to the actual publication date. Update `reviewedOn` when its content is revised. The hub becomes indexable when at least one article is approved; approved article URLs then enter the generated sitemap. Run the indexing checks with the intended publication settings before merging.

## Artwork and evidence

All six scenes were generated with the built-in GPT image generator in a consistent neon Night City pixel-art style. Prompts and provenance are in `docs/blog-art-prompts.json`. Generated scenes have 1200 × 800 WebP files; covers also have 720 × 480 variants. Native dimensions and responsive image preloads reserve space and avoid unnecessary transfers.

UltraFit360 scenes use original Dashboard and Metrics screenshots from the website repository. Their original files are byte-for-byte copies, with SHA-256 hashes in the manifest. Separate lossless WebP display versions preserve the decoded screen pixels. `BlogImageView` overlays these images into the generated phone frames using their original aspect ratios. No generative redraw, pixelation, or crop is applied to the app UI. Original screens can be opened from the supporting figure. The old sample SVG has been removed; existing site GIFs are unchanged.

The app source inspected was commit `ba6f2fa3`. Source evidence includes `WelcomeScreen.tsx`, shared theme/constants/components, `NativeTabsLayout.tsx`, `MainTabLayout.tsx`, `FooterNavigation.tsx`, `LoadingOverlay.tsx`, and `WorkoutSummaryScreen.tsx`. The active main-tab route in App.tsx uses NativeTabsLayout: native TabView on iOS with translucency and SF Symbols, and custom FooterNavigation on Android. The article includes that source excerpt and the library’s official native-material guidance. The custom footer’s separate glass variant contains unfinished native-effect comments; other overlays use expo-blur. The article distinguishes these code paths and explains Expo GlassView as a separate API. The original SRS and Figma file are not available here; the user supplied the SRS origin and frontend authorship. No SRS clauses, tool execution transcript, usage metrics, conversion gains, or launch outcomes are fabricated. Figma Make and Code Connect are explained as available capabilities, without inventing historical use.

## Validation completed

- TypeScript, ESLint, production build and whitespace checks.
- Existing `test:seo` and `test:ssr` checks, extended to account for draft routes.
- `npm run test:blogs`: complete article bodies, unique metadata, truthful draft schema, tool names, source links, asset formats, original screen layers, indexing protection, breadcrumbs, archive links and unknown-slug 404 behavior.
- Browser testing against the production renderer at 320, 390, 768, 1024 and 1440 CSS pixels: no horizontal overflow and related-card content stays inside its borders.
- Category selection, combined search/filter behavior, case/whitespace search, clearing, empty-state reset, direct article loading, contents anchors, reading progress, copy-link behavior, back navigation, command shortcuts and mobile navigation.
- Persistent audio across client navigation; compact blog controls.
- Existing sections and reading without JavaScript; no hydration or page errors.
- Desktop/mobile screenshots were inspected and the mobile related-card layout was corrected.

## Performance measurements

`docs/blog-performance.json` records local production Lighthouse runs and the test conditions. Desktop LCP measured 0.6–0.9 seconds; throttled mobile LCP measured 2.4–3.3 seconds, so a universal two-second claim is not supported. Every recorded run had zero CLS. Results are laboratory measurements, with host-load variation, rather than public-site field data. Draft noindex intentionally lowers the SEO score. The featured cover and card link names were corrected and checked with Axe after the initial measurements.

## Screenshots

These are captures of the local production renderer, not an external deployment.

- [Desktop archive](previews/blog-archive-desktop.webp)
- [Mobile archive](previews/blog-archive-mobile.webp)
- [UltraFit360 article and original screen composition](previews/ultrafit-article-desktop.webp)
- [Mobile MCP article](previews/mcp-article-mobile.webp)

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

## Production image routing fix

The original forced `/blogs/*` rewrite intercepted `/blogs/images/*` and returned HTML 404 responses for valid images. Assets now live at `/blog-images/*`, outside the page renderer. Legacy image URLs redirect before the page catch-all. Every displayed image and full-screen link uses WebP; original source binaries are retained only in `docs/source-screens` for provenance. GIFs are unchanged.

`npm run build` now runs `scripts/check-blog-assets.mjs`: verify the built WebP signatures and lengths, inspect Netlify redirect precedence, reject assets shadowed by forced routing rules, and check cached image links. Deployment completion also requires HTTP image response checks and real-browser decoding on all four blog routes at desktop and mobile widths.
