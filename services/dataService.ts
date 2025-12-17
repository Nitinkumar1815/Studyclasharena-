
import { supabase } from './supabase';
import { UserStats, ScheduleItem, Badge, StudySession } from '../types';
import { INITIAL_USER_STATS } from '../constants';

export const dataService = {
  async getUserProfile(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) {
      // Return guest template for non-authenticated or first-time simulated users
      return INITIAL_USER_STATS;
    }

    return {
      id: data.id,
      level: data.level || INITIAL_USER_STATS.level,
      xp: data.xp || INITIAL_USER_STATS.xp,
      xpToNextLevel: data.xp_to_next_level || INITIAL_USER_STATS.xpToNextLevel,
      credits: data.credits ?? INITIAL_USER_STATS.credits,
      streak: data.streak || INITIAL_USER_STATS.streak,
      rank: data.rank || INITIAL_USER_STATS.rank,
      energy: data.energy ?? INITIAL_USER_STATS.energy,
      focusTimeMinutes: data.focus_time_minutes || INITIAL_USER_STATS.focusTimeMinutes,
      mood: data.mood || INITIAL_USER_STATS.mood,
      lastDailyClaim: parseInt(data.last_daily_claim || '0'),
      avatar: data.avatar_url || INITIAL_USER_STATS.avatar,
      unlockedBadgeIds: [] 
    };
  },

  async updateUserProfile(userId: string, updates: Partial<UserStats>) {
    if (userId === 'guest-operator') return;
    const dbUpdates: any = {};
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.xpToNextLevel !== undefined) dbUpdates.xp_to_next_level = updates.xpToNextLevel;
    if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.energy !== undefined) dbUpdates.energy = updates.energy;
    if (updates.focusTimeMinutes !== undefined) dbUpdates.focus_time_minutes = updates.focusTimeMinutes;
    if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
    if (updates.lastDailyClaim !== undefined) dbUpdates.last_daily_claim = updates.lastDailyClaim.toString();
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
    if (updates.rank !== undefined) dbUpdates.rank = updates.rank;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    if (error) console.error('Error updating profile:', error);
  },

  async getInventory(userId: string): Promise<string[]> {
    if (userId === 'guest-operator') return [];
    const { data, error } = await supabase
      .from('inventory')
      .select('item_id')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
    return data.map((i: any) => i.item_id);
  },

  async addToInventory(userId: string, itemId: string, itemType: string) {
    if (userId === 'guest-operator') return;
    const { error } = await supabase.from('inventory').insert({
      user_id: userId,
      item_id: itemId,
      item_type: itemType
    });
    if (error) console.error('Error adding to inventory:', error);
  },

  async consumeItem(userId: string, itemId: string) {
    if (userId === 'guest-operator') return;
    const { data, error } = await supabase
        .from('inventory')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .limit(1)
        .maybeSingle();
    
    if (error || !data) return;

    const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', data.id);
        
    if (deleteError) console.error("Error deleting item", deleteError);
  },

  async getSchedule(userId: string): Promise<ScheduleItem[]> {
    if (userId === 'guest-operator') return [];
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }
    return data.map((t: any) => ({
      id: t.id,
      title: t.title,
      startTime: t.start_time,
      type: t.type,
      completed: t.completed,
      strictMode: t.strict_mode
    }));
  },

  async addScheduleTask(userId: string, task: ScheduleItem) {
    if (userId === 'guest-operator') return task;
    const { data, error } = await supabase.from('schedule').insert({
      user_id: userId,
      title: task.title,
      start_time: task.startTime,
      type: task.type,
      completed: task.completed,
      strict_mode: task.strictMode
    }).select().single();

    if (error) {
      console.error('Error adding task:', error);
      return null;
    }
    return data;
  },

  async updateScheduleTask(taskId: string, updates: Partial<ScheduleItem>) {
     const dbUpdates: any = {};
     if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
     
     const { error } = await supabase.from('schedule').update(dbUpdates).eq('id', taskId);
     if (error) console.error('Error updating task:', error);
  },

  async deleteScheduleTask(taskId: string) {
    const { error } = await supabase.from('schedule').delete().eq('id', taskId);
    if (error) console.error('Error deleting task:', error);
  },

  async getUnlockedBadges(userId: string): Promise<string[]> {
    if (userId === 'guest-operator') return INITIAL_USER_STATS.unlockedBadgeIds;
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
    return data.map((b: any) => b.badge_id);
  },

  async unlockBadge(userId: string, badgeId: string) {
    if (userId === 'guest-operator') return;
    const { error } = await supabase.from('user_badges').insert({
      user_id: userId,
      badge_id: badgeId
    });
    if (error && error.code !== '23505') {
       console.error('Error unlocking badge:', error);
    }
  },

  async getLeaderboard(): Promise<any[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, rank, level, xp, avatar_url')
        .order('xp', { ascending: false })
        .limit(10);
    
    if (error) {
        console.error("Error fetching leaderboard", error);
        return [];
    }
    
    return data.map((p: any) => ({
        id: p.id,
        name: p.rank || 'Anonymous', 
        level: p.level || 1,
        xp: p.xp || 0,
        avatar: p.avatar_url
    }));
  },

  async saveStudySession(session: Omit<StudySession, 'id' | 'timestamp'>) {
    if (session.userId === 'guest-operator') return;
    const { error } = await supabase.from('study_sessions').insert({
      user_id: session.userId,
      task_name: session.taskName,
      duration_minutes: session.durationMinutes,
      xp_earned: session.xpEarned,
      credits_earned: session.creditsEarned
    });
    if (error) console.error('Error saving study session:', error);
  },

  async getStudySessions(userId: string): Promise<StudySession[]> {
    if (userId === 'guest-operator') return [];
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching study sessions:', error);
      return [];
    }

    return data.map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      taskName: s.task_name,
      durationMinutes: s.duration_minutes,
      xpEarned: s.xp_earned,
      credits_earned: s.credits_earned,
      timestamp: s.created_at
    }));
  }
};
