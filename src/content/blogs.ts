export const blogCategories = [
  { id: 'all', label: 'All entries' },
  { id: 'build', label: 'Build logs' },
  { id: 'ai', label: 'AI & tools' },
  { id: 'founder', label: 'Founder notes' },
  { id: 'london', label: 'London' },
  { id: 'gaming', label: 'Gaming & tech' },
] as const;
export type BlogCategory = Exclude<typeof blogCategories[number]['id'], 'all'>;
export interface BlogImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}
export interface BlogSection {
  id: string;
  heading: string;
  paragraphs: string[];
  image?: BlogImage;
  note?: string;
}
export interface BlogEntry {
  slug: string;
  number: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readingTime: string;
  cover: BlogImage;
  coverLabel: string;
  featured?: boolean;
  isPreview: boolean;
  intro: string;
  sections: BlogSection[];
}
const street: BlogImage = {
  src: '/media/pngtree-arcade-retro-cyberpunk-generate-ai-image_15729768.webp',
  width: 720, height: 404, alt: 'Pixel-art street lit with pink and blue neon signs',
};
const workstation: BlogImage = {
  src: '/media/420982.webp', width: 800, height: 450,
  alt: 'Pixel-art desk with a retro computer and glowing yellow monitors',
};
const city: BlogImage = {
  src: '/media/wp11289734.webp', width: 800, height: 495,
  alt: 'Cyberpunk city buildings with glowing signs at night',
};
const arcade: BlogImage = {
  src: '/media/pngtree-arcade-retro-cyberpunk-generate-ai-image_15729770.webp',
  width: 720, height: 404, alt: 'A neon-lit pixel-art arcade scene',
};
const workflow: BlogImage = {
  src: '/blogs/design-workflow.svg', width: 1200, height: 600,
  alt: 'Illustration of a design frame, a component, and a finished interface connected in sequence',
  caption: 'Layout sample: a simple illustration of the design-to-code journey. Original project screenshots will accompany the finished story.',
};
export const blogEntries: BlogEntry[] = [
  {
    slug: 'from-figma-to-a-working-app', number: '01', title: 'From Figma to a working app',
    excerpt: 'The space between a design file and a screen someone can actually use. A first look at how a build story will unfold here.',
    category: 'build', readingTime: '2 min', cover: workstation, coverLabel: 'DESIGN → CODE', featured: true, isPreview: true,
    intro: 'Designing an interface and making it work are two parts of the same story. This sample entry is a place for the decisions, iterations, and small details in between.',
    sections: [
      { id: 'the-starting-point', heading: 'The starting point', paragraphs: ['A good build log starts with something concrete: a frame, an idea, or a screen that needs to do one job well. The finished article will begin with the original design and the problem it was meant to solve.', 'For now, this is short sample text so we can review the reading experience before the real story goes in.'], image: workflow },
      { id: 'making-it-work', heading: 'Making it work', paragraphs: ['The useful part is often the gap between the first version and the version that feels right. Component choices, spacing, interactions, and different screen sizes all belong in that conversation.'], note: 'The final build log will include real screenshots, selected code, and the changes that mattered.' },
      { id: 'what-comes-next', heading: 'What comes next', paragraphs: ['There is room here for what worked, what needed another attempt, and what I would approach differently. This preview shows the structure; the full project story comes after the layout is approved.'] },
    ],
  },
  {
    slug: 'where-ai-fits-in-the-workflow', number: '02', title: 'Where AI fits in the workflow',
    excerpt: 'Tools can help move a project forward. Knowing what to check is part of the work, too.',
    category: 'ai', readingTime: '1 min', cover: city, coverLabel: 'HUMAN + TOOLS', isPreview: true,
    intro: 'A sample space for practical notes on AI tools, MCP, and the decisions that still need a person behind them.',
    sections: [
      { id: 'a-real-task', heading: 'Start with a real task', paragraphs: ['The finished entry will follow one task through a real workflow, showing the context, the tool, and the result. Specific examples are more useful than a list of features.'], image: workflow },
      { id: 'the-review', heading: 'The review is part of the build', paragraphs: ['This is where a checked example, a corrected detail, or a small test can support the story. These paragraphs are layout samples rather than a finished tutorial.'] },
      { id: 'the-takeaway', heading: 'The takeaway', paragraphs: ['The final post will leave the reader with something they can try, along with an honest account of its limits.'] },
    ],
  },
  {
    slug: 'notes-from-building-a-startup', number: '03', title: 'Notes from building a startup',
    excerpt: 'A place for product choices, small wins, wrong turns, and the work between them.',
    category: 'founder', readingTime: '1 min', cover: street, coverLabel: 'BUILDING IN PUBLIC', isPreview: true,
    intro: 'This sample entry sets the tone for founder notes: personal, specific, and grounded in what actually happened.',
    sections: [
      { id: 'the-question', heading: 'The question behind the feature', paragraphs: ['A useful product story begins before a feature is built. The real entry will describe one decision, its constraints, and the alternatives that were considered.'] },
      { id: 'a-small-decision', heading: 'A small decision, a bigger lesson', paragraphs: ['A screenshot or a sketch can make a decision easier to understand. This artwork is only a visual placeholder until the approved project material is ready.'], image: { ...workstation, caption: 'Illustrative placeholder. Real product images and evidence will be added with the finished entry.' } },
      { id: 'looking-back', heading: 'Looking back', paragraphs: ['The full story will distinguish what was known at the time from what only became clear later. No growth figures or outcomes are being claimed in this sample.'] },
    ],
  },
  {
    slug: 'a-page-from-london', number: '04', title: 'A page from London',
    excerpt: 'Work, new surroundings, and the details that stay with you. A space for the KCL chapter.',
    category: 'london', readingTime: '1 min', cover: city, coverLabel: 'AWAY FROM THE DESK', isPreview: true,
    intro: 'A preview of the more personal side of the journal. The finished London entry will use original photos and the exact details of the experience.',
    sections: [
      { id: 'a-new-setting', heading: 'A new setting', paragraphs: ['Personal stories need room to breathe. This opening is intentionally short so the photographs and the actual experience can lead the finished piece.'] },
      { id: 'the-details', heading: 'The details that matter', paragraphs: ['The real article will explain the programme, the work, and the daily details in my own words. This city artwork is not a photograph of London.'], image: { ...street, caption: 'City artwork for layout review only. It will be replaced by original London photography.' } },
      { id: 'bringing-it-back', heading: 'Bringing it back', paragraphs: ['The final section will connect the experience to what came next. This placeholder does not stand in for the personal story.'] },
    ],
  },
  {
    slug: 'interfaces-worth-playing-with', number: '05', title: 'Interfaces worth playing with',
    excerpt: 'Games, consoles, and the little design details that make an experience feel different.',
    category: 'gaming', readingTime: '1 min', cover: arcade, coverLabel: 'AFTER HOURS', isPreview: true,
    intro: 'An opening for the things I enjoy outside a build: games, technology, and interfaces that are worth a closer look.',
    sections: [
      { id: 'a-closer-look', heading: 'A closer look', paragraphs: ['A game interface can communicate a great deal with very little space. This sample leaves room for a specific example and the design details that make it interesting.'], image: { ...arcade, caption: 'Illustrative arcade artwork. The finished entry will use relevant, properly attributed examples.' } },
      { id: 'beyond-the-screen', heading: 'Beyond the screen', paragraphs: ['The final piece might follow a game, a controller, or a design idea. Any hands-on impressions will come from actual use rather than this layout sample.'] },
      { id: 'one-good-detail', heading: 'One good detail', paragraphs: ['A useful observation does not need to become a review of everything. Sometimes one well-explained detail is enough.'] },
    ],
  },
  {
    slug: 'building-a-home-on-the-web', number: '06', title: 'Building a home on the web',
    excerpt: 'Design choices, experiments, and the story behind this corner of Night City.',
    category: 'build', readingTime: '1 min', cover: street, coverLabel: 'NIGHT CITY / WEB', isPreview: true,
    intro: 'A sample entry for the story behind the portfolio itself: how the visual language, navigation, and reading experience come together.',
    sections: [
      { id: 'finding-the-feel', heading: 'Finding the feel', paragraphs: ['The familiar pixel headings and neon edges belong to the same visual world. A reading page also needs a quieter rhythm so the text can stay in focus.'], image: workflow },
      { id: 'the-small-parts', heading: 'The small parts', paragraphs: ['The finished post will show the implementation choices behind those details, with screenshots and measurements where they help.'] },
      { id: 'still-in-progress', heading: 'Still in progress', paragraphs: ['A personal website can keep changing with the person behind it. This is a placeholder for that ongoing story, not a completed case study.'] },
    ],
  },
  {
    slug: 'the-details-between-the-screens', number: '07', title: 'The details between the screens',
    excerpt: 'Motion, transitions, and those small moments that make a frontend feel considered.',
    category: 'build', readingTime: '1 min', cover: workstation, coverLabel: 'MOTION / INTERACTION', isPreview: true,
    intro: 'A short sample for a future entry about animation and interaction, from a static frame to the moments between screens.',
    sections: [
      { id: 'a-purpose-for-motion', heading: 'A purpose for motion', paragraphs: ['An interaction can guide attention, confirm an action, or simply make a product feel more responsive. The final article will focus on one real example.'] },
      { id: 'trying-it-on-screen', heading: 'Trying it on screen', paragraphs: ['This is where a recording or a sequence of images will support the text. For this first layout review, a simple workflow illustration occupies that space.'], image: workflow },
      { id: 'leaving-room', heading: 'Leaving room to improve', paragraphs: ['Performance, accessibility, and different devices all influence the final result. Those tradeoffs will be documented with the actual implementation.'] },
    ],
  },
];
export const categoryLabel = (id: BlogCategory) => blogCategories.find(category => category.id === id)?.label || id;
export const blogPath = (entry: BlogEntry) => `/blogs/${entry.slug}`;
export const findBlogEntry = (slug: string) => blogEntries.find(entry => entry.slug === slug);
