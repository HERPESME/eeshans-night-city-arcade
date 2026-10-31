import type { BlogEntry } from '@/content/blogs';
import BlogImageView from './BlogImageView';

interface BlogCoverProps {
  entry: BlogEntry;
  featured?: boolean;
  article?: boolean;
  eager?: boolean;
}
export default function BlogCover({ entry, featured, article, eager }: BlogCoverProps) {
  return (
    <div className={`blog-cover blog-cover--${entry.category}${featured ? ' blog-cover--featured' : ''}${article ? ' blog-cover--article' : ''}`}>
      <BlogImageView image={entry.cover} eager={eager} sizes={article ? '(max-width: 800px) calc(100vw - 40px), 1200px' : featured ? '(max-width: 800px) calc(100vw - 40px), 670px' : '(max-width: 540px) calc(100vw - 40px), (max-width: 800px) 340px, 400px'} />
      <div className="blog-cover-top" aria-hidden="true"><span>NC / {entry.number}</span><span className="blog-cover-dot" /></div>
      <div className="blog-cover-caption" aria-hidden="true">
        <span className="blog-cover-label">{entry.coverLabel}<span>↗</span></span>
      </div>
    </div>
  );
}
