import manuscripts from './current-tech-stories.json';
import type { BlogEntry } from './blogs';

const publicationDate = '2026-11-08';
type Manuscript = Omit<BlogEntry, 'isPreview' | 'readingTime' | 'reviewedOn' | 'publishedOn'>;

export const currentTechStories: BlogEntry[] = (manuscripts as Manuscript[]).map(entry => {
  const sections = [...entry.sections, {
    id: 'frequently-asked-questions',
    heading: 'Frequently asked questions',
    paragraphs: (entry.faqs || []).map(({ question, answer }) => `${question} ${answer}`),
  }];
  const prose = [entry.intro, ...sections.flatMap(section => section.paragraphs)].join(' ');
  return {
    ...entry,
    sections,
    isPreview: false,
    readingTime: `${Math.ceil(prose.split(/\s+/).length / 200)} min`,
    reviewedOn: publicationDate,
    publishedOn: publicationDate,
  };
});
