
export interface UserStats {
  id: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  energy: number; // 0-100
  focusTimeMinutes: number;
  rank: string;
  credits: number; // Currency for marketplace
  mood: 'focus' | 'fatigue' | 'flow';
  avatar: string; // URL to avatar image
  unlockedBadgeIds: string[];
  lastDailyClaim: number; // Timestamp of last daily reward claim
  lastStudyDate?: string; // YYYY-MM-DD format
  sector?: string;
  goal?: string;
  classGrade?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  classGrade: string;
  isVerified: boolean;
  token: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  creditsReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Boss';
  status: 'active' | 'completed' | 'claimed' | 'locked';
  type: 'daily' | 'story' | 'challenge';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface Badge {
  id: string;
  name: string;
  image: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Legendary' | 'Artifact';
  acquiredDate: string;
  requirement: string;
}

export interface MarketItem {
  id: string;
  name: string;
  type: 'skin' | 'music' | 'powerup';
  cost: number;
  owned: boolean;
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string; // "14:00"
  type: 'STUDY' | 'WORKOUT' | 'REST' | 'SYSTEM';
  completed: boolean;
  strictMode: boolean; // Triggers ChronoLock
}

export interface ActiveSession {
  taskId: string;
  startTime: number; // Epoch millis
  durationMinutes: number;
  taskName: string;
  activePowerups: string[];
  completed?: boolean;
}

export interface StudySession {
  id: string;
  userId: string;
  taskName: string;
  durationMinutes: number;
  xpEarned: number;
  creditsEarned: number;
  timestamp: string;
}

export interface ActiveDuel {
  id: string;
  rivalName: string;
  rivalAvatar: string;
  myHP: number;
  rivalHP: number;
  sessionTime: number;
  logs: string[];
  lastSaveTime: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  BATTLE = 'BATTLE',
  MAP = 'MAP',
  MARKET = 'MARKET',
  LEADERBOARD = 'LEADERBOARD',
  PROFILE = 'PROFILE',
  MEDITATION = 'MEDITATION',
  HEALTH = 'HEALTH',
  SCHEDULE = 'SCHEDULE',
  DUEL = 'DUEL',
  WISDOM = 'WISDOM'
}

export type ThemeMode = 'cyber' | 'zen';
