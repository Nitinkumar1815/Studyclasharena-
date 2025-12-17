
import React, { useState, useEffect, useRef } from 'react';
import { Zap, X, Shield, Clock, Disc, Activity, Bluetooth, User, Cpu } from 'lucide-react';
import { ActiveDuel } from '../types';

interface FocusDuelProps {
  onBack: () => void;
  onDuelUpdate: (duel: ActiveDuel) => void;
  onDuelEnd: () => void;
  activeDuel: ActiveDuel | null;
}

const RIVAL_NAMES = ["Apex_Mind", "Zenith", "Obsidian", "Vanguard", "Nova", "Echo"];
const COMBAT_LOGS = [
  "Rival optimization detected.",
  "Neural focus steady at 98%.",
  "Distraction attempt blocked.",
  "Sync rate increasing...",
  "Rival processing capacity dipped.",
  "Flow state engaged.",
  "Deep work protocols active."
];

// --- PREMIUM UI COMPONENTS ---

const PremiumRadar = () => (
  <div className="relative flex items-center justify-center w-64 h-64">
    {/* Core */}
    <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] z-10 animate-pulse" />
    
    {/* Ripples */}
    <div className="absolute inset-0 border border-white/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
    <div className="absolute inset-0 border border-white/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-700" />
    <div className="absolute inset-0 border border-white/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-1000" />
    
    {/* Static Rings */}
    <div className="absolute w-32 h-32 border border-white/10 rounded-full" />
    <div className="absolute w-48 h-48 border border-white/5 rounded-full" />
    
    {/* Scanner Line */}
    <div className="absolute w-full h-full animate-[spin_4s_linear_infinite]">
       <div className="w-full h-1/2 bg-gradient-to-t from-transparent to-blue-500/10 border-r border-blue-500/20 blur-sm origin-bottom" />
    </div>
  </div>
);

const EntityModule = ({ 
  name, 
  hp, 
  isUser, 
  avatar 
}: { name: string, hp: number, isUser?: boolean, avatar?: string }) => {
  const accentColor = isUser ? 'bg-blue-500' : 'bg-orange-500';
  const textColor = isUser ? 'text-blue-500' : 'text-orange-500';

  return (
    <div className={`
      relative w-full max-w-sm backdrop-blur-3xl bg-zinc-900/40 border border-white/5 rounded-3xl p-6 transition-all duration-500
      ${isUser ? 'hover:bg-zinc-800/40' : ''}
    `}>
       {/* Header */}
       <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
             {/* Avatar Circle */}
             <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 relative">
                {avatar ? (
                   <img src={avatar} alt="avatar" className="w-full h-full object-cover opacity-80" />
                ) : (
                   isUser ? <User size={20} className="text-white/50" /> : <Cpu size={20} className="text-white/50" />
                )}
                {/* Status Dot */}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${accentColor}`} />
             </div>
             
             <div>
                <h3 className="text-white font-medium tracking-wide text-lg">{name}</h3>
                <p className={`text-[10px] uppercase tracking-widest font-bold ${textColor} opacity-80`}>
                   {isUser ? 'Connected' : 'Syncing'}
                </p>
             </div>
          </div>
          
          <div className="text-right">
             <div className="text-2xl font-light text-white">{Math.floor(hp)}%</div>
             <div className="text-[10px] text-zinc-500 uppercase">Integrity</div>
          </div>
       </div>

       {/* Progress Bar (Apple Style) */}
       <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ease-out ${accentColor}`} 
            style={{ width: `${hp}%` }}
          />
       </div>
    </div>
  );
};

