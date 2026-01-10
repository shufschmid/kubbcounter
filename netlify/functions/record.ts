import { Handler } from '@netlify/functions';
import Airtable from 'airtable';

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Validate required fields
    const requiredFields = ['playerName', 'distance', 'quantity', 'hits', 'misses', 'hitPercentage', 'longestHitStreak', 'longestMissStreak', 'duration', 'startTime', 'endTime'];
    const missingFields = requiredFields.filter(field => !(field in data));

    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields',
          missingFields
        }),
      };
    }

    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID || '');

    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Kubb';

    // Create record in Airtable
    const record = await base(tableName).create({
      'Player Name': data.playerName,
      'Distance': data.distance,
      'Quantity': data.quantity,
      'Hits': data.hits,
      'Misses': data.misses,
      'Hit Percentage': data.hitPercentage,
      'Longest Hit Streak': data.longestHitStreak,
      'Longest Miss Streak': data.longestMissStreak,
      'Duration (seconds)': data.duration,
      'Start Time': data.startTime,
      'End Time': data.endTime,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: record.getId(),
      }),
    };
  } catch (error) {
    console.error('Error creating record:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create record',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
