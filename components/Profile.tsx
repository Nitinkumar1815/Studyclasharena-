
import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { MOCK_BADGES } from '../constants';
import { 
  Share2, Shield, Cpu, Lock, X, Check, Copy, Download,
  Loader2, Smartphone, History, Clock, Zap, Coins
} from 'lucide-react';
import { UserStats, Badge, StudySession } from '../types';
import { dataService } from '../services/dataService';

interface ProfileProps {
  stats: UserStats;
}

export const Profile: React.FC<ProfileProps> = ({ stats }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'generating' | 'copied'>('idle');
  const [preGeneratedBlob, setPreGeneratedBlob] = useState<Blob | null>(null);
  const [sessionHistory, setSessionHistory] = useState<StudySession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch Session History
  useEffect(() => {
    const fetchHistory = async () => {
      // For Demo/Guest, we can't easily fetch history from Supabase without a real ID,
      // but the logic is here for authenticated users.
      // Assuming stats carries userId or we use a hardcoded one for testing.
      const userId = 'guest-operator'; // Hardcoded for this demo environment
      const history = await dataService.getStudySessions(userId);
      setSessionHistory(history);
      setHistoryLoading(false);
    };
    fetchHistory();
  }, []);

  // Reset state when badge changes
  useEffect(() => {
    if (!selectedBadge) {
      setShareStatus('idle');
      setPreGeneratedBlob(null);
    }
  }, [selectedBadge]);

  // Pre-generate image when modal opens for speed
  useEffect(() => {
    if (selectedBadge && !preGeneratedBlob) {
        generateBadgeImage(selectedBadge).then(blob => {
            setPreGeneratedBlob(blob);
        });
    }
  }, [selectedBadge]);

  const getShareText = (badge: Badge) => {
    return `🚀 UNLOCKED: ${badge.name}\nRANK: ${badge.rarity}\nAPP: StudyClash Arena\n\nI just leveled up my focus stats! 🧠⚡`;
  };

  // --- IMAGE GENERATION ENGINE ---
  const generateBadgeImage = async (badge: Badge): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          resolve(null);
          return;
      }

      canvas.width = 1080;
      canvas.height = 1080;

      const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
      gradient.addColorStop(0, '#050505');
      gradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      ctx.strokeStyle = '#bc13fe';
      ctx.lineWidth = 20;
      ctx.strokeRect(40, 40, 1000, 1000);
      
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 50;
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 5;
      ctx.strokeRect(60, 60, 960, 960);
      ctx.shadowBlur = 0; 

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('ACHIEVEMENT UNLOCKED', 540, 150);

      ctx.font = '300px serif';
      ctx.shadowColor = badge.rarity === 'Legendary' ? '#eab308' : '#bc13fe';
      ctx.shadowBlur = 100;
      ctx.fillText(badge.image, 540, 500);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#00f3ff';
      ctx.font = 'bold 80px Arial';
      ctx.fillText(badge.name.toUpperCase(), 540, 700);

      ctx.fillStyle = badge.rarity === 'Legendary' ? '#eab308' : badge.rarity === 'Rare' ? '#00f3ff' : '#9ca3af';
      ctx.font = 'bold 50px Courier New';
      ctx.fillText(`[ RANK: ${badge.rarity.toUpperCase()} ]`, 540, 800);

      ctx.fillStyle = '#ffffff';
      ctx.font = '40px Arial';
      ctx.fillText('StudyClash Arena', 540, 960);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '30px Courier New';
      ctx.fillText('Gamify Your Study Routine', 540, 1010);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  const copyToClipboard = async (blob: Blob, text: string) => {
    try {
        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob,
                'text/plain': new Blob([text], { type: 'text/plain' })
            })
        ]);
    } catch (e) {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
        } catch(err) {
            console.error("Copy failed", err);
        }
    }
  };

  const handleUnifiedShare = async () => {
    if (!selectedBadge) return;
    setShareStatus('generating');
    
    try {
      const blob = preGeneratedBlob || await generateBadgeImage(selectedBadge);
      if (!blob) throw new Error("Image generation failed");
      
      const file = new File([blob], `studyclash_${selectedBadge.id}.png`, { type: 'image/png' });
      const text = getShareText(selectedBadge);

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
         try {
           await navigator.share({
             files: [file],
             title: 'Achievement Unlocked',
             text: text
           });
           setShareStatus('idle');
           return; 
         } catch (e) {
           console.log("Native share cancelled/failed, using fallback");
         }
      }

      await copyToClipboard(blob, text);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studyclash_${selectedBadge.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 4000);

    } catch (err) {
      console.error(err);
      setShareStatus('idle');
      alert("Sharing failed. Please try again.");
    }
  };

  const unlockedCount = stats.unlockedBadgeIds ? stats.unlockedBadgeIds.length : 0;
  const totalBadges = MOCK_BADGES.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div className="pb-24 animate-in slide-in-from-right duration-500 space-y-12 relative">
      
      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in duration-200" onClick={() => setSelectedBadge(null)}>
           <GlassCard 
              className="w-full max-w-sm relative border-cyber-neonPurple/50 shadow-[0_0_50px_rgba(188,19,254,0.3)] bg-gray-900"
              onClick={(e) => e.stopPropagation()}
           >
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center space-y-4 pt-4">
                 <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(188,19,254,0.5)] animate-float">
                    {selectedBadge.image}
                 </div>
                 
                 <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">{selectedBadge.name}</h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase mt-2 inline-block ${
                       selectedBadge.rarity === 'Legendary' ? 'border-yellow-500 text-yellow-500' :
                       selectedBadge.rarity === 'Artifact' ? 'border-red-500 text-red-500' :
                       selectedBadge.rarity === 'Rare' ? 'border-cyber-neonBlue text-cyber-neonBlue' :
                       'border-gray-500 text-gray-400'
                    }`}>
                       {selectedBadge.rarity}
                    </span>
                 </div>

                 <div className="bg-black/40 p-4 rounded-xl border border-white/10 w-full">
                    <p className="text-gray-300 text-sm mb-2">{selectedBadge.description}</p>
                    <div className="text-[10px] text-gray-500 font-mono border-t border-white/5 pt-2 mt-2">
                       REQ: {selectedBadge.requirement}
                    </div>
                    {selectedBadge.acquiredDate ? (
                       <div className="text-[10px] text-green-500 font-mono mt-1">
                          UNLOCKED: {selectedBadge.acquiredDate}
                       </div>
                    ) : (
                       <div className="text-[10px] text-red-500 font-mono mt-1 flex items-center justify-center gap-1">
                          <Lock size={10} /> STATUS: LOCKED
                       </div>
                    )}
                 </div>

                 {stats.unlockedBadgeIds.includes(selectedBadge.id) && (
                   <div className="w-full space-y-3">
                       <button 
                         onClick={handleUnifiedShare}
                         disabled={shareStatus === 'generating'}
                         className={`w-full py-4 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(188,19,254,0.3)] ${
                             shareStatus === 'copied' 
                             ? 'bg-green-500/20 border border-green-500 text-green-500' 
                             : 'bg-cyber-neonPurple/20 hover:bg-cyber-neonPurple/30 border border-cyber-neonPurple text-cyber-neonPurple'
                         }`}
                       >
                         {shareStatus === 'generating' ? (
                             <>
                                <Loader2 size={18} className="animate-spin" /> GENERATING...
                             </>
                         ) : shareStatus === 'copied' ? (
                             <>
                                <Check size={18} /> SAVED & COPIED
                             </>
                         ) : (
                             <>
                                <Share2 size={18} /> SHARE ACHIEVEMENT
                             </>
                         )}
                       </button>

                       <div className="h-4 text-[10px] font-mono text-gray-400">
                          {shareStatus === 'copied' ? (
                              "Image saved to device & clipboard."
                          ) : (
                              "Tap to share via Instagram, WhatsApp, or System."
                          )}
                       </div>
                   </div>
                 )}
              </div>
           </GlassCard>
        </div>
      )}

      {/* Mastery Section */}
      <div className="relative h-[400px] flex items-center justify-center">
         <div className="absolute bottom-0 w-64 h-24 bg-cyber-neonBlue/10 rounded-[100%] blur-xl transform rotate-x-[60deg]" />
         <div className="relative z-10 w-64 h-64 animate-float group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyber-black to-cyber-panel rounded-2xl border border-cyber-neonBlue/30 transform rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.2)]">
               <div className="absolute inset-2 border border-cyber-neonPurple/20 rounded-xl z-20 pointer-events-none" />
               <div className="w-full h-full transform -rotate-45 flex items-center justify-center relative z-0">
                  <Cpu size={80} className="text-cyber-neonBlue opacity-80 animate-pulse" />
               </div>
               <div className="absolute inset-0 bg-cyber-neonBlue/10 mix-blend-overlay z-10 pointer-events-none" />
            </div>
            <div className="absolute -inset-4 border-2 border-cyber-neonBlue/20 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }} />
            <div className="absolute -inset-8 border border-cyber-neonPurple/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-cyber-black border border-cyber-neonBlue px-4 py-1 rounded-full text-cyber-neonBlue font-bold font-mono shadow-[0_0_20px_rgba(0,243,255,0.4)]">
              LVL {stats.level}
            </div>
         </div>

         <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-2 text-right hidden md:block">
            <div className="bg-black/40 border-r-2 border-cyber-neonGreen p-2 pr-4 backdrop-blur-sm">
               <div className="text-[10px] text-gray-400 uppercase">Focus Accuracy</div>
               <div className="text-xl font-bold text-cyber-neonGreen">98.2%</div>
            </div>
            <div className="bg-black/40 border-r-2 border-yellow-500 p-2 pr-4 backdrop-blur-sm">
               <div className="text-[10px] text-gray-400 uppercase">Total XP</div>
               <div className="text-xl font-bold text-yellow-500">{stats.xp.toLocaleString()}</div>
            </div>
         </div>
      </div>

      <div className="text-center">
         <h1 className="text-3xl font-bold text-white uppercase tracking-widest">{stats.rank}</h1>
         <p className="text-gray-400 text-sm mt-1">Class: Neural Architect</p>
      </div>

      {/* --- BATTLE HISTORY SECTION (NEW) --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="text-cyber-neonBlue" /> Arena Battle History
           </h2>
           <span className="text-[10px] text-gray-500 uppercase font-mono">Archive Data</span>
        </div>

        {historyLoading ? (
           <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-cyber-neonBlue" size={32} />
           </div>
        ) : sessionHistory.length === 0 ? (
           <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl text-gray-500 italic text-sm">
              No battle data recorded yet. Enter the Arena to start logging.
           </div>
        ) : (
           <div className="grid gap-3">
              {sessionHistory.slice(0, 5).map((session) => (
                <GlassCard key={session.id} className="py-3 px-5 flex items-center justify-between border-white/5 bg-black/40 hover:bg-white/5">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-cyber-neonBlue/10 rounded text-cyber-neonBlue">
                         <Zap size={18} />
                      </div>
                      <div>
                         <div className="font-bold text-white text-sm">{session.taskName}</div>
                         <div className="text-[10px] text-gray-500 font-mono uppercase">
                            {new Date(session.timestamp).toLocaleDateString()} @ {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-6 items-center">
                      <div className="text-right">
                         <div className="text-[9px] text-gray-600 uppercase font-bold">Duration</div>
                         <div className="text-xs font-mono text-gray-300 flex items-center gap-1">
                            <Clock size={10} /> {session.durationMinutes}m
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[9px] text-cyber-neonPurple uppercase font-bold">Rewards</div>
                         <div className="text-xs font-mono text-white flex items-center gap-2">
                            <span className="text-cyber-neonPurple">+{session.xpEarned} XP</span>
                            <span className="text-yellow-500">+{session.creditsEarned} CR</span>
                         </div>
                      </div>
                   </div>
                </GlassCard>
              ))}
              {sessionHistory.length > 5 && (
                <div className="text-center">
                   <button className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                      View Full Archive ({sessionHistory.length} sessions)
                   </button>
                </div>
              )}
           </div>
        )}
      </div>

      {/* Achievement Wall */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="text-cyber-neonPurple" /> Achievement Wall
            </h2>
            <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden w-32">
              <div 
                className="h-full bg-cyber-neonPurple transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-500 uppercase text-right">
             {unlockedCount} / {totalBadges} Unlocked<br/>
             <span className="text-cyber-neonPurple">{progressPercent}% COMPLETED</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MOCK_BADGES.map((badge) => {
            const isUnlocked = stats.unlockedBadgeIds?.includes(badge.id);
            
            return (
              <div key={badge.id} onClick={() => setSelectedBadge(badge)} className="group perspective-1000 cursor-pointer">
                <div className="relative h-48 w-full transition-transform duration-500 transform-style-3d group-hover:translate-y-[-5px]">
                  <GlassCard className={`h-full flex flex-col items-center justify-center text-center gap-2 border-white/5 transition-colors relative overflow-hidden ${
                    isUnlocked ? 'group-hover:border-cyber-neonPurple/50' : 'opacity-60 grayscale bg-black/50 border-white/5'
                  }`}>
                     
                     {!isUnlocked && (
                       <div className="absolute top-2 right-2 text-gray-600">
                          <Lock size={16} />
                       </div>
                     )}

                     <div className={`text-4xl filter transition-all duration-500 ${isUnlocked ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'blur-[2px] opacity-30'}`}>
                        {badge.image}
                     </div>
                     
                     <h3 className={`font-bold text-sm mt-2 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                       {isUnlocked ? badge.name : '???'}
                     </h3>
                     
                     {isUnlocked ? (
                       <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${
                         badge.rarity === 'Legendary' ? 'border-yellow-500 text-yellow-500' :
                         badge.rarity === 'Artifact' ? 'border-red-500 text-red-500' :
                         badge.rarity === 'Rare' ? 'border-cyber-neonBlue text-cyber-neonBlue' :
                         'border-gray-500 text-gray-400'
                       }`}>
                         {badge.rarity}
                       </span>
                     ) : (
                       <span className="text-[10px] px-2 py-0.5 rounded border border-gray-700 text-gray-600 uppercase">
                         LOCKED
                       </span>
                     )}
                  </GlassCard>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
