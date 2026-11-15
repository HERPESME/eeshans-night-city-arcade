import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, getDoc, getDocs, collection, query, limit, deleteDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'demo-night-city-community',
  firestore: { rules: await readFile('firestore.rules', 'utf8') },
});
try {
  const alice = env.authenticatedContext('alice', { email_verified: true }).firestore();
  const bob = env.authenticatedContext('bob', { email_verified: true }).firestore();
  const unverified = env.authenticatedContext('new-reader', { email_verified: false }).firestore();
  const anon = env.unauthenticatedContext().firestore();
  const vote = db => doc(db, 'articles/test-article/votes/alice');
  await assertFails(setDoc(vote(anon), { value: 1, updatedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(unverified, 'articles/test-article/votes/new-reader'), { value: 1, updatedAt: serverTimestamp() }));
  await assertSucceeds(setDoc(vote(alice), { value: 1, updatedAt: serverTimestamp() }));
  await assertSucceeds(setDoc(vote(alice), { value: -1, updatedAt: serverTimestamp() }));
  await assertFails(setDoc(vote(bob), { value: 1, updatedAt: serverTimestamp() }));
  await assertFails(getDoc(vote(bob)));
  await assertFails(setDoc(vote(alice), { value: 7, updatedAt: serverTimestamp() }));
  await assertSucceeds(deleteDoc(vote(alice)));
  const post = (db, uid, id, parent = null, text = 'A useful example.') => {
    const batch = writeBatch(db);
    batch.set(doc(db, 'communityMembers', uid), { lastPostAt: serverTimestamp(), lastCommentId: id });
    batch.set(doc(db, 'articles/test-article/comments', id), { uid, name: 'Reader', text, parent, createdAt: serverTimestamp() });
    return batch.commit();
  };
  await assertFails(post(anon, 'anon', 'anon'));
  await assertFails(post(unverified, 'new-reader', 'unverified'));
  await assertSucceeds(post(alice, 'alice', 'root'));
  await assertFails(post(alice, 'alice', 'too-fast'));
  await assertSucceeds(post(bob, 'bob', 'reply', 'root'));
  await assertFails(updateDoc(doc(bob, 'articles/test-article/comments/root'), { text: '' }));
  await assertFails(getDocs(collection(anon, 'articles/test-article/comments')));
  await assertSucceeds(getDocs(query(collection(anon, 'articles/test-article/comments'), limit(12))));
  await assertFails(getDocs(query(collection(anon, 'articles/test-article/comments'), limit(13))));
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    for (const uid of ['alice', 'bob']) await setDoc(doc(db, 'communityMembers', uid), { lastPostAt: Timestamp.fromMillis(0) });
  });
  await assertFails(post(alice, 'alice', 'bad-reply', 'reply'));
  await assertFails(post(alice, 'alice', 'missing-parent', 'missing'));
  await assertFails(post(alice, 'alice', 'oversized', null, 'x'.repeat(2001)));
  await assertFails(post(alice, 'bob', 'spoof'));
  await assertSucceeds(updateDoc(doc(alice, 'articles/test-article/comments/root'), { text: '' }));
  await assertSucceeds(getDoc(doc(anon, 'articles/test-article/comments/reply')));
  await assertFails(setDoc(doc(alice, 'unrelated/private'), { exposed: true }));
  console.log('PASS community rules: ownership, verified email, vote replacement, private votes, bounded reads, replies, cooldown and deletion.');
} finally {
  await env.cleanup();
}
