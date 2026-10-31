# Indexing and rendering repair

## Findings

The initial live audit found four existing canonical sitemap entries, robots.txt allowing Googlebot, one H1 on each page, and full build-time HTML. The section addresses redirected to trailing slashes while their canonical tags omitted those slashes. Search Console's private indexing/exclusion report was not available, so the actual reason for any Google exclusion cannot be determined from public checks alone.

## Changes

- Request-time React SSR via a Netlify function, with CDN caching and generated HTML fallbacks. The same content is served to people and crawlers, without bot detection. Live stats remain client enhancements.
- Force routing for the four known pages; slash variants redirect to the declared canonical URL. Legacy-host section links redirect directly to canonical addresses. Unknown paths remain HTTP 404 and noindex; indexable pages remain crawlable and indexable.
- Shared titles, descriptions, canonical URLs, JSON-LD, navigation, and sitemap route definitions. The regenerated sitemap retains the existing `/sitemap.xml` address.
- Visible breadcrumb navigation and corresponding BreadcrumbList schema. Visible profile FAQs and exactly matching FAQPage data; no Google FAQ rich-result benefit is promised.
- Résumé-backed author biography, education and experience, and a factual single-person portfolio team section. Unsupported “5+ years” prose and an unsubstantiated uptime counter were removed. AI/ML project subjects remain because they describe the actual portfolio; copy authorship cannot be determined by an AI detector.
- Static JPEG/PNG assets converted to WebP and references updated; dimensions reserve image space. Existing GIF files are untouched. New responsive GIF copies preserve all 36 frames, loop, and durations, with smaller dimensions/palette for decorative backgrounds. GIFs were not converted to WebP.
- Removed the automatic blocking introduction. Animation, music, terminal commands, and project interactions remain.
- Kept robots.txt's existing Googlebot permission. Kept noindex only for error pages.

## Reference repositories

- AgriciDaniel/claude-seo: technical SEO and schema skills were read and used as audit checklists, with important claims checked against Google documentation.
- oguzhan18/seo-tools-api: inspected SEO audit, sitemap generation, and rank-checking source. Its basic title/description/image/link checks informed validation. Its scraped Google anchor positions were not treated as reliable rank data, and its general crawler was not used to inflate the sitemap.
- tentenco/awesome-seo-toolkits: reviewed as a resource directory for testing tools. It is not an executable skill or SEO engine.

## Manual steps after a successful production deployment

1. In the already verified Google Search Console property, submit/resubmit `https://technightcity.com/sitemap.xml`.
2. Inspect `/`, `/profile`, `/projects`, and `/terminal`; run Test Live URL, review rendered HTML, and request indexing. Review Google's selected canonical after recrawl.
3. Check Page indexing exclusions, Manual actions, and Security issues. Share any exact exclusion reason for diagnosis. Repeated submissions do not guarantee or accelerate indexing.
4. Import the property into Bing Webmaster Tools, confirm the sitemap, and inspect the same four URLs. IndexNow is not configured by this repair.
5. Maintain relevant website links on GitHub, LinkedIn, LeetCode, and project READMEs. No paid/bulk backlinks or fabricated team members were added.
6. Check production mobile and desktop performance. Lab measurements are not field Core Web Vitals and cannot guarantee a universal two-second load.

No blog section is added. No Search Console or Bing submission is claimed without authenticated account access.
