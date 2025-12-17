
import React, { useState, useEffect, useMemo } from 'react';
import { UserStats, ActiveSession, ActiveDuel } from '../types';
import { GlassCard } from './ui/GlassCard';
import { Zap, Shield, Target, Flame, Brain, Swords, Radio, Headphones, Timer, Box, TrendingUp, HeartPulse } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

interface DashboardProps {
  stats: UserStats;
  activeSession: ActiveSession | null;
  activeDuel?: ActiveDuel | null;
  onStartBattle: () => void;
  onNavigate: (view: string) => void;
  onOpenSoundscape: () => void;
  onDailyClaim: () => void;
}

const NewsTicker = () => {
  return (
    <div className="w-full bg-black/40 border-y border-cyber-neonBlue/20 overflow-hidden py-1 mb-4 relative group">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-cyber-black to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-cyber-black to-transparent z-10" />
      <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused]">
        {[
          "SYSTEM ALERT: Market prices stable. Mining efficiency at 100%.",
          "USER 'CyberWolf' just achieved 'Neural Master' Rank",
          "REMINDER: Daily Supply Drops reset at 00:00 UTC",
          "NEW BOSS: 'Calculus Titan' spotted in the Challenge Arena"
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 mx-6 text-xs font-mono text-cyber-neonBlue/70">
            <Radio size={10} className="animate-pulse" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

const FocusForecast = ({ stats }: { stats: UserStats }) => {
  
  const { data, peakTime, averageFocus } = useMemo(() => {
    const baseRhythm: Record<number, number> = {
      6: 45,  
      8: 70,  
      10: 95, 
      12: 80, 
      14: 65, 
      16: 75, 
      18: 85, 
      20: 70, 
      22: 50  
    };

    const energyFactor = Math.max(0.5, stats.energy / 100); 
    const streakBonus = Math.min(stats.streak, 20) * 0.5; 

    let moodModifier = 0;
    if (stats.mood === 'flow') moodModifier = 10;
    else if (stats.mood === 'fatigue') moodModifier = -15;

    const hours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
    let maxVal = 0;
    let maxTime = "";
    let totalScore = 0;

    const points = hours.map(hour => {
      const base = baseRhythm[hour] || 50;
      let predicted = (base * energyFactor) + moodModifier + streakBonus;
      const daySeed = new Date().getDate(); 
      const noise = ((daySeed * hour) % 10) - 5; 
      predicted += noise;
      const finalValue = Math.min(100, Math.max(10, Math.floor(predicted)));
      if (finalValue > maxVal) {
        maxVal = finalValue;
        maxTime = `${hour.toString().padStart(2, '0')}:00`;
      }
      totalScore += finalValue;
      return {
        time: `${hour}:00`,
        focus: finalValue
      };
    });

    return { 
      data: points, 
      peakTime: maxTime, 
      averageFocus: Math.round(totalScore / hours.length) 
    };

  }, [stats]); 

  return (
    <GlassCard className="relative overflow-hidden border-cyber-neonPurple/20 h-full flex flex-col">
       <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
             <TrendingUp className="text-cyber-neonPurple" size={18} />
             <h3 className="text-sm font-bold uppercase tracking-widest text-white">Neural Forecast</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-cyber-neonPurple/10 text-cyber-neonPurple rounded border border-cyber-neonPurple/20 flex items-center gap-1">
             <Brain size={10} /> AI GENERATED
          </span>
       </div>
       
       <div className="flex-1 min-h-[120px] w-full relative">
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={data}>
             <defs>
               <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.8}/>
                 <stop offset="95%" stopColor="#bc13fe" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <XAxis 
               dataKey="time" 
               axisLine={false} 
               tickLine={false} 
               tick={{fontSize: 10, fill: '#666'}} 
               interval={1}
             />
             <Tooltip 
               contentStyle={{ backgroundColor: '#050505', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }} 
               itemStyle={{ color: '#bc13fe' }}
               formatter={(value: number) => [`${value}% Capacity`, 'Focus']}
             />
             <Area 
                type="monotone" 
                dataKey="focus" 
                stroke="#bc13fe" 
                fillOpacity={1} 
                fill="url(#colorFocus)" 
                strokeWidth={2} 
                animationDuration={2000}
             />
           </AreaChart>
         </ResponsiveContainer>
       </div>
       
       <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/5">
          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-widest">Daily Average</div>
            <div className="text-lg font-mono text-white font-bold">{averageFocus}%</div>
          </div>
          <div className="text-right">
             <div className="text-[9px] text-cyber-neonPurple uppercase tracking-widest animate-pulse">Predicted Peak</div>
             <div className="text-lg font-mono text-cyber-neonPurple font-bold">{peakTime}</div>
          </div>
       </div>
    </GlassCard>
  );
};

const StreakReactor = ({ streak }: { streak: number }) => {
  let stage = 'SPARK';
  let colorClass = 'text-cyan-400';
  let borderClass = 'border-cyan-400';
  let bgGlow = 'bg-cyan-500/20';
  let multiplier = 1.0;
  
  if (streak >= 15) {
      stage = 'NOVA';
      colorClass = 'text-yellow-400';
      borderClass = 'border-yellow-400';
      bgGlow = 'bg-yellow-500/20';
      multiplier = 2.0;
  } else if (streak >= 8) {
      stage = 'SURGE';
      colorClass = 'text-purple-500';
      borderClass = 'border-purple-500';
      bgGlow = 'bg-purple-500/20';
      multiplier = 1.5;
  } else if (streak >= 4) {
      stage = 'FLUX';
      colorClass = 'text-green-400';
      borderClass = 'border-green-400';
      bgGlow = 'bg-green-500/20';
      multiplier = 1.25;
  }

  const history = Array(14).fill(0).map((_, i) => {
     return i >= 14 - streak ? 1 : 0;
  });

  return (
    <GlassCard className={`relative overflow-hidden group hover:border-opacity-100 border-opacity-40 transition-all duration-500 ${borderClass} h-full flex flex-col justify-between`}>
       <div className={`absolute inset-0 ${bgGlow} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
       <div className="flex justify-between items-start relative z-10">
          <div>
             <h3 className={`text-sm font-bold uppercase tracking-widest ${colorClass} flex items-center gap-2`}>
                <Flame size={14} className={streak > 0 ? 'fill-current animate-pulse' : ''} />
                Neural Chain
             </h3>
             <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                CLASS: <span className="text-white">{stage}</span>
             </div>
          </div>
          <div className="bg-black/40 border border-white/10 px-2 py-1 rounded text-xs font-mono font-bold text-white">
             {multiplier}x XP
          </div>
       </div>
       <div className="relative h-24 flex items-center justify-center my-2">
          <div className={`absolute w-16 h-16 rounded-full border-2 border-dashed ${borderClass} opacity-30 animate-spin-slow`} />
          <div className={`absolute w-12 h-12 rounded-full border border-dotted ${colorClass} opacity-60 animate-[spin_3s_linear_infinite_reverse]`} />
          <div className="relative z-10 flex flex-col items-center">
             <span className={`text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}>
                {streak}
             </span>
             <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400">Days</span>
          </div>
          {streak > 3 && (
             <div className={`absolute inset-0 rounded-full blur-md opacity-50 animate-pulse ${bgGlow.replace('/20', '/50')}`} />
          )}
       </div>
       <div className="relative z-10">
          <div className="flex justify-between text-[9px] text-gray-600 mb-1 font-mono uppercase">
             <span>History</span>
             <span>Sync Status: 100%</span>
          </div>
          <div className="flex gap-1 h-2">
             {history.map((active, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-sm transition-all duration-500 ${active ? colorClass.replace('text-', 'bg-') : 'bg-white/5'} ${active && i === 13 ? 'animate-pulse' : ''}`} 
                />
             ))}
          </div>
       </div>
    </GlassCard>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, activeSession, activeDuel, onStartBattle, onNavigate, onOpenSoundscape, onDailyClaim }) => {
  
  const xpData = [
    { name: 'Completed', value: stats.xp },
    { name: 'Remaining', value: stats.xpToNextLevel - stats.xp }
  ];
  const COLORS = ['#00f3ff', '#1f1f2e'];

  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!activeSession) return;
    const update = () => {
      const elapsed = (Date.now() - activeSession.startTime) / 1000;
      const total = activeSession.durationMinutes * 60;
      const remaining = Math.max(0, total - elapsed);
      const m = Math.floor(remaining / 60);
      const s = Math.floor(remaining % 60);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const isDailyClaimAvailable = (Date.now() - (stats.lastDailyClaim || 0)) > 86400000;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-24">
      <NewsTicker />

      {activeSession && (
        <div className="animate-in slide-in-from-top-4" onClick={() => onNavigate('BATTLE')}>
          <GlassCard className="border-l-4 border-l-green-500 bg-green-500/10 cursor-pointer hover:bg-green-500/20 group relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-10">
                <Target size={80} className="text-green-500 animate-spin-slow" />
             </div>
             <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center">
                         <Timer className="text-green-500 animate-pulse" />
                      </div>
                      <div className="absolute inset-0 border-2 border-dashed border-green-400 rounded-full animate-spin-slow" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        Battle Active
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      </h3>
                      <p className="text-green-400 font-mono text-sm">{activeSession.taskName}</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-3xl font-mono font-bold text-white">{timeLeft}</div>
                   <div className="text-[10px] text-gray-400 uppercase">Tap to Resume</div>
                </div>
             </div>
          </GlassCard>
        </div>
      )}

      {activeDuel && (
        <div className="animate-in slide-in-from-top-4" onClick={() => onNavigate('DUEL')}>
          <GlassCard className="border-l-4 border-l-red-500 bg-red-900/10 cursor-pointer hover:bg-red-900/20 group relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-10">
                <Swords size={80} className="text-red-500 animate-pulse" />
             </div>
             <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center">
                         <Swords className="text-red-500" />
                      </div>
                      <div className="absolute inset-0 border-2 border-dotted border-red-400 rounded-full animate-[spin_5s_linear_infinite]" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        Duel in Progress
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                      </h3>
                      <p className="text-red-400 font-mono text-sm">VS {activeDuel.rivalName}</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-xl font-mono font-bold text-white">{Math.floor(activeDuel.myHP)}% HP</div>
                   <div className="text-[10px] text-gray-400 uppercase">Tap to Re-engage</div>
                </div>
             </div>
          </GlassCard>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard 
          onClick={() => onNavigate('PROFILE')} 
          hoverEffect={true} 
          className="md:col-span-3 border-l-4 border-l-cyber-neonBlue relative overflow-hidden cursor-pointer group"
        >
          <div className="absolute right-0 top-0 p-4 opacity-50">
             <Brain className="w-32 h-32 text-white/5" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-cyber-neonBlue mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-bold">Operator Status</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white neon-text group-hover:text-cyber-neonBlue transition-colors">{stats.rank}</h1>
              <p className="text-gray-400 font-mono text-sm">Level {stats.level} // XP Sync: {Math.round((stats.xp / stats.xpToNextLevel) * 100)}%</p>
            </div>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-cyber-neonBlue/20 rounded-full animate-spin-slow border-t-cyber-neonBlue border-r-transparent group-hover:border-cyber-neonGreen transition-colors z-10" />
              <div className="absolute inset-2 border-2 border-cyber-neonPurple/20 rounded-full animate-[spin_8s_linear_infinite_reverse] border-b-cyber-neonPurple border-l-transparent z-10" />
               <div className="absolute inset-0 z-0 opacity-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={xpData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={44}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        {xpData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="absolute inset-0 flex items-center justify-center z-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyber-neonBlue/50 shadow-[0_0_15px_rgba(0,243,255,0.3)] flex items-center justify-center bg-black/40">
                     <Brain size={32} className="text-cyber-neonBlue" />
                  </div>
               </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div 
        onClick={() => onNavigate('DUEL')} 
        className="relative group cursor-pointer w-full transform hover:scale-[1.01] transition-transform duration-200"
      >
         <div className="relative rounded-2xl bg-black border border-cyber-neonBlue/50 p-6 md:p-8 flex items-center justify-between overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.1)] group-hover:shadow-[0_0_50px_rgba(0,243,255,0.3)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
            <div className="relative z-10 flex items-center gap-6">
                <div className="w-20 h-20 bg-cyber-neonBlue/10 border-2 border-cyber-neonBlue rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                   <Swords size={40} className="text-cyber-neonBlue" />
                </div>
                <div>
                   <h2 className="text-3xl md:text-4xl font-bold italic tracking-tighter text-white mb-1 neon-text">
                      FOCUS DUEL
                   </h2>
                   <div className="flex items-center gap-2">
                      <span className="bg-red-500/20 border border-red-500 text-red-400 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wide animate-pulse">
                         PvP LIVE
                      </span>
                      <span className="text-xs font-mono text-cyber-neonBlue">Challenge a Rival</span>
                   </div>
                </div>
            </div>
            <div className="hidden md:flex items-center justify-center bg-cyber-neonBlue text-black w-12 h-12 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] group-hover:scale-110 transition-transform">
               <Zap size={24} fill="currentColor" />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard 
           onClick={isDailyClaimAvailable ? onDailyClaim : undefined} 
           className={`flex flex-col items-center justify-center py-4 group border border-yellow-500/30 ${isDailyClaimAvailable ? 'cursor-pointer hover:bg-yellow-900/10' : 'opacity-50 cursor-not-allowed'}`}
        >
          <div className="relative">
             <Box className={`w-8 h-8 mb-2 transition-transform ${isDailyClaimAvailable ? 'text-yellow-500 group-hover:-translate-y-1' : 'text-gray-500'}`} />
             {isDailyClaimAvailable && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />}
          </div>
          <span className={`text-sm font-bold uppercase tracking-wider ${isDailyClaimAvailable ? 'text-yellow-500' : 'text-gray-500'}`}>
            {isDailyClaimAvailable ? "Supply Drop" : "Resupplying..."}
          </span>
        </GlassCard>

        {/* Bio Sync Card */}
        <GlassCard onClick={() => onNavigate('HEALTH')} className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-green-500/10 group border-green-500/30">
          <div className="relative">
             <HeartPulse className="text-green-500 w-8 h-8 mb-2 group-hover:scale-110 transition-transform animate-pulse" />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-green-400">Bio Sync</span>
        </GlassCard>

        <GlassCard onClick={onOpenSoundscape} className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-white/5 group">
          <div className="relative">
             <Headphones className="text-cyber-neonBlue w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
             <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-gray-300">Soundscape</span>
        </GlassCard>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
         <div className="md:col-span-2">
            <StreakReactor streak={stats.streak} />
         </div>
         <div className="md:col-span-2 space-y-4">
            <FocusForecast stats={stats} />
         </div>
      </div>
    </div>
  );
};
