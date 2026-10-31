import { projects } from './projects';
export const origin = 'https://technightcity.com';
export const sectionPaths: Record<string, string> = { home: '/', about: '/profile', projects: '/projects', contact: '/terminal' };
export const routes = [
  { path: '/', section: 'home', label: 'Home', title: 'Eeshan Singh | Full-Stack Developer & AI/ML Portfolio', description: 'Explore Eeshan Singh’s Night City Arcade portfolio: full-stack development, AI/ML projects, developer profile, and an interactive contact terminal.' },
  { path: '/profile', section: 'about', label: 'Profile', title: 'Profile | Eeshan Singh — Night City Arcade', description: 'Meet Eeshan Singh, a full-stack developer and AI/ML enthusiast. Explore his skills, background, coding profiles, and download his résumé.' },
  { path: '/projects', section: 'projects', label: 'Projects', title: 'Projects | Eeshan Singh — Full-Stack & AI/ML', description: 'Explore CareerBoostAI, UltraFit360, QuantTrader, and Eeshan Singh’s development projects, with technologies, source code, and live demos.' },
  { path: '/terminal', section: 'contact', label: 'Contact', title: 'Contact Eeshan Singh | Night City Terminal', description: 'Connect with Eeshan Singh through his interactive contact terminal, email, GitHub, LinkedIn, and LeetCode profiles.' },
];
export type Page = typeof routes[number];
export const socialImage = origin + '/media/night-city-social.gif';
export function metadata(page: Page) {
  return { description: page.description, 'og:title': page.title, 'og:description': page.description, 'og:url': origin + page.path, 'og:type': 'website', 'og:site_name': 'Night City Arcade', 'og:image': socialImage, 'og:image:secure_url': socialImage, 'og:image:type': 'image/gif', 'og:image:width': '800', 'og:image:height': '450', 'og:image:alt': 'Animated pixel-art Night City skyline', 'twitter:card': 'summary_large_image', 'twitter:title': page.title, 'twitter:description': page.description, 'twitter:image': socialImage, 'twitter:image:alt': 'Animated pixel-art Night City skyline' };
}
export function schema(page: Page) {
  const person = { '@type': 'Person', '@id': origin + '/#person', name: 'Eeshan Singh', url: origin + '/profile', jobTitle: 'Full-Stack Developer', knowsAbout: ['React', 'TypeScript', 'Node.js', 'Python', 'AI/ML'], sameAs: ['https://github.com/HERPESME', 'https://www.linkedin.com/in/eeshan-singh-pokharia-926790285', 'https://leetcode.com/u/EeshanSingh/'] };
  const mainEntity = page.section === 'projects' ? { '@type': 'ItemList', itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': p.codeUrl ? 'SoftwareSourceCode' : 'CreativeWork', name: p.title, description: p.description, creativeWorkStatus: p.status, ...(p.codeUrl ? { codeRepository: p.codeUrl } : {}), ...(p.websiteUrl || p.demoUrl ? { url: p.websiteUrl || p.demoUrl } : {}), creator: { '@id': person['@id'] } } })) } : { '@id': person['@id'] };
  return { '@context': 'https://schema.org', '@graph': [person, { '@type': 'WebSite', '@id': origin + '/#website', name: 'Night City Arcade', url: origin + '/', author: { '@id': person['@id'] } }, { '@type': page.section === 'about' ? 'ProfilePage' : page.section === 'projects' ? 'CollectionPage' : page.section === 'contact' ? 'ContactPage' : 'WebPage', '@id': origin + page.path + '#webpage', url: origin + page.path, name: page.title, description: page.description, isPartOf: { '@id': origin + '/#website' }, mainEntity }] };
}
export function updateHead(page: Page) {
  document.title = page.title;
  document.querySelector('meta[name="robots"]')?.setAttribute("content", "index, follow");
  for (const [key, content] of Object.entries(metadata(page))) {
    const attr = key.startsWith('og:') ? 'property' : 'name';
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
