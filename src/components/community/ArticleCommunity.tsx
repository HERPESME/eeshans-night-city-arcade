import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, MessageSquare, Reply, Trash2 } from 'lucide-react';
import { useCommunity } from './CommunityProvider';
import type { Cursor, Discussion } from '@/lib/community-data';
import './community.css';

function errorText(error: unknown) {
  const code = (error as { code?: string }).code;
  if (code === 'permission-denied') return 'Verify your email before posting or voting. Please wait 30 seconds between messages.';
  if (code === 'failed-precondition') return 'Discussions are being prepared. Please try again later.';
  return 'Could not connect to the discussion. Please retry.';
}

function CommentForm({ slug, parent, onPosted, onCancel }: { slug: string; parent: string | null; onPosted: () => void; onCancel?: () => void }) {
  const { user, openLogin } = useCommunity();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.emailVerified) { openLogin(); return; }
    setBusy(true); setError('');
    try {
      const sdk = await import('@/lib/community-data');
      await sdk.postDiscussion(slug, user.uid, user.displayName || 'Reader', text, parent);
      setText(''); onPosted();
    } catch (error) { setError(errorText(error)); } finally { setBusy(false); }
  };
  return <form className="community-composer" onSubmit={submit}>
    <label className="sr-only" htmlFor={parent ? 'reply-' + parent : 'new-comment'}>{parent ? 'Your reply' : 'Your comment'}</label>
    <textarea id={parent ? 'reply-' + parent : 'new-comment'} value={text} onChange={event => setText(event.target.value)} required minLength={1} maxLength={2000} rows={3} placeholder={parent ? 'Add to the conversation…' : 'What worked for you? What would you do differently?'} />
    <div className="community-composer-footer"><span>{text.length}/2000</span><div>{onCancel && <button type="button" className="community-text" onClick={onCancel}>Cancel</button>}<button className="community-primary" disabled={busy || !text.trim()}>{busy ? 'Posting…' : parent ? 'Post reply' : 'Post comment'}</button></div></div>
    {error && <p role="alert" className="community-feedback">{error}</p>}
  </form>;
}

function Thread({ slug, parent = null }: { slug: string; parent?: string | null }) {
  const { user } = useCommunity();
  const [items, setItems] = useState<Discussion[]>([]);
  const [cursor, setCursor] = useState<Cursor>();
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyRevision, setReplyRevision] = useState(0);
  const load = async (append = false) => {
    setBusy(true); setError('');
    try {
      const sdk = await import('@/lib/community-data');
      const data = await sdk.getDiscussion(slug, parent, append ? cursor : undefined);
      setItems(previous => append ? [...previous, ...data.items.filter(item => !previous.some(old => old.id === item.id))] : data.items);
      setCursor(data.cursor); setMore(data.more);
    } catch (error) { setError(errorText(error)); } finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, [slug, parent]); // Each mounted thread requests only one page.
  const remove = async (item: Discussion) => {
    if (!window.confirm('Delete your comment? Replies will stay in the discussion.')) return;
    try { const sdk = await import('@/lib/community-data'); await sdk.removeDiscussion(slug, item.id); void load(); }
    catch (error) { setError(errorText(error)); }
  };
  return <div className={parent ? 'community-replies' : 'community-thread'}>
    {items.map(item => <div className="community-comment" key={item.id}>
      <div className="community-comment-meta"><span className="community-mini-avatar" aria-hidden="true" /><strong>{item.name}</strong><time>{item.createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Just now'}</time></div>
      <p>{item.text || 'This comment was deleted.'}</p>
      <div className="community-comment-actions">{!parent && <><button className="community-text" onClick={() => setReply(reply === item.id ? null : item.id)}><Reply size={13} />Reply</button><button className="community-text" aria-expanded={expanded === item.id} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>{expanded === item.id ? 'Hide replies' : 'View replies'}</button></>}{item.uid === user?.uid && item.text && <button className="community-text" aria-label="Delete your comment" onClick={() => void remove(item)}><Trash2 size={13} /></button>}</div>
      {reply === item.id && <CommentForm slug={slug} parent={item.id} onCancel={() => setReply(null)} onPosted={() => { setReply(null); setExpanded(item.id); setReplyRevision(value => value + 1); }} />}
      {expanded === item.id && <Thread key={item.id + replyRevision} slug={slug} parent={item.id} />}
    </div>)}
    {!busy && !items.length && !error && <p className="community-empty">{parent ? 'No replies yet.' : 'The conversation starts here. Leave the first thought.'}</p>}
    {busy && <p role="status" className="community-empty">Loading conversation…</p>}
    {error && <p className="community-feedback" role="alert">{error} <button className="community-text" onClick={() => void load()}>Retry</button></p>}
    {more && <button className="community-secondary" disabled={busy} onClick={() => void load(true)}>More {parent ? 'replies' : 'comments'}</button>}
  </div>;
}

