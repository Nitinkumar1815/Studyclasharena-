
import React, { useState, useEffect, useRef } from 'react';
import { ScheduleItem } from '../types';
import { ShieldAlert, Lock, Unlock, Zap, Brain, Cpu } from 'lucide-react';
import { generateSystemMotivation } from '../services/geminiService';

interface ChronoLockProps {
  task: ScheduleItem;
  onUnlock: () => void;
}

export const ChronoLock: React.FC<ChronoLockProps> = ({ task, onUnlock }) => {
  const [stage, setStage] = useState<'ALERT' | 'MOTIVATION' | 'CHALLENGE' | 'SUCCESS'>('ALERT');
  const [mathProblem, setMathProblem] = useState({ q: "", a: 0 });
  const [userResponse, setUserResponse] = useState("");
  const [errorState, setErrorState] = useState(false);
  const [systemMsg, setSystemMsg] = useState("");
  const [breachCount, setBreachCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background Audio
  useEffect(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/535/535-preview.mp3'); 
    audio.loop = true;
    audio.volume = 0.8;
    audioRef.current = audio;
    
    audio.play().catch(e => console.log("Autoplay blocked", e));
    
    return () => {
        audio.pause();
        audio.currentTime = 0;
    };
  }, []);

  // Force Fullscreen
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.log("Fullscreen blocked");
      }
    };
    enterFullscreen();
  }, []);

  // Strict Visibility Check
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setBreachCount(prev => prev + 1);
        console.warn("🚨 ARENA BREACH ATTEMPT: ChronoLock Integrity Compromised.");
      } else {
        const punishAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3');
        punishAudio.volume = 0.6;
        punishAudio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Generate Math Problem
  useEffect(() => {
    if (stage === 'CHALLENGE') {
        const difficultyMultiplier = breachCount + 1;
        const operator = Math.random() > 0.5 ? '*' : '+';
        let num1, num2, ans, q;

        if (operator === '*') {
             num1 = Math.floor(Math.random() * (12 * difficultyMultiplier)) + 3;
             num2 = Math.floor(Math.random() * (9 * difficultyMultiplier)) + 3;
             ans = num1 * num2;
             q = `${num1} x ${num2}`;
        } else {
             num1 = Math.floor(Math.random() * (50 * difficultyMultiplier)) + 20;
             num2 = Math.floor(Math.random() * (50 * difficultyMultiplier)) + 20;
             ans = num1 + num2;
             q = `${num1} + ${num2}`;
        }
        setMathProblem({ q, a: ans });
    }
  }, [stage, breachCount]);

  // Load System Message
  useEffect(() => {
    if (stage === 'MOTIVATION') {
        const loadMotivation = async () => {
            const msg = await generateSystemMotivation(task.title);
            setSystemMsg(msg);
        };
        loadMotivation();
    }
  }, [stage, task]);

  const handleVerify = () => {
    const val = parseInt(userResponse);
    if (!isNaN(val) && val === mathProblem.a) {
        setStage('SUCCESS');
        setTimeout(() => {
            onUnlock();
            if (document.exitFullscreen) document.exitFullscreen();
        }, 2000);
    } else {
        setErrorState(true);
        setUserResponse("");
        setTimeout(() => setErrorState(false), 800);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden touch-none transition-colors duration-500 ${breachCount > 0 ? 'bg-red-950' : 'bg-black'}`}>
      
      <div className={`absolute inset-0 transition-all duration-1000 pointer-events-none ${
          breachCount > 0 ? 'bg-red-900/40 animate-pulse' :
          stage === 'MOTIVATION' ? 'bg-blue-950/40' : 
          stage === 'SUCCESS' ? 'bg-green-950' : 
          'bg-zinc-950'
      }`} />
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,122,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,122,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className={`relative z-10 w-full max-w-md p-8 text-center transition-transform duration-100 ${errorState ? 'animate-shake' : ''}`}>
        
        {stage === 'ALERT' && (
          <div className="space-y-8 animate-in zoom-in duration-300">
             <div className="relative w-40 h-40 mx-auto">
               <div className="absolute inset-0 border-4 border-ios-red rounded-full animate-ping opacity-50" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <ShieldAlert className="w-20 h-20 text-ios-red animate-pulse" />
               </div>
            </div>
            
            <div>
               <h1 className="text-4xl font-black text-white tracking-tighter mb-2">LOCKDOWN IN EFFECT</h1>
               <div className="bg-ios-red/10 border border-ios-red p-4 rounded text-ios-red text-sm font-mono uppercase">
                  Directive: <span className="text-white font-bold">{task.title}</span>
               </div>
            </div>

            <button 
              onClick={() => {
                setStage('MOTIVATION');
                audioRef.current?.play().catch(() => {});
              }}
              className="w-full py-5 bg-ios-red hover:bg-red-600 text-white font-bold text-lg uppercase tracking-widest rounded shadow-[0_0_30px_rgba(255,59,48,0.4)]"
            >
              INITIALIZE PROTOCOL
            </button>
          </div>
        )}

        {stage === 'MOTIVATION' && (
           <div className="space-y-8 animate-in fade-in duration-1000">
              <div className="relative w-48 h-48 mx-auto">
                 <div className="absolute inset-0 bg-ios-blue/20 blur-[50px] rounded-full animate-pulse" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-24 h-24 text-ios-blue animate-pulse" />
                 </div>
              </div>

              <div className="bg-black/60 border-y border-white/10 p-6 backdrop-blur-md">
                 <p className="text-white font-mono text-sm leading-relaxed uppercase tracking-widest">
                    {systemMsg || "ACCESSING TACTICAL COMMAND..."}
                 </p>
              </div>

              <button 
                 onClick={() => setStage('CHALLENGE')}
                 className="w-full py-4 bg-ios-blue/20 border border-ios-blue text-ios-blue font-bold uppercase tracking-widest rounded"
              >
                 ACKNOWLEDGE
              </button>
           </div>
        )}

        {stage === 'CHALLENGE' && (
          <div className="space-y-6">
             <div className="bg-black/80 border border-white/10 p-8 rounded-2xl">
                <p className="text-ios-gray text-[10px] uppercase mb-4 flex items-center justify-center gap-2">
                   <Brain size={14} /> Neural Verification Required
                </p>
                <p className="text-6xl font-mono text-white font-bold tracking-widest">{mathProblem.q}</p>
             </div>

             <input 
                 autoFocus
                 type="tel"
                 value={userResponse}
                 onChange={(e) => setUserResponse(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                 placeholder="INPUT DATA"
                 className={`w-full bg-black/40 border-2 rounded-xl p-4 text-white text-center text-3xl font-bold outline-none font-mono transition-colors ${errorState ? 'border-ios-red' : 'border-white/10 focus:border-ios-blue'}`}
               />

             <button 
               onClick={handleVerify}
               className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold uppercase tracking-widest text-xs text-ios-gray"
             >
               Confirm Sync
             </button>
          </div>
        )}

        {stage === 'SUCCESS' && (
            <div className="animate-in zoom-in duration-500">
                <div className="w-32 h-32 mx-auto bg-ios-green/20 rounded-full flex items-center justify-center mb-6">
                    <Unlock className="w-16 h-16 text-ios-green" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2 uppercase italic">PROTOCOL CLEAR</h1>
                <p className="text-ios-gray text-xs font-mono">Resuming System Operation...</p>
            </div>
        )}
      </div>
    </div>
  );
};
