export interface GitHubFeaturedRepo {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
}

export interface GitHubStats {
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  languageCount: number;
  totalPublicCommits: number;
}

export interface GitHubStatsResponse {
  ok: boolean;
  username: string;
  stats: GitHubStats;
  featuredRepos: GitHubFeaturedRepo[];
  lastUpdated: string;
  source: string;
  error?: string;
}

const GITHUB_USERNAME = 'HERPESME';

const fallbackResponse: GitHubStatsResponse = {
  ok: false,
  username: GITHUB_USERNAME,
  stats: {
    followers: 0,
    following: 0,
    publicRepos: 0,
    totalStars: 0,
    totalForks: 0,
    languageCount: 0,
    totalPublicCommits: 0,
  },
  featuredRepos: [],
  lastUpdated: new Date().toISOString(),
  source: 'fallback',
  error: 'GitHub stats unavailable',
};

export const fetchGitHubStats = async (): Promise<GitHubStatsResponse> => {
  try {
    const response = await fetch(`/.netlify/functions/github?username=${GITHUB_USERNAME}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as GitHubStatsResponse;

    if (!data.ok) {
      throw new Error(data.error || 'GitHub request failed');
    }

    return data;
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return {
      ...fallbackResponse,
      lastUpdated: new Date().toISOString(),
    };
  }
};

let cachedStats: GitHubStatsResponse | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000;

export const getGitHubStats = async (): Promise<GitHubStatsResponse> => {
  const now = Date.now();

  if (cachedStats && now - lastFetchTime < CACHE_DURATION) {
    return cachedStats;
  }

  const data = await fetchGitHubStats();
  cachedStats = data;
  lastFetchTime = now;

  return data;
};
