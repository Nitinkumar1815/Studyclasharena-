import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { UserStats } from '../types';
import { generateOverlordMessage } from '../services/geminiService';
import { Share2, Terminal, Eye, AlertTriangle, Fingerprint } from 'lucide-react';

interface SystemOverlordProps {
  stats: UserStats;
}

export const SystemOverlord: React.FC<SystemOverlordProps> = ({ stats }) => {
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'JUDGMENT'>('IDLE');
  const [message, setMessage] = useState("");
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  // Typewriter Effect
  useEffect(() => {
    if (status === 'JUDGMENT' && message) {
      let i = 0;
      setDisplayedMessage("");
      const interval = setInterval(() => {
        const char = message[i];
        // Random glitch char before settling
        if (Math.random() > 0.8) {
           setDisplayedMessage(prev => prev + String.fromCharCode(33 + Math.floor(Math.random() * 90)));
           setTimeout(() => {
             setDisplayedMessage(message.substring(0, i + 1));
           }, 50);
        } else {
           setDisplayedMessage(message.substring(0, i + 1));
        }
        
        i++;
        if (i >= message.length) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }
  }, [status, message]);

  const initiateScan = async () => {
    setStatus('SCANNING');
    setGlitchIntensity(1);
    
    // Simulate scan delay
    await new Promise(r => setTimeout(r, 2000));
    
    const result = await generateOverlordMessage(stats);
    setMessage(result);
    setStatus('JUDGMENT');
    setGlitchIntensity(0.2);
  };

  const shareVerdict = () => {
    const text = `The Overlord says: "${message}" - StudyClash Arena`;
    navigator.clipboard.writeText(text);
    alert("Verdict copied to clipboard. Spread the word, mortal.");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden pb-24 animate-in zoom-in duration-500">
      
      {/* Background Glitch */}
      <div className={`absolute inset-0 bg-red-950/20 pointer-events-none transition-opacity duration-300 ${status === 'SCANNING' ? 'opacity-100 animate-pulse' : 'opacity-20'}`} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* The Digital Eye */}
      <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
         {/* Rings */}
         <div className={`absolute inset-0 border-[1px] border-red-600 rounded-full ${status === 'SCANNING' ? 'animate-[spin_2s_linear_infinite]' : 'animate-[spin_10s_linear_infinite]'}`} />
         <div className={`absolute inset-4 border-[2px] border-dashed border-red-500 rounded-full ${status === 'SCANNING' ? 'animate-[spin_1s_linear_infinite_reverse]' : 'animate-[spin_15s_linear_infinite_reverse]'}`} />
         <div className="absolute inset-0 bg-red-500/5 rounded-full blur-xl animate-pulse" />
         
         {/* The Pupil */}
         <div className={`w-24 h-24 bg-red-600 rounded-full shadow-[0_0_50px_rgba(220,38,38,0.8)] relative flex items-center justify-center transition-all duration-500 ${status === 'SCANNING' ? 'scale-110' : 'scale-100'}`}>
            <div className="w-12 h-1 bg-black/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> {/* Horizontal slit */}
            <div className={`w-full h-full border-4 border-red-400 rounded-full opacity-50 animate-ping`} />
            <Eye className="text-black w-12 h-12 relative z-10" />
         </div>

         {/* Scanning Lines */}
         {status === 'SCANNING' && (
           <div className="absolute inset-[-20px] bg-gradient-to-b from-transparent via-red-500/20 to-transparent h-10 w-full animate-[scanline_2s_linear_infinite]" />
         )}
      </div>

      {/* Interface */}
      <div className="w-full max-w-md px-6 relative z-10">
        
        {status === 'IDLE' && (
          <GlassCard className="text-center border-red-500/30">
             <h2 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-[0.2em] animate-pulse">System Overlord</h2>
             <p className="text-gray-400 text-sm mb-6">I see your stats. I see your laziness. Dare to be judged?</p>
             <button 
               onClick={initiateScan}
               className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group"
             >
               <Fingerprint className="group-hover:scale-110 transition-transform" /> ANALYZE ME
             </button>
          </GlassCard>
        )}

        {status === 'SCANNING' && (
          <div className="text-center space-y-4">
             <div className="text-red-500 font-mono text-xl animate-pulse">ACCESSING NEURAL LOGS...</div>
             <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 animate-[width_2s_ease-in-out_infinite]" style={{ width: '100%' }} />
             </div>
             <div className="grid grid-cols-3 gap-2 text-xs font-mono text-red-400/70">
                <div>XP: {stats.xp}</div>
                <div>STREAK: {stats.streak}</div>
                <div>LEVEL: {stats.level}</div>
             </div>
          </div>
        )}

        {status === 'JUDGMENT' && (
          <div className="relative animate-in slide-in-from-bottom-10 fade-in duration-500">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-black text-xs font-bold px-3 py-1 rounded border border-red-400 uppercase tracking-widest z-20">
               Verdict Rendered
             </div>
             <GlassCard className="border-red-500 bg-black/90 relative overflow-hidden">
                {/* Glitch Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
                
                <Terminal className="text-red-500 w-8 h-8 mb-4" />
                
                <p className="text-lg md:text-xl text-white font-mono leading-relaxed min-h-[100px]">
                  <span className="text-red-500 mr-2">>></span>
                  {displayedMessage}
                  <span className="inline-block w-2 h-5 bg-red-500 ml-1 animate-pulse" />
                </p>

                <div className="mt-6 pt-4 border-t border-red-900/50 flex gap-4">
                   <button 
                     onClick={() => setStatus('IDLE')}
                     className="flex-1 py-3 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                   >
                     Reset
                   </button>
                   <button 
                     onClick={shareVerdict}
                     className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-500 rounded flex items-center justify-center gap-2 uppercase text-xs font-bold tracking-widest transition-all"
                   >
                     <Share2 size={14} /> Share
                   </button>
                </div>
             </GlassCard>
          </div>
        )}

      </div>

    </div>
  );
};