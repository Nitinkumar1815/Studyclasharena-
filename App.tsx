
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { BattleArena } from './components/BattleArena';
import { Leaderboard } from './components/Leaderboard';
import { Marketplace } from './components/Marketplace';
import { FocusDuel } from './components/FocusDuel';
import { Profile } from './components/Profile';
import { HealthTracker } from './components/HealthTracker';
import { TacticalSchedule } from './components/TacticalSchedule';
import { SoundscapeControl } from './components/SoundscapeControl';
import { StartupSplash } from './components/StartupSplash';
import { AuthScreens } from './components/AuthScreens';
import { ChronoLock } from './components/ChronoLock';
import { WisdomShrine } from './components/WisdomShrine';
import { MeditationArena } from './components/MeditationArena';
import { QuantumMap } from './components/QuantumMap';
import { AboutUs } from './components/AboutUs';
import { AppView, UserStats, ScheduleItem, ActiveSession, AuthUser, ActiveDuel } from './types';
import { INITIAL_USER_STATS, getRandomMarvelRank } from './constants';
import { LayoutDashboard, Sword, User as UserIcon, CalendarClock, LogOut, Loader2, Zap, Sun, Activity, Trophy, Info } from 'lucide-react';
import { dataService } from './services/dataService';
import { authService } from './services/authService';

