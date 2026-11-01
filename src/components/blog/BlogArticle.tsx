import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, Link as LinkIcon } from 'lucide-react';
import { blogEntries, blogPath, categoryLabel, findBlogEntry, type BlogLink } from '@/content/blogs';
import NotFound from '@/pages/NotFound';
import BlogCover from './BlogCover';
import BlogCard from './BlogCard';
import BlogImageView from './BlogImageView';
import { track } from '@/lib/analytics';
import { author } from '@/content/author';
import './blogs.css';

function ContentLink({ link }: { link: BlogLink }) {
  return link.href.startsWith('/') ? <Link to={link.href}>{link.label}<ArrowUpRight size={13} aria-hidden="true" /></Link> : <a href={link.href}>{link.label}<ArrowUpRight size={13} aria-hidden="true" /></a>;
}

export default function BlogArticle({ slug }: { slug: string }) {
  const entry = findBlogEntry(slug);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'unavailable'>('idle');
  useEffect(() => {
    setCopyState('idle');
    setProgress(0);
    setActiveSection(entry?.sections[0]?.id || '');
    if (!entry) return;
    let frame = 0;
    const measure = () => {
      const body = document.getElementById('blog-article-body');
      if (!body) return;
      const start = body.getBoundingClientRect().top + window.scrollY - 120;
      const finish = start + body.offsetHeight - window.innerHeight * .4;
      setProgress(Math.min(100, Math.max(0, (window.scrollY - start) / Math.max(1, finish - start) * 100)));
      let current = entry.sections[0].id;
      for (const section of entry.sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 160) current = section.id;
      }
      setActiveSection(current);
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [entry]);
  useEffect(() => {
    if (copyState === 'idle') return;
    const timeout = window.setTimeout(() => setCopyState('idle'), 3000);
    return () => window.clearTimeout(timeout);
  }, [copyState]);
  if (!entry) return <NotFound />;
  const related = blogEntries.filter(item => item.slug !== entry.slug).sort((a, b) => Number(b.category === entry.category) - Number(a.category === entry.category)).slice(0, 2);
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}${blogPath(entry)}`); setCopyState('copied'); track('share', { article_slug: entry.slug, method: 'copy_link' }); }
    catch { setCopyState('unavailable'); }
  };

  return (
    <div className="blog-surface blog-article-page">
      <div className="blog-reading-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <div className="blog-container">
        <nav aria-label="Breadcrumb" className="blog-breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/blogs">Blogs</Link><span aria-hidden="true">/</span><span aria-current="page">{entry.title}</span></nav>
        <div className="blog-article-tools"><Link to="/blogs" className="blog-back-link"><ArrowLeft size={15} aria-hidden="true" /> All entries</Link><button type="button" className="blog-copy-link" onClick={copyLink}>{copyState === 'copied' ? <Check size={14} aria-hidden="true" /> : <LinkIcon size={14} aria-hidden="true" />}<span aria-live="polite">{copyState === 'copied' ? 'Link copied' : copyState === 'unavailable' ? 'Copy unavailable' : 'Copy link'}</span></button></div>
        <header className="blog-article-header">
          <div className="blog-article-category"><span>{categoryLabel(entry.category)}</span>{entry.isPreview && <span className="blog-preview-badge">DRAFT FOR REVIEW / {entry.number}</span>}</div>
          <h1>{entry.title}</h1>
          <p className="blog-article-deck">{entry.excerpt}</p>
          <div className="blog-article-byline"><Link to="/profile" className="blog-author-inline"><span className="blog-author-avatar" aria-hidden="true">ES</span><span><strong>Eeshan Singh</strong><span>{author.role} · CoFounder, UltraFit360</span></span></Link><span className="blog-byline-detail">{entry.readingTime} read{entry.publishedOn && !entry.isPreview && <> <span aria-hidden="true">·</span> <time dateTime={entry.publishedOn}>{new Date(`${entry.publishedOn}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></>}</span></div>
        </header>
        <figure className="blog-article-cover"><BlogCover entry={entry} article eager /><figcaption>{entry.cover.caption}</figcaption></figure>
        <div className="blog-reading-layout">
          <article id="blog-article-body" className="blog-prose" aria-label={entry.title}>
            <p className="blog-lead">{entry.intro}</p>
            {entry.isPreview && <div className="blog-sample-note"><span className="blog-status-dot" /><p><strong>Editorial draft.</strong> Ready for author review before publication.</p></div>}
            {entry.sections.map((section, index) => <section key={section.id} id={section.id} className="blog-prose-section">
              <div className="blog-section-heading"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h2>{section.heading}</h2></div>
              {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              {section.list && <ul className="blog-prose-list">{section.list.map(item => <li key={item}>{item}</li>)}</ul>}
              {section.table && <><p className={section.table.columns.length > 2 ? "blog-table-hint" : "sr-only"}>Scroll the table horizontally to see all columns.</p><div className={`blog-table-scroll${section.table.columns.length > 2 ? " blog-table-scroll--wide" : ""}`} role="region" aria-label={`${section.heading} reference table`} tabIndex={0}><table><caption className="sr-only">{section.heading}</caption><thead><tr>{section.table.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{section.table.rows.map(row => <tr key={row[0]}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cell}>{/^\w+_\w+$/.test(cell) ? <code>{cell}</code> : cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></>}
              {section.code && <div className="blog-code-block"><span>{section.code.label}</span><pre><code>{section.code.text}</code></pre></div>}
              {section.image && <figure className="blog-body-figure"><BlogImageView image={section.image} sizes="(max-width: 800px) calc(100vw - 40px), 740px" /><figcaption>{section.image.caption}</figcaption>{section.image.screens && <div className="blog-screen-links">{section.image.screens.map((screen, screenIndex) => <a key={screen.src} href={screen.originalSrc} target="_blank" rel="noopener noreferrer">Open {screen.originalLabel || 'app'} screen <ArrowUpRight size={12} aria-hidden="true" /><span className="sr-only"> (new tab)</span></a>)}</div>}</figure>}
              {section.note && <aside className="blog-pull-note"><span>BUILD NOTE</span><p>{section.note}</p></aside>}
              {section.links && <div className="blog-content-links">{section.links.map(link => <ContentLink key={link.href} link={link} />)}</div>}
            </section>)}
            <section className="blog-references" aria-labelledby="blog-references-title"><span className="blog-eyebrow">FURTHER READING</span><h2 id="blog-references-title">Sources & project links</h2><ul>{entry.references.map(link => <li key={link.href}><ContentLink link={link} /></li>)}</ul><p>Technical references checked <time dateTime={entry.reviewedOn}>{new Date(`${entry.reviewedOn}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time>.</p></section>
            <div className="blog-end-mark"><span aria-hidden="true">◆</span> END OF ENTRY / {entry.number}</div>
            <div className="blog-author-card"><span className="blog-author-avatar" aria-hidden="true">ES</span><div><span className="blog-eyebrow">BEHIND THE JOURNAL</span><h2>Eeshan Singh</h2><p>{author.bio}</p><p className="blog-entry-perspective">{entry.journalNote}</p><Link to="/profile">Meet the author <ArrowUpRight size={14} aria-hidden="true" /></Link></div></div>
          </article>
          <aside className="blog-article-sidebar"><nav aria-label="On this page" className="blog-toc"><div className="blog-toc-label">IN THIS ENTRY <span aria-hidden="true">↓</span></div><ol>{entry.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{section.heading}</a></li>)}</ol><div className="blog-toc-footer"><span className="blog-status-dot" /> {categoryLabel(entry.category)} / notes from the build.</div></nav></aside>
        </div>
        <section className="blog-related" aria-labelledby="related-title"><div className="blog-related-heading"><div><span className="blog-eyebrow">KEEP EXPLORING</span><h2 id="related-title">Another page in the journal.</h2></div><Link to="/blogs">All entries <ArrowUpRight size={15} aria-hidden="true" /></Link></div><div className="blog-related-grid">{related.map(item => <BlogCard key={item.slug} entry={item} />)}</div></section>
        <footer className="blog-article-footer"><Link to="/blogs"><ArrowLeft size={15} aria-hidden="true" /> Back to the archive</Link><span>NIGHT CITY JOURNAL{entry.isPreview ? ' / EDITORIAL DRAFT' : ''}</span></footer>
      </div>
    </div>
  );
}
