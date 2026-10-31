import type { BlogImage } from '@/content/blogs';

interface Props { image: BlogImage; eager?: boolean; sizes?: string }

/** Original screen pixels sit above the generated scene, with no AI redraw or crop. */
export default function BlogImageView({ image, eager = false, sizes = '100vw' }: Props) {
  return <div className="blog-art" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
    <img className="blog-art-scene" src={image.src} srcSet={image.thumbnail ? `${image.thumbnail} 720w, ${image.src} 1200w` : undefined} sizes={image.thumbnail ? sizes : undefined} alt={image.alt} width={image.width} height={image.height} loading={eager ? 'eager' : 'lazy'} decoding="async" {...{ fetchpriority: eager ? 'high' : 'low' }} />
    {image.screens?.map(screen => <img key={screen.src} className="blog-art-screen" src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} loading={eager ? 'eager' : 'lazy'} decoding="async" {...{ fetchpriority: eager ? 'high' : 'low' }} style={{ left: `${screen.x / image.width * 100}%`, top: `${screen.y / image.height * 100}%`, width: `${screen.displayWidth / image.width * 100}%`, height: `${screen.displayHeight / image.height * 100}%` }} />)}
  </div>;
}
