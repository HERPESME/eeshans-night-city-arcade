import assert from 'node:assert/strict';
import { test } from 'node:test';
import github from '../netlify/functions/github.cjs';

const call = username => github.handler({
  httpMethod: 'GET',
  queryStringParameters: username === undefined ? {} : { username },
});

function setTestEnvironment(t, key, value) {
  const previous = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
  t.after(() => {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  });
}

test('rejects unsupported usernames before making upstream requests', async t => {
  const upstream = t.mock.method(globalThis, 'fetch', () => assert.fail('Unexpected upstream request'));
  for (const username of ['../user', '%2e%2e%2fuser', 'HERPESME?x=1', 'other-account', '']) {
    assert.equal((await call(username)).statusCode, 400);
  }
  assert.equal(upstream.mock.callCount(), 0);
});

test('public REST uses fixed endpoints without the deployment credential and filters repositories', async t => {
  setTestEnvironment(t, 'GITHUB_TOKEN', 'fixture-legacy-token');
  setTestEnvironment(t, 'GITHUB_PUBLIC_PROFILE_TOKEN', undefined);
  const upstream = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    if (url === 'https://api.github.com/users/HERPESME') return Response.json({ followers: 1 });
    if (url === 'https://api.github.com/users/HERPESME/repos?per_page=100&sort=updated') {
      return Response.json([
        { id: 1, name: 'public-fixture', private: false, visibility: 'public', stargazers_count: 2 },
        { id: 2, name: 'private-fixture', private: true, visibility: 'private', stargazers_count: 50 },
        { id: 3, name: 'unknown-fixture' },
      ]);
    }
    assert.equal(url, 'https://api.github.com/search/commits?q=author:HERPESME+is:public&per_page=1');
    return Response.json({ total_count: 3 });
  });
  for (const username of [undefined, 'HERPESME']) {
    const response = await call(username);
    assert.equal(response.statusCode, 200);
    const data = JSON.parse(response.body);
    assert.equal(data.source, 'github-api-public');
    assert.equal(data.stats.totalStars, 2);
    assert.deepEqual(data.featuredRepos.map(repo => repo.name), ['public-fixture']);
  }
  assert.equal(upstream.mock.callCount(), 6);
});

test('optional GraphQL only shows explicitly public pins and falls back on failure', async t => {
  setTestEnvironment(t, 'GITHUB_PUBLIC_PROFILE_TOKEN', 'fixture-profile-token');
  let graphqlAvailable = true;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === 'https://api.github.com/graphql') {
      if (!graphqlAvailable) throw new Error('Unavailable');
      assert.equal(options.headers.Authorization, 'Bearer fixture-profile-token');
      const body = JSON.parse(options.body);
      assert.equal(body.variables.username, 'HERPESME');
      assert.match(body.query, /visibility/);
      return Response.json({ data: { user: { pinnedItems: { nodes: [
        { name: 'public-pin', visibility: 'PUBLIC' },
        { name: 'private-pin', visibility: 'PRIVATE' },
        { name: 'internal-pin', visibility: 'INTERNAL' },
      ] } } } });
    }
    assert.equal(options.headers.Authorization, undefined);
    return Response.json(url.includes('/repos?') ? [
      { id: 1, name: 'public-fallback', private: false, visibility: 'public' },
    ] : {});
  });
  let response = await call();
  assert.deepEqual(JSON.parse(response.body).featuredRepos.map(repo => repo.name), ['public-pin']);
  graphqlAvailable = false;
  response = await call();
  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body).featuredRepos.map(repo => repo.name), ['public-fallback']);
});