export default function App() {
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const [appInitialized, setAppInitialized] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
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

  const handleStatsUpdate = async (updates: Partial<UserStats>) => {
    if (!userStats || !authUser) return;
    const newStats = { ...userStats, ...updates };
    setUserStats(newStats);
    await dataService.updateUserProfile(authUser.id, updates);
  };

  const loadUserData = useCallback(async (user: AuthUser) => {
    setIsSyncing(true);
    try {
      const [profile, inv, sched] = await Promise.all([
        dataService.getUserProfile(user.id),
        dataService.getInventory(user.id),
        dataService.getSchedule(user.id)
      ]);
      
      // If no profile, generate a fresh one with a random Marvel rank
      const activeStats = profile || { 
        ...INITIAL_USER_STATS, 
        id: user.id,
        rank: getRandomMarvelRank() 
      };
      
      setUserStats(activeStats);
      setInventory(inv.length ? inv : ['m1']);
      setSchedule(sched);
      
      // If it was a new user, save the generated rank to the DB
      if (!profile) {
        await dataService.updateUserProfile(user.id, activeStats, { 
          name: user.name, 
          email: user.email 
        });
      }
      
      setAppInitialized(true);
    } catch (err: any) {
      setAppInitialized(true);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleAuthSuccess = useCallback(async (user: AuthUser) => {
    setAuthUser(user);
    await loadUserData(user);
  }, [loadUserData]);

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
        setAppInitialized(true);
      }
    };
    init();
  }, [loadUserData]);

  // --- BACKGROUND DUEL ENGINE ---
  useEffect(() => {
    let interval: any;
    const DUEL_TARGET_SECONDS = 25 * 60; // 25 Minutes (1500s)

    if (activeDuel && activeDuel.myHP > 0 && activeDuel.rivalHP > 0) {
      interval = setInterval(() => {
        setActiveDuel(prev => {
          if (!prev) return null;
          
          const nextTime = prev.sessionTime + 1;
          let nextRivalHP = 100 - ( (nextTime / DUEL_TARGET_SECONDS) * 100 );
          const noise = (Math.random() - 0.5) * 0.5;
          nextRivalHP = Math.max(nextTime >= DUEL_TARGET_SECONDS ? 0 : 0.5, nextRivalHP + noise);
          const myDamage = Math.random() > 0.99 ? 0.2 : 0; 
          const nextMyHP = Math.max(1, prev.myHP - myDamage);

          if (nextRivalHP <= 0 && prev.rivalHP > 0) {
            const xpReward = 150; 
            const creditReward = 50;
            handleStatsUpdate({
              xp: (userStats?.xp || 0) + xpReward,
              credits: (userStats?.credits || 0) + creditReward,
              focusTimeMinutes: (userStats?.focusTimeMinutes || 0) + 25
            });
            showToast("Duel Victory!", `+${xpReward} XP & +${creditReward} CR - Sector Secured`, "success");
          } else if (nextMyHP <= 0 && prev.myHP > 0) {
            handleStatsUpdate({ xp: (userStats?.xp || 0) + 10 });
            showToast("Duel Defeat", "Focus Integrity Failed", "error");
          }

          return { ...prev, sessionTime: nextTime, rivalHP: nextRivalHP, myHP: nextMyHP };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeDuel?.id, activeDuel?.rivalHP, activeDuel?.myHP, userStats?.id]);

  // --- BACKGROUND STUDY SESSION ENGINE ---
  useEffect(() => {
    let interval: any;
    if (activeSession && !activeSession.completed) {
      interval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - activeSession.startTime) / 1000);
        const totalSeconds = activeSession.durationMinutes * 60;
        
        if (elapsedSeconds >= totalSeconds) {
          const xp = activeSession.durationMinutes * 12;
          const credits = activeSession.durationMinutes * 12;
          handleStatsUpdate({
            xp: (userStats?.xp || 0) + xp,
            credits: (userStats?.credits || 0) + credits,
            focusTimeMinutes: (userStats?.focusTimeMinutes || 0) + activeSession.durationMinutes
          });
          showToast("Session Clear", `+${xp} XP & +${credits} CR extracted`, "success");
          setActiveSession(prev => prev ? { ...prev, completed: true } : null);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession?.completed, activeSession?.startTime, userStats?.id]);

  const handleLogout = async () => {
    await authService.signOut();
    setAuthUser(null);
    setUserStats(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const handlePurchase = async (item: any) => {
    if (!userStats || !authUser) return false;
    if (userStats.credits < item.cost) {
      showToast("Low Balance", "Earn credits in Arena", "error");
      return false;
    }
    handleStatsUpdate({ credits: userStats.credits - item.cost });
    setInventory([...inventory, item.id]);
    await dataService.addToInventory(authUser.id, item.id, item.type);
    showToast("Gear Unlocked", item.name, "success");
    return true;
  };

  const handleAddSchedule = async (task: ScheduleItem) => {
    if (!authUser) return;
    setSchedule(prev => [...prev, task]);
    await dataService.addScheduleTask(authUser.id, task);
    showToast("Timeline Sync", "Directive deployed", "success");
  };

  const handleRemoveSchedule = async (id: string) => {
    setSchedule(prev => prev.filter(t => t.id !== id));
    await dataService.deleteScheduleTask(id);
    showToast("Protocol Cleared", "Directive removed", "error");
  };

  const handleUnlockStrict = async () => {
    if (activeLockTask) {
      setSchedule(schedule.map(t => t.id === activeLockTask.id ? { ...t, completed: true } : t));
      await dataService.updateScheduleTask(activeLockTask.id, { completed: true });
      setActiveLockTask(null);
      showToast("Protocol Fulfilled", "Focus integrity maintained", "success");
    }
  };

  if (showStartupSplash) return <StartupSplash onFinish={() => setShowStartupSplash(false)} />;
  
  if (!appInitialized || isSyncing) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-ios-blue" size={40} />
      <p className="text-ios-gray font-mono text-[10px] tracking-[0.3em] uppercase">Neural Core Syncing...</p>
    </div>
  );

  if (!authUser) return <AuthScreens onAuthSuccess={handleAuthSuccess} />;
  
  if (!userStats) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-ios-blue" size={40} />
      <p className="text-ios-gray font-mono text-[10px] tracking-[0.3em] uppercase">Accessing Profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden pb-32">
      {activeLockTask && <ChronoLock task={activeLockTask} onUnlock={handleUnlockStrict} />}
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
      <SoundscapeControl isOpen={isSoundscapeOpen} onClose={() => setIsSoundscapeOpen(false)} inventory={inventory} />
      <main className="max-w-lg mx-auto p-4">
        <header className="flex justify-between items-center py-6 mb-2">
          <div className="flex items-center gap-3 ios-tap" onClick={() => setCurrentView(AppView.DASHBOARD)}>
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl"><Sword size={22} /></div>
            <h1 className="font-black text-lg tracking-tight uppercase italic">Arena</h1>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 glass-ios rounded-full flex items-center justify-center text-ios-red ios-tap"><LogOut size={20} /></button>
        </header>

        {currentView === AppView.DASHBOARD && <Dashboard stats={userStats} authUser={authUser} activeSession={activeSession} onStartBattle={() => setCurrentView(AppView.BATTLE)} onNavigate={(v) => setCurrentView(v as AppView)} onOpenSoundscape={() => setIsSoundscapeOpen(true)} onDailyClaim={() => {}} />}
        {currentView === AppView.BATTLE && (
          <BattleArena 
            inventory={inventory} 
            activeSession={activeSession} 
            activeSkin={activeSkin} 
            onSkinChange={setActiveSkin} 
            onSessionStart={setActiveSession} 
            onSessionEnd={() => { setActiveSession(null); setCurrentView(AppView.DASHBOARD); }} 
            onComplete={() => { setActiveSession(null); setCurrentView(AppView.DASHBOARD); }} 
            onExit={() => setCurrentView(AppView.DASHBOARD)} 
            onConsumeItem={(id) => {}} 
          />
        )}
        {currentView === AppView.DUEL && (
          <FocusDuel 
            activeDuel={activeDuel} 
            onDuelStart={setActiveDuel} 
            onDuelEnd={() => { setActiveDuel(null); setCurrentView(AppView.DASHBOARD); }} 
            onBack={() => setCurrentView(AppView.DASHBOARD)} 
          />
        )}
        {currentView === AppView.MARKET && <Marketplace credits={userStats.credits} ownedItemIds={inventory} onPurchase={handlePurchase} />}
        {currentView === AppView.LEADERBOARD && <Leaderboard />}
        {currentView === AppView.PROFILE && <Profile stats={userStats} />}
        {currentView === AppView.HEALTH && <HealthTracker stats={userStats} onNavigateToExercises={() => setCurrentView(AppView.MEDITATION)} />}
        {currentView === AppView.MEDITATION && <MeditationArena />}
        {currentView === AppView.MAP && <QuantumMap />}
        {currentView === AppView.SCHEDULE && <TacticalSchedule schedule={schedule} onAdd={handleAddSchedule} onRemove={handleRemoveSchedule} />}
        {currentView === AppView.WISDOM && <WisdomShrine stats={userStats} onUpdateStats={handleStatsUpdate} showToast={showToast} />}
        {currentView === AppView.ABOUT && <AboutUs onBack={() => setCurrentView(AppView.DASHBOARD)} />}
      </main>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[100]">
        <div className="glass-ios rounded-[2.5rem] flex justify-around items-center p-2 shadow-2xl border-white/5 relative">
          {(activeDuel || activeSession) && (
            <div className="absolute top-0 right-1/2 translate-x-[4.5rem] -translate-y-2">
               <div className="flex items-center gap-1 bg-ios-red px-2 py-0.5 rounded-full animate-bounce shadow-lg shadow-ios-red/50">
                  <Activity size={8} className="text-white" />
                  <span className="text-[7px] font-black text-white uppercase tracking-tighter">{activeDuel ? 'Duel' : 'Focus'}</span>
               </div>
            </div>
          )}
          {[
            { id: AppView.DASHBOARD, icon: LayoutDashboard },
            { id: AppView.BATTLE, icon: Sword },
            { id: AppView.ABOUT, icon: Info },
            { id: AppView.SCHEDULE, icon: CalendarClock },
            { id: AppView.PROFILE, icon: UserIcon },
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
