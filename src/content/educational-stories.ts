import manuscripts from './educational-stories.json';
import novemberGuides from './november-field-guides.json';
import type { BlogEntry } from './blogs';

type Lab = Omit<BlogEntry, 'isPreview' | 'readingTime' | 'reviewedOn' | 'publishedOn'>;

function publishedLabs(manuscripts: Lab[], publicationDate: string, featureFirst = false): BlogEntry[] {
  return manuscripts.map((entry, index) => {
    const prose = [entry.intro, ...entry.sections.flatMap(section => section.paragraphs)].join(' ');
    return {
      ...entry,
      featured: featureFirst && index === 0,
      isPreview: false,
      readingTime: `${Math.ceil(prose.split(/\s+/).length / 200)} min`,
      reviewedOn: publicationDate,
      publishedOn: publicationDate,
    };
  });
}

export const educationalStories = publishedLabs(manuscripts as Lab[], '2026-11-05', true);
export const novemberFieldGuides = publishedLabs(novemberGuides as Lab[], '2026-11-13');
