
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Play, Pause, XCircle, CheckCircle, Clock, ShieldAlert, AlertTriangle, Briefcase, Zap, Music, Volume2, ShieldCheck, Flame, LogOut, Layout, Lock } from 'lucide-react';
import { MARKET_ITEMS } from '../constants';
import { ActiveSession } from '../types';

interface BattleArenaProps {
  inventory: string[]; // List of IDs owned by user
  activeSkin: string; // ID of currently active skin (Persisted in App)
  onSkinChange: (skinId: string) => void;
  activeSession: ActiveSession | null;
  onSessionStart: (session: ActiveSession) => void;
  onSessionEnd: () => void;
  onComplete: (xp: number, minutes: number) => void;
  onExit: () => void;
  onConsumeItem: (itemId: string) => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ 
  inventory, 
  activeSkin,
  onSkinChange,
  activeSession,
  onSessionStart,
  onSessionEnd,
  onComplete, 
  onExit, 
  onConsumeItem 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25); // Minutes selected
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [task, setTask] = useState("");
  const [mode, setMode] = useState<'setup' | 'combat' | 'victory'>('setup');
  const [isDistracted, setIsDistracted] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [activePowerups, setActivePowerups] = useState<string[]>([]); // Names of active powerups
  const [soundtrackOn, setSoundtrackOn] = useState(false);
  const [shieldDeflected, setShieldDeflected] = useState(false);
  
  // Audio Refs
  const breachSirenRef = useRef<HTMLAudioElement | null>(null);

  const totalTime = sessionDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Restore state if an active session exists
  useEffect(() => {
    if (activeSession) {
      setMode('combat');
      setIsActive(true);
      setTask(activeSession.taskName);
      setSessionDuration(activeSession.durationMinutes);
      setActivePowerups(activeSession.activePowerups);
      
      // Calculate remaining time instantly
      const elapsedSeconds = Math.floor((Date.now() - activeSession.startTime) / 1000);
      const remaining = (activeSession.durationMinutes * 60) - elapsedSeconds;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }
  }, []); // Only on mount

  // Timer Logic
  useEffect(() => {
    let interval: any;
    
    // If we have an active session, use Wall Clock time to stay synced even if unmounted/remounted
    if (activeSession && mode === 'combat') {
       interval = setInterval(() => {
          // If distracted, do NOT update time (Pause effectively)
          if (isDistracted) return;

          const elapsedSeconds = Math.floor((Date.now() - activeSession.startTime) / 1000);
          const totalSeconds = activeSession.durationMinutes * 60;
          const remaining = totalSeconds - elapsedSeconds;
          
          if (remaining <= 0) {
             setTimeLeft(0);
             setIsActive(false);
             setMode('victory');
             // Do not clear session yet, wait for user to click "Collect Rewards"
          } else {
             setTimeLeft(remaining);
          }
       }, 1000);
    } 
    // Fallback for local testing
    else if (isActive && timeLeft > 0 && !isDistracted && !activeSession) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && mode === 'combat') {
      setIsActive(false);
      setMode('victory');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, isDistracted, activeSession]);

  // --- DISTRACTION / BACKGROUND DETECTION LOGIC ---
  useEffect(() => {
    // Initialize Siren
    const siren = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3');
    siren.loop = true;
    siren.volume = 1.0;
    breachSirenRef.current = siren;

    const handleVisibilityChange = () => {
      // 1. If Focus Shield is active, ignore distraction (Premium Feature)
      if (activePowerups.includes('Focus Shield')) {
         if (document.hidden && isActive) {
            setShieldDeflected(true);
            setTimeout(() => setShieldDeflected(false), 3000);
         }
         return;
      }

      // 2. Main Logic
      if (isActive) {
        if (document.hidden) {
            // APP IS IN BACKGROUND
            setIsActive(false); // Freeze timer logic
            setIsDistracted(true); // Prepare red screen
            
            // Trigger System Alert
            if (Notification.permission === 'granted') {
                new Notification("⚠️ SYSTEM BREACH DETECTED!", {
                    body: "Return to StudyClash Arena immediately or lose progress.",
                    icon: "https://img.icons8.com/color/96/siren.png",
                    requireInteraction: true,
                    silent: false
                });
            }
        } else {
            // APP IS BACK IN FOREGROUND
            // Ensure visual red screen is active
            setIsDistracted(true);
            
            // Play Loud Siren
            breachSirenRef.current?.play().catch(e => console.log("Audio block", e));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      breachSirenRef.current?.pause();
    };
  }, [isActive, activePowerups]);

  const handleStart = () => {
    if (!task) return;
    
    // Consume active single-use powerups
    activePowerups.forEach(name => {
      const item = MARKET_ITEMS.find(i => i.name === name);
      if (item && item.type === 'powerup') {
        onConsumeItem(item.id);
      }
    });

    onSessionStart({
      taskId: Date.now().toString(),
      taskName: task,
      startTime: Date.now(),
      durationMinutes: sessionDuration,
      activePowerups: activePowerups
    });

    setMode('combat');
    setIsActive(true);
  };

  const handleResumeFromDistraction = () => {
    setIsDistracted(false);
    setIsActive(true);
    // Stop Siren
    if (breachSirenRef.current) {
        breachSirenRef.current.pause();
        breachSirenRef.current.currentTime = 0;
    }
  };

  const activatePowerup = (itemName: string) => {
    if (!activePowerups.includes(itemName)) {
      setActivePowerups([...activePowerups, itemName]);
    }
  };

  const setDuration = (min: number) => {
      setSessionDuration(min);
      setTimeLeft(min * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const emergencyEject = () => {
      onSessionEnd();
      setMode('setup');
      setIsActive(false);
      setTask("");
      setActivePowerups([]);
      setSessionDuration(25);
      setTimeLeft(25 * 60);
      onExit();
  };

  // --- VICTORY CALCULATION ---
  const calculateRewards = () => {
    let xp = sessionDuration * 10;
    let credits = (sessionDuration * 10) + 100;
    
    if (activePowerups.includes('XP Booster (1h)')) {
        xp *= 2;
        credits = Math.floor(credits * 1.5);
    }
    
    if (sessionDuration >= 45) {
      xp += 100;
      credits += 50;
    }

    return { xp: Math.floor(xp), credits: Math.floor(credits) };
  };

  const getBackgroundClass = () => {
     if (activeSkin === 'm3') return "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/30 via-black to-black";
     if (activeSkin === 'm1') return "bg-cyber-neonBlue/5";
     return "bg-zinc-900"; 
  };

  if (mode === 'setup') {
    return (
      <div className="h-full flex flex-col p-4 animate-in fade-in duration-300 space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
           <div>
              <h2 className="text-2xl font-bold uppercase tracking-widest text-cyber-neonBlue">Mission Control</h2>
              <p className="text-gray-400 text-xs font-mono">Prepare your workspace operator.</p>
           </div>
           <button onClick={onExit} className="text-gray-500 hover:text-white transition-colors">
              <LogOut size={20} className="rotate-180" />
           </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
             <div className="space-y-2">
                <label className="text-xs text-cyber-neonBlue uppercase font-bold tracking-wider">Primary Objective</label>
                <input 
                  type="text" 
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="ENTER DIRECTIVE (e.g. Calculus Ch. 4)"
                  className="w-full bg-black/40 border-2 border-white/10 rounded-xl p-4 text-white text-lg focus:border-cyber-neonBlue focus:shadow-[0_0_20px_rgba(0,243,255,0.2)] outline-none font-mono transition-all"
                  autoFocus
                />
             </div>

             <div className="space-y-2">
                <label className="text-xs text-cyber-neonBlue uppercase font-bold tracking-wider">Time Allocation</label>
                <div className="grid grid-cols-3 gap-4">
                  {[15, 25, 45].map(min => (
                    <button 
                      key={min}
                      onClick={() => setDuration(min)}
                      className={`py-4 rounded-xl border-2 transition-all font-mono text-lg font-bold ${
                        sessionDuration === min 
                          ? 'bg-cyber-neonBlue/10 border-cyber-neonBlue text-cyber-neonBlue shadow-[0_0_15px_rgba(0,243,255,0.2)]' 
                          : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2">
                    <Layout size={12} /> Neural Environment
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {MARKET_ITEMS.filter(i => i.type === 'skin').map(skin => {
                        const owned = inventory.includes(skin.id);
                        return (
                            <button
                                key={skin.id}
                                disabled={!owned}
                                onClick={() => onSkinChange(skin.id)}
                                className={`p-3 rounded-xl border text-left text-xs transition-all relative overflow-hidden group ${
                                    activeSkin === skin.id 
                                    ? 'border-cyber-neonBlue bg-cyber-neonBlue/10 text-white shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                                    : owned 
                                        ? 'border-white/10 bg-black/40 text-gray-400 hover:border-white/30 hover:bg-white/5' 
                                        : 'border-white/5 bg-black/60 text-gray-600 opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <div className="font-bold truncate pr-4">{skin.name}</div>
                                {!owned && (
                                    <div className="text-[9px] uppercase mt-1 flex items-center gap-1 text-red-400">
                                        <Lock size={8} /> Locked
                                    </div>
                                )}
                                {activeSkin === skin.id && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyber-neonBlue rounded-full animate-pulse" />
                                )}
                            </button>
                        )
                    })}
                </div>
             </div>

             {inventory.length > 0 && (
                <div className="space-y-2">
                   <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex justify-between">
                      <span>Tactical Mods</span>
                      <span className="text-white/50">{activePowerups.length} Active</span>
                   </label>
                   <div className="grid grid-cols-2 gap-3">
                     {MARKET_ITEMS.filter(i => inventory.includes(i.id) && i.type === 'powerup').map(item => (
                       <button
                         key={item.id}
                         onClick={() => activatePowerup(item.name)}
                         className={`p-3 rounded-lg border text-left text-xs flex items-center justify-between transition-all ${
                           activePowerups.includes(item.name) 
                             ? 'bg-green-500/20 border-green-500 text-green-400' 
                             : 'bg-black/40 border-white/10 text-gray-500 hover:bg-white/5'
                         }`}
                       >
                         <span className="font-bold">{item.name}</span>
                         <Zap size={14} className={activePowerups.includes(item.name) ? 'text-green-400 fill-current' : 'text-gray-600'} />
                       </button>
                     ))}
                   </div>
                </div>
             )}
        </div>

        <div className="pt-2">
          <button 
            onClick={handleStart}
            disabled={!task}
            className="w-full py-5 bg-cyber-neonBlue text-black font-black text-xl uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,243,255,0.4)] relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
               <Play fill="currentColor" /> DEPLOY SYSTEM
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'victory') {
    const rewards = calculateRewards();
    return (
      <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(74,222,128,0.4)] animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Victory!</h1>
        <p className="text-gray-400 mb-8">Objective secured. Data sync complete.</p>
        
        <div className="flex gap-8 mb-8">
            <div className="text-center">
                <div className="text-sm text-gray-500 uppercase">XP Gained</div>
                <div className="text-3xl font-mono text-cyber-neonPurple font-bold">+{rewards.xp}</div>
            </div>
             <div className="text-center">
                <div className="text-sm text-gray-500 uppercase">Credits</div>
                <div className="text-3xl font-mono text-yellow-500 font-bold">+{rewards.credits}</div>
            </div>
        </div>

        {activePowerups.includes('XP Booster (1h)') && <div className="text-xs mb-4 text-yellow-500 uppercase tracking-widest border border-yellow-500/50 px-3 py-1 rounded-full animate-pulse">XP Booster Active</div>}

        <button 
          onClick={() => onComplete(rewards.xp, sessionDuration)}
          className="px-10 py-4 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all font-bold uppercase tracking-widest"
        >
          Collect Rewards
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* --- RED SCREEN OF DEATH (Distraction Overlay) --- */}
      {isDistracted && (
        <div className="absolute inset-0 z-[100] bg-red-950 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-300 border-[20px] border-red-600 animate-pulse">
          {/* Glitch Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
          
          <div className="relative mb-6 z-10">
            <ShieldAlert className="w-32 h-32 text-red-500 animate-shake" />
            <div className="absolute inset-0 border-8 border-red-500 rounded-full animate-ping opacity-50"></div>
          </div>
          
          <h1 className="text-6xl font-black text-white tracking-widest mb-2 drop-shadow-[0_0_20px_rgba(220,38,38,1)] uppercase">BREACH DETECTED</h1>
          <h2 className="text-2xl font-bold text-red-500 font-mono mb-8 uppercase animate-pulse">⚠️ UNAUTHORIZED EXIT DETECTED ⚠️</h2>
          
          <div className="bg-black/80 border-2 border-red-500 p-6 rounded-xl max-w-sm mb-8 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
             <p className="text-red-200 font-mono text-lg leading-relaxed font-bold">
               &gt; SYSTEM LOCKDOWN<br/>
               &gt; TIMER FROZEN<br/>
               &gt; ALARM ACTIVATED
             </p>
          </div>
          
          <button 
            onClick={handleResumeFromDistraction}
            className="w-full max-w-md py-6 bg-red-600 hover:bg-red-700 text-white font-black text-2xl rounded shadow-[0_0_50px_rgba(220,38,38,0.8)] border-2 border-white uppercase tracking-[0.2em] transition-transform hover:scale-105"
          >
            RE-ENGAGE SYSTEM
          </button>
        </div>
      )}

      {/* Shield Deflected Toast */}
      {shieldDeflected && (
        <div className="absolute top-20 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
           <div className="bg-cyber-neonBlue/10 border border-cyber-neonBlue text-cyber-neonBlue px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(0,243,255,0.4)] backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
              <div>
                 <div className="font-bold uppercase tracking-wider text-sm">Threat Neutralized</div>
                 <div className="text-[10px] opacity-80 font-mono">Focus Shield Absorbed Distraction</div>
              </div>
           </div>
        </div>
      )}

      {/* Background Ambience (DYNAMIC) */}
      <div className={`absolute inset-0 pointer-events-none animate-pulse ${getBackgroundClass()}`} />
      
      {/* POWERUP VISUAL EFFECTS OVERLAY */}
      {mode === 'combat' && (
        <>
          {/* Focus Shield Visuals */}
          {activePowerups.includes('Focus Shield') && (
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00f3ff_1px,transparent_1px)] [background-size:20px_20px]" />
              <div className="absolute top-0 left-0 w-16 md:w-32 h-16 md:h-32 border-t-4 border-l-4 border-cyber-neonBlue/30 rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-16 md:w-32 h-16 md:h-32 border-t-4 border-r-4 border-cyber-neonBlue/30 rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-16 md:w-32 h-16 md:h-32 border-b-4 border-l-4 border-cyber-neonBlue/30 rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-16 md:w-32 h-16 md:h-32 border-b-4 border-r-4 border-cyber-neonBlue/30 rounded-br-3xl" />
              
              <div className="absolute top-24 left-4 md:left-6 animate-pulse hidden md:block">
                 <div className="flex items-center gap-2 px-3 py-1 bg-cyber-neonBlue/10 border border-cyber-neonBlue/50 rounded text-cyber-neonBlue text-xs font-mono font-bold shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                    <ShieldAlert size={14} /> SHIELD MATRIX ONLINE
                 </div>
              </div>
            </div>
          )}

          {/* XP Booster Visuals */}
          {activePowerups.includes('XP Booster (1h)') && (
            <div className="absolute inset-0 pointer-events-none z-0">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(234,179,8,0.05)_100%)]" />
               
               <div className="absolute bottom-20 right-4 md:right-10 flex flex-col items-center animate-bounce duration-[2000ms]">
                  <div className="text-yellow-400 font-bold text-lg drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">+XP</div>
                  <div className="w-1 h-8 bg-gradient-to-t from-yellow-500 to-transparent opacity-50" />
               </div>

               <div className="absolute top-24 right-4 md:right-6 animate-pulse hidden md:block">
                 <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/50 rounded text-yellow-500 text-xs font-mono font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    <Flame size={14} fill="currentColor" /> XP OVERDRIVE
                 </div>
               </div>
            </div>
          )}
        </>
      )}

      {/* HUD Header */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-10">
         <div className="text-left">
            <h3 className="text-sm text-gray-400 uppercase tracking-widest">Current Objective</h3>
            <p className="text-xl font-bold text-white max-w-[200px] truncate">{task}</p>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={() => setSoundtrackOn(!soundtrackOn)}
              className={`p-2 rounded-full transition-colors ${soundtrackOn ? 'bg-cyber-neonBlue/20 text-cyber-neonBlue' : 'bg-white/5 text-gray-400'}`}
            >
              {soundtrackOn ? <Volume2 size={20} className="animate-pulse"/> : <Music size={20} />}
            </button>
            <button onClick={onExit} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
              <LogOut size={24} className="rotate-180" /> 
            </button>
         </div>
      </div>

      {/* Main Timer Visual */}
      <div className="relative z-10 mb-8">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white/5 flex items-center justify-center relative">
           {activePowerups.includes('Focus Shield') && (
              <div className="absolute -inset-4 border border-cyber-neonBlue/30 rounded-full animate-[spin_10s_linear_infinite]" />
           )}
           {activePowerups.includes('XP Booster (1h)') && (
              <div className="absolute -inset-2 border border-dashed border-yellow-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
           )}

           <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle 
               cx="50%" cy="50%" r="48%" 
               fill="transparent" 
               stroke="#13131f" 
               strokeWidth="8" 
             />
             <circle 
               cx="50%" cy="50%" r="48%" 
               fill="transparent" 
               stroke={activePowerups.includes('XP Booster (1h)') ? "#eab308" : "#00f3ff"} 
               strokeWidth="8"
               strokeDasharray="301" 
               strokeDashoffset={301 - (301 * progress) / 100} 
               strokeLinecap="round"
               className="transition-all duration-1000 ease-linear"
             />
           </svg>

           <div className="flex flex-col items-center text-center">
              <span className={`text-6xl md:text-7xl font-mono font-bold text-white ${activePowerups.includes('XP Booster (1h)') ? 'drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]'}`}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-cyber-neonBlue uppercase tracking-[0.3em] mt-2 animate-pulse">
                {isActive ? 'System Active' : 'System Paused'}
              </span>
           </div>
        </div>
      </div>

      {/* Controls & Powerups */}
      <div className="flex flex-col items-center gap-6 z-10 w-full px-4">
        <div className="flex gap-6">
          <button 
            onClick={() => setShowInventory(!showInventory)}
            className="w-12 h-12 rounded-full flex items-center justify-center border border-white/20 bg-black/40 text-gray-400 hover:text-white hover:border-white/50 transition-all relative"
          >
            <Briefcase size={20} />
            {activePowerups.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            )}
          </button>
          
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              isActive 
                ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10' 
                : 'border-green-500 text-green-500 hover:bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
            }`}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
          
           <button 
            onClick={emergencyEject}
            className="w-12 h-12 rounded-full flex items-center justify-center border border-red-500/30 bg-red-900/10 text-red-500 hover:bg-red-900/30 hover:border-red-500 transition-all"
            title="Emergency Eject"
          >
            <XCircle size={24} />
          </button>
        </div>

        {showInventory && (
          <div className="w-full max-w-sm animate-in slide-in-from-bottom-4">
            <GlassCard className="p-3">
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Tactical Inventory (Purchased)</h4>
              <div className="grid grid-cols-2 gap-2">
                {MARKET_ITEMS.filter(i => inventory.includes(i.id) && i.type === 'powerup').map(item => (
                  <button
                    key={item.id}
                    onClick={() => activatePowerup(item.name)}
                    disabled={activePowerups.includes(item.name)}
                    className={`
                      p-2 rounded border text-left text-xs flex items-center justify-between
                      ${activePowerups.includes(item.name) 
                        ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10'}
                    `}
                  >
                    <span>{item.name}</span>
                    <Zap size={12} className={activePowerups.includes(item.name) ? 'text-green-400' : 'text-gray-400'} />
                  </button>
                ))}
                {MARKET_ITEMS.filter(i => inventory.includes(i.id) && i.type === 'powerup').length === 0 && (
                  <div className="col-span-2 text-center text-xs text-gray-500 py-2">
                    No powerups detected. Acquire in Market.
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </div>

    </div>
  );
};
