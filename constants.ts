
import { UserStats, Badge, MarketItem } from './types';

export const MARVEL_RANKS = [
  "Iron Scholastic", "Captain Academic", "Focus Panther", "Scarlet Studious", "Strange Mind", 
  "Quantum Widow", "Stark Logic", "Thor Focus", "Hulk Intelligence", "Rocket Reader", 
  "Groot Growth", "Gamora Grade", "Visionary Mind", "Spider-Study", "Deadpool Discipline", 
  "Ant-Man Analysis", "Wasp Wisdom", "Falcon Focus", "Winter Scholar", "Nebula Neural", 
  "Drax Diligence", "Mantis Meditation", "Thanos Theory", "Loki Lore", "Odin Oracle", 
  "Valkyrie Veteran", "Panther Principal", "Shuri Smart", "Okoye Order", "Bucky Brain", 
  "Carol Core", "Clint Concentration", "Bruce Bright", "Tony Tech", "Steve Steady", 
  "Natasha Network", "Wanda Wave", "Pietro Pace", "Sam Sky", "Rhodey Rigor", 
  "Peter Power", "Scott Science", "Hope Harmony", "T'Challa Talent", "Strange Sorcerer", 
  "Wong Word", "Quill Quest", "Mantis Mindset", "Rocket Rig", "Groot Genius"
];

export const getRandomMarvelRank = () => MARVEL_RANKS[Math.floor(Math.random() * MARVEL_RANKS.length)];

// --- GLOBAL PERFORMANCE LOGIC ---

