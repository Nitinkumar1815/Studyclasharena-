
import { UserStats, Badge, MarketItem } from './types';

export const INITIAL_USER_STATS: UserStats = {
  id: 'guest-operator',
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  streak: 0,
  energy: 100,
  focusTimeMinutes: 0,
  rank: "Recruit",
  credits: 0, // Ensure starting value is 0
  mood: 'focus',
  avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=operator",
  unlockedBadgeIds: [],
  lastDailyClaim: 0
};

export const MARKET_ITEMS: MarketItem[] = [
  { id: 'm1', name: 'Cyberpunk Cityscape', type: 'skin', cost: 500, owned: true },
  { id: 'm3', name: 'Golden Neural Net', type: 'skin', cost: 1000, owned: false },
  { id: 'm4', name: 'XP Booster (1h)', type: 'powerup', cost: 150, owned: false },
  { id: 'm5', name: 'Focus Shield', type: 'powerup', cost: 200, owned: false },
  { id: 's_delta', name: 'Delta Waves (Sleep)', type: 'music', cost: 300, owned: false },
  { id: 's_beta', name: 'Beta Waves (Alert)', type: 'music', cost: 300, owned: false },
  { id: 's_epsilon', name: 'Epsilon Waves (Insight)', type: 'music', cost: 500, owned: false },
  { id: 's_white', name: 'White Noise', type: 'music', cost: 200, owned: false },
  { id: 's_528', name: '528Hz DNA Repair', type: 'music', cost: 450, owned: false },
  { id: 's_432', name: '432Hz Miracle', type: 'music', cost: 500, owned: false },
];

