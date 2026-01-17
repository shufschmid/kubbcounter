'use client';

import { useState, useEffect } from 'react';

type Screen = 'setup' | 'game' | 'celebration' | 'statistics';
type ThrowResult = 'hit' | 'miss';

interface GameSetup {
  playerName: string;
  distance: string;
  quantity: number;
}

interface GameSession {
  setup: GameSetup;
  throws: ThrowResult[];
  startTime: Date;
}

interface Statistics {
  hits: number;
  misses: number;
  hitPercentage: number;
  longestHitStreak: number;
  longestMissStreak: number;
}

interface RecordBreaks {
  hitStreak: boolean;
  hitPercentage: boolean;
  totalHits: boolean;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [setup, setSetup] = useState<GameSetup>({
    playerName: 'Samuel',
    distance: '4 Meter',
    quantity: 50,
  });
  const [session, setSession] = useState<GameSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordBreaks, setRecordBreaks] = useState<RecordBreaks>({
    hitStreak: false,
    hitPercentage: false,
    totalHits: false,
  });
  const [celebrationGif, setCelebrationGif] = useState<string>('');
  const [historicalRecords, setHistoricalRecords] = useState<any>(null);
  const [clickedButton, setClickedButton] = useState<'hit' | 'miss' | null>(null);
  const [showPlusOne, setShowPlusOne] = useState<'hit' | 'miss' | null>(null);

  // Array of celebration GIFs
  const celebrationGifs = [
    'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif', // Confetti explosion
    'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif', // Fireworks
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Trophy celebration
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', // Party celebration
    'https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif', // Confetti popper
    'https://media.giphy.com/media/l0HlR3kHtkgFbYfgQ/giphy.gif', // Celebration dance
  ];

  // Timer effect for game screen
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (screen === 'game' && session) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [screen, session]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = async () => {
    setSession({
      setup,
      throws: [],
      startTime: new Date(),
    });
    setElapsedTime(0);
    setScreen('game');

    // Fetch historical records at game start
    try {
      const response = await fetch(
        `/.netlify/functions/get-records?playerName=${encodeURIComponent(setup.playerName)}&distance=${encodeURIComponent(setup.distance)}&quantity=${setup.quantity}`
      );

      if (response.ok) {
        const data = await response.json();
        setHistoricalRecords(data.records);
      }
    } catch (error) {
      console.error('Error fetching historical records:', error);
    }
  };

  const calculateStatistics = (): Statistics => {
    if (!session) {
      return { hits: 0, misses: 0, hitPercentage: 0, longestHitStreak: 0, longestMissStreak: 0 };
    }

    const hits = session.throws.filter(t => t === 'hit').length;
    const misses = session.throws.filter(t => t === 'miss').length;
    const hitPercentage = session.throws.length > 0 ? (hits / session.throws.length) * 100 : 0;

    // Calculate longest streaks
    let longestHitStreak = 0;
    let longestMissStreak = 0;
    let currentHitStreak = 0;
    let currentMissStreak = 0;

    session.throws.forEach(throwResult => {
      if (throwResult === 'hit') {
        currentHitStreak++;
        currentMissStreak = 0;
        longestHitStreak = Math.max(longestHitStreak, currentHitStreak);
      } else {
        currentMissStreak++;
        currentHitStreak = 0;
        longestMissStreak = Math.max(longestMissStreak, currentMissStreak);
      }
    });

    return { hits, misses, hitPercentage, longestHitStreak, longestMissStreak };
  };

  const checkForRecords = () => {
    if (!session) return;

    const stats = calculateStatistics();

    // Use pre-fetched historical records
    if (historicalRecords) {
      const breaks: RecordBreaks = {
        hitStreak: stats.longestHitStreak > historicalRecords.maxHitStreak,
        hitPercentage: stats.hitPercentage > historicalRecords.maxHitPercentage,
        totalHits: stats.hits > historicalRecords.maxHitsForQuantity,
      };

      setRecordBreaks(breaks);

      // Show celebration if any records were broken
      if (breaks.hitStreak || breaks.hitPercentage || breaks.totalHits) {
        // Select a random celebration GIF
        const randomGif = celebrationGifs[Math.floor(Math.random() * celebrationGifs.length)];
        setCelebrationGif(randomGif);

        setScreen('celebration');
        // Auto-advance to statistics after 5 seconds
        setTimeout(() => {
          setScreen('statistics');
        }, 5000);
      } else {
        setScreen('statistics');
      }
    } else {
      // If no historical records loaded, just go to statistics
      setScreen('statistics');
    }
  };

  const recordThrow = (result: ThrowResult) => {
    if (!session) return;

    // Show button feedback
    setClickedButton(result);
    setTimeout(() => setClickedButton(null), 300);

    // Show +1 animation
    setShowPlusOne(result);
    setTimeout(() => setShowPlusOne(null), 800);

    const newThrows = [...session.throws, result];
    setSession({
      ...session,
      throws: newThrows,
    });

    // Check if game is complete
    if (newThrows.length >= setup.quantity) {
      checkForRecords();
    }
  };

  const submitResult = async () => {
    if (!session) return;

    setSubmitting(true);
    setSubmitMessage('');

    const stats = calculateStatistics();
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / 1000); // in seconds

    try {
      const response = await fetch('/.netlify/functions/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: setup.playerName,
          distance: setup.distance,
          quantity: setup.quantity,
          hits: stats.hits,
          misses: stats.misses,
          hitPercentage: stats.hitPercentage,
          longestHitStreak: stats.longestHitStreak,
          longestMissStreak: stats.longestMissStreak,
          duration,
          startTime: session.startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage('Result submitted successfully!');
        setTimeout(() => {
          // Reset to setup screen
          setScreen('setup');
          setSession(null);
          setSubmitMessage('');
          setRecordBreaks({ hitStreak: false, hitPercentage: false, totalHits: false });
          setCelebrationGif('');
          setHistoricalRecords(null);
        }, 2000);
      } else {
        setSubmitMessage(`Error: ${data.error || 'Failed to submit'}`);
      }
    } catch (error) {
      setSubmitMessage(`Error: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Setup Screen
  if (screen === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-5xl font-bold mb-12 text-gray-800">Kubb Counter</h1>

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="mb-6">
            <label className="block text-xl font-semibold text-gray-700 mb-3">Player Name</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSetup({ ...setup, playerName: 'Samuel' })}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  setup.playerName === 'Samuel'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Samuel
              </button>
              <button
                onClick={() => setSetup({ ...setup, playerName: 'Isabelle' })}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  setup.playerName === 'Isabelle'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Isabelle
              </button>
              <button
                onClick={() => setSetup({ ...setup, playerName: 'Louise' })}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  setup.playerName === 'Louise'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Louise
              </button>
              <button
                onClick={() => setSetup({ ...setup, playerName: 'Sophie' })}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  setup.playerName === 'Sophie'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Sophie
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xl font-semibold text-gray-700 mb-3">Distance</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSetup({ ...setup, distance: '4 Meter' })}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  setup.distance === '4 Meter'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                4 Meter
              </button>
              <button
                onClick={() => setSetup({ ...setup, distance: '8 Meter' })}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  setup.distance === '8 Meter'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                8 Meter
              </button>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xl font-semibold text-gray-700 mb-3">Quantity of Throws</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setSetup({ ...setup, quantity: 30 })}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  setup.quantity === 30
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                30
              </button>
              <button
                onClick={() => setSetup({ ...setup, quantity: 50 })}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  setup.quantity === 50
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                50
              </button>
              <button
                onClick={() => setSetup({ ...setup, quantity: 100 })}
                className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  setup.quantity === 100
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                100
              </button>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-2xl py-6 rounded-xl shadow-lg transition-all transform active:scale-95"
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // Game Screen - Only timer and buttons
  if (screen === 'game' && session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="mb-12">
          <div className="text-6xl font-mono font-bold text-gray-700">
            {formatTime(elapsedTime)}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 relative">
          <div className="relative">
            <button
              onClick={() => recordThrow('hit')}
              className={`w-64 h-64 text-white font-bold text-4xl rounded-2xl shadow-2xl transform transition-all duration-150 ${
                clickedButton === 'hit'
                  ? 'bg-green-700 scale-90 ring-8 ring-green-300 brightness-125'
                  : 'bg-green-500 hover:bg-green-600 active:scale-95'
              }`}
            >
              HIT
            </button>
            {showPlusOne === 'hit' && setup.playerName === 'Isabelle' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-2xl border-8 border-green-500 animate-ping">
                  <span className="text-6xl font-black text-green-600">+1</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => recordThrow('miss')}
              className={`w-64 h-64 text-white font-bold text-4xl rounded-2xl shadow-2xl transform transition-all duration-150 ${
                clickedButton === 'miss'
                  ? 'bg-red-700 scale-90 ring-8 ring-red-300 brightness-125'
                  : 'bg-red-500 hover:bg-red-600 active:scale-95'
              }`}
            >
              MISS
            </button>
            {showPlusOne === 'miss' && setup.playerName === 'Isabelle' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-2xl border-8 border-red-500 animate-ping">
                  <span className="text-6xl font-black text-red-600">+1</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Celebration Screen - Shows when records are broken
  if (screen === 'celebration' && session) {
    const recordMessages = [];
    if (recordBreaks.hitStreak) recordMessages.push('Longest Hit Streak');
    if (recordBreaks.hitPercentage) recordMessages.push('Highest Hit Percentage');
    if (recordBreaks.totalHits) recordMessages.push('Most Total Hits');

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4">
        <div className="text-center">
          <h1 className="text-7xl font-bold text-white mb-8 animate-bounce">
            NEW RECORD!
          </h1>

          <div className="mb-8">
            <img
              src={celebrationGif}
              alt="Celebration"
              className="w-96 h-96 mx-auto rounded-3xl shadow-2xl object-cover"
            />
          </div>

          <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">You broke the record for:</h2>
            <div className="space-y-4">
              {recordMessages.map((msg, index) => (
                <div key={index} className="text-3xl font-semibold text-orange-600 animate-pulse">
                  🏆 {msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Statistics Screen
  if (screen === 'statistics' && session) {
    const stats = calculateStatistics();
    const endTime = new Date();
    const totalSeconds = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
    const timePerThrow = session.throws.length > 0 ? totalSeconds / session.throws.length : 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-5xl font-bold mb-8 text-gray-800">Results</h1>

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
          <div className="mb-6 text-center pb-6 border-b-2">
            <h2 className="text-3xl font-bold text-gray-800">{setup.playerName}</h2>
            <p className="text-xl text-gray-600 mt-2">{setup.distance} - {setup.quantity} throws</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-xl text-center">
              <p className="text-gray-600 text-lg mb-2">Hits</p>
              <p className="text-5xl font-bold text-green-600">{stats.hits}</p>
            </div>

            <div className="bg-red-50 p-6 rounded-xl text-center">
              <p className="text-gray-600 text-lg mb-2">Misses</p>
              <p className="text-5xl font-bold text-red-600">{stats.misses}</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl text-center col-span-2">
              <p className="text-gray-600 text-lg mb-2">Hit Percentage</p>
              <p className="text-5xl font-bold text-blue-600">{stats.hitPercentage.toFixed(1)}%</p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl text-center">
              <p className="text-gray-600 text-lg mb-2">Longest Hit Streak</p>
              <p className="text-4xl font-bold text-yellow-600">{stats.longestHitStreak}</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl text-center">
              <p className="text-gray-600 text-lg mb-2">Longest Miss Streak</p>
              <p className="text-4xl font-bold text-purple-600">{stats.longestMissStreak}</p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl text-center">
              <p className="text-gray-600 text-lg mb-2">Total Time</p>
              <p className="text-4xl font-bold text-indigo-600">{formatTime(totalSeconds)}</p>
            </div>

            <div className="bg-teal-50 p-6 rounded-xl text-center">
              <p className="text-gray-600 text-lg mb-2">Time per Throw</p>
              <p className="text-4xl font-bold text-teal-600">{timePerThrow.toFixed(1)}s</p>
            </div>
          </div>

          <button
            onClick={submitResult}
            disabled={submitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold text-2xl py-6 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mr-3"></div>
                Submitting...
              </div>
            ) : (
              'Submit Result'
            )}
          </button>

          {submitMessage && (
            <div className={`mt-4 text-center text-xl font-semibold ${submitMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {submitMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
