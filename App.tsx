
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
import { AuthScreens } from './components/AuthScreens';
import { AppView, UserStats, ScheduleItem, MarketItem, ActiveSession, ActiveDuel, AuthUser } from './types';
import { INITIAL_USER_STATS, MARKET_ITEMS, MOCK_BADGES } from './constants';
import { LayoutDashboard, Sword, Sun, CheckCircle, Bell, AlertTriangle, X, User, HeartPulse, CalendarClock, LogOut, Loader2 } from 'lucide-react';
import { GlassCard } from './components/ui/GlassCard';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { supabase } from './services/supabase';

export default function App() {
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
  
  const sirenAudioRef = useRef<HTMLAudioElement | null>(null);

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
        
        // Ensure strictly fresh profile for real users
        if (!profile || profile.id === 'guest-operator') {
          const startStats: UserStats = {
             ...INITIAL_USER_STATS,
             id: authUser.id,
             rank: 'Novice Recruit',
             level: 1,
             xp: 0,
             xpToNextLevel: 1000,
             credits: 0, // Zero starting credits for real users
             streak: 0,
             focusTimeMinutes: 0
          };
          await dataService.updateUserProfile(authUser.id, startStats);
          profile = startStats;
          setShowOnboarding(true);
        }
        
        const dbBadges = await dataService.getUnlockedBadges(authUser.id);
        setUserStats({ ...profile, unlockedBadgeIds: dbBadges });
        
        const dbInventory = await dataService.getInventory(authUser.id);
        setInventory(dbInventory); // Use DB inventory, no defaults
        
        const dbSchedule = await dataService.getSchedule(authUser.id);
        setSchedule(dbSchedule);
      } catch (error) {
        console.error("Data sync failed:", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [authUser]);

  const handleTaskUnlock = async (taskId: string) => {
    setSchedule(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    if (sirenAudioRef.current) { sirenAudioRef.current.pause(); sirenAudioRef.current.currentTime = 0; }
    setActiveAlarmTask(null);
    if (authUser) {
      await dataService.updateScheduleTask(taskId, { completed: true });
    }
  };

  const handleAddScheduleTask = async (task: ScheduleItem) => {
    if (!authUser) return;
    const newTask = await dataService.addScheduleTask(authUser.id, task);
    if (newTask) {
      setSchedule(prev => [...prev, newTask].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
  };

  const handleRemoveScheduleTask = async (id: string) => {
    if (!authUser) return;
    setSchedule(prev => prev.filter(t => t.id !== id));
    await dataService.deleteScheduleTask(id);
  };

  const handleLogout = async () => {
    await authService.logout();
    setAuthUser(null);
    setUserStats(null);
    setCurrentView(AppView.DASHBOARD);
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
          const reward = 300;
          const newCredits = userStats.credits + reward;
          setUserStats({ ...userStats, credits: newCredits, lastDailyClaim: now });
          await dataService.updateUserProfile(authUser.id, { credits: newCredits, lastDailyClaim: now });
          showToast("Supply Drop Claimed", `+${reward} Credits added.`, "success");
          
          // Check for "Supporter" achievement (a8)
          // For brevity, we'll assume badges are checked on server or in background periodically, 
          // but we'll add one check here for demonstration.
      } else {
          showToast("Cooldown Active", "Supply Drop available tomorrow.", "error");
      }
  };

  const handleBattleComplete = async (xpEarned: number, durationMinutes: number) => {
    if (!userStats || !authUser) return;
    let earnedCredits = (Math.floor(durationMinutes) * 10) + 100;
    let newXp = userStats.xp + xpEarned;
    let newLevel = userStats.level;
    let newXpToNext = userStats.xpToNextLevel;

    if (newXp >= newXpToNext) {
       newLevel += 1;
       newXp = newXp - newXpToNext; 
       newXpToNext = Math.floor(newXpToNext * 1.5); 
       showToast("LEVEL UP!", `Welcome to Level ${newLevel}`, "success");
       earnedCredits += 200; 
    }

    const updates = { 
      level: newLevel, 
      xp: newXp, 
      xpToNextLevel: newXpToNext, 
      credits: userStats.credits + earnedCredits, 
      focusTimeMinutes: userStats.focusTimeMinutes + durationMinutes,
      energy: Math.max(0, userStats.energy - 10)
    };

    setUserStats({ ...userStats, ...updates });
    await dataService.updateUserProfile(authUser.id, updates);
    await dataService.saveStudySession({ userId: authUser.id, taskName: activeSession?.taskName || 'Battle', durationMinutes, xpEarned, creditsEarned: earnedCredits });
    
    // Check basic badges
    if (updates.focusTimeMinutes >= 60 && !userStats.unlockedBadgeIds.includes('f1')) {
        await dataService.unlockBadge(authUser.id, 'f1');
        setUserStats(prev => prev ? { ...prev, unlockedBadgeIds: [...prev.unlockedBadgeIds, 'f1'] } : null);
        showToast("Achievement Unlocked!", "Focus Spark", "success");
    }

    setActiveSession(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const handlePurchase = async (item: MarketItem) => {
    if (!userStats || !authUser) return false;
    if (inventory.includes(item.id)) return false;
    if (userStats.credits >= item.cost) {
      const newCredits = userStats.credits - item.cost;
      setUserStats({ ...userStats, credits: newCredits });
      setInventory(prev => [...prev, item.id]);
      await dataService.updateUserProfile(authUser.id, { credits: newCredits });
      await dataService.addToInventory(authUser.id, item.id, item.type);
      showToast(`Acquired: ${item.name}`, `Added to Inventory`, 'success');
      return true; 
    } else {
      showToast("Insufficient Credits", "Study more to mine credits.", "error");
      return false; 
    }
  };

  if (!appInitialized || (authUser && dataLoading)) {
    return (
      <div className="fixed inset-0 bg-cyber-black flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyber-neonBlue animate-spin mb-4" />
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Establishing Secure Link...</p>
      </div>
    );
  }

  if (!authUser) {
    return <AuthScreens onAuthSuccess={setAuthUser} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
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
      {toast && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right fade-in duration-300">
           <GlassCard className={`min-w-[300px] border-l-4 p-4 flex items-start gap-3 shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'border-l-green-500 bg-green-900/20' : 'border-l-red-500 bg-red-900/20'}`}>
              <div className={`mt-0.5 p-1 rounded-full ${toast.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}</div>
              <div className="flex-1"><h4 className={`font-bold text-sm ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{toast.message}</h4>{toast.subMessage && <p className="text-xs text-gray-400 mt-1">{toast.subMessage}</p>}</div>
              <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
           </GlassCard>
        </div>
      )}

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
              onConsumeItem={async (id) => { setInventory(prev => prev.filter(i => i !== id)); await dataService.consumeItem(authUser.id, id); }}
            />
          )}
          {currentView === AppView.DUEL && <FocusDuel activeDuel={activeDuel} onDuelUpdate={(duel) => setActiveDuel(duel)} onDuelEnd={() => setActiveDuel(null)} onBack={() => setCurrentView(AppView.DASHBOARD)} />}
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
