import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const temp = await mkdtemp(join(tmpdir(), 'night-city-analytics-'));
try {
  await build({ entryPoints: ['src/lib/analytics-core.ts'], bundle: true, platform: 'node', format: 'esm', outfile: join(temp, 'core.mjs') });
  const { AnalyticsTracker } = await import(pathToFileURL(join(temp, 'core.mjs')));
  const home = { path: '/', title: 'Home', section: 'home' };
  const article = { path: '/blogs/example', title: 'Example', section: 'blogs', article: 'example' };
  const events = [], contexts = [];
  let loads = 0, stops = 0;
  const transport = { context: (...args) => contexts.push(args), event: (...args) => events.push(args), stop: () => { stops++; } };
  const tracker = new AnalyticsTracker(true, async () => { loads++; return transport; }, 'https://search.example/results?q=private&email=secret@example.com');
  tracker.pageView(home);
  tracker.event('generate_lead');
  await tracker.consent(false);
  assert.equal(loads, 0, 'No SDK before consent');
  assert.equal(events.length, 0);
  await tracker.consent(true);
  assert.equal(loads, 1);
  assert.equal(events.filter(([name]) => name === 'page_view').length, 1);
  assert.equal(contexts[0][1], 'https://search.example/', 'Referrer path/query discarded');
  tracker.pageView(home);
  tracker.pageView(article);
  tracker.pageView(article);
  tracker.pageView(home);
  assert.equal(events.filter(([name]) => name === 'page_view').length, 3, 'One view per transition; revisits count');
  assert.equal(events.filter(([name]) => name === 'article_view').length, 1);
  assert.equal(contexts[1][1], 'https://technightcity.com/');
  tracker.pageView(undefined);
  const before = events.length;
  tracker.event('generate_lead');
  assert.equal(events.length, before, 'Unknown routes cannot emit events');
  tracker.pageView(home);
  await tracker.consent(false);
  tracker.event('generate_lead');
  assert.equal(stops, 1);
  assert.equal(events.at(-1)[0], 'page_view', 'Revoked consent blocks further events');

  let resolveLoad;
  const pending = new AnalyticsTracker(true, () => new Promise(resolve => { resolveLoad = resolve; }));
  pending.pageView(home);
  const granting = pending.consent(true);
  await pending.consent(false);
  const beforeLate = events.length;
  resolveLoad(transport);
  await granting;
  assert.equal(events.length, beforeLate, 'Late SDK initialization cannot send after withdrawal');
  assert.equal(stops, 2, 'Late transport is stopped');

  let resolveRace, raceLoads = 0;
  const race = new AnalyticsTracker(true, () => {
    raceLoads++;
    return raceLoads === 1 ? new Promise(resolve => { resolveRace = resolve; }) : Promise.resolve(transport);
  });
  race.pageView(home);
  const firstGrant = race.consent(true);
  await race.consent(false);
  await race.consent(true);
  resolveRace(transport);
  await firstGrant;
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(raceLoads, 2, 'Accept/withdraw/accept during loading recovers');
  assert.equal(events.filter(([name]) => name === 'page_view').length, 5);

  let previewLoads = 0;
  const preview = new AnalyticsTracker(false, async () => { previewLoads++; return transport; });
  preview.pageView(home); await preview.consent(true);
  assert.equal(previewLoads, 0, 'Preview environment never initializes');
  const blocked = new AnalyticsTracker(true, async () => { throw Error('blocked'); });
  blocked.pageView(home); await blocked.consent(true);

  // Exercise the actual route/parameter boundary without importing a browser SDK in Node.
  const received = [];
  globalThis.__analyticsEvents = received;
  await build({ entryPoints: ['src/lib/analytics.ts'], bundle: true, platform: 'node', format: 'esm', outfile: join(temp, 'boundary.mjs'), alias: { '@': resolve('src') }, plugins: [{ name: 'fake-transport', setup(builder) {
    builder.onResolve({ filter: /analytics-firebase$/ }, () => ({ path: 'fake', namespace: 'analytics-test' }));
    builder.onLoad({ filter: /.*/, namespace: 'analytics-test' }, () => ({ contents: 'export async function loadFirebaseAnalytics() { return {context(){},stop(){},event(...args){globalThis.__analyticsEvents.push(args)}} }' }));
  } }] });
  globalThis.window = { location: { hostname: 'technightcity.com' } };
  globalThis.document = { referrer: 'https://www.google.com/search?q=secret' };
  const api = await import(pathToFileURL(join(temp, 'boundary.mjs')));
  assert.equal(api.analyticsPage('/unknown-private-address'), undefined);
  api.trackPage('/blogs'); api.applyAnalyticsChoice('accepted');
  await new Promise(resolve => setTimeout(resolve, 10));
  api.track('generate_lead', { method: 'contact_form', email: 'private@example.com', message: 'private' });
  assert.equal(received.at(-1)[1].method, 'contact_form');
  assert.equal(received.at(-1)[1].email, undefined);
  assert.equal(received.at(-1)[1].message, undefined);
  api.track('contact_intent', { method: 'private@example.com' });
  assert.equal(received.at(-1)[1].method, undefined, 'Email-like parameter rejected even in a permitted field');
  api.trackPage('/not-real?email=secret');
  api.track('generate_lead');
  assert.ok(!JSON.stringify(received).includes('secret'));
  delete globalThis.window; delete globalThis.document; delete globalThis.__analyticsEvents;
  console.log('PASS consent, withdrawal races, route deduplication, referrers, previews, blocked SDK and private-data boundary');
} finally { await rm(temp, { recursive: true, force: true }); }
