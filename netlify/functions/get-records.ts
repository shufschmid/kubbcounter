import { Handler } from '@netlify/functions';
import Airtable from 'airtable';

const handler: Handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { playerName, distance, quantity } = event.queryStringParameters || {};

    if (!playerName || !distance || !quantity) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required parameters: playerName, distance, quantity'
        }),
      };
    }

    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID || '');

    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Kubb';

    // Fetch records for this player and distance
    const records = await base(tableName)
      .select({
        filterByFormula: `AND({Player Name} = '${playerName}', {Distance} = '${distance}')`,
        sort: [{ field: 'Start Time', direction: 'desc' }]
      })
      .all();

    const historicalData = records.map(record => ({
      hits: record.get('Hits') as number,
      misses: record.get('Misses') as number,
      hitPercentage: record.get('Hit Percentage') as number,
      longestHitStreak: record.get('Longest Hit Streak') as number,
      longestMissStreak: record.get('Longest Miss Streak') as number,
      quantity: record.get('Quantity') as number,
      duration: record.get('Duration (seconds)') as number,
    }));

    // Calculate records
    const maxHitStreak = Math.max(...historicalData.map(d => d.longestHitStreak || 0), 0);
    const maxHitPercentage = Math.max(...historicalData.map(d => d.hitPercentage || 0), 0);

    // Filter by quantity and get max hits
    const sameQuantityRecords = historicalData.filter(d => d.quantity === parseInt(quantity));
    const maxHitsForQuantity = Math.max(...sameQuantityRecords.map(d => d.hits || 0), 0);

    return {
      statusCode: 200,
      body: JSON.stringify({
        records: {
          maxHitStreak,
          maxHitPercentage,
          maxHitsForQuantity,
        },
        totalGames: historicalData.length,
      }),
    };
  } catch (error) {
    console.error('Error fetching records:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch records',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
