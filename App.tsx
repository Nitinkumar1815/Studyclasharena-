
import React, { useState, useEffect, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { BattleArena } from './components/BattleArena';
import { Leaderboard } from './components/Leaderboard';
import { Marketplace } from './components/Marketplace';
import { FocusDuel } from './components/FocusDuel';
import { QuantumMap } from './components/QuantumMap';
import { Profile } from './components/Profile';
import { MeditationArena } from './components/MeditationArena';
import { HealthTracker } from './components/HealthTracker';
import { TacticalSchedule } from './components/TacticalSchedule';
import { ChronoLock } from './components/ChronoLock';
import { WisdomShrine } from './components/WisdomShrine';
import { SoundscapeControl } from './components/SoundscapeControl';
import { SilentRival } from './components/SilentRival';
import { OnboardingFlow } from './components/OnboardingFlow';
import { StartupSplash } from './components/StartupSplash';
import { AuthScreens } from './components/AuthScreens';
import { AppView, UserStats, ScheduleItem, MarketItem, ActiveSession, ActiveDuel, AuthUser } from './types';
import { INITIAL_USER_STATS, MARKET_ITEMS, MOCK_BADGES, getRandomMarvelRank } from './constants';
import { LayoutDashboard, Sword, Sun, CheckCircle, Bell, AlertTriangle, X, User, HeartPulse, CalendarClock, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { GlassCard } from './components/ui/GlassCard';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { supabase } from './services/supabase';

export default function App() {
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSoundscapeOpen, setIsSoundscapeOpen] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);
  const [activeSkin, setActiveSkin] = useState<string>('m1');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [activeDuel, setActiveDuel] = useState<ActiveDuel | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [activeAlarmTask, setActiveAlarmTask] = useState<ScheduleItem | null>(null);
  const [toast, setToast] = useState<{message: string, subMessage?: string, type: 'success' | 'error'} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- REAL-TIME NEURAL UPLINK ---
  useEffect(() => {
    if (!authUser) return;

    console.log("Establishing Real-time Neural Link...");

    // 1. Profile Channel: Watch for changes in Level, XP, Credits
    const profileChannel = supabase
      .channel(`neural-stats-${authUser.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `id=eq.${authUser.id}` 
      }, (payload) => {
        const newData = payload.new;
        setIsSyncing(true);
        setUserStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            level: newData.level,
            xp: newData.xp,
            xpToNextLevel: newData.xp_to_next_level,
            credits: newData.credits,
            rank: newData.rank,
            energy: newData.energy,
            focusTimeMinutes: newData.focus_time_minutes,
            streak: newData.streak,
            lastDailyClaim: parseInt(newData.last_daily_claim || '0'),
            lastStudyDate: newData.last_study_date,
            mood: newData.mood
          };
        });
        setTimeout(() => setIsSyncing(false), 1000);
      })
      .subscribe();

    // 2. Schedule Channel: Real-time task modifications
    const scheduleChannel = supabase
      .channel(`tactical-timeline-${authUser.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'schedule', 
        filter: `user_id=eq.${authUser.id}` 
      }, async (payload) => {
        setIsSyncing(true);
        // We re-fetch the whole list to ensure correct sorting and mapping
        const updatedSchedule = await dataService.getSchedule(authUser.id);
        setSchedule(updatedSchedule);
        setTimeout(() => setIsSyncing(false), 1000);
      })
      .subscribe();

    // 3. Inventory Channel: Remote item acquisition
    const inventoryChannel = supabase
      .channel(`black-market-${authUser.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory',
        filter: `user_id=eq.${authUser.id}`
      }, async () => {
        const dbInventory = await dataService.getInventory(authUser.id);
        setInventory(dbInventory);
      })
      .subscribe();

    // 4. Badge Channel: Automatic achievement unlocks
    const badgeChannel = supabase
      .channel(`hall-of-fame-${authUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_badges',
        filter: `user_id=eq.${authUser.id}`
      }, (payload) => {
        const badgeId = payload.new.badge_id;
        const badge = MOCK_BADGES.find(b => b.id === badgeId);
        showToast("Achievement Unlocked!", badge?.name || "Neural Mastery", "success");
        
        setUserStats(prev => {
          if (!prev) return prev;
          if (prev.unlockedBadgeIds.includes(badgeId)) return prev;
          return { ...prev, unlockedBadgeIds: [...prev.unlockedBadgeIds, badgeId] };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(scheduleChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(badgeChannel);
    };
  }, [authUser]);

  useEffect(() => {
    const initAuth = async () => {
      const user = await authService.checkSession();
      setAuthUser(user);
      setAppInitialized(true);
    };
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || 'Operator',
          email: session.user.email || '',
          classGrade: session.user.user_metadata?.class_grade || 'Class 12',
          isVerified: !!session.user.email_confirmed_at,
          token: session.access_token
        });
      } else {
        setAuthUser(null);
        setUserStats(null);
        setInventory([]);
        setSchedule([]);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        let profile = await dataService.getUserProfile(authUser.id);
        
        if (!profile || profile.id === 'guest-operator') {
          setShowOnboarding(true);
        } else {
          const dbBadges = await dataService.getUnlockedBadges(authUser.id);
          setUserStats({ ...profile, unlockedBadgeIds: dbBadges });
          
          const dbInventory = await dataService.getInventory(authUser.id);
          setInventory(dbInventory); 
          
          const dbSchedule = await dataService.getSchedule(authUser.id);
          setSchedule(dbSchedule);
        }
      } catch (error) {
        console.error("Data Sync Fault:", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [authUser]);

  const handleOnboardingComplete = async (data: Record<string, string>) => {
    if (!authUser) return;
    const marvelRank = getRandomMarvelRank();
    const startStats: UserStats = {
       ...INITIAL_USER_STATS,
       id: authUser.id,
       rank: marvelRank,
       level: 1,
       xp: 0,
       xpToNextLevel: 1000,
       credits: 0, 
       streak: 0,
       focusTimeMinutes: 0,
       sector: data.role,
       goal: data.goal,
       classGrade: data.class,
       lastStudyDate: new Date().toISOString().split('T')[0]
    };
    await dataService.updateUserProfile(authUser.id, startStats);
    setUserStats(startStats);
    setShowOnboarding(false);
    showToast("Identity Forged", `Rank: ${marvelRank}`, "success");
  };

  const handleBattleComplete = async (xpEarned: number, durationMinutes: number) => {
    if (!userStats || !authUser) return;
    const today = new Date().toISOString().split('T')[0];
    const lastStudy = userStats.lastStudyDate || "";
    let newStreak = userStats.streak;
    
    if (lastStudy === "") {
      newStreak = 1;
    } else if (lastStudy !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (lastStudy === yesterdayStr) {
        newStreak += 1;
        showToast("STREAK INCREASED!", `Day ${newStreak}`, "success");
      } else {
        newStreak = 1;
        showToast("STREAK RESET", "System missed a day.", "error");
      }
    }

    let earnedCredits = (Math.floor(durationMinutes) * 10) + 100;
    let newXp = userStats.xp + xpEarned;
    let newLevel = userStats.level;
    let newXpToNext = userStats.xpToNextLevel;

    if (newXp >= newXpToNext) {
       newLevel += 1;
       newXp = newXp - newXpToNext; 
       newXpToNext = Math.floor(newXpToNext * 1.5); 
       showToast("LEVEL UP!", `Level ${newLevel} Achieved`, "success");
       earnedCredits += 200; 
    }

    const updates = { 
      level: newLevel, 
      xp: newXp, 
      xpToNextLevel: newXpToNext, 
      credits: userStats.credits + earnedCredits, 
      focusTimeMinutes: userStats.focusTimeMinutes + durationMinutes, 
      energy: Math.max(0, userStats.energy - 10), 
      streak: newStreak, 
      lastStudyDate: today 
    };

    setUserStats(prev => prev ? { ...prev, ...updates } : null);
    
    await dataService.updateUserProfile(authUser.id, updates);
    await dataService.saveStudySession({ 
      userId: authUser.id, 
      taskName: activeSession?.taskName || 'Battle', 
      durationMinutes, 
      xpEarned, 
      creditsEarned: earnedCredits 
    });

    if (updates.focusTimeMinutes >= 60 && !userStats.unlockedBadgeIds.includes('f1')) {
        await dataService.unlockBadge(authUser.id, 'f1');
    }
    
    setActiveSession(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const handlePurchase = async (item: MarketItem) => {
    if (!userStats || !authUser) return false;
    if (inventory.includes(item.id)) return false;
    if (userStats.credits >= item.cost) {
      const newCredits = userStats.credits - item.cost;
      setUserStats(prev => prev ? { ...prev, credits: newCredits } : null);
      setInventory(prev => [...prev, item.id]);
      
      await dataService.updateUserProfile(authUser.id, { credits: newCredits });
      await dataService.addToInventory(authUser.id, item.id, item.type);
      showToast(`Item Acquired`, item.name, 'success');
      return true; 
    } else {
      showToast("Insufficient Credits", "Requires more study cycles.", "error");
      return false; 
    }
  };

  const showToast = (msg: string, subMsg: string = "", type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, subMessage: subMsg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDailyClaim = async () => {
      if (!userStats || !authUser) return;
      const now = Date.now();
      const last = userStats.lastDailyClaim || 0;
      if (now - last > 86400000) {
          const rewardCredits = Math.floor(Math.random() * 300) + 200; 
          const rewardXP = 150;
          const newCredits = userStats.credits + rewardCredits;
          const newXP = userStats.xp + rewardXP;
          const updates = { credits: newCredits, xp: newXP, lastDailyClaim: now, energy: 100 };
          
          setUserStats(prev => prev ? { ...prev, ...updates } : null);
          await dataService.updateUserProfile(authUser.id, updates);
          showToast("Supply Drop Secured", `+${rewardCredits} CR, +${rewardXP} XP`, "success");
      } else {
          showToast("Supply Lock Active", "Try again in 24h.", "error");
      }
  };

  const handleLogout = async () => {
    await authService.logout();
    setAuthUser(null);
    setUserStats(null);
    setInventory([]);
    setSchedule([]);
  };

  const handleAddScheduleTask = async (task: ScheduleItem) => {
    if (!authUser) return;
    await dataService.addScheduleTask(authUser.id, task);
    showToast("Objective Uploaded", task.title, "success");
  };

  const handleRemoveScheduleTask = async (taskId: string) => {
    await dataService.deleteScheduleTask(taskId);
    showToast("Directive Purged", "Timeline updated.", "success");
  };

  const handleTaskUnlock = async (taskId: string) => {
    await dataService.updateScheduleTask(taskId, { completed: true });
    setActiveAlarmTask(null);
    showToast("Neural Lock Disengaged", "Objective secured.", "success");
  };

  if (showStartupSplash) {
    return <StartupSplash onFinish={() => setShowStartupSplash(false)} />;
  }

  if (!appInitialized || (authUser && dataLoading)) {
    return (
      <div className="fixed inset-0 bg-cyber-black flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-4">
           <Loader2 className="w-16 h-16 text-cyber-neonBlue animate-spin" />
           <div className="absolute inset-0 border-2 border-dashed border-cyber-neonPurple rounded-full animate-spin-slow opacity-20" />
        </div>
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Establishing Secure Neural Link...</p>
      </div>
    );
  }

  if (!authUser) {
    return <AuthScreens onAuthSuccess={setAuthUser} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (!userStats) return null;

  const navItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Home' },
    { id: AppView.BATTLE, icon: Sword, label: 'Arena', highlight: true },
    { id: AppView.HEALTH, icon: HeartPulse, label: 'Bio' },
    { id: AppView.SCHEDULE, icon: CalendarClock, label: 'Plan' },
    { id: AppView.WISDOM, icon: Sun, label: 'Gyan', highlight: true },
  ];

  return (
    <div className="min-h-screen font-sans bg-cyber-black text-white selection:bg-cyber-neonBlue selection:text-black">
      {/* GLOBAL TOAST & SYNC SYSTEM */}
      <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 items-end">
        {isSyncing && (
          <div className="bg-cyber-neonBlue/10 border border-cyber-neonBlue/40 px-3 py-1 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
             <RefreshCw size={10} className="text-cyber-neonBlue animate-spin" />
             <span className="text-[9px] font-mono text-cyber-neonBlue uppercase tracking-widest">Neural Syncing...</span>
          </div>
        )}
        {toast && (
          <GlassCard className={`min-w-[300px] border-l-4 p-4 flex items-start gap-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in slide-in-from-right fade-in duration-300 ${toast.type === 'success' ? 'border-l-green-500 bg-green-950/20' : 'border-l-red-500 bg-red-950/20'}`}>
              <div className={`mt-0.5 p-1 rounded-full ${toast.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}</div>
              <div className="flex-1">
                <h4 className={`font-bold text-sm ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{toast.message}</h4>
                {toast.subMessage && <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono">{toast.subMessage}</p>}
              </div>
              <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
          </GlassCard>
        )}
      </div>

      {activeAlarmTask && activeAlarmTask.strictMode && <ChronoLock task={activeAlarmTask} onUnlock={() => handleTaskUnlock(activeAlarmTask.id)} />}

      <SoundscapeControl isOpen={isSoundscapeOpen} onClose={() => setIsSoundscapeOpen(false)} inventory={inventory} />

      <main className="relative z-10 max-w-4xl mx-auto min-h-screen flex flex-col">
        {currentView !== AppView.WISDOM && (
          <header className="p-4 flex justify-between items-center glass-panel m-4 rounded-xl border-white/5 sticky top-4 z-40">
             <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setCurrentView(AppView.DASHBOARD)}>
               <div className="w-8 h-8 bg-gradient-to-tr from-cyber-neonBlue to-cyber-neonPurple rounded-lg flex items-center justify-center font-bold text-black shadow-lg">SC</div>
               <h1 className="font-bold text-lg tracking-wider hidden sm:block group-hover:text-cyber-neonBlue transition-colors uppercase italic">StudyClash<span className="text-cyber-neonBlue">Arena</span></h1>
             </div>
             <div className="flex items-center gap-4">
               <button onClick={() => setCurrentView(AppView.MARKET)} className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-yellow-500/30">
                  <span className="text-xs font-mono text-yellow-500 font-bold">{userStats.credits} CR</span>
               </button>
               <button onClick={() => setCurrentView(AppView.PROFILE)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all"><User size={20} className="text-gray-300" /></button>
               <button onClick={handleLogout} className="p-2 bg-red-900/10 border border-red-500/30 rounded-full text-red-500 hover:bg-red-500/20 transition-all"><LogOut size={20} /></button>
             </div>
          </header>
        )}

        <div className={`flex-1 ${currentView === AppView.WISDOM ? '' : 'p-4 md:p-6'} pb-32`}>
          {currentView === AppView.DASHBOARD && (
            <Dashboard 
              stats={userStats} 
              authUser={authUser}
              activeSession={activeSession}
              activeDuel={activeDuel}
              onStartBattle={() => setCurrentView(AppView.BATTLE)} 
              onNavigate={(view) => setCurrentView(view as AppView)}
              onOpenSoundscape={() => setIsSoundscapeOpen(true)}
              onDailyClaim={handleDailyClaim}
            />
          )}
          {currentView === AppView.BATTLE && (
            <BattleArena 
              inventory={inventory}
              activeSession={activeSession}
              activeSkin={activeSkin}
              onSkinChange={setActiveSkin}
              onSessionStart={(session) => setActiveSession(session)}
              onSessionEnd={() => setActiveSession(null)}
              onComplete={handleBattleComplete} 
              onExit={() => setCurrentView(AppView.DASHBOARD)} 
              onConsumeItem={async (id) => { 
                await dataService.consumeItem(authUser.id, id); 
              }}
            />
          )}
          {currentView === AppView.DUEL && (
            <FocusDuel 
              activeDuel={activeDuel} 
              onDuelUpdate={(duel) => setActiveDuel(duel)} 
              onDuelEnd={() => setActiveDuel(null)} 
              onBack={() => setCurrentView(AppView.DASHBOARD)} 
            />
          )}
          {currentView === AppView.MARKET && <Marketplace credits={userStats.credits} ownedItemIds={inventory} onPurchase={handlePurchase} />}
          {currentView === AppView.LEADERBOARD && <Leaderboard />}
          {currentView === AppView.PROFILE && <Profile stats={userStats} />}
          {currentView === AppView.HEALTH && <HealthTracker stats={userStats} onNavigateToExercises={() => setCurrentView(AppView.MEDITATION)} />}
          {currentView === AppView.SCHEDULE && <TacticalSchedule schedule={schedule} onAdd={handleAddScheduleTask} onRemove={handleRemoveScheduleTask} />}
          {currentView === AppView.WISDOM && <WisdomShrine />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full p-4 z-50">
        <div className="max-w-md mx-auto glass-panel rounded-2xl flex justify-around items-center p-2 border-t border-white/20 bg-cyber-black/90 backdrop-blur-xl">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${currentView === item.id ? item.highlight ? 'text-yellow-400 bg-yellow-500/10' : 'text-cyber-neonBlue bg-cyber-neonBlue/10' : 'text-gray-500'}`}>
              <item.icon size={item.highlight ? 24 : 20} /><span className="text-[9px] uppercase font-bold mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
