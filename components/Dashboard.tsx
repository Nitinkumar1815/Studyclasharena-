
import React from 'react';
import { UserStats, ActiveSession, AuthUser, AppView } from '../types';
import { GlassCard } from './ui/GlassCard';
import { 
  Swords, Headphones, HeartPulse, 
  Cpu, Target, Calendar, Trophy, Zap, Box, Flame, Coins as CoinIcon, User as UserIcon
} from 'lucide-react';
import { calculatePerformanceScore, getPerformanceTier } from '../constants';

interface DashboardProps {
  stats: UserStats;
  authUser: AuthUser | null;
  activeSession: ActiveSession | null;
  onStartBattle: () => void;
  onNavigate: (view: string) => void;
  onOpenSoundscape: () => void;
  onDailyClaim: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, authUser, activeSession, 
  onStartBattle, onNavigate, onOpenSoundscape, onDailyClaim 
}) => {
  const xpPercentage = (stats.xp / stats.xpToNextLevel) * 100;
  const perfScore = calculatePerformanceScore(stats);
  const perfTier = getPerformanceTier(perfScore);

  return (
    <div className="space-y-6 animate-spring pb-12">
      <div className="flex justify-between items-center px-1">
        <div>
          <p className="text-[10px] font-black text-ios-gray uppercase tracking-widest mb-1">System Operator</p>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Hi, <span className="text-ios-blue">{authUser?.name?.split(' ')[0] || 'Operator'}</span>
          </h2>
        </div>
        <button onClick={() => onNavigate(AppView.PROFILE)} className="w-12 h-12 rounded-2xl glass-ios flex items-center justify-center p-1 border-white/20 ios-tap">
           <div className="w-full h-full rounded-xl overflow-hidden bg-ios-blue/10 flex items-center justify-center text-ios-blue">
              <UserIcon size={24} />
           </div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 px-1">
        <div className="glass-ios flex items-center gap-3 p-4 rounded-[1.8rem] border-ios-orange/20 ios-tap">
           <div className="w-10 h-10 rounded-xl bg-ios-orange/10 flex items-center justify-center text-ios-orange">
              <Flame size={20} fill="currentColor" />
           </div>
           <div>
              <div className="text-[9px] font-black uppercase text-ios-gray tracking-widest">Streak</div>
              <div className="text-lg font-bold text-white leading-tight">{stats.streak} Days</div>
           </div>
        </div>
        <div className="glass-ios flex items-center gap-3 p-4 rounded-[1.8rem] border-yellow-500/20 ios-tap">
           <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <CoinIcon size={20} fill="currentColor" />
           </div>
           <div>
              <div className="text-[9px] font-black uppercase text-ios-gray tracking-widest">Credits</div>
              <div className="text-lg font-bold text-white leading-tight">{stats.credits} CR</div>
           </div>
        </div>
      </div>

      <GlassCard onClick={() => onNavigate(AppView.PROFILE)} className="p-6 border-white/5">
        <div className="flex justify-between items-start mb-10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1.2rem] bg-ios-blue flex items-center justify-center text-white shadow-xl shadow-ios-blue/20">
                 <Cpu size={24} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-ios-blue uppercase tracking-widest">{stats.rank}</div>
                 <div className="text-xl font-bold text-white">Level {stats.level}</div>
              </div>
           </div>
           <div className="text-right">
              <div className="text-[10px] font-black text-ios-gray uppercase tracking-widest">Rank</div>
              <div className={`text-xl font-black ${perfTier.color} tracking-tighter`}>{perfTier.label}</div>
           </div>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <span>Next Level</span>
              <span>{Math.floor(xpPercentage)}%</span>
           </div>
           <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-ios-blue rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,122,255,0.4)]" 
                style={{ width: `${xpPercentage}%` }} 
              />
           </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 px-1">
        <GlassCard onClick={() => onNavigate(AppView.BATTLE)} className="aspect-square flex flex-col justify-between p-5">
           <div className="w-12 h-12 rounded-[1.5rem] bg-ios-red flex items-center justify-center text-white shadow-xl shadow-ios-red/20">
              <Swords size={24} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-white leading-tight">Focus Arena</h3>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">Combat Study</p>
           </div>
        </GlassCard>

        <GlassCard onClick={() => onNavigate(AppView.DUEL)} className="aspect-square flex flex-col justify-between p-5 border-ios-blue/20">
           <div className="w-12 h-12 rounded-[1.5rem] bg-ios-blue flex items-center justify-center text-white shadow-xl shadow-ios-blue/20">
              <Target size={24} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-white leading-tight">Rival Duel</h3>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">Live Clash</p>
           </div>
        </GlassCard>

        <GlassCard onClick={() => onNavigate(AppView.SCHEDULE)} className="aspect-square flex flex-col justify-between p-5">
           <div className="w-12 h-12 rounded-[1.5rem] bg-ios-purple flex items-center justify-center text-white shadow-xl shadow-ios-purple/20">
              <Calendar size={24} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-white leading-tight">Daily Plan</h3>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">Timeline</p>
           </div>
        </GlassCard>

        <GlassCard onClick={() => onNavigate(AppView.MARKET)} className="aspect-square flex flex-col justify-between p-5">
           <div className="w-12 h-12 rounded-[1.5rem] bg-ios-orange flex items-center justify-center text-white shadow-xl shadow-ios-orange/20">
              <Box size={24} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-white leading-tight">Marketplace</h3>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">Shop Gear</p>
           </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-3 px-1">
         <div onClick={() => onNavigate(AppView.HEALTH)} className="glass-ios flex items-center gap-3 p-4 rounded-[1.5rem] ios-tap">
            <div className="w-10 h-10 rounded-xl bg-ios-green/10 flex items-center justify-center text-ios-green">
               <HeartPulse size={20} />
            </div>
            <span className="text-xs font-bold text-white">Health</span>
         </div>
         
         <div onClick={onOpenSoundscape} className="glass-ios flex items-center gap-3 p-4 rounded-[1.5rem] ios-tap">
            <div className="w-10 h-10 rounded-xl bg-ios-blue/10 flex items-center justify-center text-ios-blue">
               <Headphones size={20} />
            </div>
            <span className="text-xs font-bold text-white">Audio</span>
         </div>
      </div>

      <button onClick={() => onNavigate(AppView.LEADERBOARD)} className="w-full glass-ios p-5 rounded-[2rem] flex items-center justify-between ios-tap">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-ios-blue">
               <Trophy size={20} />
            </div>
            <span className="text-sm font-bold text-white">Global Leaderboard</span>
         </div>
         <Zap size={14} className="text-white/20" />
      </button>
    </div>
  );
};
