
import { UserStats, Badge, MarketItem } from './types';

export const INITIAL_USER_STATS: UserStats = {
  id: 'guest-operator',
  level: 12,
  xp: 4500,
  xpToNextLevel: 6000,
  streak: 5,
  energy: 85,
  focusTimeMinutes: 3420,
  rank: "Neon Scholar",
  credits: 5000,
  mood: 'flow',
  avatar: "https://img.freepik.com/premium-photo/futuristic-cyberpunk-character-avatar-neon-lights-futuristic-technologies_759095-257.jpg",
  unlockedBadgeIds: ['b1', 'b2', 'b9', 'b42'],
  lastDailyClaim: 0
};

export const MARKET_ITEMS: MarketItem[] = [
  // --- SKINS ---
  { id: 'm1', name: 'Cyberpunk Cityscape', type: 'skin', cost: 500, owned: true },
  { id: 'm3', name: 'Golden Neural Net', type: 'skin', cost: 1000, owned: false },
  
  // --- POWERUPS ---
  { id: 'm4', name: 'XP Booster (1h)', type: 'powerup', cost: 150, owned: false },
  { id: 'm5', name: 'Focus Shield', type: 'powerup', cost: 200, owned: false },

  // --- SOUNDSCAPES: BRAINWAVES ---
  { id: 's_delta', name: 'Delta Waves (Sleep)', type: 'music', cost: 300, owned: false },
  { id: 's_beta', name: 'Beta Waves (Alert)', type: 'music', cost: 300, owned: false },
  { id: 's_epsilon', name: 'Epsilon Waves (Insight)', type: 'music', cost: 500, owned: false },

  // --- SOUNDSCAPES: COLORED NOISE ---
  { id: 's_white', name: 'White Noise', type: 'music', cost: 200, owned: false },
  { id: 's_pink', name: 'Pink Noise', type: 'music', cost: 250, owned: false },
  { id: 's_brown', name: 'Brown Noise', type: 'music', cost: 250, owned: false },

  // --- SOUNDSCAPES: SOLFEGGIO FREQUENCIES ---
  { id: 's_528', name: '528Hz DNA Repair', type: 'music', cost: 450, owned: false },
  { id: 's_432', name: '432Hz Miracle', type: 'music', cost: 500, owned: false },
];

export const MOCK_BADGES: Badge[] = [
  { id: 'b1', name: 'Neural Link Alpha', image: '🧠', description: 'Completed your first focus session.', rarity: 'Common', acquiredDate: '2023-10-12', requirement: 'Finish 1 session' },
  { id: 'b2', name: 'Hello World', image: '👋', description: 'Logged in for the first time.', rarity: 'Common', acquiredDate: '2023-10-01', requirement: 'Create account' },
  { id: 'b9', name: 'Streak Starter', image: '🔥', description: 'Maintained a 3-day streak.', rarity: 'Common', acquiredDate: '2023-10-15', requirement: '3 Day Streak' },
  { id: 'b42', name: 'Neural Master', image: '🧠✨', description: '1000 Hours of Total Focus.', rarity: 'Artifact', acquiredDate: '2024-01-01', requirement: '1000h Focus' },
];
