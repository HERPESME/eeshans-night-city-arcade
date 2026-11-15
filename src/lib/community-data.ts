import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy, limit, startAfter, serverTimestamp, runTransaction, deleteDoc, updateDoc, setDoc, type QueryDocumentSnapshot } from 'firebase/firestore';
import { communityApp } from './community-auth';

const db = getFirestore(communityApp);
export type Discussion = { id: string; uid: string; name: string; text: string; parent: string | null; createdAt: { toDate(): Date } | null };
export type Cursor = QueryDocumentSnapshot;
const thread = (slug: string) => collection(db, 'articles', slug, 'comments');
async function boundedRead<T>(request: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Discussion connection timed out')), 12000);
  });
  try { return await Promise.race([request, timeout]); }
  finally { clearTimeout(timer!); }
}

export async function getDiscussion(slug: string, parent: string | null, cursor?: Cursor) {
  // Replies are one level deep. Each thread has an independent bounded read.
  const { where } = await import('firebase/firestore');
  const result = await boundedRead(getDocs(query(thread(slug), where('parent', '==', parent), orderBy('createdAt', 'desc'), ...(cursor ? [startAfter(cursor)] : []), limit(12))));
  return { items: result.docs.map(item => ({ ...item.data(), id: item.id }) as Discussion), cursor: result.docs.at(-1), more: result.size === 12 };
}
export async function postDiscussion(slug: string, uid: string, name: string, text: string, parent: string | null) {
  const comment = doc(thread(slug));
  const member = doc(db, 'communityMembers', uid);
  await runTransaction(db, async transaction => {
    await transaction.get(member);
    transaction.set(member, { lastPostAt: serverTimestamp(), lastCommentId: comment.id });
    transaction.set(comment, { uid, name: name.trim().slice(0, 40) || 'Reader', text: text.trim(), parent, createdAt: serverTimestamp() });
  });
}
export async function removeDiscussion(slug: string, id: string) {
  await updateDoc(doc(thread(slug), id), { text: '' });
}
export async function getVote(slug: string, uid: string): Promise<number> {
  const vote = await boundedRead(getDoc(doc(db, 'articles', slug, 'votes', uid)));
  return vote.exists() ? vote.data().value : 0;
}
export async function vote(slug: string, uid: string, value: number) {
  const ref = doc(db, 'articles', slug, 'votes', uid);
  if (!value) await deleteDoc(ref);
  else await setDoc(ref, { value, updatedAt: serverTimestamp() });
}
