
import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { MOCK_BADGES } from '../constants';
import { 
  Share2, Shield, Cpu, Lock, X, Check, Copy, Download,
  Loader2, Smartphone, History, Clock, Zap, Coins, Fingerprint, Key, AlertCircle, Trophy, Medal
} from 'lucide-react';
import { UserStats, Badge, StudySession } from '../types';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

interface ProfileProps {
  stats: UserStats;
}

export const Profile: React.FC<ProfileProps> = ({ stats }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'generating' | 'copied'>('idle');
  const [sessionHistory, setSessionHistory] = useState<StudySession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // Re-auth State
  const [showReauth, setShowReauth] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthError, setReauthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = stats.id || 'guest-operator';
      const history = await dataService.getStudySessions(userId);
      setSessionHistory(history);
      setHistoryLoading(false);
    };
    fetchHistory();
  }, [stats.id]);

  const handleReauthenticate = async () => {
    if (!reauthPassword) return;
    setReauthLoading(true);
    setReauthError(null);
    
    const res = await authService.reauthenticate(reauthPassword);
    setReauthLoading(false);
    
    if (res.success) {
      setShowReauth(false);
      setReauthPassword("");
      alert("Identity Confirmed. Access Granted.");
    } else {
      setReauthError(res.message);
    }
  };

  const handleUnifiedShare = async () => {
    if (!selectedBadge) return;
    setShareStatus('generating');
    // Simulated share for speed
    setTimeout(() => {
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-500 space-y-10 relative">
      
      {/* Identity Re-authentication Modal */}
      {showReauth && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
           <GlassCard className="w-full max-w-sm border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.2)] bg-zinc-950 p-8">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-red-500/10 border border-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Fingerprint className="text-red-500" size={32} />
                 </div>
                 <h2 className="text-xl font-bold text-white uppercase tracking-tighter italic">Identity Challenge</h2>
                 <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-1">Re-authentication Required</p>
              </div>

              <div className="space-y-4">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                       <Key size={16} />
                    </div>
                    <input 
                       type="password" 
                       placeholder="Operator Password"
                       className="w-full bg-black/60 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white font-mono focus:border-red-500 outline-none transition-all"
                       value={reauthPassword}
                       onChange={(e) => setReauthPassword(e.target.value)}
                       autoFocus
                    />
                 </div>

                 {reauthError && (
                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-mono uppercase bg-red-500/10 p-2 rounded animate-shake">
                       <AlertCircle size={14} /> {reauthError}
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowReauth(false)} className="py-4 bg-white/5 text-gray-500 font-bold uppercase text-xs tracking-widest rounded-xl hover:text-white transition-colors">Abort</button>
                    <button onClick={handleReauthenticate} disabled={reauthLoading || !reauthPassword} className="py-4 bg-red-600 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-red-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]">{reauthLoading ? <Loader2 className="animate-spin" size={16} /> : "Verify Identity"}</button>
                 </div>
              </div>
           </GlassCard>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in zoom-in duration-200" onClick={() => setSelectedBadge(null)}>
           <GlassCard className="w-full max-w-sm relative border-cyber-neonPurple/50 shadow-[0_0_50px_rgba(188,19,254,0.3)] bg-gray-900" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedBadge(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
              <div className="flex flex-col items-center text-center space-y-4 pt-4">
                 <div className="text-7xl filter drop-shadow-[0_0_20px_rgba(188,19,254,0.5)] animate-float mb-4">{selectedBadge.image}</div>
                 <div><h2 className="text-xl font-bold text-white uppercase tracking-widest">{selectedBadge.name}</h2><span className={`text-[10px] px-2 py-0.5 rounded border uppercase mt-2 inline-block ${selectedBadge.rarity === 'Legendary' ? 'border-yellow-500 text-yellow-500' : selectedBadge.rarity === 'Artifact' ? 'border-red-500 text-red-500' : selectedBadge.rarity === 'Rare' ? 'border-cyber-neonBlue text-cyber-neonBlue' : 'border-gray-500 text-gray-400'}`}>{selectedBadge.rarity}</span></div>
                 <div className="bg-black/60 p-5 rounded-2xl border border-white/5 w-full"><p className="text-gray-300 text-sm mb-4 leading-relaxed">{selectedBadge.description}</p><div className="text-[10px] text-gray-500 font-mono border-t border-white/5 pt-3 mt-2 uppercase tracking-widest">Requirement: {selectedBadge.requirement}</div>{stats.unlockedBadgeIds.includes(selectedBadge.id) ? (<div className="text-[10px] text-green-500 font-mono mt-2 flex items-center justify-center gap-1 uppercase tracking-widest"><Check size={12} /> Status: Unlocked</div>) : (<div className="text-[10px] text-red-500 font-mono mt-2 flex items-center justify-center gap-1 uppercase tracking-widest"><Lock size={12} /> Status: Encrypted</div>)}</div>
                 {stats.unlockedBadgeIds.includes(selectedBadge.id) && (<div className="w-full"><button onClick={handleUnifiedShare} className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(188,19,254,0.3)] ${shareStatus === 'copied' ? 'bg-green-500 text-black' : 'bg-cyber-neonPurple text-white'}`}>{shareStatus === 'generating' ? <Loader2 size={18} className="animate-spin" /> : shareStatus === 'copied' ? <Check size={18} /> : <Share2 size={18} />} {shareStatus === 'copied' ? "Copied" : "Share Achievement"}</button></div>)}
              </div>
           </GlassCard>
        </div>
      )}

      {/* Mastery Section */}
      <div className="relative h-[300px] flex items-center justify-center">
         <div className="absolute bottom-0 w-64 h-24 bg-cyber-neonBlue/10 rounded-[100%] blur-3xl transform rotate-x-[60deg]" />
         <div className="relative z-10 w-48 h-48 animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyber-black to-cyber-panel rounded-3xl border border-cyber-neonBlue/30 transform rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.3)]">
               <div className="w-full h-full transform -rotate-45 flex items-center justify-center relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyber-neonBlue/50 bg-black">
                     <img src={stats.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
               </div>
            </div>
            <div className="absolute -inset-6 border-2 border-cyber-neonBlue/20 rounded-full animate-spin-slow" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-cyber-black border border-cyber-neonBlue px-6 py-1 rounded-full text-cyber-neonBlue font-black font-mono shadow-[0_0_25px_rgba(0,243,255,0.5)] uppercase tracking-widest">Lvl {stats.level}</div>
         </div>
      </div>

      <div className="text-center px-4">
         <div className="text-[10px] text-cyber-neonBlue font-mono uppercase tracking-[0.4em] mb-2">Neural Link Identification</div>
         <h1 className="text-3xl font-black text-white uppercase tracking-widest italic">{stats.rank}</h1>
         <p className="text-gray-500 text-xs mt-2 font-mono uppercase">ID: {stats.id.slice(0, 12)}... // OPERATOR READY</p>
         <button onClick={() => setShowReauth(true)} className="mt-6 text-[10px] text-red-500/60 hover:text-red-500 uppercase tracking-[0.2em] font-mono flex items-center justify-center gap-2 mx-auto transition-colors"><Shield size={12}/> Security Override</button>
      </div>

      {/* Achievement Wall */}
      <div className="space-y-6 px-4 md:px-0">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-widest italic"><Medal className="text-cyber-neonPurple" /> Achievement Wall</h2>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{stats.unlockedBadgeIds.length} / {MOCK_BADGES.length} Synced</span>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {MOCK_BADGES.map((badge) => {
            const isUnlocked = stats.unlockedBadgeIds.includes(badge.id);
            return (
              <div key={badge.id} onClick={() => setSelectedBadge(badge)} className={`group relative cursor-pointer aspect-square transition-all duration-300 hover:scale-105`}>
                <div className={`absolute inset-0 rounded-2xl border transition-all ${isUnlocked ? 'border-cyber-neonPurple/30 bg-cyber-neonPurple/5 shadow-[0_0_15px_rgba(188,19,254,0.1)]' : 'border-white/5 bg-black/40 grayscale opacity-40'}`} />
                <div className="absolute inset-0 flex items-center justify-center text-3xl transition-transform group-hover:scale-110">{isUnlocked ? badge.image : <Lock size={20} className="text-gray-700" />}</div>
                {badge.rarity === 'Legendary' && isUnlocked && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_#eab308]" />}
                {badge.rarity === 'Artifact' && isUnlocked && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] animate-pulse" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Battle History */}
      <div className="space-y-6 px-4 md:px-0">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-widest italic"><History className="text-cyber-neonBlue" /> Neural Logs</h2>
        </div>
        {historyLoading ? (<div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyber-neonBlue" size={32} /></div>) : sessionHistory.length === 0 ? (<div className="text-center p-12 border border-dashed border-white/5 rounded-3xl text-gray-600 italic text-xs uppercase tracking-widest">Zero historical data detected.</div>) : (
           <div className="grid gap-3">{sessionHistory.slice(0, 10).map((session) => (
                <GlassCard key={session.id} className="py-4 px-6 flex items-center justify-between border-white/5 bg-black/40 hover:bg-white/5">
                   <div className="flex items-center gap-4"><div className="p-2.5 bg-cyber-neonBlue/10 rounded-xl text-cyber-neonBlue"><Zap size={18} /></div><div><div className="font-bold text-white text-sm uppercase tracking-wide">{session.taskName}</div><div className="text-[9px] text-gray-500 font-mono uppercase mt-1">{new Date(session.timestamp).toLocaleString()}</div></div></div>
                   <div className="text-right"><div className="font-mono text-xs text-cyber-neonPurple font-bold">+{session.xpEarned} XP</div><div className="text-[9px] text-yellow-500 font-mono">+{session.creditsEarned} CR</div></div>
                </GlassCard>
              ))}</div>
        )}
      </div>
    </div>
  );
};