export const FocusDuel: React.FC<FocusDuelProps> = ({ onBack, onDuelUpdate, onDuelEnd, activeDuel }) => {
  const [gameState, setGameState] = useState<'MATCHMAKING' | 'SYNC' | 'BATTLE' | 'VICTORY' | 'DEFEAT'>('MATCHMAKING');
  
  // Stats
  const [myHP, setMyHP] = useState(100);
  const [rivalHP, setRivalHP] = useState(100);
  const [sessionTime, setSessionTime] = useState(0);
  const [rivalName, setRivalName] = useState("");
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [restored, setRestored] = useState(false);

  // Restore State
  useEffect(() => {
    if (activeDuel && !restored) {
        const now = Date.now();
        const secondsAway = Math.floor((now - activeDuel.lastSaveTime) / 1000);
        
        setRivalName(activeDuel.rivalName);
        setMyHP(Math.max(0, activeDuel.myHP - (secondsAway * 0.3)));
        setRivalHP(Math.max(0, activeDuel.rivalHP - (secondsAway * 0.4)));
        setSessionTime(activeDuel.sessionTime + secondsAway);
        setBattleLogs(activeDuel.logs);

        if (activeDuel.rivalHP <= 0) setGameState('VICTORY');
        else if (activeDuel.myHP <= 0) setGameState('DEFEAT');
        else setGameState('BATTLE');
        setRestored(true);
    } else if (!activeDuel && !restored) {
        setGameState('MATCHMAKING');
        setRestored(true);
    }
  }, [activeDuel]);

  // Matchmaking
  useEffect(() => {
    if (gameState === 'MATCHMAKING' && restored && !activeDuel) {
        const randomName = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
        setRivalName(randomName);
        setTimeout(() => setGameState('SYNC'), 3000);
    }
    if (gameState === 'SYNC') {
        setTimeout(() => {
           setGameState('BATTLE');
           onDuelUpdate({ 
               id: Date.now().toString(), 
               rivalName, rivalAvatar: "", myHP: 100, rivalHP: 100, sessionTime: 0, logs: [], lastSaveTime: Date.now() 
           });
        }, 2000);
    }
  }, [gameState, restored]);

  // Game Loop
  useEffect(() => {
    let interval: any;
    if (gameState === 'BATTLE') {
        interval = setInterval(() => {
            setSessionTime(t => t + 1);
            setRivalHP(prev => Math.max(0, prev - (Math.random() > 0.6 ? 1 : 0)));
            if (Math.random() > 0.9) setMyHP(prev => Math.max(0, prev - 1.5));
            if (Math.random() > 0.85) setBattleLogs(prev => [COMBAT_LOGS[Math.floor(Math.random() * COMBAT_LOGS.length)], ...prev.slice(0, 2)]);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Win/Loss
  useEffect(() => {
      if (rivalHP <= 0 && gameState === 'BATTLE') setGameState('VICTORY');
      if (myHP <= 0 && gameState === 'BATTLE') setGameState('DEFEAT');
  }, [rivalHP, myHP, gameState]);

  const handleMinimize = () => {
    if (gameState === 'BATTLE') {
        onDuelUpdate({
            id: activeDuel?.id || "1",
            rivalName, rivalAvatar: "", myHP, rivalHP, sessionTime, logs: battleLogs, lastSaveTime: Date.now()
        });
    }
    onBack();
  };

  const handleEnd = () => {
    onDuelEnd();
    onBack();
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- RENDER ---

  // 1. MATCHMAKING
  if (gameState === 'MATCHMAKING') {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-zinc-950 text-center relative overflow-hidden">
              <PremiumRadar />
              <div className="mt-12 space-y-2 z-10">
                 <h2 className="text-xl font-light text-white tracking-widest uppercase">Searching</h2>
                 <p className="text-zinc-500 text-xs font-medium">Scanning local network for rivals...</p>
              </div>
              <button onClick={onBack} className="absolute bottom-10 text-zinc-600 hover:text-white transition-colors text-xs uppercase tracking-widest">Cancel</button>
          </div>
      );
  }

  // 2. SYNC
  if (gameState === 'SYNC') {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-zinc-950 px-6">
              <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-700">
                  <EntityModule name="You" hp={100} isUser />
                  <div className="flex items-center justify-center gap-4 text-zinc-600">
                      <div className="h-px bg-zinc-800 w-12" />
                      <Bluetooth size={20} className="animate-pulse" />
                      <div className="h-px bg-zinc-800 w-12" />
                  </div>
                  <EntityModule name={rivalName} hp={100} />
              </div>
          </div>
      );
  }

  // 3. RESULT
  if (gameState === 'VICTORY' || gameState === 'DEFEAT') {
      const isWin = gameState === 'VICTORY';
      return (
          <div className="h-full flex flex-col items-center justify-center bg-zinc-950 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                  {isWin ? <Activity className="text-white" /> : <X className="text-zinc-500" />}
              </div>
              <h1 className="text-4xl font-light text-white mb-2 tracking-tight">{isWin ? 'Session Complete' : 'Link Severed'}</h1>
              <p className="text-zinc-500 mb-12">{isWin ? 'Performance optimal. Rival outpaced.' : 'Focus integrity critically low.'}</p>
              
              <button 
                onClick={handleEnd}
                className="w-full max-w-xs py-4 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-colors"
              >
                Done
              </button>
          </div>
      );
  }

  // 4. BATTLE (PREMIUM)
  return (
    <div className="h-full flex flex-col bg-zinc-950 relative overflow-hidden">
        
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-zinc-950 to-zinc-950 pointer-events-none" />

        {/* Top Bar */}
        <div className="pt-6 px-6 pb-2 flex justify-between items-center z-10">
            <button onClick={handleMinimize} className="p-2 bg-zinc-900/50 rounded-full text-zinc-400 hover:text-white transition-colors border border-white/5">
                <Disc size={18} className={gameState === 'BATTLE' ? 'animate-spin-slow' : ''} />
            </button>
            <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-zinc-300 font-medium tracking-wider">LIVE</span>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 z-10">
            
            {/* RIVAL */}
            <div className="w-full flex justify-center">
                <EntityModule name={rivalName} hp={rivalHP} avatar={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${rivalName}`} />
            </div>

            {/* CENTER DATA HUD */}
            <div className="flex flex-col items-center justify-center py-8">
               {/* Time Circle */}
               <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle cx="50%" cy="50%" r="48%" fill="transparent" stroke="#27272a" strokeWidth="1" />
                     <circle 
                        cx="50%" cy="50%" r="48%" 
                        fill="transparent" 
                        stroke="#3b82f6" 
                        strokeWidth="1.5"
                        strokeDasharray="300"
                        strokeDashoffset={300 - ((sessionTime % 60) / 60) * 300}
                        className="transition-all duration-1000 ease-linear"
                     />
                  </svg>
                  <div className="text-center">
                     <div className="text-5xl font-light text-white tracking-tighter tabular-nums">
                        {formatTime(sessionTime)}
                     </div>
                     <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-2">Duration</div>
                  </div>
               </div>

               {/* Log Stack (Dynamic Island Style) */}
               <div className="mt-8 space-y-2 w-full max-w-xs h-24 overflow-hidden mask-linear-fade">
                  {battleLogs.map((log, i) => (
                     <div key={i} className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="bg-zinc-900/80 border border-white/5 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-3">
                           <Activity size={12} className="text-zinc-500" />
                           <span className="text-xs text-zinc-300 truncate font-light">{log}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* USER */}
            <div className="w-full flex justify-center">
                <EntityModule name="You" hp={myHP} isUser />
            </div>

        </div>

        {/* Eject Button (Bottom) */}
        <div className="p-6 pb-8 z-10 flex justify-center">
            <button 
               onClick={() => setGameState('DEFEAT')}
               className="group relative px-8 py-4 rounded-full bg-zinc-900 border border-zinc-800 hover:border-red-900/50 transition-all duration-500 overflow-hidden"
            >
               <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors duration-500" />
               <span className="relative text-xs font-bold text-zinc-500 group-hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors">
                  <X size={14} /> End Session
               </span>
            </button>
        </div>

    </div>
  );
};
