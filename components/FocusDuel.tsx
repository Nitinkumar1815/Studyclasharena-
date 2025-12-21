
import React, { useState, useEffect } from 'react';
import { Zap, X, Disc, Activity, Bluetooth, User, Cpu, ChevronLeft, Trophy, Skull } from 'lucide-react';
import { ActiveDuel } from '../types';

interface FocusDuelProps {
  onBack: () => void;
  onDuelStart: (duel: ActiveDuel) => void;
  onDuelEnd: (timeSpent: number) => void;
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

const PremiumRadar = () => (
  <div className="relative flex items-center justify-center w-64 h-64">
    <div className="w-4 h-4 bg-ios-blue rounded-full shadow-[0_0_20px_rgba(0,122,255,0.5)] z-10 animate-pulse" />
    <div className="absolute inset-0 border border-white/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
    <div className="absolute inset-0 border border-white/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-1000" />
    <div className="absolute w-full h-full animate-[spin_4s_linear_infinite]">
       <div className="w-full h-1/2 bg-gradient-to-t from-transparent to-ios-blue/10 border-r border-ios-blue/20 blur-sm origin-bottom" />
    </div>
  </div>
);

const EntityModule = ({ name, hp, isUser, avatar }: { name: string, hp: number, isUser?: boolean, avatar?: string }) => {
  const accentColor = isUser ? 'bg-ios-blue' : 'bg-ios-orange';
  const textColor = isUser ? 'text-ios-blue' : 'text-ios-orange';

  return (
    <div className={`relative w-full max-w-sm glass-ios rounded-3xl p-5 border-white/5 animate-spring`}>
       <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 relative">
                {avatar ? <img src={avatar} alt="P" className="w-full h-full object-cover opacity-80" /> : isUser ? <User size={18} /> : <Cpu size={18} />}
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${accentColor}`} />
             </div>
             <div>
                <h3 className="text-white font-bold text-sm tracking-tight">{name}</h3>
                <p className={`text-[9px] uppercase tracking-widest font-black ${textColor}`}>
                   {isUser ? 'Live' : 'Linked'}
                </p>
             </div>
          </div>
          <div className="text-right">
             <div className="text-xl font-bold text-white tabular-nums">{Math.floor(hp)}%</div>
          </div>
       </div>
       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-700 ${accentColor}`} style={{ width: `${hp}%` }} />
       </div>
    </div>
  );
};

export const FocusDuel: React.FC<FocusDuelProps> = ({ onBack, onDuelStart, onDuelEnd, activeDuel }) => {
  const [matchmaking, setMatchmaking] = useState(!activeDuel);
  const [randomRival, setRandomRival] = useState("");

  useEffect(() => {
    if (matchmaking) {
      const timer = setTimeout(() => {
        const name = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
        setRandomRival(name);
        onDuelStart({
          id: Date.now().toString(),
          rivalName: name,
          rivalAvatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name}`,
          myHP: 100,
          rivalHP: 100,
          sessionTime: 0,
          logs: ["Duel initialized."],
          lastSaveTime: Date.now()
        });
        setMatchmaking(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [matchmaking]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (matchmaking) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-spring py-20">
          <PremiumRadar />
          <div className="mt-12">
             <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Matching...</h2>
             <p className="text-ios-gray text-xs font-medium mt-2">Searching Neural Proximity</p>
          </div>
          <button onClick={onBack} className="mt-20 glass-ios px-8 py-3 rounded-2xl text-ios-gray font-black text-[10px] uppercase tracking-widest ios-tap">Cancel Signal</button>
      </div>
    );
  }

  if (!activeDuel) return null;

  const isVictory = activeDuel.rivalHP <= 0;
  const isDefeat = activeDuel.myHP <= 0;

  if (isVictory || isDefeat) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-spring py-20">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-2xl ${isVictory ? 'bg-ios-green/20 text-ios-green' : 'bg-ios-red/20 text-ios-red'}`}>
              {isVictory ? <Trophy size={48} /> : <Skull size={48} />}
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight uppercase italic">{isVictory ? 'Victory' : 'Defeated'}</h1>
          <p className="text-ios-gray mb-12 text-sm max-w-[240px] mx-auto">
            {isVictory ? 'Neural dominance confirmed. Rewards synced to core.' : 'Focus integrity lost. System requires recalibration.'}
          </p>
          <button 
            onClick={() => onDuelEnd(activeDuel.sessionTime)} 
            className="ios-btn-primary w-full py-5 text-lg uppercase tracking-widest font-black"
          >
            Collect Data
          </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2 animate-spring">
        <div className="flex justify-between items-center mb-10">
            <button onClick={onBack} className="w-10 h-10 glass-ios rounded-full flex items-center justify-center text-ios-gray ios-tap">
                <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 bg-ios-red/10 px-5 py-2 rounded-full border border-ios-red/20">
                <div className="w-1.5 h-1.5 bg-ios-red rounded-full animate-pulse shadow-[0_0_8px_#FF3B30]" />
                <span className="text-[10px] font-black text-ios-red tracking-[0.2em] uppercase">Combat Live</span>
            </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-between pb-10">
            <EntityModule name={activeDuel.rivalName} hp={activeDuel.rivalHP} avatar={activeDuel.rivalAvatar} />

            <div className="flex flex-col items-center">
               <div className="relative w-56 h-56 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle cx="50%" cy="50%" r="48%" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                     <circle 
                        cx="50%" cy="50%" r="48%" 
                        fill="transparent" 
                        stroke="#007AFF" 
                        strokeWidth="3"
                        strokeDasharray="300"
                        strokeDashoffset={300 - ((activeDuel.sessionTime % 60) / 60) * 300}
                        className="transition-all duration-1000 ease-linear"
                     />
                  </svg>
                  <div className="text-center">
                     <div className="text-5xl font-light tabular-nums tracking-tighter">{formatTime(activeDuel.sessionTime)}</div>
                     <div className="text-[9px] text-ios-gray uppercase font-black tracking-[0.3em] mt-3">Sync Phase</div>
                  </div>
               </div>
               
               <div className="mt-12 h-20 flex flex-col items-center justify-center">
                  {COMBAT_LOGS.slice(0, 1).map((log, i) => (
                    <div key={i} className="glass-ios px-6 py-3 rounded-2xl flex items-center gap-3 animate-pulse">
                        <Activity size={12} className="text-ios-blue" />
                        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">{log}</span>
                    </div>
                  ))}
               </div>
            </div>

            <EntityModule name="You" hp={activeDuel.myHP} isUser />
        </div>
    </div>
  );
};
