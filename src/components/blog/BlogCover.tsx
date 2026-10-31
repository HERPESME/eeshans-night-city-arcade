import type { BlogEntry } from '@/content/blogs';

interface BlogCoverProps {
  entry: BlogEntry;
  featured?: boolean;
  article?: boolean;
  eager?: boolean;
}
export default function BlogCover({ entry, featured, article, eager }: BlogCoverProps) {
  return (
    <div className={`blog-cover blog-cover--${entry.category}${featured ? ' blog-cover--featured' : ''}${article ? ' blog-cover--article' : ''}`}>
      <img src={entry.cover.src} alt={entry.cover.alt} width={entry.cover.width} height={entry.cover.height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      <div className="blog-cover-shade" />
      <div className="blog-cover-top" aria-hidden="true"><span>NC / {entry.number}</span><span className="blog-cover-dot" /></div>
      <div className="blog-cover-caption" aria-hidden="true">
        {(featured || article) && <span className="blog-cover-headline">{entry.category === 'build' ? <>From pixels.<br />To a real screen.</> : entry.coverLabel}</span>}
        <span className="blog-cover-label">{entry.coverLabel}<span>↗</span></span>
      </div>
    </div>
  );
}
