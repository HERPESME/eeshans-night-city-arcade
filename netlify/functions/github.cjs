const DEFAULT_USERNAME = 'HERPESME';

const DASHBOARD_QUERY = `
  query($username: String!) {
    user(login: $username) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            id
            name
            visibility
            description
            url
            stargazerCount
            forkCount
            primaryLanguage {
              name
            }
            updatedAt
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
      }
    }
  }
`;

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

const dedupeFeaturedRepos = (repos) => {
  const seen = new Set();

  return repos.filter((repo) => {
    const key = `${repo.url}::${repo.name}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, { ok: true });
  }

  if (event.httpMethod !== 'GET') {
    return respond(405, { ok: false, error: 'Method not allowed. Use GET.' });
  }

  const requestedUsername = event.queryStringParameters?.username;
  if (requestedUsername !== undefined && requestedUsername !== DEFAULT_USERNAME) {
    return respond(400, { ok: false, error: 'Unsupported GitHub username.' });
  }
  const username = DEFAULT_USERNAME;
  // The public REST requests never use a repository credential.
  const token = process.env.GITHUB_PUBLIC_PROFILE_TOKEN;

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'night-city-arcade-portfolio',
  };

  try {
    const [profileRes, reposRes, commitsRes, dashboardRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
      fetch(`https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}+is:public&per_page=1`, {
        headers: {
          ...headers,
          Accept: 'application/vnd.github+json',
        },
      }),
      token
        ? fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              query: DASHBOARD_QUERY,
              variables: { username },
            }),
          }).catch(() => null)
        : Promise.resolve(null),
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
    const commitsSearch = commitsRes.ok ? await commitsRes.json() : null;
    const dashboardData = dashboardRes && dashboardRes.ok ? await dashboardRes.json() : null;

    const publicRepos = Array.isArray(repos) ? repos.filter(repo => repo?.private === false && repo.visibility === 'public') : [];

    const totalStars = publicRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = publicRepos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    const languages = Array.from(new Set(publicRepos.map((repo) => repo.language).filter(Boolean)));

    const fallbackCommitCount =
      commitsSearch && typeof commitsSearch.total_count === 'number' ? commitsSearch.total_count : 0;

    const profileCommitCount =
      typeof dashboardData?.data?.user?.contributionsCollection?.totalCommitContributions === 'number'
        ? dashboardData.data.user.contributionsCollection.totalCommitContributions
        : null;

    const totalCommits = profileCommitCount ?? fallbackCommitCount;

    const fallbackFeaturedRepos = publicRepos
      .filter((repo) => !repo.fork)
      .sort((a, b) => {
        if ((b.stargazers_count || 0) !== (a.stargazers_count || 0)) {
          return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })
      .slice(0, 4)
      .map((repo) => ({
        id: String(repo.id),
        name: repo.name,
        description: repo.description || 'No description available.',
        url: repo.html_url,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || 'N/A',
        updatedAt: repo.updated_at,
      }));

    const pinnedRepos = Array.isArray(dashboardData?.data?.user?.pinnedItems?.nodes)
      ? dashboardData.data.user.pinnedItems.nodes
          .filter(repo => repo?.visibility === 'PUBLIC')
          .map((repo) => ({
            id: repo.id || repo.url,
            name: repo.name,
            description: repo.description || 'No description available.',
            url: repo.url,
            stars: repo.stargazerCount || 0,
            forks: repo.forkCount || 0,
            language: repo.primaryLanguage?.name || 'N/A',
            updatedAt: repo.updatedAt,
          }))
      : [];

    const featuredRepos = dedupeFeaturedRepos(pinnedRepos.length > 0 ? pinnedRepos : fallbackFeaturedRepos);

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
        totalCommits,
      },
      featuredRepos,
      lastUpdated: new Date().toISOString(),
      source: dashboardData?.data?.user ? 'github-api-authenticated' : 'github-api-public',
    });
  } catch (error) {
    console.error('GitHub function error:', error);
    return respond(500, {
      ok: false,
      error: 'Failed to fetch GitHub data.',
    });
  }
};
