import { blogEntries, blogPath, blogWordCount, findBlogEntry } from '@/content/blogs';
import { faqs } from './faqs';
import { projects } from './projects';
import { author } from '@/content/author';
export const origin = 'https://technightcity.com';
export const sectionPaths: Record<string, string> = { home: '/', about: '/profile', projects: '/projects', contact: '/terminal', blogs: '/blogs' };
export interface Page {
  path: string;
  section: 'home' | 'about' | 'projects' | 'contact' | 'blogs';
  label: string;
  title: string;
  description: string;
  indexable?: boolean;
  blogSlug?: string;
  lastModified?: string;
}
export const routes: Page[] = [
  { path: '/', section: 'home', label: 'Home', title: 'Eeshan Singh | AI Full Stack Developer & UltraFit360 CoFounder', description: 'Eeshan Singh Pokharia, AI Full Stack Developer and CoFounder of UltraFit360. Explore AI projects, web and mobile builds, and practical product stories.' },
  { path: '/profile', section: 'about', label: 'Profile', title: 'Profile | Eeshan Singh — Night City Arcade', description: 'Meet Eeshan Singh Pokharia, AI Full Stack Developer and CoFounder of UltraFit360. Explore his background, projects, coding profiles and résumé.' },
  { path: '/projects', section: 'projects', label: 'Projects', title: 'Projects | Eeshan Singh — Full-Stack & AI/ML', description: 'Explore CareerBoostAI, UltraFit360, QuantTrader, and Eeshan Singh’s development projects, with technologies, source code, and live demos.' },
  { path: '/terminal', section: 'contact', label: 'Contact', title: 'Contact Eeshan Singh | Night City Terminal', description: 'Connect with Eeshan Singh through his interactive contact terminal, email, GitHub, LinkedIn, and LeetCode profiles.' },
  { path: '/blogs', section: 'blogs', label: 'Blogs', title: 'Blogs | Eeshan Singh — Night City Journal', description: 'Expo, React Native, design, startup credits and connected AI: practical guides and product stories by Eeshan Singh at Night City Arcade.', indexable: blogEntries.some(entry => !entry.isPreview) },
  ...blogEntries.map((entry): Page => ({ path: blogPath(entry), section: 'blogs', label: entry.title, title: `${entry.title} | Night City Journal`, description: entry.excerpt, indexable: !entry.isPreview, blogSlug: entry.slug, lastModified: entry.reviewedOn })),
];
export const socialImage = origin + '/media/night-city-social.gif';
export function metadata(page: Page) {
  const entry = page.blogSlug ? findBlogEntry(page.blogSlug) : undefined;
  return { description: page.description, 'og:title': page.title, 'og:description': page.description, 'og:url': origin + page.path, 'og:type': entry ? 'article' : 'website', 'og:site_name': 'Night City Arcade', 'og:image': socialImage, 'og:image:secure_url': socialImage, 'og:image:type': 'image/gif', 'og:image:width': '800', 'og:image:height': '450', 'og:image:alt': 'Animated pixel-art Night City skyline', 'twitter:card': 'summary_large_image', 'twitter:title': page.title, 'twitter:description': page.description, 'twitter:image': socialImage, 'twitter:image:alt': 'Animated pixel-art Night City skyline', ...(entry ? { 'article:author': origin + '/profile', 'article:modified_time': entry.reviewedOn + 'T00:00:00Z', ...(!entry.isPreview && entry.publishedOn ? { 'article:published_time': entry.publishedOn + 'T00:00:00Z' } : {}) } : {}) };
}
export function schema(page: Page) {
  const entry = page.blogSlug ? findBlogEntry(page.blogSlug) : undefined;
  const articleId = origin + page.path + '#article';
  const person = { '@type': 'Person', '@id': origin + '/#person', name: 'Eeshan Singh Pokharia', alternateName: 'Eeshan Singh', url: origin + '/profile', jobTitle: author.role, description: author.bio, affiliation: { '@type': 'Organization', name: 'UltraFit360', url: 'https://ultrafit360.com' }, knowsAbout: ['React', 'TypeScript', 'Node.js', 'Python', 'AI/ML'], sameAs: ['https://github.com/HERPESME', 'https://www.linkedin.com/in/eeshan-singh-pokharia-926790285', 'https://leetcode.com/u/EeshanSingh/'] };
  const mainEntity = page.section === 'projects' ? { '@type': 'ItemList', itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': p.codeUrl ? 'SoftwareSourceCode' : 'CreativeWork', name: p.title, description: p.description, creativeWorkStatus: p.status, ...(p.codeUrl ? { codeRepository: p.codeUrl } : {}), ...(p.websiteUrl || p.demoUrl ? { url: p.websiteUrl || p.demoUrl } : {}), creator: { '@id': person['@id'] } } })) } : { '@id': person['@id'] };
  return { '@context': 'https://schema.org', '@graph': [
    ...(entry ? [{ '@type': 'BlogPosting', '@id': articleId, headline: entry.title, description: entry.excerpt, url: origin + page.path, mainEntityOfPage: { '@id': origin + page.path + '#webpage' }, author: { '@id': person['@id'] }, publisher: { '@id': person['@id'] }, image: { '@type': 'ImageObject', url: origin + entry.cover.src, width: entry.cover.width, height: entry.cover.height, caption: entry.cover.caption }, inLanguage: 'en', keywords: entry.keywords, wordCount: blogWordCount(entry), dateModified: entry.reviewedOn, creativeWorkStatus: entry.isPreview ? 'Draft' : 'Published', ...(!entry.isPreview && entry.publishedOn ? { datePublished: entry.publishedOn } : {}), citation: entry.references.map(link => link.href.startsWith('/') ? origin + link.href : link.href) }] : []),
    ...(page.path !== '/' ? [{ '@type': 'BreadcrumbList', '@id': origin + page.path + '#breadcrumbs', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' }, ...(page.blogSlug ? [{ '@type': 'ListItem', position: 2, name: 'Blogs', item: origin + '/blogs' }] : []), { '@type': 'ListItem', position: page.blogSlug ? 3 : 2, name: page.label, item: origin + page.path }] }] : []),
    ...(page.section === 'about' ? [{ '@type': 'FAQPage', '@id': origin + page.path + '#faq', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }] : []), person, { '@type': 'WebSite', '@id': origin + '/#website', name: 'Night City Arcade', url: origin + '/', author: { '@id': person['@id'] } }, { '@type': page.section === 'about' ? 'ProfilePage' : page.section === 'projects' || (page.section === 'blogs' && !page.blogSlug) ? 'CollectionPage' : page.section === 'contact' ? 'ContactPage' : 'WebPage', '@id': origin + page.path + '#webpage', url: origin + page.path, name: page.title, description: page.description, isPartOf: { '@id': origin + '/#website' }, author: { '@id': person['@id'] }, ...(page.path !== '/' ? { breadcrumb: { '@id': origin + page.path + '#breadcrumbs' } } : {}), mainEntity: entry ? { '@id': articleId } : mainEntity }] };
}
export function updateHead(page: Page) {
  document.title = page.title;
  document.querySelector('meta[name="robots"]')?.setAttribute("content", page.indexable === false ? "noindex, follow" : "index, follow");
  document.head.querySelectorAll('meta[property^="article:"]').forEach(el => el.remove());
  for (const [key, content] of Object.entries(metadata(page))) {
    const attr = key.startsWith('og:') || key.startsWith('article:') ? 'property' : 'name';
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.append(el); }
    el.content = content;
  }
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
  canonical.href = origin + page.path;
  let json = document.getElementById('page-schema');
  if (!json) { json = document.createElement('script'); json.id = 'page-schema'; json.setAttribute('type', 'application/ld+json'); document.head.append(json); }
  json.textContent = JSON.stringify(schema(page));
}
