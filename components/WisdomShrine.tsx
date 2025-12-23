
import React, { useState, useEffect, useRef } from 'react';
import { streamGitaGuidance } from '../services/geminiService';
import { UserStats, StudySession } from '../types';
import { dataService } from '../services/dataService';
import { GlassCard } from './ui/GlassCard';
import { 
  Sun, Sparkles, Send, Loader2, Trophy, 
  Flame, Swords, ShieldCheck, HeartPulse, 
  Atom, BookOpen, Crown, ChevronRight,
  Target, Zap, Compass, Lock, Clock,
  Wind, Infinity, ShieldAlert, Star, 
  Hand, Map, Milestone, Timer, ScrollText, History,
  Coins as CoinIcon, ChevronLeft
} from 'lucide-react';

interface WisdomShrineProps {
  stats: UserStats;
  onUpdateStats: (updates: Partial<UserStats>) => void;
  showToast: (msg: string, sub: string, type: 'success' | 'error') => void;
}

type ShrineView = 'DARSHAN' | 'SHRINE' | 'TAPASYA' | 'SHASTRA' | 'CONVERSATION' | 'MANDALA' | 'KARMA' | 'ASHIRVAD' | 'CHARIOT';

interface ActiveBuff {
  id: string;
  expiresAt: number;
}

