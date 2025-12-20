
import React from 'react';
import { UserStats, ActiveSession, ActiveDuel, AuthUser } from '../types';
import { GlassCard } from './ui/GlassCard';
import { 
  Flame, Swords, Headphones, Box, HeartPulse, 
  Activity, Cpu, Battery, Wifi, BarChart3, Clock, ChevronRight, Target
} from 'lucide-react';
import { calculatePerformanceScore, getPerformanceTier } from '../constants';

interface DashboardProps {
  stats: UserStats;
  authUser: AuthUser | null;
  activeSession: ActiveSession | null;
  activeDuel?: ActiveDuel | null;
  onStartBattle: () => void;
  onNavigate: (view: string) => void;
  onOpenSoundscape: () => void;
  onDailyClaim: () => void;
}

const ActivityTicker = ({ stats }: { stats: UserStats }) => {
  const messages = [
    `OPERATOR STATUS: ${stats.rank.toUpperCase()}`,
    `NEURAL CHAIN: ${stats.streak} DAYS ACTIVE`,
    `LEVEL ${stats.level} CLEARANCE GRANTED`,
    `CREDITS MINED: ${stats.credits} CR`,
    `FOCUS LOAD: ${Math.floor(stats.focusTimeMinutes / 60)}H ${stats.focusTimeMinutes % 60}M`,
    "LINK INTEGRITY: 99.9%"
  ];

  return (
    <div className="w-full bg-black/60 border-y border-cyber-neonBlue/30 overflow-hidden py-1.5 mb-6 relative">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cyber-black to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cyber-black to-transparent z-10" />
      <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
        {messages.concat(messages).map((item, i) => (
          <div key={i} className="flex items-center gap-3 mx-8 text-[10px] font-mono text-cyber-neonBlue uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 bg-cyber-neonBlue rounded-full animate-pulse" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

const VitalsScanner = ({ stats }: { stats: UserStats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <div className="bg-black/40 border border-white/5 p-3 rounded-xl relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-1 h-full bg-cyber-neonBlue/50" />
         <div className="flex justify-between items-start mb-2">
            <Battery size={14} className="text-cyber-neonBlue" />
            <span className="text-[10px] font-mono text-gray-500 uppercase">Energy</span>
         </div>
         <div className="text-xl font-bold text-white font-mono">{stats.energy}%</div>
         <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${stats.energy > 30 ? 'bg-cyber-neonBlue' : 'bg-red-500 animate-pulse'}`} style={{ width: `${stats.energy}%` }} />
         </div>
      </div>
      <div className="bg-black/40 border border-white/5 p-3 rounded-xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-cyber-neonPurple/50" />
         <div className="flex justify-between items-start mb-2">
            <HeartPulse size={14} className="text-cyber-neonPurple" />
            <span className="text-[10px] font-mono text-gray-500 uppercase">Bio Load</span>
         </div>
         <div className="text-lg font-bold text-white font-mono truncate uppercase">
            {stats.mood === 'focus' ? 'STABLE' : stats.mood === 'flow' ? 'OPTIMAL' : 'FATIGUED'}
         </div>
         <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= (stats.mood === 'focus' ? 3 : stats.mood === 'flow' ? 5 : 1) ? 'bg-cyber-neonPurple' : 'bg-gray-800'}`} />
            ))}
         </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, authUser, activeSession, activeDuel, 
  onStartBattle, onNavigate, onOpenSoundscape, onDailyClaim 
}) => {
  const xpPercentage = (stats.xp / stats.xpToNextLevel) * 100;
  const isDailyClaimAvailable = (Date.now() - (stats.lastDailyClaim || 0)) > 86400000;
  
  // REAL-TIME PERFORMANCE CALCULATION
  const perfScore = calculatePerformanceScore(stats);
  const perfTier = getPerformanceTier(perfScore);
  
  // Progress to next tier
  const scoreInCurrentRange = perfScore - perfTier.minScore;
  const rangeTotal = (perfTier.next?.minScore || perfScore) - perfTier.minScore;
  const tierProgress = rangeTotal > 0 ? (scoreInCurrentRange / rangeTotal) * 100 : 100;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-700">
      <ActivityTicker stats={stats} />

      <div className="flex justify-between items-end px-2">
        <div className="animate-in slide-in-from-left duration-500">
          <div className="flex items-center gap-2 mb-1">
             <Wifi size={12} className="text-cyber-neonBlue animate-pulse" />
             <span className="text-[9px] font-mono text-cyber-neonBlue uppercase tracking-[0.4em]">Neural Uplink Secure</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            <span className="text-gray-500 mr-1">/</span>{authUser?.name?.split(' ')[0] || 'OPERATOR'}
          </h2>
        </div>
        <div className="text-right animate-in slide-in-from-right duration-500">
           <div className="text-[10px] font-mono text-gray-500 uppercase mb-1">Sector</div>
           <div className="text-xs font-bold text-cyber-neonPurple bg-cyber-neonPurple/10 px-2 py-0.5 rounded border border-cyber-neonPurple/20 uppercase tracking-widest">
             {authUser?.classGrade || 'Class 12'}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard onClick={() => onNavigate('PROFILE')} className="lg:col-span-2 border-cyber-neonBlue/20 bg-gradient-to-br from-cyber-neonBlue/10 to-transparent overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Cpu size={150} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative w-36 h-36 shrink-0">
               <svg className="absolute inset-0 w-full h-full -rotate-90 scale-110">
                 <circle cx="50%" cy="50%" r="44%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                 <circle cx="50%" cy="50%" r="44%" fill="none" stroke="#00f3ff" strokeWidth="4" strokeDasharray="251" strokeDashoffset={251 - (251 * xpPercentage) / 100} strokeLinecap="round" className="transition-all duration-1000 shadow-[0_0_15px_#00f3ff]" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[8px] text-cyber-neonBlue font-mono uppercase tracking-tighter">Clearance</span>
                  <span className="text-5xl font-black text-white">{stats.level}</span>
                  <span className="text-[9px] text-gray-500 font-mono mt-1">{stats.xp} XP</span>
               </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
               <div className="text-center md:text-left">
                  <h3 className="text-[10px] font-mono text-cyber-neonBlue uppercase tracking-[0.4em] mb-1">Assigned Rank</h3>
                  <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase neon-text group-hover:scale-105 transition-transform duration-500 truncate">
                    {stats.rank}
                  </h1>
               </div>
               <VitalsScanner stats={stats} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-cyber-neonPurple/20 bg-cyber-neonPurple/5 flex flex-col justify-between group">
           <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-[10px] font-mono text-cyber-neonPurple uppercase tracking-widest mb-1">Neural Chain</h3>
                 <div className="text-4xl font-black text-white font-mono">{stats.streak}D</div>
              </div>
              <div className={`p-2 rounded-lg bg-cyber-neonPurple/10 border border-cyber-neonPurple/30`}>
                <Flame size={20} className="text-cyber-neonPurple group-hover:scale-125 transition-transform duration-300" />
              </div>
           </div>
           
           <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[9px] uppercase font-mono text-gray-500">
                 <span>Protocol Status</span>
                 <span className="text-cyber-neonPurple">{Math.min(100, Math.floor((stats.streak / 30) * 100))}%</span>
              </div>
              <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-cyber-neonPurple animate-scanline" style={{ width: `${Math.min(100, (stats.streak / 30) * 100)}%` }} />
              </div>
           </div>
        </GlassCard>
      </div>

      {/* FOCUS DUEL ENTRY - REAL TIME INTEGRATION */}
      <div 
        onClick={() => onNavigate('DUEL')} 
        className="group relative cursor-pointer overflow-hidden rounded-2xl p-8 border border-cyber-neonBlue/40 bg-black shadow-[0_0_30px_rgba(0,243,255,0.15)] transition-all hover:scale-[1.01] hover:shadow-[0_0_50px_rgba(0,243,255,0.25)]"
      >
        <div className="absolute inset-0 bg-cyber-neonBlue/5 group-hover:bg-cyber-neonBlue/10 transition-colors" />
        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <Swords size={200} className="text-cyber-neonBlue" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-cyber-neonBlue/20 border-2 border-cyber-neonBlue rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                 <Swords size={32} className="text-cyber-neonBlue" />
              </div>
              <div>
                 <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase group-hover:neon-text transition-all">Focus Duel</h2>
                 <p className="text-xs text-cyber-neonBlue font-mono uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {activeDuel ? 'ACTIVE COMBAT LOG DETECTED' : 'PVP MATCHMAKING READY'}
                 </p>
              </div>
           </div>
           <button className="px-8 py-3 bg-cyber-neonBlue text-black font-black uppercase tracking-widest rounded-xl group-hover:scale-110 transition-all shadow-xl flex items-center gap-2">
              {activeDuel ? 'RESUME COMBAT' : 'INITIATE SYNC'} <ChevronRight size={18} />
           </button>
        </div>
      </div>

      {/* GRID MENU */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'DAILY', label: 'Supply Drop', icon: Box, color: 'text-yellow-500', bg: 'border-yellow-500/20 bg-yellow-500/5', action: onDailyClaim, active: isDailyClaimAvailable },
          { id: 'HEALTH', label: 'Bio Sync', icon: Activity, color: 'text-green-500', bg: 'border-green-500/20 bg-green-500/5', action: () => onNavigate('HEALTH'), active: true },
          { id: 'SOUND', label: 'Soundscape', icon: Headphones, color: 'text-cyber-neonBlue', bg: 'border-cyber-neonBlue/20 bg-cyber-neonBlue/5', action: onOpenSoundscape, active: true },
          { id: 'RANK', label: 'Leaderboard', icon: Target, color: 'text-cyber-neonPurple', bg: 'border-cyber-neonPurple/20 bg-cyber-neonPurple/5', action: () => onNavigate('LEADERBOARD'), active: true }
        ].map((item) => (
          <div key={item.id} onClick={item.active ? item.action : undefined} className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 group ${item.bg} ${item.active ? 'cursor-pointer hover:scale-105 hover:bg-white/5' : 'opacity-40 grayscale cursor-not-allowed'}`}>
            <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform duration-500`} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white text-center">{item.label}</span>
            {item.id === 'DAILY' && item.active && <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-ping shadow-[0_0_10px_#eab308]" />}
          </div>
        ))}
      </div>

      {/* PERFORMANCE RATING - REAL TIME HUD (Now Full Width) */}
      <div className="w-full">
         <GlassCard className="border-cyber-neonBlue/20 bg-black/40 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-cyber-neonBlue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="absolute top-0 right-0 p-4 opacity-5"><BarChart3 size={100} /></div>
            
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-2">
                  <Activity className="text-cyber-neonBlue w-4 h-4 animate-pulse" />
                  <h3 className="text-xs font-mono text-cyber-neonBlue uppercase tracking-widest font-bold">Neural Performance</h3>
               </div>
               <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] text-gray-500 font-mono uppercase">Live Data Sync</span>
               </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
               <div>
                  <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Combat Tier</div>
                  <div className={`text-6xl md:text-7xl font-black italic tracking-tighter ${perfTier.color} drop-shadow-[0_0_15px_currentColor]`}>
                    {perfTier.tier}
                    <span className="text-xs md:text-sm font-bold uppercase not-italic opacity-40 ml-4">/ {perfTier.label}</span>
                  </div>
               </div>
               <div className="text-left md:text-right">
                  <div className="text-[9px] text-gray-500 uppercase mb-1">Rating Index</div>
                  <div className="text-4xl md:text-5xl font-mono font-black text-white">{Math.floor(perfScore)}</div>
               </div>
            </div>

            <div className="space-y-3 mt-4">
               <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-white/5 relative">
                  <div className={`h-full transition-all duration-1000 bg-gradient-to-r from-cyber-neonBlue/50 to-cyber-neonBlue shadow-[0_0_15px_#00f3ff]`} style={{ width: `${tierProgress}%` }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-40 animate-[marquee_3s_linear_infinite]" />
               </div>
               <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase tracking-[0.3em]">
                  <span className="flex items-center gap-1"><Clock size={10} /> Tier: {perfTier.tier}</span>
                  {perfTier.next ? (
                    <span className="text-cyber-neonBlue">Next Sync Point: {perfTier.next.tier} ({Math.ceil(perfTier.next.minScore - perfScore)} Points Needed)</span>
                  ) : (
                    <span className="text-yellow-500 animate-pulse font-black tracking-widest">LEGENDARY PROTOCOL SECURED</span>
                  )}
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
};
