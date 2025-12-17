
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
import { AppView, UserStats, ScheduleItem, MarketItem, ActiveSession, ActiveDuel, AuthUser } from './types';
import { INITIAL_USER_STATS, MARKET_ITEMS } from './constants';
import { LayoutDashboard, Sword, Sun, CheckCircle, Bell, AlertTriangle, X, User, HeartPulse, CalendarClock, LogOut } from 'lucide-react';
import { GlassCard } from './components/ui/GlassCard';
import { dataService } from './services/dataService';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  const [authUser, setAuthUser] = useState<AuthUser | null>({
    id: 'guest-operator',
    name: 'Neon Scholar',
    email: 'guest@studyclash.ai',
    classGrade: 'Class 12',
    isVerified: true,
    token: 'mock-token'
  });

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSoundscapeOpen, setIsSoundscapeOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [inventory, setInventory] = useState<string[]>(MARKET_ITEMS.filter(i => i.owned).map(i => i.id));
  const [activeSkin, setActiveSkin] = useState<string>('m1');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [activeDuel, setActiveDuel] = useState<ActiveDuel | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [activeAlarmTask, setActiveAlarmTask] = useState<ScheduleItem | null>(null);
  const [toast, setToast] = useState<{message: string, subMessage?: string, type: 'success' | 'error'} | null>(null);
  
  const sirenAudioRef = useRef<HTMLAudioElement | null>(null);
  const noiseAudioRef = useRef<HTMLAudioElement | null>(null);
  const nuclearAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (authUser) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const profile = await dataService.getUserProfile(authUser.id);
          if (profile) {
            setUserStats(prev => ({ ...prev, ...profile }));
          }
          const dbInventory = await dataService.getInventory(authUser.id);
          const defaultItems = MARKET_ITEMS.filter(i => i.owned).map(i => i.id);
          setInventory(Array.from(new Set([...defaultItems, ...dbInventory])));
          const dbSchedule = await dataService.getSchedule(authUser.id);
          setSchedule(dbSchedule);
          const dbBadges = await dataService.getUnlockedBadges(authUser.id);
          if (dbBadges.length > 0) {
             setUserStats(prev => ({ ...prev, unlockedBadgeIds: dbBadges }));
          }
        } catch (error) {
          console.error("Data sync failed:", error);
          // Fallback to initial stats is already handled by state defaults
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    const checkSchedule = () => {
      if (activeAlarmTask) return;
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const matchingTask = schedule.find(item => item.startTime === currentTime && !item.completed);
      if (matchingTask) {
        setActiveAlarmTask(matchingTask);
        try {
          const siren = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3'); 
          siren.volume = 1.0; siren.loop = true; 
          sirenAudioRef.current = siren;
          siren.play().catch(e => console.error("Siren play failed:", e));
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`Emergency! ${matchingTask.title} protocol initiated. Engage immediately.`);
            utterance.rate = 1.2; utterance.pitch = 1.2; utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        } catch (err) {
          console.error("Alert system malfunction", err);
        }
        if ('Notification' in window && Notification.permission === 'granted') {
           new Notification(`⚠️ ALARM: ${matchingTask.title}`, {
             body: "SYSTEM LOCKDOWN. RETURN TO TERMINAL IMMEDIATELY.",
             icon: "https://img.icons8.com/color/96/siren.png",
             requireInteraction: true, silent: false
           });
        }
      }
    };
    const interval = setInterval(checkSchedule, 1000); 
    return () => clearInterval(interval);
  }, [schedule, activeAlarmTask, authUser]);

  const handleTaskUnlock = async (taskId: string) => {
    setSchedule(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    ));
    if (sirenAudioRef.current) { sirenAudioRef.current.pause(); sirenAudioRef.current.currentTime = 0; }
    setActiveAlarmTask(null);
    if (authUser) {
      await dataService.updateScheduleTask(taskId, { completed: true });
    }
  };

  const handleAddScheduleTask = async (task: ScheduleItem) => {
    if (!authUser) return;
    setSchedule(prev => [...prev, task].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    try {
      const newTask = await dataService.addScheduleTask(authUser.id, task);
      if (newTask) {
        setSchedule(prev => prev.map(t => t.id === task.id ? { ...t, id: newTask.id } : t));
      }
    } catch (error) {
      console.error("Add task failed:", error);
    }
  };

  const handleRemoveScheduleTask = async (id: string) => {
    if (!authUser) return;
    setSchedule(prev => prev.filter(t => t.id !== id));
    await dataService.deleteScheduleTask(id);
  };

  const handleLogout = () => {
    // Just a placeholder for demo purposes since real logout logic was removed
    alert("Simulating reset to onboarding...");
    setShowOnboarding(true);
    setUserStats(INITIAL_USER_STATS);
  };

  const showToast = (msg: string, subMsg: string = "", type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, subMessage: subMsg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDailyClaim = async () => {
      const now = Date.now();
      const last = userStats.lastDailyClaim || 0;
      const oneDay = 24 * 60 * 60 * 1000;
      if (now - last > oneDay) {
          const reward = 300;
          const newCredits = userStats.credits + reward;
          setUserStats(prev => ({ ...prev, credits: newCredits, lastDailyClaim: now }));
          if (authUser) {
            await dataService.updateUserProfile(authUser.id, { credits: newCredits, lastDailyClaim: now });
          }
          showToast("Supply Drop Claimed", `+${reward} Credits added to wallet.`, "success");
      } else {
          showToast("Cooldown Active", "Supply Drop available tomorrow.", "error");
      }
  };

  const handleBattleComplete = async (xpEarned: number, durationMinutes: number) => {
    let earnedCredits = (Math.floor(durationMinutes) * 10) + 100;
    let newXp = userStats.xp + xpEarned;
    let newLevel = userStats.level;
    let newXpToNext = userStats.xpToNextLevel;
    if (newXp >= newXpToNext) {
       newLevel += 1;
       newXp = newXp - newXpToNext; 
       newXpToNext = Math.floor(newXpToNext * 1.2); 
       showToast("LEVEL UP!", `Welcome to Level ${newLevel}`, "success");
       earnedCredits += 200; 
    }
    const newStats = {
      level: newLevel,
      xp: newXp,
      xpToNextLevel: newXpToNext,
      credits: userStats.credits + earnedCredits,
      focusTimeMinutes: userStats.focusTimeMinutes + durationMinutes,
      streak: userStats.streak
    };

    if (authUser && activeSession) {
      await dataService.saveStudySession({
        userId: authUser.id,
        taskName: activeSession.taskName,
        durationMinutes: durationMinutes,
        xpEarned: xpEarned,
        creditsEarned: earnedCredits
      });
    }

    setUserStats(prev => ({ ...prev, ...newStats }));
    if (authUser) {
      await dataService.updateUserProfile(authUser.id, newStats);
    }
    setActiveSession(null);
    setTimeout(() => {
      setCurrentView(AppView.DASHBOARD);
      showToast("Mission Complete", `+${earnedCredits} Credits Earned`, "success");
    }, 1000);
  };

  const handlePurchase = async (item: MarketItem) => {
    if (inventory.includes(item.id)) {
        showToast("Item Already Owned", "Check your inventory.", "error");
        return false;
    }
    if (userStats.credits >= item.cost) {
      const newCredits = userStats.credits - item.cost;
      setUserStats(prev => ({ ...prev, credits: newCredits }));
      setInventory(prev => [...prev, item.id]);
      if (authUser) {
        await dataService.updateUserProfile(authUser.id, { credits: newCredits });
        await dataService.addToInventory(authUser.id, item.id, item.type);
      }
      showToast(`Acquired: ${item.name}`, `Added to Inventory`, 'success');
      return true; 
    } else {
      showToast("Insufficient Credits", "Study more to mine credits.", "error");
      return false; 
    }
  };

  const navItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Dash' },
    { id: AppView.BATTLE, icon: Sword, label: 'Arena', highlight: true },
    { id: AppView.HEALTH, icon: HeartPulse, label: 'Bio' },
    { id: AppView.SCHEDULE, icon: CalendarClock, label: 'Plan' },
    { id: AppView.WISDOM, icon: Sun, label: 'Gyan', highlight: true },
  ];

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen font-sans bg-cyber-black text-white selection:bg-cyber-neonBlue selection:text-black">
      
      {toast && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right fade-in duration-300">
           <GlassCard className={`min-w-[300px] border-l-4 p-4 flex items-start gap-3 shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'border-l-green-500 bg-green-900/20' : 'border-l-red-500 bg-red-900/20'}`}>
              <div className={`mt-0.5 p-1 rounded-full ${toast.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                 {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="flex-1">
                 <h4 className={`font-bold text-sm ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{toast.message}</h4>
                 {toast.subMessage && <p className="text-xs text-gray-400 mt-1">{toast.subMessage}</p>}
              </div>
              <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white">
                 <X size={14} />
              </button>
           </GlassCard>
        </div>
      )}

      {activeAlarmTask && activeAlarmTask.strictMode && (
        <ChronoLock 
          task={activeAlarmTask} 
          onUnlock={() => handleTaskUnlock(activeAlarmTask.id)} 
        />
      )}

      {activeAlarmTask && !activeAlarmTask.strictMode && (
        <div className="fixed top-0 left-0 w-full z-50 p-4 animate-in slide-in-from-top-10">
          <GlassCard className="max-w-md mx-auto border-red-500 bg-black/95 shadow-2xl flex flex-col p-6 text-center">
            <Bell size={48} className="text-red-500 mx-auto mb-4 animate-bounce" />
            <h3 className="font-bold text-white text-2xl mb-1 uppercase tracking-widest animate-pulse">Directive Active</h3>
            <p className="text-red-400 font-mono text-lg mb-6">{activeAlarmTask.title}</p>
            <button 
              onClick={() => handleTaskUnlock(activeAlarmTask.id)}
              className="w-full py-4 bg-red-600 text-white font-bold uppercase tracking-widest rounded-lg"
            >
              ACKNOWLEDGE
            </button>
          </GlassCard>
        </div>
      )}

      <SoundscapeControl isOpen={isSoundscapeOpen} onClose={() => setIsSoundscapeOpen(false)} inventory={inventory} />

      <main className="relative z-10 max-w-4xl mx-auto min-h-screen flex flex-col">
        {currentView !== AppView.WISDOM && (
          <header className="p-4 flex justify-between items-center glass-panel m-4 rounded-xl border-white/5 sticky top-4 z-40">
             <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setCurrentView(AppView.DASHBOARD)}>
               <div className="w-8 h-8 bg-gradient-to-tr from-cyber-neonBlue to-cyber-neonPurple rounded-lg flex items-center justify-center font-bold text-black shadow-lg">SC</div>
               <h1 className="font-bold text-lg tracking-wider hidden sm:block group-hover:text-cyber-neonBlue transition-colors">STUDY CLASH</h1>
             </div>
             
             <div className="flex items-center gap-4">
               <button onClick={() => setCurrentView(AppView.MARKET)} className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-yellow-500/30">
                  <span className="text-xs font-mono text-yellow-500 font-bold">{userStats.credits} CR</span>
               </button>
               <button onClick={() => setCurrentView(AppView.PROFILE)} className="p-2 bg-white/5 rounded-full"><User size={20} className="text-gray-300" /></button>
               <button onClick={handleLogout} className="p-2 bg-red-900/10 border border-red-500/30 rounded-full text-red-500 hover:bg-red-500/20 transition-all"><LogOut size={20} /></button>
             </div>
          </header>
        )}

        <div className={`flex-1 ${currentView === AppView.WISDOM ? '' : 'p-4 md:p-6'} pb-32`}>
          {currentView === AppView.DASHBOARD && (
            <Dashboard 
              stats={userStats} 
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
              onConsumeItem={async (id) => { setInventory(prev => prev.filter(i => i !== id)); await dataService.consumeItem(authUser?.id || 'guest', id); }}
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
          {currentView === AppView.MAP && <QuantumMap />}
          {currentView === AppView.MARKET && (
            <Marketplace 
              credits={userStats.credits} 
              ownedItemIds={inventory}
              onPurchase={handlePurchase}
            />
          )}
          {currentView === AppView.LEADERBOARD && <Leaderboard />}
          {currentView === AppView.PROFILE && (
            <Profile stats={userStats} />
          )}
          {currentView === AppView.MEDITATION && <MeditationArena />}
          {currentView === AppView.HEALTH && (
            <HealthTracker 
              stats={userStats} 
              onNavigateToExercises={() => setCurrentView(AppView.MEDITATION)} 
            />
          )}
          {currentView === AppView.SCHEDULE && (
            <TacticalSchedule 
              schedule={schedule}
              onAdd={handleAddScheduleTask}
              onRemove={handleRemoveScheduleTask}
            />
          )}
          {currentView === AppView.WISDOM && <WisdomShrine />}
          {currentView === AppView.RIVAL && <SilentRival stats={userStats} />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full p-4 z-50">
        <div className="max-w-md mx-auto glass-panel rounded-2xl flex justify-around items-center p-2 border-t border-white/20 bg-cyber-black/90 backdrop-blur-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                currentView === item.id 
                  ? item.highlight 
                      ? 'text-yellow-400 bg-yellow-500/10'
                      : 'text-cyber-neonBlue bg-cyber-neonBlue/10' 
                  : 'text-gray-500'
              }`}
            >
              <item.icon size={item.highlight ? 24 : 20} />
              <span className="text-[9px] uppercase font-bold mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
