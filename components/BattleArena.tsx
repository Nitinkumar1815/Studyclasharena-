
import React, { useState, useEffect } from 'react';
import { Play, Pause, XCircle, Volume2, ChevronLeft, Layout, ShieldCheck, Brain } from 'lucide-react';
import { MARKET_ITEMS } from '../constants';
import { ActiveSession } from '../types';

interface BattleArenaProps {
  inventory: string[];
  activeSkin: string;
  onSkinChange: (skinId: string) => void;
  activeSession: ActiveSession | null;
  onSessionStart: (session: ActiveSession) => void;
  onSessionEnd: () => void;
  onComplete: (xp: number, minutes: number) => void;
  onExit: () => void;
  onConsumeItem: (itemId: string) => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ 
  inventory, activeSkin, onSkinChange, activeSession, onSessionStart, 
  onSessionEnd, onComplete, onExit, onConsumeItem 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [task, setTask] = useState("");
  const [mode, setMode] = useState<'setup' | 'combat' | 'victory'>('setup');
  
  const totalTime = sessionDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (activeSession) {
      setMode('combat');
      setIsActive(true);
      setTask(activeSession.taskName);
      const elapsed = Math.floor((Date.now() - activeSession.startTime) / 1000);
      const remaining = (activeSession.durationMinutes * 60) - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    } else if (mode !== 'victory') {
      setMode('setup');
      setIsActive(false);
    }
  }, [activeSession]);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && mode === 'combat') {
      setIsActive(false);
      setMode('victory');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const handleStart = () => {
    if (!task) return;
    onSessionStart({
      taskId: Date.now().toString(),
      taskName: task,
      startTime: Date.now(),
      durationMinutes: sessionDuration,
      activePowerups: []
    });
  };

  const handleManualExit = () => {
    onSessionEnd();
    setMode('setup');
    setIsActive(false);
    setTimeLeft(sessionDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (mode === 'setup') {
    return (
      <div className="h-full flex flex-col p-2 animate-spring">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={onExit} className="w-10 h-10 glass-ios rounded-full flex items-center justify-center ios-tap">
              <ChevronLeft size={20} />
           </button>
           <h2 className="text-3xl font-bold italic uppercase tracking-tighter">Arena Setup</h2>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-10">
          <div className="space-y-2">
             <p className="text-[10px] font-black uppercase text-ios-gray tracking-widest ml-1">Objective</p>
             <input 
               type="text" 
               value={task}
               onChange={(e) => setTask(e.target.value)}
               placeholder="Target Mission..."
               className="ios-input w-full p-6 text-xl font-bold"
             />
          </div>

          <div className="space-y-2">
             <p className="text-[10px] font-black uppercase text-ios-gray tracking-widest ml-1">Session Length</p>
             <div className="grid grid-cols-3 gap-2">
                {[15, 25, 45, 60, 90, 120].map(m => (
                  <button 
                    key={m} 
                    onClick={() => { setSessionDuration(m); setTimeLeft(m * 60); }}
                    className={`p-4 rounded-2xl font-bold transition-all ios-tap ${sessionDuration === m ? 'bg-white text-black' : 'glass-ios text-white/40'}`}
                  >
                    {m}m
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-2">
             <p className="text-[10px] font-black uppercase text-ios-gray tracking-widest ml-1">Environment Skin</p>
             <div className="grid grid-cols-2 gap-2">
                {MARKET_ITEMS.filter(i => i.type === 'skin' && (i.owned || inventory.includes(i.id))).map(skin => (
                  <button 
                    key={skin.id}
                    onClick={() => onSkinChange(skin.id)}
                    className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ios-tap ${activeSkin === skin.id ? 'border-ios-blue bg-ios-blue/10 text-white' : 'border-white/5 glass-ios text-white/40'}`}
                  >
                    <Layout size={16} />
                    <span className="text-[10px] font-black truncate uppercase">{skin.name}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>

        <button 
          onClick={handleStart}
          disabled={!task}
          className="ios-btn-primary w-full py-5 text-lg font-black uppercase tracking-widest mt-4 disabled:opacity-10 ios-tap"
        >
          Initialize Focus
        </button>
      </div>
    );
  }

  if (mode === 'combat') {
    return (
      <div className="h-full flex flex-col items-center justify-between py-10 animate-spring">
        <div className="text-center px-6">
          <p className="text-ios-blue font-black uppercase tracking-[0.3em] text-[10px] mb-2 animate-pulse">Neural Sync Active</p>
          <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{task}</h3>
        </div>

        <div className="relative w-80 h-80 flex items-center justify-center">
           <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle cx="50%" cy="50%" r="44%" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
             <circle 
               cx="50%" cy="50%" r="44%" 
               fill="transparent" 
               stroke={isActive ? "#007AFF" : "#8E8E93"} 
               strokeWidth="6"
               strokeDasharray="276" 
               strokeDashoffset={276 - (276 * progress) / 100} 
               strokeLinecap="round"
               className="transition-all duration-1000 ease-linear shadow-[0_0_20px_#007AFF]"
             />
           </svg>
           <div className="flex flex-col items-center">
              <span className="text-7xl font-light tracking-tighter tabular-nums text-white">{formatTime(timeLeft)}</span>
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-ios-gray mt-4">{isActive ? 'Flow State' : 'Protocol Halted'}</span>
           </div>
        </div>

        <div className="flex items-center gap-8">
           <button onClick={handleManualExit} className="w-16 h-16 glass-ios rounded-full flex items-center justify-center text-ios-red ios-tap shadow-xl"><XCircle size={32} /></button>
           <button onClick={() => setIsActive(!isActive)} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ios-tap ${isActive ? 'glass-ios text-ios-orange' : 'bg-white text-black'}`}>
              {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
           </button>
           <button className="w-16 h-16 glass-ios rounded-full flex items-center justify-center text-ios-blue ios-tap shadow-xl"><Volume2 size={30} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-spring py-20">
       <div className="w-24 h-24 bg-ios-green/10 border border-ios-green/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(52,199,89,0.3)]">
          <ShieldCheck size={48} className="text-ios-green" />
       </div>
       <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Mission Clear</h2>
       <p className="text-ios-gray mb-12 text-sm max-w-[240px]">Strategic focus maintained. Neural experience points successfully calculated.</p>
       <button 
         onClick={() => onComplete(sessionDuration * 12, sessionDuration)}
         className="ios-btn-primary w-full py-5 text-xl font-black uppercase tracking-[0.2em] ios-tap"
       >
         Extract Rewards
       </button>
    </div>
  );
};
