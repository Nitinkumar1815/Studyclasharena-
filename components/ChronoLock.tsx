
import React, { useState, useEffect, useRef } from 'react';
import { ScheduleItem } from '../types';
import { ShieldAlert, Lock, Unlock, Calculator, Sun, Brain } from 'lucide-react';
import { generateKrishnaMotivation } from '../services/geminiService';

interface ChronoLockProps {
  task: ScheduleItem;
  onUnlock: () => void;
}

export const ChronoLock: React.FC<ChronoLockProps> = ({ task, onUnlock }) => {
  const [stage, setStage] = useState<'ALERT' | 'MOTIVATION' | 'CHALLENGE' | 'SUCCESS'>('ALERT');
  const [mathProblem, setMathProblem] = useState({ q: "", a: 0 });
  const [userResponse, setUserResponse] = useState("");
  const [errorState, setErrorState] = useState(false);
  const [krishnaMsg, setKrishnaMsg] = useState("");
  const [breachCount, setBreachCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background Audio (War Drums / Ambience)
  useEffect(() => {
    // Only play if audio context allows
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/535/535-preview.mp3'); // Deep hum/drone
    audio.loop = true;
    audio.volume = 1.0; // Increased volume for intensity
    audioRef.current = audio;
    
    // Attempt play
    audio.play().catch(e => console.log("Autoplay blocked", e));
    
    return () => {
        audio.pause();
        audio.currentTime = 0;
    };
  }, []);

  // Force Fullscreen on Mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.log("Fullscreen blocked by user interaction requirements");
      }
    };
    enterFullscreen();
  }, []);

  // Strict Visibility Check (Anti-Home Screen)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User tried to leave
        setBreachCount(prev => prev + 1);

        if ('Notification' in window && Notification.permission === 'granted') {
             new Notification("🚨 ESCAPE FAILED", {
                 body: "ChronoLock Active. Difficulty Increased.",
                 icon: "https://img.icons8.com/color/96/siren.png",
                 requireInteraction: true
             });
        }
      } else {
        // User Returned - Punishment Audio
        const punishAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3'); // Siren
        punishAudio.volume = 1.0;
        punishAudio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Generate Math Problem (Difficulty scales with breaches)
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

  // Load Krishna Message
  useEffect(() => {
    if (stage === 'MOTIVATION') {
        const loadDivineMessage = async () => {
            const msg = await generateKrishnaMotivation(task.title);
            setKrishnaMsg(msg);
        };
        loadDivineMessage();
    }
  }, [stage, task]);

  const handleVerify = () => {
    const val = parseInt(userResponse);
    if (!isNaN(val) && val === mathProblem.a) {
        setStage('SUCCESS');
        setTimeout(() => {
            onUnlock();
            if (document.exitFullscreen) document.exitFullscreen();
        }, 3000);
    } else {
        setErrorState(true);
        setUserResponse("");
        setTimeout(() => setErrorState(false), 800);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden touch-none transition-colors duration-500 ${breachCount > 0 ? 'bg-red-950' : 'bg-black'}`}>
      
      {/* Dynamic Background */}
      <div className={`absolute inset-0 transition-all duration-1000 pointer-events-none ${
          breachCount > 0 ? 'bg-red-900/50 animate-pulse' :
          stage === 'MOTIVATION' ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-600/30 via-black to-black' : 
          stage === 'SUCCESS' ? 'bg-green-950' : 
          'bg-red-950/60'
      }`} />
      
      {/* Scanning Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] animate-scanline pointer-events-none" />

      {/* Main Container */}
      <div className={`relative z-10 w-full max-w-md p-8 text-center transition-transform duration-100 ${errorState ? 'animate-shake' : ''}`}>
        
        {stage === 'ALERT' && (
          <div className="space-y-8 animate-in zoom-in duration-300">
             <div className="relative w-40 h-40 mx-auto">
               <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-50" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <Lock className="w-20 h-20 text-red-500 animate-pulse" />
               </div>
            </div>
            
            <div>
               <h1 className="text-5xl font-black text-white tracking-tighter mb-2">TIME TO ACT</h1>
               <div className="bg-red-500/10 border border-red-500 p-4 rounded text-red-200 text-sm font-mono uppercase">
                  Directive: <span className="text-white font-bold">{task.title}</span><br/>
                  <span className="font-bold animate-pulse">STRICT LOCK ENGAGED</span>
               </div>
            </div>

            <button 
              onClick={() => {
                setStage('MOTIVATION');
                audioRef.current?.play().catch(e => console.log(e));
              }}
              className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xl uppercase tracking-widest rounded shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse"
            >
              ACCEPT DUTY
            </button>
          </div>
        )}

        {stage === 'MOTIVATION' && (
           <div className="space-y-8 animate-in fade-in duration-1000">
              <div className="relative w-48 h-48 mx-auto">
                 {/* Divine Glow Animation */}
                 <div className="absolute inset-0 bg-yellow-500/20 blur-[50px] rounded-full animate-pulse-glow" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Sun className="w-32 h-32 text-yellow-400 animate-spin-slow" />
                 </div>
              </div>

              <div className="bg-black/60 border-y-2 border-yellow-500/50 p-6 backdrop-blur-md">
                 <p className="text-yellow-100 font-serif text-lg leading-relaxed italic">
                    "{krishnaMsg || "Summoning Divine Will..."}"
                 </p>
              </div>

              <button 
                 onClick={() => setStage('CHALLENGE')}
                 className="w-full py-4 bg-yellow-600/20 border border-yellow-500 text-yellow-400 font-bold uppercase tracking-widest rounded hover:bg-yellow-600/30 transition-all"
              >
                 I AM READY
              </button>
           </div>
        )}

        {stage === 'CHALLENGE' && (
          <div className="space-y-6">
             {breachCount > 0 && (
                 <div className="bg-red-600 border-2 border-white text-white font-bold uppercase text-lg py-4 px-4 rounded animate-bounce shadow-[0_0_20px_rgba(220,38,38,1)]">
                    🚨 CHEAT ATTEMPT DETECTED 🚨<br/>
                    <span className="text-sm font-mono">DIFFICULTY +{breachCount}00%</span>
                 </div>
             )}
             
             <div className="bg-black/80 border-2 border-white/20 p-8 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                <p className="text-gray-400 text-xs uppercase mb-2 flex items-center justify-center gap-2">
                   <Brain size={14} /> Cognitive Verification
                </p>
                <p className="text-6xl font-mono text-white font-bold tracking-widest">{mathProblem.q}</p>
             </div>

             <input 
                 autoFocus
                 type="tel"
                 value={userResponse}
                 onChange={(e) => setUserResponse(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                 placeholder="?"
                 className={`w-full bg-black/40 border-2 rounded-lg p-4 text-white text-center text-3xl font-bold outline-none font-mono transition-colors ${errorState ? 'border-red-500' : 'border-white/20 focus:border-yellow-400'}`}
               />

             <button 
               onClick={handleVerify}
               className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded font-bold uppercase tracking-wider"
             >
               Verify Focus
             </button>
          </div>
        )}

        {stage === 'SUCCESS' && (
            <div className="animate-in zoom-in duration-500">
                <div className="w-32 h-32 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.6)]">
                    <Unlock className="w-16 h-16 text-black" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">DHARMA FULFILLED</h1>
                <p className="text-gray-400">Returning to Tactical Dashboard...</p>
            </div>
        )}

      </div>
    </div>
  );
};
