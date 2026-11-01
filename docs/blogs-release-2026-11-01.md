# Blog publication — 1 November 2026

All six articles and the archive are published and indexable. The generated sitemap contains eleven canonical pages: four portfolio sections, the blog archive and six articles. Published articles carry publication/modification dates and BlogPosting structured data. Unknown slugs remain real 404/noindex responses.

## New articles

- `/blogs/startup-credits-app-cost-myth`: founder-provided credit-support context, with official ElevenLabs, Microsoft, Google Cloud, NVIDIA, Cloudflare and AWS links; stage-specific eligibility, conditional maximums, expiry and post-credit planning.
- `/blogs/fitness-coaching-apps-ultrafit360-comparison`: disclosed co-founder perspective; official competitor sources; documented nutrition/workout/client/team workflows; voluntary adult family-accountability use case with permission boundaries. No invented competitor omissions, pricing, medical outcomes or hands-on benchmark claims.
- `/blogs/ultrafit360-chatgpt-claude-mcp-guide`: the documented personal read/write tool interface and example prompts; separate coach connector, client-dependent approvals, plan-versus-log distinction and supported-feature limits. Current OpenAI/Anthropic setup guidance takes precedence over older product walkthrough UI labels.

## Verification and privacy

The application and website workspace checkouts were inspected to verify user-facing capabilities. Public MCP tool names were checked against the implementation and public documentation; no private function implementations, database queries, credentials, customer records, schemas, internal endpoints or deployment configuration were copied into editorial content. The guide covers the publicly documented personal tools without disclosing additional undocumented implementation capabilities. Billing support is the founder's stated experience; no billing accounts, balances or grant documents were accessed.

Sources are linked in context and in each article's references. Program terms and advertised benefits were checked on 1 November 2026; actual eligibility and service coverage remain provider decisions. Competitor summaries describe documented features, with plan-dependent caveats, rather than treating unverified features as absent.

## Artwork

Six new built-in GPT-generated Night City pixel-art scenes are saved as WebP under `public/blog-images/`; cover thumbnails have responsive 720-pixel variants. Prompts are in `docs/startup-coaching-mcp-art.json`. New phone covers use the original app dashboard as a separate lossless WebP layer inside the pixel-art hardware; surrounding panels are identified as conceptual artwork. Existing GIF assets are unchanged.

## Release checks

- TypeScript, lint, production build, SEO/SSR/blog checks and whitespace validation.
- Build gate verifies WebP container validity, asset presence, routing isolation and legacy image redirects.
- Publication tests require all six approved posts to be indexable, in the eleven-URL sitemap, with truthful dates and distinct metadata.
- Content checks reject private backend URLs, implementation paths, credential patterns and confirmation-token fields in rendered articles.
- Browser QA checks image decoding, metadata, headings, hydration, filters/search and responsive layout before and after deployment.

Interim commits use `[skip netlify]`. Merge once into the production branch with an unskipped merge commit, then verify the published commit, image responses, rendered pages and sitemap on `technightcity.com`.
