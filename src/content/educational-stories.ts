import manuscripts from './educational-stories.json';
import type { BlogEntry } from './blogs';

const publicationDate = '2026-11-05';

export const educationalStories: BlogEntry[] = (manuscripts as Omit<BlogEntry, 'isPreview' | 'readingTime' | 'reviewedOn'>[]).map((entry, index) => {
  const prose = [entry.intro, ...entry.sections.flatMap(section => section.paragraphs)].join(' ');
  return {
    ...entry,
    featured: index === 0,
    isPreview: false,
    readingTime: `${Math.ceil(prose.split(/\s+/).length / 200)} min`,
    reviewedOn: publicationDate,
    publishedOn: publicationDate,
  };
});
