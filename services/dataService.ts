
import { supabase } from './supabase';
import { UserStats, ScheduleItem, Badge, StudySession } from '../types';
import { INITIAL_USER_STATS } from '../constants';

export const dataService = {
  async getUserProfile(userId: string): Promise<UserStats | null> {
    if (userId === 'guest-operator') return INITIAL_USER_STATS;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) return null; 

      return {
        id: data.id,
        level: data.level || 1,
        xp: data.xp || 0,
        xpToNextLevel: data.xp_to_next_level || 1000,
        credits: data.credits ?? 0,
        streak: data.streak || 0,
        rank: data.rank || 'Sector Hero', 
        energy: data.energy ?? 100,
        focusTimeMinutes: data.focus_time_minutes || 0,
        mood: data.mood || 'focus',
        lastDailyClaim: data.last_daily_claim ? parseInt(data.last_daily_claim) : 0,
        avatar: INITIAL_USER_STATS.avatar,
        unlockedBadgeIds: [],
        sector: data.sector,
        goal: data.goal,
        classGrade: data.class_grade,
        lastStudyDate: data.last_study_date
      };
    } catch (err) {
      console.error('Fatal profile fetch error:', err);
      return null;
    }
  },

  async updateUserProfile(userId: string, updates: Partial<UserStats>, identity?: { name: string, email: string }) {
    if (userId === 'guest-operator') return;
    
    // Construct database updates with snake_case mapping
    const dbUpdates: any = { id: userId };
    
    // Core identity if available (fixes new user creation errors)
    if (identity?.name) dbUpdates.full_name = identity.name;
    if (identity?.email) dbUpdates.email = identity.email;

    // Stat mappings
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.xpToNextLevel !== undefined) dbUpdates.xp_to_next_level = updates.xpToNextLevel;
    if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.energy !== undefined) dbUpdates.energy = updates.energy;
    if (updates.focusTimeMinutes !== undefined) dbUpdates.focus_time_minutes = updates.focusTimeMinutes;
    if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
    if (updates.lastDailyClaim !== undefined) dbUpdates.last_daily_claim = updates.lastDailyClaim.toString();
    if (updates.rank !== undefined) dbUpdates.rank = updates.rank;
    if (updates.sector !== undefined) dbUpdates.sector = updates.sector;
    if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
    if (updates.classGrade !== undefined) dbUpdates.class_grade = updates.classGrade;
    if (updates.lastStudyDate !== undefined) dbUpdates.last_study_date = updates.lastStudyDate;

    // Use upsert with explicit onConflict to handle first-time creation reliably
    const { error } = await supabase
      .from('profiles')
      .upsert(dbUpdates, { onConflict: 'id' });

    if (error) {
      console.error('Error saving user profile to DB:', error.message);
      throw new Error(`Sync Error: ${error.message}`);
    }
  },

  async getInventory(userId: string): Promise<string[]> {
    if (userId === 'guest-operator') return [];
    const { data, error } = await supabase
      .from('inventory')
      .select('item_id')
      .eq('user_id', userId);
    if (error) return [];
    return data.map((i: any) => i.item_id);
  },

  async addToInventory(userId: string, itemId: string, itemType: string) {
    if (userId === 'guest-operator') return;
    await supabase.from('inventory').insert({ user_id: userId, item_id: itemId, item_type: itemType });
  },

  async getSchedule(userId: string): Promise<ScheduleItem[]> {
    if (userId === 'guest-operator') return [];
    const { data, error } = await supabase.from('schedule').select('*').eq('user_id', userId);
    if (error) return [];
    return data.map((t: any) => ({ 
      id: t.id, 
      title: t.title, 
      startTime: t.start_time, 
      type: t.type, 
      completed: t.completed, 
      strictMode: t.strict_mode 
    }));
  },

  async addScheduleTask(userId: string, task: ScheduleItem): Promise<ScheduleItem | null> {
    if (userId === 'guest-operator') return task;
    const { data, error } = await supabase.from('schedule').insert({
      user_id: userId, 
      title: task.title, 
      start_time: task.startTime, 
      type: task.type, 
      completed: task.completed, 
      strict_mode: task.strictMode
    }).select().single();

    if (error || !data) {
      console.error('Error adding schedule task:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      startTime: data.start_time,
      type: data.type,
      completed: data.completed,
      strictMode: data.strict_mode
    };
  },

  async updateScheduleTask(taskId: string, updates: Partial<ScheduleItem>) {
     const dbUpdates: any = {};
     if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
     await supabase.from('schedule').update(dbUpdates).eq('id', taskId);
  },

  async deleteScheduleTask(taskId: string) {
    await supabase.from('schedule').delete().eq('id', taskId);
  },

  async getLeaderboard(): Promise<any[]> {
    const { data, error } = await supabase.from('profiles').select('id, rank, level, xp').order('xp', { ascending: false }).limit(10);
    if (error) return [];
    return data.map((p: any) => ({ id: p.id, name: p.rank || 'Sector Hero', level: p.level || 1, xp: p.xp || 0 }));
  },

  async getStudySessions(userId: string): Promise<StudySession[]> {
    if (userId === 'guest-operator') return [];
    const { data, error } = await supabase.from('study_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return [];
    return data.map((s: any) => ({ id: s.id, userId: s.user_id, taskName: s.task_name, durationMinutes: s.duration_minutes, xpEarned: s.xp_earned, credits_earned: s.credits_earned, timestamp: s.created_at }));
  }
};
