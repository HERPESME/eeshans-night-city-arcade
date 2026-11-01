import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Search, X } from 'lucide-react';
import { blogCategories, blogEntries, blogPath, categoryLabel } from '@/content/blogs';
import BlogCover from './BlogCover';
import BlogCard from './BlogCard';
import { track } from '@/lib/analytics';
import './blogs.css';

export default function BlogsSection() {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const featured = blogEntries.find(entry => entry.featured) || blogEntries[0];
  const showFeatured = category === 'all' && !search.trim();
  const query = search.trim().toLowerCase();
  const visibleEntries = blogEntries.filter(entry => (!showFeatured || entry.slug !== featured.slug) && (category === 'all' || entry.category === category) && (!query || `${entry.title} ${entry.excerpt} ${categoryLabel(entry.category)} ${entry.keywords.join(' ')}`.toLowerCase().includes(query)));
  const allDrafts = blogEntries.every(entry => entry.isPreview);
  const reset = () => { setCategory('all'); setSearch(''); };

  return (
    <div className="blog-surface blog-hub">
      <div className="blog-container">
        <nav aria-label="Breadcrumb" className="blog-breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Blogs</span></nav>
        <header className="blog-hub-header">
          <div className="blog-eyebrow-row"><span className="blog-eyebrow"><span className="blog-status-dot" /> PERSONAL LOG / NIGHT CITY</span>{allDrafts && <span className="blog-preview-badge">EDITORIAL PREVIEW</span>}</div>
          <h1 className="blog-hub-title">BLOGS<span>.ARCHIVE</span></h1>
          <div className="blog-hub-intro"><p>Projects, late-night fixes, startup lessons, London stories,<br className="blog-desktop-break" /> and the tech I keep coming back to.</p><span className="blog-archive-count"><span>01 — {String(blogEntries.length).padStart(2, '0')}</span>THE JOURNAL</span></div>
        </header>

        {showFeatured && <section className="blog-featured" aria-labelledby="featured-entry-title">
          <Link to={blogPath(featured)} className="blog-featured-cover-link"><BlogCover entry={featured} featured eager /></Link>
          <div className="blog-featured-copy">
            <div className="blog-featured-kicker"><span className="blog-status-dot" /> FEATURED ENTRY / {featured.number.padStart(3, '0')}</div>
            <div className="blog-entry-meta"><span>{categoryLabel(featured.category)}</span><span>{featured.readingTime} read</span></div>
            <h2 id="featured-entry-title"><Link to={blogPath(featured)}>{featured.title}</Link></h2>
            <p>{featured.excerpt}</p>
            <Link to="/profile" className="blog-author-inline"><span className="blog-author-avatar" aria-hidden="true">ES</span><span><strong>Eeshan Singh</strong><span>AI Full Stack Developer · CoFounder, UltraFit360</span></span></Link>
            <Link to={blogPath(featured)} className="blog-read-button">Read the entry <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>}

        <section className="blog-archive" aria-labelledby="archive-title">
          <div className="blog-archive-heading"><div><span className="blog-eyebrow">THE LOGBOOK</span><h2 id="archive-title">Find your next read.</h2></div><form role="search" className="blog-search" onSubmit={event => event.preventDefault()}><Search size={17} aria-hidden="true" /><label htmlFor="blog-search" className="sr-only">Search blog entries</label><input id="blog-search" type="search" placeholder="Search the archive…" value={search} onChange={event => setSearch(event.target.value)} />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={16} /></button>}</form></div>
          <div className="blog-filter-bar"><div className="blog-filters" role="group" aria-label="Filter entries by category">{blogCategories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} className={category === item.id ? 'is-active' : ''} onClick={() => { setCategory(item.id); track('blog_filter', { category: item.id }); }}>{item.label}</button>)}</div><span className="blog-result-count" role="status" aria-live="polite">{visibleEntries.length} {showFeatured ? 'more ' : ''}{visibleEntries.length === 1 ? 'entry' : 'entries'}</span></div>
          {visibleEntries.length ? <div className={`blog-grid${visibleEntries.length === 2 ? ' blog-grid--pair' : ''}`}>{visibleEntries.map(entry => <BlogCard key={entry.slug} entry={entry} />)}</div> : <div className="blog-empty"><span className="blog-empty-code">NO SIGNAL / 000</span><h3>No entries found.</h3><p>Try a different word or open the full archive.</p><button type="button" className="blog-text-button" onClick={reset}>Reset filters <ArrowRight size={16} aria-hidden="true" /></button></div>}
        </section>
        <footer className="blog-hub-footer"><div><span className="blog-status-dot" /><span>Made by hand. Built in code.</span><small>{allDrafts ? 'Three complete drafts, ready for a closer look.' : 'AI, full-stack products, startup lessons, and the stories behind the builds.'}</small></div><Link to="/terminal">Say hello <ArrowUpRight size={16} aria-hidden="true" /></Link></footer>
      </div>
    </div>
  );
}
