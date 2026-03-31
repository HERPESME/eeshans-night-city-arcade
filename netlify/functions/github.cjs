const fetch = require('node-fetch');

const DEFAULT_USERNAME = 'HERPESME';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders,
  },
  body: JSON.stringify(body),
});

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, { ok: true });
  }

  if (event.httpMethod !== 'GET') {
    return respond(405, { ok: false, error: 'Method not allowed. Use GET.' });
  }

  const username = (event.queryStringParameters && event.queryStringParameters.username) || DEFAULT_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'night-city-arcade-portfolio',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const [profileRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers }),
    ]);

    if (!profileRes.ok) {
      return respond(profileRes.status, {
        ok: false,
        error: 'Failed to fetch GitHub profile.',
      });
    }

    if (!reposRes.ok) {
      return respond(reposRes.status, {
        ok: false,
        error: 'Failed to fetch GitHub repositories.',
      });
    }

    const profile = await profileRes.json();
    const repos = await reposRes.json();
    const events = eventsRes.ok ? await eventsRes.json() : [];

    const publicRepos = Array.isArray(repos) ? repos : [];

    const totalStars = publicRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = publicRepos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    const languages = Array.from(new Set(publicRepos.map((repo) => repo.language).filter(Boolean)));

    const recentPushCommits = Array.isArray(events)
      ? events
          .filter((item) => item && item.type === 'PushEvent')
          .reduce((sum, item) => sum + ((item.payload && Array.isArray(item.payload.commits) ? item.payload.commits.length : 0)), 0)
      : 0;

    const featuredRepos = publicRepos
      .filter((repo) => !repo.fork)
      .sort((a, b) => {
        if ((b.stargazers_count || 0) !== (a.stargazers_count || 0)) {
          return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })
      .slice(0, 4)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description || 'No description available.',
        url: repo.html_url,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || 'N/A',
        updatedAt: repo.updated_at,
      }));

    return respond(200, {
      ok: true,
      username,
      stats: {
        followers: profile.followers || 0,
        following: profile.following || 0,
        publicRepos: profile.public_repos || publicRepos.length,
        totalStars,
        totalForks,
        languageCount: languages.length,
        recentPushCommits,
      },
      featuredRepos,
      lastUpdated: new Date().toISOString(),
      source: token ? 'github-api-authenticated' : 'github-api-public',
    });
  } catch (error) {
    console.error('GitHub function error:', error);
    return respond(500, {
      ok: false,
      error: 'Failed to fetch GitHub data.',
    });
  }
};
