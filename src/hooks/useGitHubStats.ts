import { useCallback, useEffect, useState } from 'react';
import { getGitHubStats, GitHubFeaturedRepo, GitHubStats } from '@/lib/github';

interface UseGitHubStatsReturn {
  stats: GitHubStats | null;
  featuredRepos: GitHubFeaturedRepo[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

export const useGitHubStats = (): UseGitHubStatsReturn => {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [featuredRepos, setFeaturedRepos] = useState<GitHubFeaturedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGitHubStats();

      setStats(data.stats);
      setFeaturedRepos(data.featuredRepos || []);
      setLastUpdated(data.lastUpdated);

      if (!data.ok) {
        setError(data.error || 'Failed to fetch GitHub stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return {
    stats,
    featuredRepos,
    loading,
    error,
    lastUpdated,
    refresh,
  };
};
