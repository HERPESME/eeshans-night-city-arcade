import type { BlogDiagram as Diagram } from '@/content/blogs';
import './blog-diagrams.css';

/** Text-first figures: readable before hydration, responsive, no raster labels. */
export default function BlogDiagram({ diagram, prefix }: { diagram: Diagram; prefix: string }) {
  const id = `${prefix}-${diagram.id}`;
  return (
    <figure className={`blog-diagram blog-diagram--${diagram.kind}`} aria-labelledby={`${id}-title`} aria-describedby={`${id}-caption`}>
      <header className="blog-diagram-header">
        <span className="blog-diagram-kicker"><span aria-hidden="true">◇</span> EXPLAINED / {diagram.kind === 'schema' ? 'RECORD MODEL' : diagram.kind === 'states' ? 'STATE CONTRACT' : diagram.kind === 'compare' ? 'SIDE BY SIDE' : diagram.kind === 'sequence' ? 'SEQUENCE' : diagram.kind === 'funnel' ? 'MEASUREMENT CHAIN' : 'SYSTEM FLOW'}</span>
        <h3 id={`${id}-title`}>{diagram.title}</h3>
        <p>{diagram.summary}</p>
      </header>
      <div className="blog-diagram-groups">
        {diagram.groups.map((group, groupIndex) => <div className="blog-diagram-group" key={group.label}>
          <h4 id={`${id}-group-${groupIndex}`}>{group.label}</h4>
          <ol className="blog-diagram-steps" aria-labelledby={`${id}-group-${groupIndex}`}>
            {group.steps.map((step, index) => <li className={`blog-diagram-step blog-diagram-step--${step.tone || 'neutral'}`} key={step.title}>
              {['flow', 'sequence', 'funnel'].includes(diagram.kind) && <span className="blog-diagram-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
              <div><strong>{step.title}</strong><p>{step.detail}</p></div>
            </li>)}
          </ol>
        </div>)}
      </div>
      <div className="blog-diagram-takeaway"><span>THE KEY DISTINCTION</span><p>{diagram.takeaway}</p></div>
      <figcaption id={`${id}-caption`}>{diagram.caption}</figcaption>
    </figure>
  );
}
