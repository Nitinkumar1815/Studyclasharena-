
import React from 'react';
import { Quest } from '../types';
import { GlassCard } from './ui/GlassCard';
import { ScrollText, Trophy, Zap, Clock, CheckCircle2, Circle, ArrowRight, Gift, Swords, Sparkles } from 'lucide-react';

interface QuestsScreenProps {
  quests: Quest[];
  onClaimReward: (questId: string) => void;
  onBack: () => void;
}

export const QuestsScreen: React.FC<QuestsScreenProps> = ({ quests, onClaimReward, onBack }) => {
  const categories = [
    { type: 'daily', label: 'Daily Ops', icon: Zap, color: 'text-cyber-neonBlue' },
    { type: 'challenge', label: 'Boss Raids', icon: Swords, color: 'text-cyber-alert' },
    { type: 'story', label: 'Chronicle', icon: Sparkles, color: 'text-cyber-neonPurple' }
  ];

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'Medium': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'Hard': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'Boss': return 'text-cyber-alert border-cyber-alert/30 bg-cyber-alert/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white neon-text uppercase tracking-widest flex items-center gap-3">
            <ScrollText className="text-cyber-neonBlue" /> Mission Hub
          </h2>
          <p className="text-gray-400 text-sm mt-1 font-mono">Execute directives to optimize rewards.</p>
        </div>
        <button 
          onClick={onBack}
          className="p-2 bg-white/5 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRight className="rotate-180" />
        </button>
      </div>

      <div className="space-y-10">
        {categories.map((cat) => {
          const catQuests = quests.filter(q => q.type === cat.type);
          if (catQuests.length === 0) return null;

          return (
            <div key={cat.type} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                 <cat.icon className={cat.color} size={20} />
                 <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${cat.color}`}>{cat.label}</h3>
              </div>

              <div className="grid gap-4">
                {catQuests.map((quest) => (
                  <GlassCard 
                    key={quest.id} 
                    className={`relative overflow-hidden group border-opacity-30 ${
                      quest.status === 'completed' ? 'border-green-500/50 bg-green-500/5' : 
                      quest.status === 'claimed' ? 'opacity-50 grayscale' : 'border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {quest.status === 'claimed' ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : quest.status === 'completed' ? (
                            <div className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center">
                               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            </div>
                          ) : (
                            <Circle size={16} className="text-gray-600" />
                          )}
                          <h4 className="font-bold text-white tracking-wide">{quest.title}</h4>
                        </div>
                        <p className="text-xs text-gray-400 ml-6">{quest.description}</p>
                      </div>

                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getDifficultyColor(quest.difficulty)}`}>
                        {quest.difficulty}
                      </span>
                    </div>

                    <div className="mt-6 flex justify-between items-end relative z-10">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Reward XP</span>
                          <span className="text-sm font-mono text-cyber-neonPurple font-bold">+{quest.xpReward}</span>
                        </div>
                        <div className="flex flex-col border-l border-white/5 pl-4">
                          <span className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Reward CR</span>
                          <span className="text-sm font-mono text-yellow-500 font-bold">+{quest.creditsReward}</span>
                        </div>
                      </div>

                      {quest.status === 'completed' && (
                        <button 
                          onClick={() => onClaimReward(quest.id)}
                          className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-bounce"
                        >
                          Claim Rewards
                        </button>
                      )}

                      {quest.status === 'claimed' && (
                        <span className="text-[10px] text-green-500 font-mono uppercase font-bold">
                           Sync Complete
                        </span>
                      )}

                      {quest.status === 'active' && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-600 font-mono">
                           <Clock size={10} /> Pending Verification
                        </div>
                      )}
                    </div>
                    
                    {/* Background Detail */}
                    {quest.status === 'completed' && (
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Trophy size={60} className="text-green-500 animate-pulse" />
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
