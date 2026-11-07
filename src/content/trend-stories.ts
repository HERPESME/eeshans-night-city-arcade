import manuscripts from './trend-stories.json';
import type { BlogEntry } from './blogs';

const publicationDate = '2026-11-06';

type Manuscript = Omit<BlogEntry, 'isPreview' | 'readingTime' | 'reviewedOn' | 'publishedOn'> & { reviewedOn?: string };

export const trendStories: BlogEntry[] = (manuscripts as Manuscript[]).map(entry => {
  const prose = [entry.intro, ...entry.sections.flatMap(section => section.paragraphs)].join(' ');
  return {
    ...entry,
    sections: entry.faqs?.length ? [...entry.sections, {
      id: 'frequently-asked-questions',
      heading: 'Frequently asked questions',
      paragraphs: entry.faqs.map(({ question, answer }) => `${question} ${answer}`),
    }] : entry.sections,
    isPreview: false,
    readingTime: `${Math.ceil(prose.split(/\s+/).length / 200)} min`,
    reviewedOn: entry.reviewedOn || publicationDate,
    publishedOn: publicationDate,
  };
});
