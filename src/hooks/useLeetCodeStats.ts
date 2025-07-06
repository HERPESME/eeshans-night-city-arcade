import { useState, useEffect, useCallback } from 'react';
import { getLeetCodeStats, LeetCodeStats } from '@/lib/leetcode';

interface UseLeetCodeStatsReturn {
  stats: LeetCodeStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

export const useLeetCodeStats = (): UseLeetCodeStatsReturn => {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeetCodeStats();
      setStats(data);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch LeetCode stats');
      console.error('Error in useLeetCodeStats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up hourly updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [fetchStats]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}; 