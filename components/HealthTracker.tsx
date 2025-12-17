import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Activity, Heart, Moon, Eye, Zap, ChevronRight, AlertTriangle, Stethoscope, Brain, Droplets, Move, Flame } from 'lucide-react';
import { UserStats } from '../types';
import { generateHealthReport, HealthDataInput } from '../services/geminiService';

interface HealthTrackerProps {
  stats: UserStats;
  onNavigateToExercises: () => void;
}

export const HealthTracker: React.FC<HealthTrackerProps> = ({ stats, onNavigateToExercises }) => {
  // Manual Input States
  const [posture, setPosture] = useState("Desk (Slouching)");
  const [sleep, setSleep] = useState(6);
  const [water, setWater] = useState(1.5);
  const [eyeStrain, setEyeStrain] = useState("Medium");
  const [activity, setActivity] = useState("Sedentary");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const habits = [
    "Desk (Ergonomic)", "Desk (Slouching)", "Lying on Bed", "Floor", "Standing"
  ];

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setReport(null);
    
    const inputData: HealthDataInput = {
      posture,
      sleep,
      water,
      eyeStrain,
      activity
    };

    const result = await generateHealthReport(stats, inputData);
    setReport(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="h-full pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white neon-text uppercase tracking-widest flex justify-center items-center gap-3">
          <Stethoscope className="text-green-500" /> Bio-Metric Scanner
        </h2>
        <p className="text-gray-400 text-sm mt-2">Aggregating internal app data & manual telemetry.</p>
      </div>

      {/* Auto-Collected Data Preview */}
      <GlassCard className="border-cyber-neonBlue/20 bg-cyber-dark/50">
         <div className="flex items-center gap-2 mb-4">
            <Zap className="text-cyber-neonBlue w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Internal System Metrics (Auto-Detected)</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-black/40 p-2 rounded border border-white/5">
               <div className="text-[10px] text-gray-500 uppercase">Focus Load</div>
               <div className="text-lg font-mono font-bold text-white">{(stats.focusTimeMinutes / 60).toFixed(1)} hrs</div>
            </div>
            <div className="bg-black/40 p-2 rounded border border-white/5">
               <div className="text-[10px] text-gray-500 uppercase">Energy Reserve</div>
               <div className="text-lg font-mono font-bold text-yellow-500">{stats.energy}%</div>
            </div>
            <div className="bg-black/40 p-2 rounded border border-white/5">
               <div className="text-[10px] text-gray-500 uppercase">Streak Stress</div>
               <div className="text-lg font-mono font-bold text-orange-500">{stats.streak} Days</div>
            </div>
             <div className="bg-black/40 p-2 rounded border border-white/5">
               <div className="text-[10px] text-gray-500 uppercase">Mental State</div>
               <div className="text-lg font-mono font-bold text-green-500 uppercase">{stats.mood}</div>
            </div>
         </div>
      </GlassCard>

      {/* Manual Input Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="border-cyber-neonGreen/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-cyber-neonGreen" /> Physical Inputs
          </h3>
          
          <div className="space-y-4">
            {/* Posture */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 block">Working Stance</label>
              <select 
                value={posture}
                onChange={(e) => setPosture(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded p-2 text-sm text-white focus:border-cyber-neonGreen outline-none"
              >
                {habits.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Activity Level */}
            <div>
               <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 block">Chassis Movement (Activity)</label>
               <div className="flex bg-black/40 rounded p-1 border border-white/10">
                 {['Sedentary', 'Light', 'Active'].map((lvl) => (
                   <button
                     key={lvl}
                     onClick={() => setActivity(lvl)}
                     className={`flex-1 py-1.5 text-xs rounded transition-all ${activity === lvl ? 'bg-cyber-neonGreen/20 text-cyber-neonGreen font-bold' : 'text-gray-500 hover:text-white'}`}
                   >
                     {lvl}
                   </button>
                 ))}
               </div>
            </div>

            {/* Sleep */}
            <div>
               <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 flex justify-between">
                 <span>System Recharge (Sleep)</span>
                 <span className="text-cyber-neonGreen">{sleep}h</span>
               </label>
               <input 
                 type="range" 
                 min="3" max="12" step="0.5"
                 value={sleep}
                 onChange={(e) => setSleep(parseFloat(e.target.value))}
                 className="w-full accent-cyber-neonGreen h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
               />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-cyber-neonBlue/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Droplets size={18} className="text-cyber-neonBlue" /> Maintenance Inputs
          </h3>

          <div className="space-y-6">
            {/* Water */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 flex justify-between">
                 <span>Coolant Levels (Water)</span>
                 <span className="text-blue-400">{water} L</span>
               </label>
               <div className="flex items-center gap-4">
                 <button onClick={() => setWater(Math.max(0.5, water - 0.5))} className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">-</button>
                 <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${(water / 4) * 100}%` }} />
                 </div>
                 <button onClick={() => setWater(Math.min(4, water + 0.5))} className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">+</button>
               </div>
            </div>

            {/* Eye Strain */}
            <div>
               <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 block">Optical Sensor Heat (Eye Strain)</label>
               <div className="grid grid-cols-3 gap-2">
                 {['Low', 'Medium', 'Critical'].map((lvl) => (
                   <button
                     key={lvl}
                     onClick={() => setEyeStrain(lvl)}
                     className={`py-2 text-xs rounded border transition-all ${
                       eyeStrain === lvl 
                         ? lvl === 'Critical' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-cyber-neonBlue/20 border-cyber-neonBlue text-cyber-neonBlue' 
                         : 'bg-transparent border-white/10 text-gray-500'
                     }`}
                   >
                     {lvl}
                   </button>
                 ))}
               </div>
            </div>

            <button 
              onClick={handleAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3 mt-4 bg-gradient-to-r from-green-600 to-cyber-neonGreen text-black font-bold uppercase tracking-widest rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 relative overflow-hidden"
            >
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
              <Stethoscope size={18} />
              {isAnalyzing ? "RUNNING DIAGNOSTICS..." : "COMPILE HEALTH REPORT"}
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Report Section */}
      {report && (
        <GlassCard className="border-t-4 border-t-green-500 bg-black/80 relative overflow-hidden animate-in slide-in-from-bottom-8">
           <div className="absolute top-0 right-0 p-2 opacity-10">
             <Activity size={100} className="text-green-500" />
           </div>
           
           <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
             <h3 className="text-xl font-bold text-green-500 font-mono flex items-center gap-2">
               <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
               DIAGNOSTIC COMPLETE
             </h3>
             <div className="text-[10px] font-mono text-gray-500">ID: {Date.now().toString().slice(-6)}</div>
           </div>
           
           <div className="prose prose-invert prose-sm max-w-none text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
             {report}
           </div>

           <div className="mt-6 pt-4 border-t border-white/10 flex gap-4">
             <button 
               onClick={onNavigateToExercises}
               className="flex-1 py-3 bg-green-500/10 border border-green-500/50 text-green-500 rounded flex items-center justify-center gap-2 hover:bg-green-500/20 transition-all uppercase text-sm font-bold tracking-wider"
             >
               Initiate Recovery Protocol <ChevronRight size={16} />
             </button>
           </div>
        </GlassCard>
      )}
      
      {!report && !isAnalyzing && (
        <div className="text-center p-8 border border-white/5 rounded-2xl border-dashed">
           <AlertTriangle className="mx-auto text-gray-600 mb-2" />
           <p className="text-gray-500 text-sm">Awaiting user telemetry for deep analysis.</p>
        </div>
      )}

    </div>
  );
};