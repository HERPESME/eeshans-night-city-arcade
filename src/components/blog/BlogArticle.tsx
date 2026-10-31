import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, Link as LinkIcon } from 'lucide-react';
import { blogEntries, blogPath, categoryLabel, findBlogEntry } from '@/content/blogs';
import NotFound from '@/pages/NotFound';
import BlogCover from './BlogCover';
import BlogCard from './BlogCard';
import './blogs.css';

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
    try { await navigator.clipboard.writeText(`${window.location.origin}${blogPath(entry)}`); setCopyState('copied'); }
    catch { setCopyState('unavailable'); }
  };

  return (
    <div className="blog-surface blog-article-page">
      <div className="blog-reading-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <div className="blog-container">
        <nav aria-label="Breadcrumb" className="blog-breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><Link to="/blogs">Blogs</Link><span aria-hidden="true">/</span><span aria-current="page">{entry.title}</span></nav>
        <div className="blog-article-tools"><Link to="/blogs" className="blog-back-link"><ArrowLeft size={15} aria-hidden="true" /> All entries</Link><button type="button" className="blog-copy-link" onClick={copyLink}>{copyState === 'copied' ? <Check size={14} aria-hidden="true" /> : <LinkIcon size={14} aria-hidden="true" />}<span aria-live="polite">{copyState === 'copied' ? 'Link copied' : copyState === 'unavailable' ? 'Copy unavailable' : 'Copy link'}</span></button></div>
        <header className="blog-article-header">
          <div className="blog-article-category"><span>{categoryLabel(entry.category)}</span><span className="blog-preview-badge">SAMPLE ENTRY / {entry.number}</span></div>
          <h1>{entry.title}</h1>
          <p className="blog-article-deck">{entry.excerpt}</p>
          <div className="blog-article-byline"><Link to="/profile" className="blog-author-inline"><span className="blog-author-avatar" aria-hidden="true">ES</span><span><strong>Eeshan Singh</strong><span>Personal notes from Night City</span></span></Link><span className="blog-byline-detail">{entry.readingTime} read <span aria-hidden="true">·</span> Layout preview</span></div>
        </header>
        <figure className="blog-article-cover"><BlogCover entry={entry} article eager /><figcaption>Illustrative cover for this sample entry. Final stories will include their own images.</figcaption></figure>
        <div className="blog-reading-layout">
          <article id="blog-article-body" className="blog-prose" aria-label={entry.title}>
            <p className="blog-lead">{entry.intro}</p>
            <div className="blog-sample-note"><span className="blog-status-dot" /><p><strong>A little placeholder text, for now.</strong> This is a design preview. The complete story and original images come after the layout review.</p></div>
            {entry.sections.map((section, index) => <section key={section.id} id={section.id} className="blog-prose-section"><div className="blog-section-heading"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h2>{section.heading}</h2></div>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.image && <figure className="blog-body-figure"><img src={section.image.src} alt={section.image.alt} width={section.image.width} height={section.image.height} loading="lazy" decoding="async" /><figcaption>{section.image.caption}</figcaption></figure>}{section.note && <aside className="blog-pull-note"><span>BUILD NOTE</span><p>{section.note}</p></aside>}</section>)}
            <div className="blog-end-mark"><span aria-hidden="true">◆</span> END OF ENTRY / {entry.number}</div>
            <div className="blog-author-card"><span className="blog-author-avatar" aria-hidden="true">ES</span><div><span className="blog-eyebrow">BEHIND THE JOURNAL</span><h2>Eeshan Singh</h2><p>Design, code, and the things learned along the way.</p><Link to="/profile">Meet the author <ArrowUpRight size={14} aria-hidden="true" /></Link></div></div>
          </article>
          <aside className="blog-article-sidebar"><nav aria-label="On this page" className="blog-toc"><div className="blog-toc-label">IN THIS ENTRY <span aria-hidden="true">↓</span></div><ol>{entry.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{section.heading}</a></li>)}</ol><div className="blog-toc-footer"><span className="blog-status-dot" /> Personal notes, one entry at a time.</div></nav></aside>
        </div>
        <section className="blog-related" aria-labelledby="related-title"><div className="blog-related-heading"><div><span className="blog-eyebrow">KEEP EXPLORING</span><h2 id="related-title">Another page in the journal.</h2></div><Link to="/blogs">All entries <ArrowUpRight size={15} aria-hidden="true" /></Link></div><div className="blog-related-grid">{related.map(item => <BlogCard key={item.slug} entry={item} />)}</div></section>
        <footer className="blog-article-footer"><Link to="/blogs"><ArrowLeft size={15} aria-hidden="true" /> Back to the archive</Link><span>NIGHT CITY JOURNAL / DESIGN PREVIEW</span></footer>
      </div>
    </div>
  );
}
