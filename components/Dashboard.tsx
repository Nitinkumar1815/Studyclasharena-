
import React, { useState, useEffect } from 'react';
import { UserStats, ActiveSession, ActiveDuel, AuthUser } from '../types';
import { GlassCard } from './ui/GlassCard';
import { 
  Zap, Shield, Target, Flame, Brain, Swords, Radio, 
  Headphones, Timer, Box, TrendingUp, HeartPulse, 
  User, Activity, Cpu, Battery, Eye, Wifi, BarChart3, Clock
} from 'lucide-react';
import { ResponsiveContainer } from 'recharts';

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
  const [messages] = useState([
    `OPERATOR STATUS: ${stats.rank.toUpperCase()}`,
    `NEURAL CHAIN: ${stats.streak} DAYS ACTIVE`,
    `LEVEL ${stats.level} CLEARANCE GRANTED`,
    `CREDITS MINED: ${stats.credits} CR`,
    "RE-ENTRY LOGS SYNCHRONIZED"
  ]);

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
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-black/40 border border-white/5 p-3 rounded-xl relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-1 h-full bg-cyber-neonBlue/50" />
         <div className="flex justify-between items-start mb-2">
            <Battery size={14} className="text-cyber-neonBlue" />
            <span className="text-[10px] font-mono text-gray-500 uppercase">Core Energy</span>
         </div>
         <div className="text-xl font-bold text-white font-mono">{stats.energy}%</div>
         <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyber-neonBlue transition-all duration-1000" style={{ width: `${stats.energy}%` }} />
         </div>
      </div>
      <div className="bg-black/40 border border-white/5 p-3 rounded-xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-cyber-neonPurple/50" />
         <div className="flex justify-between items-start mb-2">
            <HeartPulse size={14} className="text-cyber-neonPurple" />
            <span className="text-[10px] font-mono text-gray-500 uppercase">Bio Load</span>
         </div>
         <div className="text-xl font-bold text-white font-mono">
            {stats.mood === 'focus' ? 'STABLE' : stats.mood === 'flow' ? 'OPTIMAL' : 'CRITICAL'}
         </div>
         <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= (stats.mood === 'focus' ? 1 : stats.mood === 'flow' ? 3 : 5) ? 'bg-cyber-neonPurple' : 'bg-gray-800'}`} />
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

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-700">
      <ActivityTicker stats={stats} />

      {/* Header Greeting */}
      <div className="flex justify-between items-end px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Wifi size={12} className="text-cyber-neonBlue animate-pulse" />
             <span className="text-[9px] font-mono text-cyber-neonBlue uppercase tracking-[0.4em]">Uplink Active</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            <span className="text-gray-500 mr-2">/</span>{authUser?.name || 'OPERATOR'}
          </h2>
        </div>
        <div className="text-right">
           <div className="text-[10px] font-mono text-gray-500 uppercase mb-1">Assigned Sector</div>
           <div className="text-xs font-bold text-cyber-neonPurple bg-cyber-neonPurple/10 px-2 py-0.5 rounded border border-cyber-neonPurple/20 uppercase tracking-widest">
             {authUser?.classGrade || 'Class 12'}
           </div>
        </div>
      </div>

      {/* Main Neural Core Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard 
          onClick={() => onNavigate('PROFILE')} 
          className="lg:col-span-2 min-h-[220px] border-cyber-neonBlue/20 bg-gradient-to-br from-cyber-neonBlue/10 to-transparent relative overflow-hidden group"
        >
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,243,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative w-40 h-40 shrink-0">
               <div className="absolute inset-0 rounded-full border border-cyber-neonBlue/20 animate-spin-slow" />
               <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyber-neonBlue/40 animate-[spin_10s_linear_infinite_reverse]" />
               
               <svg className="absolute inset-0 w-full h-full -rotate-90 scale-110">
                 <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(0,243,255,0.05)" strokeWidth="4" />
                 <circle 
                   cx="50%" cy="50%" r="42%" 
                   fill="none" 
                   stroke="#00f3ff" 
                   strokeWidth="4" 
                   strokeDasharray="264" 
                   strokeDashoffset={264 - (264 * xpPercentage) / 100}
                   strokeLinecap="round"
                   className="transition-all duration-1000 shadow-[0_0_15px_#00f3ff]"
                 />
               </svg>

               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-cyber-neonBlue font-mono uppercase">Level</span>
                  <span className="text-5xl font-black text-white">{stats.level}</span>
                  <span className="text-[9px] text-gray-500 font-mono mt-1">{stats.xp} / {stats.xpToNextLevel} XP</span>
               </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
               <div>
                  <h3 className="text-xs font-mono text-cyber-neonBlue uppercase tracking-[0.3em] mb-1">Neural Authority</h3>
                  <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase neon-text group-hover:scale-105 transition-transform duration-500">
                    {stats.rank}
                  </h1>
               </div>
               
               <VitalsScanner stats={stats} />
            </div>
          </div>
        </GlassCard>

        {/* Neural Chain Card */}
        <GlassCard className="border-cyber-neonPurple/20 bg-cyber-neonPurple/5 flex flex-col justify-between group">
           <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-[10px] font-mono text-cyber-neonPurple uppercase tracking-widest mb-1">Consistency Streak</h3>
                 <div className="text-4xl font-black text-white font-mono">{stats.streak}D</div>
              </div>
              <Flame size={24} className="text-cyber-neonPurple group-hover:scale-125 transition-transform duration-300" />
           </div>
           
           <div className="space-y-2 mt-6">
              <div className="flex justify-between text-[10px] uppercase font-mono text-gray-500">
                 <span>Mastery Progress</span>
                 <span>{Math.floor(stats.focusTimeMinutes / 60)}H Accumulated</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-cyber-neonPurple animate-scanline" style={{ width: `${Math.min(100, (stats.streak / 30) * 100)}%` }} />
              </div>
              <p className="text-[9px] text-gray-500 leading-tight italic">
                 {stats.streak > 3 ? "STREAK INTEGRITY OPTIMAL." : "NEURAL CHAIN FRAGILE. INITIATE STUDY."}
              </p>
           </div>
        </GlassCard>
      </div>

      {/* Focus Duel Entry */}
      <div 
        onClick={() => onNavigate('DUEL')} 
        className="group relative cursor-pointer overflow-hidden rounded-2xl p-8 border border-cyber-neonBlue/40 bg-black shadow-[0_0_30px_rgba(0,243,255,0.1)] transition-all hover:scale-[1.01] hover:shadow-[0_0_50px_rgba(0,243,255,0.2)]"
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
                    PVP Matching Active
                 </p>
              </div>
           </div>
           <button className="px-8 py-3 bg-cyber-neonBlue text-black font-black uppercase tracking-widest rounded-xl group-hover:scale-110 transition-transform shadow-xl">
              Initiate Combat
           </button>
        </div>
      </div>

      {/* Functional Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'DAILY', label: 'Supply Drop', icon: Box, color: 'text-yellow-500', bg: 'border-yellow-500/20 bg-yellow-500/5', action: onDailyClaim, active: isDailyClaimAvailable },
          { id: 'HEALTH', label: 'Bio Sync', icon: Activity, color: 'text-green-500', bg: 'border-green-500/20 bg-green-500/5', action: () => onNavigate('HEALTH'), active: true },
          { id: 'SOUND', label: 'Soundscape', icon: Headphones, color: 'text-cyber-neonBlue', bg: 'border-cyber-neonBlue/20 bg-cyber-neonBlue/5', action: onOpenSoundscape, active: true },
          { id: 'RANK', label: 'Rankings', icon: Target, color: 'text-cyber-neonPurple', bg: 'border-cyber-neonPurple/20 bg-cyber-neonPurple/5', action: () => onNavigate('LEADERBOARD'), active: true }
        ].map((item) => (
          <div 
            key={item.id}
            onClick={item.active ? item.action : undefined}
            className={`
              relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 group
              ${item.bg} ${item.active ? 'cursor-pointer hover:scale-105 hover:bg-white/5' : 'opacity-40 grayscale cursor-not-allowed'}
            `}
          >
            <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-125 transition-transform duration-500`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors text-center">{item.label}</span>
            {item.id === 'DAILY' && item.active && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-ping" />
            )}
          </div>
        ))}
      </div>

      {/* Real-time Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
         <GlassCard className="border-cyber-neonBlue/20 bg-black/40">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xs font-mono text-cyber-neonBlue uppercase tracking-widest flex items-center gap-2">
                 <BarChart3 size={14} /> Global Performance
               </h3>
               <span className="text-[9px] text-gray-500 font-mono uppercase">Calculated in real-time</span>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[9px] text-gray-500 uppercase">Focus Minutes</div>
                    <div className="text-2xl font-mono font-bold text-white">{stats.focusTimeMinutes}M</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-gray-500 uppercase">Total XP</div>
                    <div className="text-2xl font-mono font-bold text-cyber-neonBlue">{stats.xp}</div>
                  </div>
               </div>
               <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyber-neonBlue to-cyber-neonPurple transition-all duration-1000" style={{ width: `${Math.min(100, (stats.level / 10) * 100)}%` }} />
               </div>
               <p className="text-[10px] text-gray-400 font-mono italic">Sector progress: Level {stats.level} attained.</p>
            </div>
         </GlassCard>

         <GlassCard className="border-cyber-neonPurple/20 bg-black/40">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xs font-mono text-cyber-neonPurple uppercase tracking-widest flex items-center gap-2">
                 <Clock size={14} /> Session Integrity
               </h3>
               <span className="text-[9px] text-gray-500 font-mono uppercase">Live Link Status</span>
            </div>
            <div className="flex items-center justify-between gap-6">
               <div className="flex-1 space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                     <div className="text-[9px] text-gray-500 uppercase mb-1">Current Credits</div>
                     <div className="text-2xl font-mono font-bold text-yellow-500">{stats.credits} CR</div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-green-500 font-mono animate-pulse uppercase">
                    <Wifi size={10} /> Link Status: Synchronized
                  </div>
               </div>
               <div className="w-20 h-20 bg-cyber-neonPurple/10 border border-cyber-neonPurple/30 rounded-full flex items-center justify-center relative">
                  <Activity size={32} className="text-cyber-neonPurple animate-pulse" />
                  <div className="absolute inset-0 border border-cyber-neonPurple rounded-full animate-ping opacity-20" />
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
};