export default function ArticleCommunity({ slug }: { slug: string }) {
  const { user, ready, openLogin } = useCommunity();
  const area = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [selection, setSelection] = useState(0);
  const [busy, setBusy] = useState(false);
  const [voteReady, setVoteReady] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    if (area.current) observer.observe(area.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true;
    setSelection(0); setVoteReady(!user); setError('');
    if (user && visible) import('@/lib/community-data').then(sdk => sdk.getVote(slug, user.uid)).then(value => {
      if (active) { setSelection(value); setVoteReady(true); }
    }).catch(() => { if (active) setError('Your vote could not be loaded. Refresh to try again.'); });
    return () => { active = false; };
  }, [slug, user?.uid, visible]);
  useEffect(() => {
    let elapsed = 0;
    const timer = window.setInterval(() => {
      if (user || !ready || document.visibilityState !== 'visible' || !document.hasFocus() || document.querySelector('[role="dialog"]')) return;
      elapsed += 1;
      if (elapsed < 90) return;
      try { if (sessionStorage.getItem('night-city-reader-prompt')) return; sessionStorage.setItem('night-city-reader-prompt', 'seen'); } catch { /* Session storage is optional. */ }
      window.clearInterval(timer); openLogin();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [slug, user, ready, openLogin]);
  const cast = async (value: number) => {
    if (!user?.emailVerified) { openLogin(); return; }
    setBusy(true); setError('');
    const next = selection === value ? 0 : value;
    try { const sdk = await import('@/lib/community-data'); await sdk.vote(slug, user.uid, next); setSelection(next); }
    catch (error) { setError(errorText(error)); } finally { setBusy(false); }
  };
  return <section ref={area} className="community-section" aria-labelledby="discussion-title">
    <div className="community-section-heading"><div><span className="community-kicker">THE CONVERSATION</span><h2 id="discussion-title">Your side of the story.</h2></div><div className="community-votes" aria-label="Rate this article">
      <button aria-label="Upvote article" aria-pressed={selection === 1} disabled={busy || !ready || (!!user && !voteReady)} onClick={() => void cast(1)}><ArrowUp size={17} />Helpful</button><button aria-label="Downvote article" aria-pressed={selection === -1} disabled={busy || !ready || (!!user && !voteReady)} onClick={() => void cast(-1)}><ArrowDown size={17} /><span className="sr-only">Downvote</span></button>
    </div></div>
    {error && <p className="community-feedback" role="alert">{error}</p>}
    {user?.emailVerified ? <CommentForm slug={slug} parent={null} onPosted={() => setRevision(value => value + 1)} /> : <button className="community-join" onClick={openLogin}><MessageSquare size={18} /><span>{user ? 'Verify your email to join in.' : 'Have something to add?'}<small>{user ? 'Open your account to verify.' : 'Sign in to vote, comment or reply.'}</small></span><span aria-hidden="true">↗</span></button>}
    {visible && <Thread key={slug + revision} slug={slug} />}
  </section>;
}
