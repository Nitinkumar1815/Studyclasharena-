
import React, { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Trophy, Medal, User, Loader2 } from 'lucide-react';
import { dataService } from '../services/dataService';

export const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const data = await dataService.getLeaderboard();
      if (data.length > 0) {
        setLeaders(data);
      } else {
        // Fallback for empty DB
        setLeaders([]);
      }
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-cyber-neonBlue animate-spin" />
        <p className="text-gray-400 font-mono text-sm tracking-widest">SYNCING GLOBAL RANKINGS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white neon-text uppercase tracking-widest">Global Rankings</h2>
        <p className="text-gray-400 mt-2">Compete with scholars across the network.</p>
      </div>

      <div className="space-y-4">
        {leaders.length === 0 && (
           <div className="text-center text-gray-500 font-mono p-8 border border-dashed border-gray-800 rounded-xl">
              No data available in the network. Be the first to rise.
           </div>
        )}

        {leaders.map((user, index) => {
          const isTop3 = index < 3;
          let rankColor = 'text-gray-400';
          if (index === 0) rankColor = 'text-yellow-400';
          if (index === 1) rankColor = 'text-gray-300';
          if (index === 2) rankColor = 'text-amber-600';

          return (
            <GlassCard key={user.id || index} className="flex items-center gap-4 py-4 hover:border-cyber-neonBlue/40">
              <div className={`text-2xl font-bold font-mono w-10 text-center ${rankColor}`}>
                {index + 1}
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                   {user.avatar ? (
                     <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                   ) : (
                     <User className="text-gray-400 w-6 h-6" />
                   )}
                </div>
                {isTop3 && (
                   <div className="absolute -top-2 -right-2 bg-black rounded-full p-0.5">
                     <Medal className={`w-4 h-4 ${rankColor}`} fill="currentColor" />
                   </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-white`}>
                  {user.name}
                </h3>
                <p className="text-xs text-gray-500">Level {user.level} // {user.xp} XP</p>
              </div>
              {index === 0 && <Trophy className="text-yellow-400 w-6 h-6 animate-bounce" />}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