export const MOCK_BADGES: Badge[] = [
  // --- LEVELING (1-10) ---
  { id: 'l1', name: 'First Sync', image: '📡', description: 'Linked your neural path for the first time.', rarity: 'Common', acquiredDate: '', requirement: 'Reach Level 1' },
  { id: 'l2', name: 'Novice Adept', image: '🌱', description: 'Taking the first steps into the arena.', rarity: 'Common', acquiredDate: '', requirement: 'Reach Level 5' },
  { id: 'l3', name: 'Core Operator', image: '⚙️', description: 'Basic systems fully operational.', rarity: 'Common', acquiredDate: '', requirement: 'Reach Level 10' },
  { id: 'l4', name: 'Neural Architect', image: '🏗️', description: 'Building the foundation of knowledge.', rarity: 'Rare', acquiredDate: '', requirement: 'Reach Level 25' },
  { id: 'l5', name: 'Grand Master', image: '👑', description: 'A legend of the StudyClash Arena.', rarity: 'Legendary', acquiredDate: '', requirement: 'Reach Level 50' },
  { id: 'l6', name: 'Transcendent', image: '🌌', description: 'Beyond mortal study limits.', rarity: 'Artifact', acquiredDate: '', requirement: 'Reach Level 100' },
  
  // --- FOCUS TIME (7-15) ---
  { id: 'f1', name: 'Focus Spark', image: '⚡', description: '1 Hour of intense focus.', rarity: 'Common', acquiredDate: '', requirement: '60m Focus' },
  { id: 'f2', name: 'Deep Diver', image: '🤿', description: '10 Hours of deep work.', rarity: 'Rare', acquiredDate: '', requirement: '600m Focus' },
  { id: 'f3', name: 'Chronos King', image: '⏳', description: '50 Hours of focus time.', rarity: 'Rare', acquiredDate: '', requirement: '3000m Focus' },
  { id: 'f4', name: 'Time Lord', image: '🕰️', description: '100 Hours of mastery.', rarity: 'Legendary', acquiredDate: '', requirement: '6000m Focus' },
  { id: 'f5', name: 'Eternal Mind', image: '♾️', description: '1000 Hours of total study.', rarity: 'Artifact', acquiredDate: '', requirement: '60000m Focus' },
  
  // --- STREAKS (16-25) ---
  { id: 's1', name: 'Ignition', image: '🕯️', description: '3 Day Streak.', rarity: 'Common', acquiredDate: '', requirement: '3 Day Streak' },
  { id: 's2', name: 'Fire Starter', image: '🔥', description: '7 Day Streak.', rarity: 'Common', acquiredDate: '', requirement: '7 Day Streak' },
  { id: 's3', name: 'Wildfire', image: '💥', description: '15 Day Streak.', rarity: 'Rare', acquiredDate: '', requirement: '15 Day Streak' },
  { id: 's4', name: 'Supernova', image: '🌟', description: '30 Day Streak.', rarity: 'Legendary', acquiredDate: '', requirement: '30 Day Streak' },
  { id: 's5', name: 'Solar Flare', image: '☀️', description: '60 Day Streak.', rarity: 'Legendary', acquiredDate: '', requirement: '60 Day Streak' },
  { id: 's6', name: 'Century Club', image: '💯', description: '100 Day Streak.', rarity: 'Artifact', acquiredDate: '', requirement: '100 Day Streak' },

  // --- WEALTH (26-35) ---
  { id: 'w1', name: 'Credit Miner', image: '⛏️', description: 'Earned your first 1000 credits.', rarity: 'Common', acquiredDate: '', requirement: '1000 Credits' },
  { id: 'w2', name: 'Wealthy Scholar', image: '💰', description: 'Saved 5000 credits.', rarity: 'Rare', acquiredDate: '', requirement: '5000 Credits' },
  { id: 'w3', name: 'Market Shark', image: '🦈', description: 'Purchased 5 market items.', rarity: 'Rare', acquiredDate: '', requirement: '5 Market Items' },
  { id: 'w4', name: 'Tycoon', image: '💎', description: 'Total wealth exceeded 100k.', rarity: 'Legendary', acquiredDate: '', requirement: '100k Total Earned' },

  // --- SPECIAL ACTIONS (36-50) ---
  { id: 'a1', name: 'Bio-Optimizer', image: '🥗', description: 'Checked Bio-Sync 10 times.', rarity: 'Common', acquiredDate: '', requirement: '10 Health Checks' },
  { id: 'a2', name: 'Zen Master', image: '🧘', description: 'Completed a 10m meditation.', rarity: 'Rare', acquiredDate: '', requirement: '10m Meditation' },
  { id: 'a3', name: 'Early Bird', image: '🌅', description: 'Studied before 6:00 AM.', rarity: 'Rare', acquiredDate: '', requirement: 'Morning Study' },
  { id: 'a4', name: 'Night Owl', image: '🦉', description: 'Studied after 12:00 AM.', rarity: 'Rare', acquiredDate: '', requirement: 'Late Night Study' },
  { id: 'a5', name: 'Duelist', image: '🤺', description: 'Won your first focus duel.', rarity: 'Rare', acquiredDate: '', requirement: '1 Duel Win' },
  { id: 'a6', name: 'Arena Regular', image: '🏟️', description: 'Participated in 20 battles.', rarity: 'Common', acquiredDate: '', requirement: '20 Battles' },
  { id: 'a7', name: 'Bookworm', image: '📚', description: 'Tracked 50 unique tasks.', rarity: 'Rare', acquiredDate: '', requirement: '50 Unique Tasks' },
  { id: 'a8', name: 'Supporter', image: '📦', description: 'Claimed 10 supply drops.', rarity: 'Common', acquiredDate: '', requirement: '10 Claims' },
  { id: 'a9', name: 'Speed Demon', image: '🏎️', description: 'Finished a 25m session with 0 distractions.', rarity: 'Rare', acquiredDate: '', requirement: 'Perfect 25m' },
  { id: 'a10', name: 'Tank', image: '🛡️', description: 'Shielded 5 distractions.', rarity: 'Rare', acquiredDate: '', requirement: '5 Shields' },
  { id: 'a11', name: 'Scholar of Gita', image: '☸️', description: 'Visited Wisdom Shrine 5 times.', rarity: 'Rare', acquiredDate: '', requirement: '5 Wisdom Visits' },
  { id: 'a12', name: 'Audio Phile', image: '🎵', description: 'Owned all music tracks.', rarity: 'Legendary', acquiredDate: '', requirement: 'All Music' },
  { id: 'a13', name: 'Perfect Week', image: '📅', description: 'Completed all schedule items in a week.', rarity: 'Legendary', acquiredDate: '', requirement: 'Week Perfect' },
  { id: 'a14', name: 'God Mode', image: '👾', description: '300m focus in a single day.', rarity: 'Artifact', acquiredDate: '', requirement: '300m Daily' },
  { id: 'a15', name: 'Socialite', image: '🤝', description: 'Shared 5 achievements.', rarity: 'Common', acquiredDate: '', requirement: '5 Shares' },
  { id: 'a16', name: 'Neural Diver', image: '🏊', description: 'First 90-minute session.', rarity: 'Rare', acquiredDate: '', requirement: '90m Session' },
  { id: 'a17', name: 'Battery Full', image: '🔋', description: 'Restored energy to 100% via rest.', rarity: 'Common', acquiredDate: '', requirement: 'Full Energy' },
  { id: 'a18', name: 'Glitch Fixer', image: '🔧', description: 'Recovered from a 3-breach duel.', rarity: 'Rare', acquiredDate: '', requirement: 'Duel Recovery' },
  { id: 'a19', name: 'Oracle', image: '👁️', description: 'Used AI Analysis 20 times.', rarity: 'Rare', acquiredDate: '', requirement: '20 AI Consults' },
  { id: 'a20', name: 'Conqueror', image: '⚔️', description: 'Top 3 on Leaderboard.', rarity: 'Legendary', acquiredDate: '', requirement: 'Top 3' },
  { id: 'a21', name: 'Master of Dharma', image: '📜', description: 'Unlocked 40 achievements.', rarity: 'Artifact', acquiredDate: '', requirement: '40 Badges' },
  { id: 'a22', name: 'Hacker', image: '💻', description: 'Scored 10,000 in Neural Breach.', rarity: 'Rare', acquiredDate: '', requirement: '10k Breach' },
  { id: 'a23', name: 'Elite Guard', image: '💂', description: 'Zero exits in Strict Mode for 5 tasks.', rarity: 'Rare', acquiredDate: '', requirement: '5 Strict Tasks' },
  { id: 'a24', name: 'Lofi Legend', image: '☕', description: 'Listened to Lofi for 10 hours.', rarity: 'Rare', acquiredDate: '', requirement: '10h Music' },
  { id: 'a25', name: 'Titan', image: '⛰️', description: 'Level 15 achieved.', rarity: 'Common', acquiredDate: '', requirement: 'Lvl 15' },
  { id: 'a26', name: 'Commander', image: '🎖️', description: 'Level 30 achieved.', rarity: 'Rare', acquiredDate: '', requirement: 'Lvl 30' },
  { id: 'a27', name: 'The Chosen One', image: '⚡', description: 'Unlocked a legendary badge.', rarity: 'Rare', acquiredDate: '', requirement: '1 Legendary' },
  { id: 'a28', name: 'Marathoner', image: '🏃', description: '10,000 total focus minutes.', rarity: 'Legendary', acquiredDate: '', requirement: '10k Minutes' },
  { id: 'a29', name: 'Daily Warrior', image: '⚔️', description: 'Studied for 21 days straight.', rarity: 'Rare', acquiredDate: '', requirement: '21 Streak' },
  { id: 'a30', name: 'Cyber Hero', image: '🦸', description: 'Highest rank achieved.', rarity: 'Artifact', acquiredDate: '', requirement: 'Max Rank' }
];
