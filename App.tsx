
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { BattleArena } from './components/BattleArena';
import { Leaderboard } from './components/Leaderboard';
import { Marketplace } from './components/Marketplace';
import { FocusDuel } from './components/FocusDuel';
import { Profile } from './components/Profile';
import { HealthTracker } from './components/HealthTracker';
import { TacticalSchedule } from './components/TacticalSchedule';
import { WisdomShrine } from './components/WisdomShrine';
import { SoundscapeControl } from './components/SoundscapeControl';
import { StartupSplash } from './components/StartupSplash';
import { AuthScreens } from './components/AuthScreens';
import { ChronoLock } from './components/ChronoLock';
import { AppView, UserStats, ScheduleItem, ActiveSession, AuthUser, ActiveDuel } from './types';
import { INITIAL_USER_STATS } from './constants';
import { LayoutDashboard, Sword, Sun, User as UserIcon, CalendarClock, LogOut, Loader2, Zap } from 'lucide-react';
import { dataService } from './services/dataService';
import { authService } from './services/authService';

export default function App() {
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const [appInitialized, setAppInitialized] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSoundscapeOpen, setIsSoundscapeOpen] = useState(false);
  const [inventory, setInventory] = useState<string[]>(['m1']);
  const [activeSkin, setActiveSkin] = useState<string>('m1');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [activeDuel, setActiveDuel] = useState<ActiveDuel | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [activeLockTask, setActiveLockTask] = useState<ScheduleItem | null>(null);
  const [toast, setToast] = useState<{message: string, subMessage?: string, type: 'success' | 'error'} | null>(null);

  const showToast = useCallback((msg: string, subMsg: string = "", type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, subMessage: subMsg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadUserData = useCallback(async (user: AuthUser) => {
    try {
      const [profile, inv, sched] = await Promise.all([
        dataService.getUserProfile(user.id),
        dataService.getInventory(user.id),
        dataService.getSchedule(user.id)
      ]);
      setUserStats(profile || { ...INITIAL_USER_STATS, id: user.id });
      setInventory(inv.length ? inv : ['m1']);
      setSchedule(sched);
      setAppInitialized(true);
    } catch (err) {
      console.error("Data fetch error:", err);
      showToast("Sync Error", "Neural link unstable", "error");
    }
  }, [showToast]);

  // Initial Auth Check
  useEffect(() => {
    const init = async () => {
      try {
        const user = await authService.checkSession();
        if (user) {
          setAuthUser(user);
          await loadUserData(user);
        } else {
          setAppInitialized(true);
        }
      } catch (err) {
        console.error("Initialization fault:", err);
        setAppInitialized(true);
      }
    };
    init();
  }, [loadUserData]);

  // Background Duel Sync
  useEffect(() => {
    let interval: any;
    if (activeDuel && activeDuel.myHP > 0 && activeDuel.rivalHP > 0) {
      interval = setInterval(() => {
        setActiveDuel(prev => {
          if (!prev) return null;
          const rivalDmg = Math.random() > 0.45 ? 1.5 : 0;
          const userDmg = Math.random() > 0.88 ? 1.2 : 0;
          return {
            ...prev,
            myHP: Math.max(0, prev.myHP - userDmg),
            rivalHP: Math.max(0, prev.rivalHP - rivalDmg),
            sessionTime: prev.sessionTime + 1
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeDuel?.id]);

  // High-Sensitivity Background Monitor (Strict Protocol Trigger)
  useEffect(() => {
    const monitor = setInterval(() => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${h}:${m}`;
      
      const dueStrictTask = schedule.find(task => 
        task.strictMode && 
        task.startTime === currentTime && 
        !task.completed &&
        (!activeLockTask || activeLockTask.id !== task.id)
      );

      if (dueStrictTask) {
        setActiveLockTask(dueStrictTask);
      }
    }, 5000);

    return () => clearInterval(monitor);
  }, [schedule, activeLockTask]);

  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    loadUserData(user);
  };

  const handlePurchase = async (item: any) => {
    if (!userStats || !authUser) return false;
    if (userStats.credits < item.cost) {
      showToast("Low Balance", "Earn credits in Arena", "error");
      return false;
    }
    const newCredits = userStats.credits - item.cost;
    setUserStats({ ...userStats, credits: newCredits });
    setInventory([...inventory, item.id]);
    await dataService.addToInventory(authUser.id, item.id, item.type);
    await dataService.updateUserProfile(authUser.id, { credits: newCredits });
    showToast("Gear Unlocked", item.name, "success");
    return true;
  };

  const handleBattleComplete = async (xp: number, mins: number) => {
    if (!userStats || !authUser) return;
    const credits = mins * 12;
    const updates = {
      xp: userStats.xp + xp,
      credits: userStats.credits + credits,
      focusTimeMinutes: userStats.focusTimeMinutes + mins
    };
    setUserStats({ ...userStats, ...updates });
    await dataService.updateUserProfile(authUser.id, updates);
    setActiveSession(null);
    setCurrentView(AppView.DASHBOARD);
    showToast("Victory!", `+${xp} XP | +${credits} CR`, "success");
  };

  const handleAddSchedule = async (task: ScheduleItem) => {
    if (!authUser) return;
    
    // Optimistic Update
    setSchedule(prev => [...prev, task]);
    
    try {
      const addedTask = await dataService.addScheduleTask(authUser.id, task);
      if (addedTask) {
        setSchedule(prev => prev.map(t => t.id === task.id ? addedTask : t));
        showToast("Timeline Sync", "Directive deployed", "success");
      }
    } catch (e) {
      setSchedule(prev => prev.filter(t => t.id !== task.id));
      showToast("Sync Error", "DB link failed", "error");
    }
  };

  const handleRemoveSchedule = async (id: string) => {
    setSchedule(prev => prev.filter(t => t.id !== id));
    await dataService.deleteScheduleTask(id);
    showToast("Protocol Cleared", "Directive removed", "error");
  };

  const handleUnlockStrict = async () => {
    if (activeLockTask) {
      const updatedSchedule = schedule.map(t => 
        t.id === activeLockTask.id ? { ...t, completed: true } : t
      );
      setSchedule(updatedSchedule);
      await dataService.updateScheduleTask(activeLockTask.id, { completed: true });
      setActiveLockTask(null);
      showToast("Protocol Fulfilled", "Focus maintained", "success");
    }
  };

  if (showStartupSplash) return <StartupSplash onFinish={() => setShowStartupSplash(false)} />;
  if (!appInitialized) return <div className="fixed inset-0 bg-black flex items-center justify-center"><Loader2 className="animate-spin text-ios-blue" /></div>;
  if (!authUser) return <AuthScreens onAuthSuccess={handleAuthSuccess} />;
  if (!userStats) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden pb-32">
      {activeLockTask && (
        <ChronoLock task={activeLockTask} onUnlock={handleUnlockStrict} />
      )}

      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-spring">
          <div className="glass-ios rounded-[2rem] p-4 flex items-center gap-4 shadow-2xl border-white/10">
            <div className={`w-3 h-3 rounded-full ${toast.type === 'success' ? 'bg-ios-green' : 'bg-ios-red'} shadow-lg`} />
            <div>
              <p className="text-sm font-bold">{toast.message}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{toast.subMessage}</p>
            </div>
          </div>
        </div>
      )}

      {activeDuel && currentView !== AppView.DUEL && (
        <div 
          onClick={() => setCurrentView(AppView.DUEL)}
          className="fixed top-24 right-4 z-50 glass-ios rounded-3xl p-3 flex items-center gap-3 border-ios-red/30 animate-pulse ios-tap shadow-2xl"
        >
          <div className="w-8 h-8 rounded-full bg-ios-red/20 flex items-center justify-center text-ios-red">
            <Zap size={16} fill="currentColor" />
          </div>
          <div className="pr-2">
            <p className="text-[9px] font-black uppercase text-ios-red tracking-widest leading-none">In Battle</p>
            <p className="text-xs font-bold text-white mt-1">{activeDuel.myHP}% HP</p>
          </div>
        </div>
      )}

      <SoundscapeControl isOpen={isSoundscapeOpen} onClose={() => setIsSoundscapeOpen(false)} inventory={inventory} />

      <main className="max-w-lg mx-auto p-4">
        <header className="flex justify-between items-center py-6 mb-2">
          <div className="flex items-center gap-3 ios-tap" onClick={() => setCurrentView(AppView.DASHBOARD)}>
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl"><Sword size={22} /></div>
            <h1 className="font-black text-lg tracking-tight uppercase italic">Arena</h1>
          </div>
          <button onClick={() => authService.logout().then(() => setAuthUser(null))} className="w-10 h-10 glass-ios rounded-full flex items-center justify-center text-ios-red ios-tap"><LogOut size={20} /></button>
        </header>

        {currentView === AppView.DASHBOARD && <Dashboard stats={userStats} authUser={authUser} activeSession={activeSession} onStartBattle={() => setCurrentView(AppView.BATTLE)} onNavigate={(v) => setCurrentView(v as AppView)} onOpenSoundscape={() => setIsSoundscapeOpen(true)} onDailyClaim={() => {}} />}
        {currentView === AppView.BATTLE && <BattleArena inventory={inventory} activeSession={activeSession} activeSkin={activeSkin} onSkinChange={setActiveSkin} onSessionStart={setActiveSession} onSessionEnd={() => setActiveSession(null)} onComplete={handleBattleComplete} onExit={() => setCurrentView(AppView.DASHBOARD)} onConsumeItem={(id) => {}} />}
        {currentView === AppView.DUEL && <FocusDuel activeDuel={activeDuel} onDuelStart={setActiveDuel} onDuelEnd={() => setActiveDuel(null)} onBack={() => setCurrentView(AppView.DASHBOARD)} />}
        {currentView === AppView.MARKET && <Marketplace credits={userStats.credits} ownedItemIds={inventory} onPurchase={handlePurchase} />}
        {currentView === AppView.LEADERBOARD && <Leaderboard />}
        {currentView === AppView.PROFILE && <Profile stats={userStats} />}
        {currentView === AppView.HEALTH && <HealthTracker stats={userStats} onNavigateToExercises={() => setCurrentView(AppView.MEDITATION)} />}
        {currentView === AppView.SCHEDULE && <TacticalSchedule schedule={schedule} onAdd={handleAddSchedule} onRemove={handleRemoveSchedule} />}
        {currentView === AppView.WISDOM && <WisdomShrine />}
      </main>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] z-[100]">
        <div className="glass-ios rounded-[2.5rem] flex justify-around items-center p-2 shadow-2xl border-white/5">
          {[
            { id: AppView.DASHBOARD, icon: LayoutDashboard },
            { id: AppView.BATTLE, icon: Sword },
            { id: AppView.SCHEDULE, icon: CalendarClock },
            { id: AppView.PROFILE, icon: UserIcon },
            { id: AppView.WISDOM, icon: Sun },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setCurrentView(item.id)} 
              className={`flex flex-col items-center p-4 rounded-[2rem] transition-all duration-300 ios-tap ${currentView === item.id ? 'text-black bg-white scale-110 shadow-xl' : 'text-white/40'}`}
            >
              <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
