export interface LeetCodeStats {
  totalSolved: number;
  accuracy: number;
  rating: number;
  rank: string;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  lastUpdated: string;
}

export interface LeetCodeResponse {
  data: {
    matchedUser: {
      submitStatsGlobal: {
        acSubmissionNum: Array<{
          difficulty: string;
          count: number;
          submissions: number;
        }>;
      };
      profile: {
        ranking: number;
        reputation: number;
      };
      userCalendar: {
        submissionCalendar: string;
      };
    };
    userContestRanking: {
      attendedContestsCount: number;
      rating: number;
      globalRanking: number;
      totalParticipants: number;
    } | null;
  };
}

const LEETCODE_USERNAME = 'EeshanSingh'; // Your real username

export const fetchLeetCodeStats = async (): Promise<LeetCodeStats> => {
  try {
    // Use Netlify function endpoint
    const response = await fetch(`/.netlify/functions/leetcode?username=${LEETCODE_USERNAME}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: LeetCodeResponse = await response.json();

    if (!data.data.matchedUser) {
      throw new Error('User not found');
    }

    const { matchedUser, userContestRanking } = data.data;
    const submitStats = matchedUser.submitStatsGlobal.acSubmissionNum;

    // Extract stats by difficulty
    const easyStats = submitStats.find(stat => stat.difficulty === 'Easy') || { count: 0, submissions: 0 };
    const mediumStats = submitStats.find(stat => stat.difficulty === 'Medium') || { count: 0, submissions: 0 };
    const hardStats = submitStats.find(stat => stat.difficulty === 'Hard') || { count: 0, submissions: 0 };
    const allStats = submitStats.find(stat => stat.difficulty === 'All') || { count: 0, submissions: 0 };

    const totalSolved = easyStats.count + mediumStats.count + hardStats.count;
    // Use LeetCode's acceptance rate: accepted submissions / total submissions
    const accuracy = allStats.submissions > 0 ? Math.round((allStats.count / allStats.submissions) * 100) : 0;

    // Contests attended display
    let contestsAttended = 'N/A';
    if (userContestRanking && typeof userContestRanking.attendedContestsCount === 'number') {
      contestsAttended = `CONTESTS: ${userContestRanking.attendedContestsCount}`;
    }

    // Get contest rating
    const rating = userContestRanking?.rating || 0;

    return {
      totalSolved,
      accuracy,
      rating: Math.round(rating),
      rank: contestsAttended,
      easySolved: easyStats.count,
      easyTotal: 150, // You can update these to the current LeetCode totals if you want
      mediumSolved: mediumStats.count,
      mediumTotal: 120,
      hardSolved: hardStats.count,
      hardTotal: 80,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    // Return fallback data if API fails
    return {
      totalSolved: 0,
      accuracy: 0,
      rating: 0,
      rank: 'N/A',
      easySolved: 0,
      easyTotal: 150,
      mediumSolved: 0,
      mediumTotal: 120,
      hardSolved: 0,
      hardTotal: 80,
      lastUpdated: new Date().toISOString(),
    };
  }
};

// Cache the stats to avoid excessive API calls
let cachedStats: LeetCodeStats | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const getLeetCodeStats = async (): Promise<LeetCodeStats> => {
  const now = Date.now();
  
  // Return cached stats if they're still valid
  if (cachedStats && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedStats;
  }

  // Fetch new stats
  const stats = await fetchLeetCodeStats();
  cachedStats = stats;
  lastFetchTime = now;
  
  return stats;
}; 