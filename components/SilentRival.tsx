import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { UserStats } from '../types';
import { generateRivalAnalysis, generateStudySuggestions, RivalInput } from '../services/geminiService';
import { Ghost, Lock, UserX, Activity, BarChart3, Fingerprint, Shield, TrendingUp, Cpu, ScanLine, Brain, Target, Zap, User } from 'lucide-react';

interface SilentRivalProps {
  stats: UserStats;
}

export const SilentRival: React.FC<SilentRivalProps> = ({ stats }) => {
  const [isSetup, setIsSetup] = useState(false);
  const [examName, setExamName] = useState("");
  const [rivalStats, setRivalStats] = useState({
    time: 0,
    streak: 0,
    level: 0,
    codename: "Subject 89"
  });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0); // 0: Idle, 1: History, 2: Exam, 3: Sync

  // Mock "Today's" User Data for Demo (Derived from total or random)
  const todayUserTime = Math.min(stats.focusTimeMinutes % 240, 180); // Simulate 0-3 hours

  // Function to determine rival stats based on user data
  const calculateRivalMetrics = (exam: string) => {
    // 1. Difficulty Modifier based on Exam Name
    const isHardExam = /JEE|NEET|USMLE|Bar|CFA|GATE|Civil|UPSC|AIIMS/.test(exam);
    const difficultyMult = isHardExam ? 1.2 : 1.05;

    // 2. Rival Level (Always slightly ahead to induce aspiration)
    const calculatedLevel = Math.max(stats.level + 1, Math.ceil(stats.level * 1.1));

    // 3. Rival Streak (Solid discipline)
    const calculatedStreak = Math.max(stats.streak + 3, Math.ceil(stats.streak * 1.2));

    // 4. Rival Study Time Logic (The "Beatable but Tough" Logic)
    let calculatedTime = 0;
    
    if (todayUserTime < 30) {
        // If user is lazy, rival shows baseline discipline (e.g. 1 hour)
        calculatedTime = 60 * difficultyMult; 
    } else if (todayUserTime > 240) {
         // If user is grinding hard (>4h), rival is slightly behind to reward effort (Beatable)
         calculatedTime = todayUserTime * 0.95;
    } else {
         // Normal range: Rival is 5-20% ahead
         const randomPush = 1 + (Math.random() * 0.15) + (isHardExam ? 0.05 : 0);
         calculatedTime = Math.floor(todayUserTime * randomPush);
    }
    
    // Occasional "Bad Day" for Rival (10% chance) to make them feel human
    if (Math.random() > 0.9) {
        calculatedTime = Math.floor(todayUserTime * 0.8);
    }

    return {
        time: Math.floor(calculatedTime),
        streak: calculatedStreak,
        level: calculatedLevel,
        codename: `Subject ${800 + Math.floor(Math.random() * 199)}` // High number subjects
    };
  };

  const handleInitialize = async () => {
    if (!examName) return;
    setLoading(true);
    setCalibrationStep(1); // Analyzing History

    // Simulate Processing Steps
    await new Promise(r => setTimeout(r, 1000));
    setCalibrationStep(2); // Configuring Rival
    
    const metrics = calculateRivalMetrics(examName);
    setRivalStats(metrics);

    await new Promise(r => setTimeout(r, 1200));
    setCalibrationStep(3); // Syncing

    const input: RivalInput = {
      studentName: stats.rank,
      examName: examName,
      userStudyTime: todayUserTime,
      rivalStudyTime: metrics.time,
      rivalStreak: metrics.streak,
      rivalLevel: metrics.level
    };

    // Parallel Fetching for Efficiency
    const [text, suggestedTopics] = await Promise.all([
        generateRivalAnalysis(input),
        generateStudySuggestions(examName)
    ]);

    setAnalysis(text);
    setSuggestions(suggestedTopics);
    setIsSetup(true);
    setLoading(false);
    setCalibrationStep(0);
  };

  if (!isSetup) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
        <div className="w-full max-w-md space-y-8 text-center">
          
          {/* Animated Header Icon */}
          <div className="relative w-32 h-32 mx-auto">
             <div className="absolute inset-0 bg-gray-500/10 rounded-full blur-xl animate-pulse" />
             <div className={`absolute inset-0 border-2 border-dashed ${loading ? 'border-cyber-neonBlue animate-spin' : 'border-gray-600 animate-spin-slow'} rounded-full`} />
             <div className="absolute inset-0 flex items-center justify-center">
                {loading ? <Cpu size={48} className="text-cyber-neonBlue animate-pulse" /> : <UserX size={48} className="text-gray-400" />}
             </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-200 tracking-[0.2em] uppercase">SILENT RIVAL MODE™</h1>
            <p className="text-gray-500 mt-2 text-sm font-mono">Anonymous. Competitive. Invisible.</p>
          </div>

          <GlassCard className="border-gray-700 bg-black/80 text-left space-y-4">
             {loading ? (
               <div className="py-8 space-y-4 text-center">
                  <div className="text-sm font-mono text-cyber-neonBlue animate-pulse">
                     {calibrationStep === 1 && ">> ACCESSING ACADEMIC RECORDS..."}
                     {calibrationStep === 2 && `>> PROFILING RIVAL FOR ${examName.toUpperCase()}...`}
                     {calibrationStep === 3 && ">> ESTABLISHING ENCRYPTED LINK..."}
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-cyber-neonBlue transition-all duration-500" 
                        style={{ width: `${(calibrationStep / 3) * 100}%` }} 
                     />
                  </div>
               </div>
             ) : (
               <>
                 <div className="space-y-2">
                   <label className="text-xs text-gray-500 uppercase font-bold">Target Exam / Goal</label>
                   <input 
                     type="text" 
                     value={examName}
                     onChange={(e) => setExamName(e.target.value)}
                     placeholder="e.g. JEE Advanced, NEET, SAT"
                     className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-white/50 outline-none font-mono"
                   />
                 </div>
                 
                 <div className="p-3 bg-gray-900/50 rounded border border-gray-800 text-xs text-gray-400 font-mono leading-relaxed">
                   <p className="mb-2"><Lock size={12} className="inline mr-1"/> PROTOCOL:</p>
                   <ul className="list-disc pl-4 space-y-1">
                     <li>Rival calibrated to your skill level.</li>
                     <li>Performance synced daily.</li>
                     <li>Goal: Outpace {rivalStats.codename}.</li>
                   </ul>
                 </div>

                 <button 
                   onClick={handleInitialize}
                   disabled={!examName}
                   className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Fingerprint /> INITIATE LINK
                 </button>
               </>
             )}
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full pb-24 relative overflow-hidden flex flex-col items-center animate-in fade-in duration-500">
      
      {/* Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/20 via-black to-black pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-500/50 to-transparent opacity-50" />

      {/* Header */}
      <div className="relative z-10 w-full max-w-lg p-6 space-y-6">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
           <div>
             <h2 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
               <Ghost size={20} className="text-gray-400" /> Rival Uplink
             </h2>
             <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">
               Connected to: <span className="text-white font-bold">{rivalStats.codename}</span>
             </p>
           </div>
           <div className="text-right">
              <div className="text-xs text-gray-500 uppercase">Target</div>
              <div className="text-sm font-bold text-white font-mono">{examName}</div>
           </div>
        </div>

        {/* Rival Visualizer */}
        <div className="relative h-64 flex items-center justify-center">
           {/* User Side */}
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-center group">
              <div className="w-20 h-20 rounded-full border-2 border-cyber-neonBlue p-1 mb-2 relative flex items-center justify-center bg-white/5">
                 <User className="text-cyber-neonBlue w-10 h-10" />
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyber-neonBlue text-black text-[10px] font-bold px-2 rounded">YOU</div>
              </div>
              <div className="text-2xl font-bold text-white font-mono">{todayUserTime}m</div>
              <div className="text-[10px] text-gray-500">Level {stats.level}</div>
           </div>

           {/* VS Divider */}
           <div className="h-40 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent mx-4 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/20 px-2 py-1 text-[10px] text-gray-500 font-mono">VS</div>
           </div>

           {/* Rival Side */}
           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-center">
              <div className="w-20 h-20 rounded-full border-2 border-gray-600 p-1 mb-2 relative overflow-hidden bg-black">
                 {/* Glitchy Avatar */}
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-pulse" />
                 <UserX className="w-full h-full text-gray-700 p-4" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-[10px] font-bold px-2 rounded">RIVAL</div>
              </div>
              <div className="text-2xl font-bold text-gray-400 font-mono">{rivalStats.time}m</div>
              <div className="text-[10px] text-gray-500">Level {rivalStats.level}</div>
           </div>

           {/* Connection Lines */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <line x1="20%" y1="50%" x2="45%" y2="50%" stroke="#00f3ff" strokeDasharray="5,5" className="animate-pulse" />
              <line x1="55%" y1="50%" x2="80%" y2="50%" stroke="#666" strokeDasharray="5,5" />
           </svg>
        </div>

        {/* AI Analysis Card */}
        <GlassCard className="bg-black/40 border-l-4 border-l-gray-500 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity size={80} />
           </div>
           
           <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <Shield size={14} /> Daily Intel Report
           </h3>
           
           <div className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {analysis || "Decrypting rival data stream..."}
           </div>
        </GlassCard>

        {/* AI Recommendations - Counter Tactics */}
        {suggestions.length > 0 && (
           <div className="space-y-2">
             <div className="text-[10px] text-cyber-neonBlue uppercase font-bold tracking-widest flex items-center gap-2 mb-2">
                <Brain size={12} /> AI Counter-Tactics Calculated
             </div>
             <div className="grid gap-2">
                {suggestions.map((topic, i) => (
                  <GlassCard key={i} className="py-3 px-4 flex items-center justify-between hover:bg-white/5 border-cyber-neonBlue/20">
                     <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-cyber-neonBlue/10 flex items-center justify-center text-cyber-neonBlue font-bold text-xs">
                           {i + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-200">{topic}</span>
                     </div>
                     <Target size={14} className="text-gray-500" />
                  </GlassCard>
                ))}
             </div>
           </div>
        )}

        {/* Weekly Trend (Mock) */}
        <div className="grid grid-cols-2 gap-4">
           <GlassCard className="p-4 flex flex-col justify-between h-24">
              <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                 <BarChart3 size={12} /> Consistency
              </div>
              <div className="text-2xl font-mono text-white">{(Math.random() * 5 + 90).toFixed(1)}%</div>
              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                 <div className="bg-gray-500 h-full w-[92%]" />
              </div>
           </GlassCard>
           <GlassCard className="p-4 flex flex-col justify-between h-24">
              <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                 <TrendingUp size={12} /> Rival Streak
              </div>
              <div className="text-2xl font-mono text-white">{rivalStats.streak} Days</div>
              <div className="text-[10px] text-gray-500">Target: catch up</div>
           </GlassCard>
        </div>
      </div>

    </div>
  );
};