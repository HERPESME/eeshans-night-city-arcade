import manuscripts from './journal-stories.json';
import type { BlogCategory, BlogEntry, BlogImage, BlogSection } from './blogs';

const scenes: Record<string, string> = {
  'agent-evaluation': 'An adult teacher explains branching tool-flow symbols to adult students in a rainy Japanese pixel-art classroom',
  'memory-context': 'A developer selects glowing memory cards in a Japanese hillside library overlooking a night city',
  'honest-actions': 'Railway operators verify the actual track switch before marking a confirmation in a pixel-art control room',
  'missing-traces': 'An engineer follows a broken luminous signal path through a Japanese underground observatory',
  'token-accounting': 'A night-market bookkeeper examines token tiles, counting beads and a meal photograph',
  'mcp-permissions': 'A guide checks a visitor’s pass at a Japanese garden gate, illustrating distinct access boundaries',
  'query-cache': 'Station workers inspect colour-coded boxes routed between two separate baggage tracks',
  'theme-scope': 'A designer adjusts independent palettes for a public shop and private workspace in a Japanese architecture studio',
  'react-seo': 'A Japanese printmaker hangs distinct complete page prints in a lantern-lit night studio',
  'image-publishing': 'An editorial illustrator reviews topic-matched artwork in a rooftop greenhouse atelier',
  'notification-race': 'Two postal workers reach for one envelope while a dispatcher checks a single claim slot',
  'database-migration': 'Engineers oversee a continuous flow of crates across a bridge between two futuristic harbour districts',
  'photo-permissions': 'A craftsperson inspects the layers of a pixel phone in a Japanese mobile workshop',
  'first-schedule': 'A clockmaker supplies the first winding key to a clock in a futuristic Japanese shop',
  'dashboard-states': 'Adult students review empty, loading and failed interface states in a Japanese design classroom',
  'activation-metrics': 'A founder watches a newly rooted seedling beside unopened packets on a city rooftop at dawn',
  'lifecycle-restraint': 'An adult tends a bonsai beside a silent phone while delivery drones pass a quiet city balcony',
  'reversible-startup': 'Founders rearrange modular cedar joints in a workshop above a futuristic harbour',
  'read-only-ai': 'A coach considers a summary offered by a small assistant robot that leaves the action controls untouched',
  'seo-outcomes': 'Illuminated steps lead from a city directory to a reader speaking with a bookshop owner',
  'ocarina-gta': 'Adult players share a retro fantasy CRT and a modern coastal-city screen in a Japanese pixel-art game shop',
  'ai-frames': 'An adult gamer and developer inspect solid and translucent frame sequences in a Japanese arcade laboratory',
  'gaming-worlds-detail': 'An original fantasy path leads from a forest and stone arch toward a modern coastal night city',
  'gaming-latency-detail': 'A controller, luminous frames and a separate clockwork path illustrate presentation and response in a pixel-art arcade',
};
const generatedArt = (key: string, thumbnail = false): BlogImage => ({
  src: `/blog-images/journal-${key}.webp`, width: 1200, height: 800,
  ...(thumbnail ? { thumbnail: `/blog-images/journal-${key}-720.webp` } : {}),
  alt: scenes[key],
  caption: 'GPT-generated Japanese-inspired pixel-art illustration. Conceptual artwork, not a screenshot, measured result or depiction of private product data.',
});
const portalFigure = (view: string): BlogImage => ({
  src: `/blog-images/journal-portal-${view}.webp`, width: 1200, height: 800,
  alt: `Actual UltraFit360 website components in a labelled fictional ${view} study`,
  caption: 'Actual UltraFit360 website components assembled locally as an editorial study. Names, records and assistant messages are invented teaching examples. No customer account or live API was used; this is not a complete production-screen capture.',
});
const nativeFigure: BlogImage = {
  src: '/blog-images/expo-field-test-kit.webp', width: 1200, height: 800,
  alt: 'Source-rendered UltraFit360 React Native nutrition components inside a pixel-art field-testing kit',
  caption: 'Actual React Native components rendered through React Native Web with fictional editorial data, preserved above generated pixel artwork. Not a device capture or a native permission/performance test.',
  screens: [{
    src: '/blog-images/expo-dashboard-screen.webp', originalSrc: '/blog-images/expo-dashboard-screen.webp',
    originalLabel: 'source-rendered dashboard components', width: 390, height: 844,
    alt: 'Source-rendered UltraFit360 dashboard with fictional editorial data',
    x: 350, y: 144, displayWidth: 206, displayHeight: 440,
  }, {
    src: '/blog-images/expo-nutrition-screen.webp', originalSrc: '/blog-images/expo-nutrition-screen.webp',
    originalLabel: 'source-rendered nutrition components', width: 390, height: 844,
    alt: 'Source-rendered UltraFit360 nutrition interface using illustrative totals',
    x: 642, y: 144, displayWidth: 207, displayHeight: 440,
  }],
};
const wordCount = (intro: string, sections: BlogSection[]) => [intro, ...sections.flatMap(s => [s.heading, ...s.paragraphs, ...(s.list || []), ...(s.table?.rows.flat() || [])])].join(' ').trim().split(/\s+/).length;

export const journalStories: BlogEntry[] = manuscripts.map((draft, index) => {
  const sections = structuredClone(draft.sections) as BlogSection[];
  sections[3].image = draft.support === 'native' ? nativeFigure
    : draft.support.startsWith('gaming-') ? generatedArt(draft.support)
    : portalFigure(draft.support);
  const peers = manuscripts.filter(item => item.category === draft.category);
  const related = peers[(peers.findIndex(item => item.slug === draft.slug) + 1) % peers.length];
  const foundations = draft.category === 'gaming' ? { label: 'AI engineering and the meaning of a successful result', href: '/blogs/ai-agent-evaluations-tool-calls' } : draft.category === 'founder' ? { label: 'The startup-credits story', href: '/blogs/startup-credits-app-cost-myth' } : draft.category === 'build' ? { label: 'The frontend design workflow', href: '/blogs/figma-to-frontend-web-mobile-workflow' } : { label: 'The original AI coach and guardrails guide', href: '/blogs/build-ai-coach-prompt-engineering-rag-guardrails' };
  sections[0].links = [foundations, { label: related.title, href: `/blogs/${related.slug}` }];
  const faqs = sections[sections.length - 1].paragraphs.flatMap(paragraph => {
    const match = paragraph.match(/^(.+?\?)\s+([\s\S]+)$/);
    return match ? [{ question: match[1], answer: match[2] }] : [];
  });
  return {
    slug: draft.slug, number: String(index + 9).padStart(2, '0'), title: draft.title,
    category: draft.category as BlogCategory, excerpt: draft.excerpt,
    intro: draft.intro, journalNote: draft.journalNote, keywords: draft.keywords,
    cover: generatedArt(draft.key, true), coverLabel: draft.category === 'gaming' ? 'GAMES / DESIGN / TECHNOLOGY' : draft.category === 'founder' ? 'FOUNDER FIELD NOTES' : 'PRODUCTION FIELD NOTES',
    readingTime: `${Math.ceil(wordCount(draft.intro, sections) / 200)} min`,
    featured: index === 0, isPreview: false, reviewedOn: '2026-11-02', publishedOn: '2026-11-02',
    sections, references: draft.references, faqs,
  };
});
