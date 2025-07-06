const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const username = event.queryStringParameters.username;
  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing username parameter' })
    };
  }

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
          reputation
        }
        userCalendar {
          submissionCalendar
        }
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
      }
    }
  `;

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username } }),
    });
    const data = await response.json();
    console.log('LeetCode API response:', JSON.stringify(data));
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  } catch (err) {
    console.error('LeetCode proxy error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from LeetCode', details: err.message })
    };
  }
}; 