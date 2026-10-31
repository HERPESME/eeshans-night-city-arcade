import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPath, categoryLabel, type BlogEntry } from '@/content/blogs';
import BlogCover from './BlogCover';

export default function BlogCard({ entry }: { entry: BlogEntry }) {
  return (
    <Link to={blogPath(entry)} className={`blog-card blog-card--${entry.category}`} aria-labelledby={`entry-${entry.slug}`}>
      <article>
        <BlogCover entry={entry} />
        <div className="blog-card-body">
          <div className="blog-entry-meta"><span>{categoryLabel(entry.category)}</span><span>{entry.readingTime} read</span></div>
          <h3 id={`entry-${entry.slug}`}>{entry.title}<ArrowUpRight size={19} aria-hidden="true" /></h3>
          <p>{entry.excerpt}</p>
          <div className="blog-card-bottom"><span>Sample entry</span><span>Read entry <span aria-hidden="true">→</span></span></div>
        </div>
      </article>
    </Link>
  );
}