export const WisdomShrine: React.FC<WisdomShrineProps> = ({ stats, onUpdateStats, showToast }) => {
  const [view, setView] = useState<ShrineView>('DARSHAN');
  const [displayedGuidance, setDisplayedGuidance] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const [history, setHistory] = useState<StudySession[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  // Mandala State
  const [mandalaPhase, setMandalaPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [mandalaTimer, setMandalaTimer] = useState(60);
  const [isMandalaActive, setIsMandalaActive] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Logic: Calculate Karma Alignment
  const calculateKarma = () => {
    const totalFocus = stats.focusTimeMinutes || 0;
    const streakDays = stats.streak || 0;
    const total = totalFocus + (streakDays * 60);
    if (total === 0) return { sattva: 33, rajas: 33, tamas: 34 };
    const sattva = Math.min(100, (streakDays * 5) + (totalFocus / 100));
    const rajas = Math.min(100, (totalFocus / 50));
    const tamas = Math.max(0, 100 - (sattva + rajas) / 2);
    return { sattva, rajas, tamas };
  };

  const karma = calculateKarma();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedGuidance]);

  // Fetch History when Tapasya view is selected
  useEffect(() => {
    if (view === 'TAPASYA' && stats.id) {
      const fetchTapasyaLogs = async () => {
        setIsHistoryLoading(true);
        try {
          const sessions = await dataService.getStudySessions(stats.id);
          setHistory(sessions || []);
        } catch (e) {
          console.error("Failed to fetch divine logs", e);
        } finally {
          setIsHistoryLoading(false);
        }
      };
      fetchTapasyaLogs();
    }
  }, [view, stats.id]);

  // Mandala Animation & Timer Logic
  useEffect(() => {
    let phaseInterval: any;
    let timerInterval: any;

    if (view === 'MANDALA' && isMandalaActive) {
      phaseInterval = setInterval(() => {
        setMandalaPhase(p => {
          if (p === 'Inhale') return 'Hold';
          if (p === 'Hold') return 'Exhale';
          return 'Inhale';
        });
      }, 4000);

      timerInterval = setInterval(() => {
        setMandalaTimer(prev => {
          if (prev <= 1) {
            handleMandalaComplete();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(phaseInterval);
      clearInterval(timerInterval);
    };
  }, [view, isMandalaActive]);

  const handleMandalaComplete = () => {
    setIsMandalaActive(false);
    onUpdateStats({ xp: stats.xp + 50 });
    showToast("तपस्या सफल!", "You gained 50 XP and mental clarity.", "success");
    setView('SHRINE');
  };

  const handleDivineGuidance = async (query: string) => {
    if (!query.trim() || isStreaming) return;
    setView('CONVERSATION');
    setIsStreaming(true);
    setDisplayedGuidance("");

    const context = `Level: ${stats.level}, Sector: ${stats.classGrade}, Karma: Sattva ${karma.sattva}%`;
    const generator = streamGitaGuidance(query, context);

    try {
      for await (const chunk of generator) {
        setDisplayedGuidance(prev => prev + chunk);
      }
      setUserInput("");
    } catch (e) {
      setDisplayedGuidance("पार्थ, मन को शांत रखो। मैं साक्षी हूँ।");
    } finally {
      setIsStreaming(false);
    }
  };

  const handlePurchaseAshirvad = (id: string, cost: number, name: string) => {
    if (stats.credits < cost) {
      showToast("श्रद्धा की कमी", "Not enough credits for this offering.", "error");
      return;
    }

    onUpdateStats({ credits: stats.credits - cost });
    const expiry = Date.now() + 3600000; // 1 hour buff
    setActiveBuffs(prev => [...prev, { id, expiresAt: expiry }]);
    showToast("आशीर्वाद प्राप्त", `${name} is now active for 1 hour.`, "success");
  };

  const ASHIRVAD_DATA = [
    { id: 'a1', name: "Sthitaprajna Grace", icon: <Target size={24} />, cost: 500, effect: "Steady focus. Reduces energy drain.", duration: "1 Hour" },
    { id: 'a2', name: "Karmasu Kaushalam", icon: <Zap size={24} />, cost: 800, effect: "Skill in action. Gain 1.5x XP.", duration: "2 Hours" },
    { id: 'a3', name: "Nitya Abhyasa", icon: <Infinity size={24} />, cost: 1200, effect: "Eternal Practice. Streak protection.", duration: "24 Hours" },
  ];

  const SHASTRA_DATA = [
    { name: "Panchajanya Shankh", icon: "🐚", power: "Clarity & Awareness", req: 300, desc: "The call of pure focus." },
    { name: "Gandiva Dhanush", icon: "🏹", power: "Unwavering Aim", req: 1500, desc: "Arjun's bow of total concentration." },
    { name: "Sudarshan Chakra", icon: "🌀", power: "Mind Control", req: 5000, desc: "Destruction of all mental barriers." },
    { name: "Kaumodaki Gada", icon: "🔱", power: "Sheer Discipline", req: 10000, desc: "Shattering procrastination." },
  ];

  const CHARIOT_STAGES = [
    { label: "Sankalp", target: 500, icon: <Hand size={18} /> },
    { label: "Abhyasa", target: 2000, icon: <Flame size={18} /> },
    { label: "Vairagya", target: 5000, icon: <ShieldCheck size={18} /> },
    { label: "Dharma", target: 10000, icon: <Trophy size={18} /> },
  ];

  return (
    <div className="min-h-[85vh] relative overflow-hidden flex flex-col items-center bg-black/95 rounded-[3rem] border border-yellow-500/20 shadow-[0_0_100px_rgba(234,179,8,0.1)] mb-10">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-yellow-600/5 rounded-full blur-[150px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full flex flex-col flex-1 p-6 md:p-10 h-full overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 animate-pulse">
                <Sun size={24} />
             </div>
             <div>
                <h3 className="text-yellow-500 font-serif italic text-lg leading-none">पार्थ...</h3>
                <p className="text-[9px] text-yellow-500/40 uppercase tracking-[0.3em] font-black">Sakshi Awareness</p>
             </div>
          </div>
          <div className="px-4 py-2 glass-ios rounded-full border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <CoinIcon size={12} /> {stats.credits} CR
          </div>
        </div>

        {/* View Switcher */}
        {view === 'DARSHAN' && (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-10 animate-spring">
             <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-[100px] scale-[2.5] animate-pulse" />
                <Sparkles className="text-yellow-500 w-20 h-20 relative z-10" />
             </div>
             <div className="max-w-md space-y-6">
                <h2 className="text-3xl md:text-4xl font-serif text-white italic leading-relaxed">"पार्थ, फल की चिंता छोड़ कर कर्म पर ध्यान दो।"</h2>
                <div className="h-px w-20 bg-yellow-500/20 mx-auto" />
                <p className="text-yellow-500/60 font-serif italic text-sm">Arth: Do not worry about the result, focus on the process.</p>
             </div>
             <button onClick={() => setView('SHRINE')} className="ios-btn-primary px-12 py-5 text-xs font-black uppercase tracking-[0.3em] bg-yellow-500 text-black border-none">
                Enter the Shrine
             </button>
          </div>
        )}

        {view === 'SHRINE' && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-1000">
             <div className="text-center mb-10">
                <h2 className="text-4xl font-serif italic text-white mb-2">Wisdom Shrine</h2>
                <p className="text-yellow-500/40 text-xs font-black uppercase tracking-[0.4em]">Parth's Mental Sanctuary</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <GlassCard onClick={() => setView('CHARIOT')} className="p-6 border-yellow-500/10 flex flex-col items-center text-center">
                   <Compass className="text-yellow-500 mb-4" size={32} />
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">Dharma Path</h3>
                </GlassCard>
                <GlassCard onClick={() => setView('ASHIRVAD')} className="p-6 border-blue-500/10 flex flex-col items-center text-center">
                   <Hand className="text-blue-400 mb-4" size={32} />
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">Ashirvad</h3>
                </GlassCard>
                <GlassCard onClick={() => setView('KARMA')} className="p-6 border-purple-500/10 flex flex-col items-center text-center">
                   <Infinity className="text-purple-400 mb-4" size={32} />
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">Karma</h3>
                </GlassCard>
                <GlassCard onClick={() => setView('MANDALA')} className="p-6 border-orange-500/10 flex flex-col items-center text-center">
                   <Wind className="text-orange-400 mb-4" size={32} />
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">Mandala</h3>
                </GlassCard>
             </div>

             <div className="mt-8 grid grid-cols-2 gap-4">
                <button onClick={() => setView('SHASTRA')} className="p-4 glass-ios rounded-[2rem] border-white/5 flex items-center gap-3 active:scale-95 transition-transform">
                   <Crown size={16} className="text-yellow-500" />
                   <span className="text-[9px] font-black uppercase text-white tracking-widest">Armory</span>
                </button>
                <button onClick={() => setView('TAPASYA')} className="p-4 glass-ios rounded-[2rem] border-white/5 flex items-center gap-3 active:scale-95 transition-transform">
                   <Flame size={16} className="text-orange-500" />
                   <span className="text-[9px] font-black uppercase text-white tracking-widest">History</span>
                </button>
             </div>

             <div className="mt-auto pt-10">
                <p className="text-[10px] font-black uppercase text-yellow-500/40 text-center tracking-[0.4em] mb-4">Seek Counsel</p>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-3xl focus-within:border-yellow-500/40 transition-all">
                   <input 
                      type="text" 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDivineGuidance(userInput)}
                      placeholder="पार्थ, आज क्या संशय है?"
                      className="flex-1 bg-transparent border-none outline-none text-white px-5 py-3 font-serif italic text-lg"
                   />
                   <button onClick={() => handleDivineGuidance(userInput)} className="bg-yellow-500 text-black p-4 rounded-2xl shadow-xl">
                      <Send size={22} />
                   </button>
                </div>
             </div>
          </div>
        )}

        {view === 'CONVERSATION' && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-500">
             <button onClick={() => setView('SHRINE')} className="text-yellow-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-8">
                <ChevronLeft size={14} /> Back to Sanctuary
             </button>
             <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6" ref={scrollRef}>
                <div className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-3xl">
                   <div className="whitespace-pre-wrap font-serif italic text-lg text-white leading-relaxed">
                      {displayedGuidance || (isStreaming ? "Wait, Parth..." : "पार्थ, मन की स्थिरता ही सर्वोच्च शक्ति है।")}
                   </div>
                </div>
                {isStreaming && <Loader2 className="animate-spin text-yellow-500 mx-auto" size={24} />}
             </div>
             <div className="p-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-3xl">
                   <input 
                      type="text" 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDivineGuidance(userInput)}
                      placeholder="Speak to Krishna..."
                      className="flex-1 bg-transparent border-none outline-none text-white px-5 py-3 font-serif italic text-sm"
                   />
                   <button onClick={() => handleDivineGuidance(userInput)} className="bg-yellow-500 text-black p-3 rounded-2xl shadow-xl">
                      <Send size={18} />
                   </button>
                </div>
             </div>
          </div>
        )}

        {view === 'MANDALA' && (
           <div className="flex-1 flex flex-col animate-in zoom-in duration-500 items-center justify-center relative">
              <button onClick={() => setView('SHRINE')} className="absolute top-0 left-0 text-yellow-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <ChevronLeft className="rotate-0" size={14} /> Back
              </button>
              <div className="text-center mb-12">
                 <h2 className="text-3xl font-serif italic text-white">{isMandalaActive ? mandalaPhase : "Mandala Focus"}</h2>
                 <p className="text-orange-400/40 text-xs font-black uppercase tracking-widest">Banish Tamas (Inertia)</p>
              </div>
              <div className="relative w-80 h-80 flex items-center justify-center">
                 <div className={`absolute inset-0 border border-orange-500/20 rounded-full transition-all duration-[4000ms] ${isMandalaActive && mandalaPhase === 'Inhale' ? 'scale-125 opacity-100' : 'scale-100 opacity-20'}`} />
                 <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-[4000ms] ${isMandalaActive && mandalaPhase === 'Inhale' ? 'bg-orange-500' : 'bg-orange-500/20'}`}>
                    {isMandalaActive ? (
                      <div className="text-white text-4xl font-mono font-bold">{mandalaTimer}s</div>
                    ) : (
                      <Wind size={48} className="text-orange-400" />
                    )}
                 </div>
              </div>
              <div className="mt-16">
                 {!isMandalaActive ? (
                    <button onClick={() => setIsMandalaActive(true)} className="ios-btn-primary px-10 py-4 bg-orange-500 text-black font-black uppercase tracking-widest text-xs">
                       Start Tapasya
                    </button>
                 ) : (
                    <button onClick={() => { setIsMandalaActive(false); setMandalaTimer(60); }} className="text-orange-500/50 uppercase font-bold text-[10px] tracking-widest">
                       Abort Focus
                    </button>
                 )}
              </div>
           </div>
        )}

        {view === 'SHASTRA' && (
           <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
              <button onClick={() => setView('SHRINE')} className="text-yellow-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-8">
                 <ChevronLeft className="rotate-0" size={14} /> Back to Shrine
              </button>
              <div className="text-center mb-8">
                 <h2 className="text-3xl font-serif italic text-white">Shastra Anugrah</h2>
                 <p className="text-yellow-500/40 text-[9px] font-black uppercase tracking-widest">Divine Weapons of Concentration</p>
              </div>
              <div className="space-y-4 overflow-y-auto no-scrollbar pb-10">
                 {SHASTRA_DATA.map(s => {
                   const focusVal = stats.focusTimeMinutes || 0;
                   const isUnlocked = focusVal >= s.req;
                   const progress = Math.min(100, (focusVal / s.req) * 100);
                   return (
                     <GlassCard key={s.name} className={`p-6 border transition-all duration-500 ${isUnlocked ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-white/5 opacity-60'}`}>
                        <div className="flex items-center gap-5 mb-4">
                           <div className={`text-5xl ${!isUnlocked ? 'grayscale blur-[1px]' : ''}`}>{s.icon}</div>
                           <div className="flex-1">
                              <h4 className={`font-black uppercase tracking-tighter ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{s.name}</h4>
                              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-1">{isUnlocked ? s.power : `Required: ${s.req}m`}</p>
                           </div>
                           {isUnlocked ? <ShieldCheck className="text-yellow-500" size={24} /> : <Lock size={18} className="text-gray-700" />}
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${isUnlocked ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-yellow-500/20'}`} style={{ width: `${progress}%` }} />
                        </div>
                     </GlassCard>
                   );
                 })}
              </div>
           </div>
        )}

        {view === 'ASHIRVAD' && (
           <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
              <button onClick={() => setView('SHRINE')} className="text-yellow-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-8">
                 <ChevronLeft size={14} /> Back
              </button>
              <div className="text-center mb-10">
                 <h2 className="text-3xl font-serif italic text-white">Divine Ashirvad</h2>
                 <p className="text-blue-400/40 text-xs font-black uppercase tracking-widest">Academic Grace Buffs</p>
              </div>
              <div className="space-y-4 overflow-y-auto no-scrollbar">
                 {ASHIRVAD_DATA.map(a => {
                   const isActive = activeBuffs.some(b => b.id === a.id && b.expiresAt > Date.now());
                   return (
                     <GlassCard key={a.id} className={`p-6 flex items-center justify-between border ${isActive ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-blue-500/10'}`}>
                        <div className="flex items-center gap-5">
                           <div className={`p-4 rounded-2xl ${isActive ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-400'}`}>{a.icon}</div>
                           <div>
                              <h4 className="font-bold text-white text-sm">{a.name}</h4>
                              <p className="text-[10px] text-gray-500 mt-1">{a.effect}</p>
                           </div>
                        </div>
                        <button onClick={() => !isActive && handlePurchaseAshirvad(a.id, a.cost, a.name)} disabled={isActive} className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-ios-green text-black' : 'bg-blue-500 text-white'}`}>
                           {isActive ? "ACTIVE" : `${a.cost} CR`}
                        </button>
                     </GlassCard>
                   );
                 })}
              </div>
           </div>
        )}

        {view === 'KARMA' && (
           <div className="flex-1 flex flex-col animate-in fade-in duration-500">
              <button onClick={() => setView('SHRINE')} className="text-yellow-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-8">
                 <ChevronLeft size={14} /> Back
              </button>
              <div className="text-center mb-10">
                 <h2 className="text-3xl font-serif italic text-white">Karmic Telemetry</h2>
                 <p className="text-purple-400/40 text-xs font-black uppercase tracking-widest">Real-time Guna Sync</p>
              </div>
              <div className="space-y-6">
                 {['Sattva', 'Rajas', 'Tamas'].map(guna => {
                    const val = karma[guna.toLowerCase() as keyof typeof karma];
                    const color = guna === 'Sattva' ? 'bg-blue-500' : guna === 'Rajas' ? 'bg-orange-500' : 'bg-gray-700';
                    return (
                      <div key={guna} className="space-y-3">
                         <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/60"><span>{guna}</span><span>{Math.floor(val)}%</span></div>
                         <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${color} shadow-lg`} style={{ width: `${val}%` }} /></div>
                      </div>
                    );
                 })}
                 <GlassCard className="mt-10 border-purple-500/20 bg-purple-500/5">
                    <p className="text-sm text-gray-300 font-serif italic leading-relaxed text-center">
                       {karma.sattva > 50 ? "पार्थ, तुम्हारी एकाग्रता सात्विक है। यही विजय का मार्ग है।" : "पार्थ, मन को शांत करो और कर्मठ बनो।"}
                    </p>
                 </GlassCard>
              </div>
           </div>
        )}

        {view === 'CHARIOT' && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
             <button onClick={() => setView('SHRINE')} className="text-yellow-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-8">
                <ChevronLeft size={14} /> Back
             </button>
             <div className="text-center mb-10">
                <h2 className="text-3xl font-serif italic text-white">Dharma Chariot</h2>
                <p className="text-yellow-500/40 text-xs font-black uppercase tracking-widest">Growth Progression</p>
             </div>
             <div className="space-y-8">
                {CHARIOT_STAGES.map((s, i) => {
                  const focusVal = stats.focusTimeMinutes || 0;
                  const isReached = focusVal >= s.target;
                  return (
                    <div key={s.label} className="flex items-center gap-6 relative">
                       {i < CHARIOT_STAGES.length - 1 && (
                         <div className="absolute left-6 top-12 w-px h-8 bg-white/10" />
                       )}
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${isReached ? 'bg-yellow-500 border-yellow-500 text-black shadow-[0_0_15px_#eab308]' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                          {s.icon}
                       </div>
                       <div className="flex-1">
                          <h4 className={`font-black uppercase tracking-widest text-sm ${isReached ? 'text-white' : 'text-gray-700'}`}>{s.label}</h4>
                          <p className="text-[10px] text-gray-500 mt-0.5">{isReached ? 'Unlocked' : `Required: ${s.target}m`}</p>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