export const PERFORMANCE_TIERS = [
  { label: 'Recruit', tier: 'D', minScore: 0, color: 'text-gray-400', glow: 'shadow-gray-500/20' },
  { label: 'Guard', tier: 'C', minScore: 1000, color: 'text-green-400', glow: 'shadow-green-500/20' },
  { label: 'Warrior', tier: 'B', minScore: 3000, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
  { label: 'Commander', tier: 'A', minScore: 7000, color: 'text-purple-400', glow: 'shadow-purple-500/20' },
  { label: 'Elite', tier: 'S', minScore: 15000, color: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
  { label: 'Master', tier: 'SS', minScore: 30000, color: 'text-cyan-400', glow: 'shadow-cyan-400/20' },
  { label: 'Legend', tier: 'SSS', minScore: 60000, color: 'text-red-500', glow: 'shadow-red-500/40' },
];

export const calculatePerformanceScore = (stats: UserStats) => {
  return (stats.focusTimeMinutes * 2) + (stats.streak * 100) + (stats.level * 500) + (stats.xp / 10);
};

export const getPerformanceTier = (score: number) => {
  for (let i = PERFORMANCE_TIERS.length - 1; i >= 0; i--) {
    if (score >= PERFORMANCE_TIERS[i].minScore) {
      return {
        ...PERFORMANCE_TIERS[i],
        next: PERFORMANCE_TIERS[i + 1] || null
      };
    }
  }
  return { ...PERFORMANCE_TIERS[0], next: PERFORMANCE_TIERS[1] };
};

export const INITIAL_USER_STATS: UserStats = {
  id: 'guest-operator',
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  streak: 0,
  energy: 100,
  focusTimeMinutes: 0,
  rank: "Sector Hero",
  credits: 0, 
  mood: 'focus',
  avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=operator",
  unlockedBadgeIds: [],
  lastDailyClaim: 0
};

// Expanded Marketplace with 50+ Premium Audio Tracks
export const MARKET_ITEMS: MarketItem[] = [
  // Skins & Powerups (Originals)
  { id: 'm1', name: 'Cyberpunk Cityscape', type: 'skin', cost: 500, owned: true },
  { id: 'm3', name: 'Golden Neural Net', type: 'skin', cost: 1000, owned: false },
  { id: 'm4', name: 'XP Booster (1h)', type: 'powerup', cost: 150, owned: false },
  { id: 'm5', name: 'Focus Shield', type: 'powerup', cost: 200, owned: false },

  // --- AUDIO PACKS: BINAURAL SERIES (10) ---
  { id: 's_beta_boost', name: 'Beta Focus: High Alert', type: 'music', cost: 300, owned: false },
  { id: 's_alpha_zen', name: 'Alpha Flow: Creative State', type: 'music', cost: 300, owned: false },
  { id: 's_theta_deep', name: 'Theta Depth: Subconscious', type: 'music', cost: 350, owned: false },
  { id: 's_delta_sleep', name: 'Delta Pulse: Deep Recovery', type: 'music', cost: 400, owned: false },
  { id: 's_gamma_peak', name: 'Gamma Peak: Neural Surge', type: 'music', cost: 600, owned: false },
  { id: 's_epsilon_void', name: 'Epsilon Void: Infinite Focus', type: 'music', cost: 700, owned: false },
  { id: 's_binaural_hybrid_1', name: 'Dual Layer: Logic Sync', type: 'music', cost: 450, owned: false },
  { id: 's_binaural_hybrid_2', name: 'Dual Layer: Memory Link', type: 'music', cost: 450, owned: false },
  { id: 's_iso_chronic', name: 'Isochronic Stimulator', type: 'music', cost: 500, owned: false },
  { id: 's_brain_refresh', name: 'Synapse Flush 12Hz', type: 'music', cost: 550, owned: false },

  // --- AUDIO PACKS: NATURE OS (10) ---
  { id: 's_neon_rain', name: 'Neon Rain: Tokyo 2099', type: 'music', cost: 200, owned: false },
  { id: 's_cyber_forest', name: 'Quantum Forest: Amazonia', type: 'music', cost: 250, owned: false },
  { id: 's_solar_ocean', name: 'Solar Ocean: Surface 4', type: 'music', cost: 250, owned: false },
  { id: 's_arctic_wind', name: 'Arctic Breach: Zero Kelvin', type: 'music', cost: 300, owned: false },
  { id: 's_thunder_storm', name: 'EMP Storm: High Voltage', type: 'music', cost: 350, owned: false },
  { id: 's_cricket_night', name: 'Bio-Static: Forest Night', type: 'music', cost: 200, owned: false },
  { id: 's_waterfall_flux', name: 'Liquid Core: Waterfall', type: 'music', cost: 300, owned: false },
  { id: 's_desert_sirocco', name: 'Dune Drifting: Hot Air', type: 'music', cost: 250, owned: false },
  { id: 's_bird_morning', name: 'Aviary Uplink: 0600hrs', type: 'music', cost: 200, owned: false },
  { id: 's_underwater_sonar', name: 'Sub-Aqua: Trench Depth', type: 'music', cost: 400, owned: false },

  // --- AUDIO PACKS: FUTURISTIC AMBIENCE (10) ---
  { id: 's_spaceship_hum', name: 'Interstellar Cruiser Hum', type: 'music', cost: 350, owned: false },
  { id: 's_server_room', name: 'Mainframe Cooling Fans', type: 'music', cost: 300, owned: false },
  { id: 's_cyber_cafe', name: 'Akihabara Cafe: Low Hum', type: 'music', cost: 250, owned: false },
  { id: 's_space_station', name: 'Orbit Station: Air Flow', type: 'music', cost: 400, owned: false },
  { id: 's_blade_runner', name: 'Replicant Dreams: Synth', type: 'music', cost: 500, owned: false },
  { id: 's_market_chatter', name: 'Neo-Market: Human Noise', type: 'music', cost: 200, owned: false },
  { id: 's_train_future', name: 'Maglev Transit: Smooth', type: 'music', cost: 350, owned: false },
  { id: 's_teleport_room', name: 'Atomizer Static', type: 'music', cost: 450, owned: false },
  { id: 's_library_silent', name: 'Neural Archives: Silence', type: 'music', cost: 200, owned: false },
  { id: 's_cyber_garden', name: 'Glass Dome: Eco Synth', type: 'music', cost: 300, owned: false },

  // --- AUDIO PACKS: SOLFEGGIO FREQUENCIES (10) ---
  { id: 's_174_pain', name: '174Hz: Genetic Healing', type: 'music', cost: 450, owned: false },
  { id: 's_285_tissue', name: '285Hz: Cellular Repair', type: 'music', cost: 450, owned: false },
  { id: 's_396_fear', name: '396Hz: Liberation (Fear)', type: 'music', cost: 450, owned: false },
  { id: 's_417_change', name: '417Hz: Universal Change', type: 'music', cost: 450, owned: false },
  { id: 's_432_nature', name: '432Hz: Heart of Earth', type: 'music', cost: 500, owned: false },
  { id: 's_528_dna', name: '528Hz: DNA Activation', type: 'music', cost: 550, owned: false },
  { id: 's_639_link', name: '639Hz: Neural Connectivity', type: 'music', cost: 450, owned: false },
  { id: 's_741_detox', name: '741Hz: Mental Detox', type: 'music', cost: 450, owned: false },
  { id: 's_852_order', name: '852Hz: Returning to Order', type: 'music', cost: 500, owned: false },
  { id: 's_963_god', name: '963Hz: Higher Reality', type: 'music', cost: 600, owned: false },

  // --- AUDIO PACKS: LO-FI NEURAL BEATS (10) ---
  { id: 's_lofi_midnight', name: 'Midnight Study: Glitch', type: 'music', cost: 250, owned: false },
  { id: 's_lofi_rainy_window', name: 'Rainy Terminal: Lo-fi', type: 'music', cost: 250, owned: false },
  { id: 's_lofi_empty_metro', name: 'Empty Metro: Lo-fi', type: 'music', cost: 250, owned: false },
  { id: 's_lofi_starry_night', name: 'Orion Belt: Chill Hop', type: 'music', cost: 300, owned: false },
  { id: 's_lofi_lo_poly', name: 'Low Poly Garden: Beats', type: 'music', cost: 200, owned: false },
  { id: 's_lofi_vapor', name: 'Vapor Wave: Nostalgia', type: 'music', cost: 350, owned: false },
  { id: 's_lofi_jazz_bot', name: 'Jazz Bot: Soft Brass', type: 'music', cost: 300, owned: false },
  { id: 's_lofi_moon_cafe', name: 'Lunar Cafe: Dusty Vinyl', type: 'music', cost: 250, owned: false },
  { id: 's_lofi_study_girl', name: 'Classic Lo-fi Archive', type: 'music', cost: 200, owned: false },
  { id: 's_lofi_terminal_vibes', name: 'Root Access: Lo-fi', type: 'music', cost: 300, owned: false },

  // --- AUDIO PACKS: NOISE SHAPES (5) ---
  { id: 's_white_noise', name: 'White Noise: Clean', type: 'music', cost: 150, owned: false },
  { id: 's_pink_noise', name: 'Pink Noise: Soft', type: 'music', cost: 150, owned: false },
  { id: 's_brown_noise', name: 'Brown Noise: Deep', type: 'music', cost: 150, owned: false },
  { id: 's_blue_noise', name: 'Blue Noise: High', type: 'music', cost: 150, owned: false },
  { id: 's_gray_noise', name: 'Gray Noise: Balanced', type: 'music', cost: 150, owned: false },
];

export const MOCK_BADGES: Badge[] = [
  // --- CORE MILESTONES (10) ---
  { id: 'l1', name: 'First Sync', image: '📡', description: 'Linked your neural path for the first time.', rarity: 'Common', acquiredDate: '', requirement: 'Reach Level 1' },
  { id: 'l10', name: 'Decade of Power', image: '🔋', description: 'Reached a double-digit clearance level.', rarity: 'Common', acquiredDate: '', requirement: 'Reach Level 10' },
  { id: 'l25', name: 'Quarter Century', image: '🎖️', description: 'Level 25 clearance confirmed.', rarity: 'Rare', acquiredDate: '', requirement: 'Reach Level 25' },
  { id: 'l50', name: 'Halfway Hero', image: '🛡️', description: 'You are becoming a legend in the sector.', rarity: 'Rare', acquiredDate: '', requirement: 'Reach Level 50' },
  { id: 'l75', name: 'Elite Guardian', image: '🦅', description: 'Level 75 reached. System stability high.', rarity: 'Legendary', acquiredDate: '', requirement: 'Reach Level 75' },
  { id: 'l100', name: 'Grandmaster', image: '👑', description: 'Absolute dominance. Level 100.', rarity: 'Artifact', acquiredDate: '', requirement: 'Reach Level 100' },
  { id: 'f1', name: 'Focus Spark', image: '⚡', description: '1 Hour of intense focus.', rarity: 'Common', acquiredDate: '', requirement: '60m Focus' },
  { id: 'f10', name: 'Focus Flame', image: '🔥', description: '10 Hours of deep work logged.', rarity: 'Common', acquiredDate: '', requirement: '600m Focus' },
  { id: 'f50', name: 'Focus Inferno', image: '🌋', description: '50 Hours. You are unstoppable.', rarity: 'Rare', acquiredDate: '', requirement: '3000m Focus' },
  { id: 'f100', name: 'Zen Master', image: '🧘', description: '100 Hours of pure silence.', rarity: 'Legendary', acquiredDate: '', requirement: '6000m Focus' },

  // --- STREAK HEROES (10) ---
  { id: 's1', name: 'Ignition', image: '🕯️', description: '3 Day Streak.', rarity: 'Common', acquiredDate: '', requirement: '3 Day Streak' },
  { id: 's7', name: 'Weekly Warrior', image: '📅', description: 'A full week of discipline.', rarity: 'Common', acquiredDate: '', requirement: '7 Day Streak' },
  { id: 's14', name: 'Fortnight Fighter', image: '⚔️', description: 'Two weeks of constant growth.', rarity: 'Rare', acquiredDate: '', requirement: '14 Day Streak' },
  { id: 's30', name: 'Monthly Maven', image: '🌙', description: '30 Days. Habit solidified.', rarity: 'Rare', acquiredDate: '', requirement: '30 Day Streak' },
  { id: 's60', name: 'Bi-Monthly Boss', image: '🌀', description: '60 Days of excellence.', rarity: 'Rare', acquiredDate: '', requirement: '60 Day Streak' },
  { id: 's90', name: 'Quarterly Queen', image: '💎', description: '90 Days. Your mind is a diamond.', rarity: 'Legendary', acquiredDate: '', requirement: '90 Day Streak' },
  { id: 's100', name: 'Century Streak', image: '💯', description: '100 Days. Pure dedication.', rarity: 'Legendary', acquiredDate: '', requirement: '100 Day Streak' },
  { id: 's180', name: 'Half Year Solstice', image: '🌗', description: '180 Days. Part of the system.', rarity: 'Legendary', acquiredDate: '', requirement: '180 Day Streak' },
  { id: 's365', name: 'Orbital Master', image: '🌍', description: 'One Year. You have evolved.', rarity: 'Artifact', acquiredDate: '', requirement: '365 Day Streak' },
  { id: 's1000', name: 'Immortal Mind', image: '♾️', description: '1000 Days. You are a god.', rarity: 'Artifact', acquiredDate: '', requirement: '1000 Day Streak' },

  // --- WEALTH & MARKET (10) ---
  { id: 'w1', name: 'Credit Miner', image: '⛏️', description: 'Earned your first 1000 credits.', rarity: 'Common', acquiredDate: '', requirement: '1000 Credits' },
  { id: 'w5', name: 'Silver Stacker', image: '🥈', description: '5000 Credits accumulated.', rarity: 'Common', acquiredDate: '', requirement: '5000 Credits' },
  { id: 'w10', name: 'Gold Grinder', image: '🥇', description: '10000 Credits. Rich in knowledge.', rarity: 'Rare', acquiredDate: '', requirement: '10000 Credits' },
  { id: 'w25', name: 'Platinum Pilot', image: '🛸', description: '25000 Credits. High flyer.', rarity: 'Rare', acquiredDate: '', requirement: '25000 Credits' },
  { id: 'w50', name: 'Emerald Emperor', image: '💹', description: '50000 Credits. Wealthy mind.', rarity: 'Legendary', acquiredDate: '', requirement: '50000 Credits' },
  { id: 'w100', name: 'Ruby Royal', image: '🧧', description: '100000 Credits. Market influence.', rarity: 'Legendary', acquiredDate: '', requirement: '100000 Credits' },
  { id: 'w500', name: 'Credit Overlord', image: '🏦', description: '500000 Credits. Sector owner.', rarity: 'Artifact', acquiredDate: '', requirement: '500000 Credits' },
  { id: 'buy1', name: 'First Gear', image: '⚙️', description: 'Bought your first item.', rarity: 'Common', acquiredDate: '', requirement: 'Buy 1 Item' },
  { id: 'buy10', name: 'Collector', image: '📦', description: '10 Items owned.', rarity: 'Rare', acquiredDate: '', requirement: 'Buy 10 Items' },
  { id: 'buyAll', name: 'completionist', image: '🏁', description: 'Owned everything in market.', rarity: 'Legendary', acquiredDate: '', requirement: 'Own All Items' },

  // --- COMBAT & MINI-GAMES (10) ---
  { id: 'duel1', name: 'First Blood', image: '🩸', description: 'Won your first focus duel.', rarity: 'Common', acquiredDate: '', requirement: 'Win 1 Duel' },
  { id: 'duel10', name: 'Gladiator', image: '🏟️', description: '10 Duels won.', rarity: 'Rare', acquiredDate: '', requirement: 'Win 10 Duels' },
  { id: 'duel50', name: 'Arena King', image: '⚔️', description: '50 Duels. Feared in sector.', rarity: 'Legendary', acquiredDate: '', requirement: 'Win 50 Duels' },
  { id: 'hack1', name: 'Script Kiddie', image: '💻', description: 'First hack complete.', rarity: 'Common', acquiredDate: '', requirement: 'Play Breach once' },
  { id: 'hack10', name: 'Mainframe Breacher', image: '🗝️', description: '10 Hacks logged.', rarity: 'Rare', acquiredDate: '', requirement: '10 Breach Plays' },
  { id: 'hackHigh', name: 'Neo', image: '💊', description: 'Scored 5000 in Breach.', rarity: 'Legendary', acquiredDate: '', requirement: 'Breach Score 5k' },
  { id: 'hackGod', name: 'The Architect', image: '🕶️', description: 'Scored 20000 in Breach.', rarity: 'Artifact', acquiredDate: '', requirement: 'Breach Score 20k' },
  { id: 'duelPerfect', name: 'Untouchable', image: '👻', description: 'Win duel without losing HP.', rarity: 'Legendary', acquiredDate: '', requirement: 'Flawless Duel' },
  { id: 'duelLong', name: 'Marathon Dueler', image: '🏃', description: 'Duel lasted over 30 mins.', rarity: 'Rare', acquiredDate: '', requirement: '30m Duel' },
  { id: 'duelRapid', name: 'Speed Demon', image: '💨', description: 'Won duel in under 5 mins.', rarity: 'Rare', acquiredDate: '', requirement: 'Fast Win' },

  // --- SOCIAL & SYSTEM (10) ---
  { id: 'daily1', name: 'Supply Receiver', image: '🎁', description: 'Claimed first supply drop.', rarity: 'Common', acquiredDate: '', requirement: '1 Daily Claim' },
  { id: 'daily30', name: 'Loyal Operator', image: '🫡', description: '30 supply drops claimed.', rarity: 'Rare', acquiredDate: '', requirement: '30 Daily Claims' },
  { id: 'daily100', name: 'Veteran Operator', image: '🎖️', description: '100 supply drops claimed.', rarity: 'Legendary', acquiredDate: '', requirement: '100 Daily Claims' },
  { id: 'social1', name: 'Neural Networker', image: '🌐', description: 'Shared your first achievement.', rarity: 'Common', acquiredDate: '', requirement: 'Share 1 Badge' },
  // Fixed property name from 'icon' to 'image' to match Badge interface definition
  { id: 'social10', name: 'Influencer', image: '📣', description: 'Shared 10 achievements.', rarity: 'Rare', acquiredDate: '', requirement: 'Share 10 Badges' },
  { id: 'shrine1', name: 'Wisdom Seeker', image: '🕯️', description: 'Visited the wisdom shrine.', rarity: 'Common', acquiredDate: '', requirement: '1 Shrine Visit' },
  { id: 'shrine10', name: 'Enlightened', image: '✨', description: 'Received 10 divine guidances.', rarity: 'Rare', acquiredDate: '', requirement: '10 Shrine Visits' },
  { id: 'skinChange', name: 'Chameleon', image: '🦎', description: 'Changed your neural skin.', rarity: 'Common', acquiredDate: '', requirement: 'Change Skin' },
  { id: 'nameChange', name: 'Identity Shift', image: '🆔', description: 'Updated your rank/name.', rarity: 'Common', acquiredDate: '', requirement: 'Update Profile' },
  { id: 'secret1', name: 'Glitch in Matrix', image: '👾', description: 'Found a hidden system message.', rarity: 'Artifact', acquiredDate: '', requirement: 'Secret Action' },
];
