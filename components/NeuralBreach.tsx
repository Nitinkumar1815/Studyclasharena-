
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Terminal, Zap, Skull, ShieldAlert, Share2, Play, RotateCcw, Cpu, Lock, Crosshair } from 'lucide-react';

interface NeuralBreachProps {
  onExit: () => void;
  onScoreSubmit: (score: number) => void;
}

type FragmentType = 'NORMAL' | 'FIREWALL' | 'ENCRYPTED';

interface FallingFragment {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  speed: number;
  type: FragmentType;
  color: string;
}

const CODE_SNIPPETS = [
  "0xF1", "ROOT", "SUDO", "PING", "ECHO", "VOID", "NULL", 
  "TRUE", "FALSE", "IF", "ELSE", "WHILE", "CONST", "VAR",
  "INT", "BYTE", "MEGA", "GIGA", "TERA", "NANO", "UNIX", 
  "BIOS", "CMOS", "RAM", "GPU", "CPU", "ALU", "HACK", 
  "WORM", "BOT", "NET", "TCP", "UDP", "SSH", "FTP", "HTTP",
  "SSL", "TLS", "KEY", "SHA", "MD5", "AES", "DES", "RSA"
];

const FIREWALL_WORDS = [
  "DENIED", "BLOCK", "HALT", "STOP", "ERROR", "FATAL", "PANIC", "CRASH"
];

export const NeuralBreach: React.FC<NeuralBreachProps> = ({ onExit, onScoreSubmit }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [fragments, setFragments] = useState<FallingFragment[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [integrity, setIntegrity] = useState(100);
  const [combo, setCombo] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [shake, setShake] = useState(false);
  const [targetedId, setTargetedId] = useState<string | null>(null);
  
  const frameRef = useRef<number>(0);
  const spawnRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input
  useEffect(() => {
    if (gameState === 'PLAYING') {
      inputRef.current?.focus();
    }
  }, [gameState, fragments]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const loop = () => {
      setFragments(prev => {
        // Move fragments
        const nextFragments = prev.map(f => ({
          ...f,
          y: f.y + f.speed * (0.05 + (difficulty * 0.005))
        })).filter(f => {
          // Check for breach (bottom of screen)
          if (f.y > 85) { // Hit bottom threshold
            const damage = f.type === 'FIREWALL' ? 25 : f.type === 'ENCRYPTED' ? 15 : 10;
            setIntegrity(l => Math.max(0, l - damage));
            setShake(true);
            setTimeout(() => setShake(false), 200);
            setCombo(0);
            return false;
          }
          return true;
        });
        return nextFragments;
      });

      // Spawn Logic
      spawnRef.current++;
      const spawnRate = Math.max(20, 60 - difficulty * 3); // Spawns faster over time
      
      if (spawnRef.current > spawnRate) {
        spawnRef.current = 0;
        
        // Determine Type
        const rand = Math.random();
        let type: FragmentType = 'NORMAL';
        let text = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
        let speed = Math.random() * 0.4 + 0.1;
        let color = "text-green-500";

        if (rand > 0.9) {
           type = 'FIREWALL';
           text = FIREWALL_WORDS[Math.floor(Math.random() * FIREWALL_WORDS.length)];
           speed = 0.1; // Slow but deadly
           color = "text-red-500";
        } else if (rand > 0.8) {
           type = 'ENCRYPTED';
           speed = 0.6; // Fast
           color = "text-yellow-400";
        }

        const newFragment: FallingFragment = {
          id: Date.now().toString() + Math.random(),
          text,
          x: Math.random() * 80 + 10,
          y: -10,
          speed,
          type,
          color
        };
        setFragments(prev => [...prev, newFragment]);
      }

      if (integrity <= 0) {
        setGameState('GAMEOVER');
      } else {
        frameRef.current = requestAnimationFrame(loop);
      }
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, difficulty, integrity]);

  // Difficulty scaling
  useEffect(() => {
    if (score > 0 && score % 500 === 0) {
      setDifficulty(prev => Math.min(prev + 1, 15));
    }
  }, [score]);

  // Input Handling
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInput(val);

    // Find partial match for "Lock-on" visual
    const partialMatch = fragments.find(f => f.text.startsWith(val));
    if (partialMatch) {
       setTargetedId(partialMatch.id);
    } else {
       setTargetedId(null);
    }

    // Check exact match
    const matchIndex = fragments.findIndex(f => f.text === val);
    if (matchIndex !== -1) {
      const fragment = fragments[matchIndex];
      
      // Destroy
      setFragments(prev => prev.filter(f => f.id !== fragment.id));
      setInput("");
      setTargetedId(null);
      
      // Score Calc
      let points = 10;
      if (fragment.type === 'FIREWALL') points = 50;
      if (fragment.type === 'ENCRYPTED') points = 30;
      
      setScore(s => s + points + (combo * 5));
      setCombo(c => c + 1);
    }
  };

  const getTargetCoords = () => {
     if (!targetedId) return null;
     const target = fragments.find(f => f.id === targetedId);
     if (!target) return null;
     return { x: target.x, y: target.y };
  };

  const targetCoords = getTargetCoords();

  return (
    <div className={`fixed inset-0 z-50 bg-[#050505] font-mono overflow-hidden ${shake ? 'animate-shake' : ''}`}>
      
      {/* CRT Monitor Effects */}
      <div className="absolute inset-0 pointer-events-none z-40">
         {/* Scanlines */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />
         {/* Vignette */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Cyber Grid Floor */}
      <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(transparent_0%,rgba(0,243,255,0.1)_100%)] perspective-1000 transform-style-3d opacity-20 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,243,255,0.3)_25%,rgba(0,243,255,0.3)_26%,transparent_27%,transparent_74%,rgba(0,243,255,0.3)_75%,rgba(0,243,255,0.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,243,255,0.3)_25%,rgba(0,243,255,0.3)_26%,transparent_27%,transparent_74%,rgba(0,243,255,0.3)_75%,rgba(0,243,255,0.3)_76%,transparent_77%,transparent)] bg-[size:50px_50px] transform rotateX(60deg) origin-bottom" />
      </div>

      {/* HUD Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-30 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex gap-4 items-center">
           <div className="bg-[#0a0a10] border border-cyber-neonBlue/30 p-2 rounded shadow-[0_0_10px_rgba(0,243,255,0.1)]">
              <div className="flex justify-between items-center mb-1">
                 <div className="text-[10px] text-cyber-neonBlue uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert size={10} /> System Integrity
                 </div>
                 <div className="text-[10px] text-white font-bold">{integrity}%</div>
              </div>
              <div className="w-40 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-300 ${integrity > 50 ? 'bg-cyber-neonBlue' : 'bg-red-500 animate-pulse'}`} 
                   style={{ width: `${integrity}%` }} 
                 />
              </div>
           </div>
           
           <div className="bg-[#0a0a10] border border-green-500/30 p-2 rounded min-w-[100px]">
              <div className="text-[10px] text-green-500 uppercase tracking-wider">Score</div>
              <div className="text-xl font-bold text-white font-mono leading-none mt-1">{score.toLocaleString()}</div>
           </div>
        </div>

        <div className="text-right">
           <div className={`text-5xl font-black italic tracking-tighter ${combo > 5 ? 'text-yellow-400 animate-bounce' : 'text-gray-700'}`}>
              {combo}x
           </div>
           {combo > 5 && <div className="text-[10px] text-yellow-500 uppercase font-bold animate-pulse">OVERDRIVE ACTIVE</div>}
        </div>
      </div>

      {/* Game Area */}
      {gameState === 'PLAYING' && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {fragments.map(f => (
            <div 
              key={f.id}
              className={`absolute font-bold text-lg font-mono transition-transform duration-100 flex flex-col items-center ${f.color}`}
              style={{ 
                  left: `${f.x}%`, 
                  top: `${f.y}%`,
                  textShadow: f.type === 'ENCRYPTED' ? '0 0 10px rgba(234,179,8,0.8)' : f.type === 'FIREWALL' ? '0 0 10px rgba(239,68,68,0.8)' : '0 0 5px rgba(34,197,94,0.5)'
              }}
            >
              {/* Type Indicator Icon */}
              {f.type === 'FIREWALL' && <Skull size={16} className="mb-1 animate-pulse" />}
              {f.type === 'ENCRYPTED' && <Lock size={16} className="mb-1" />}

              {/* Text rendering with highlighting */}
              <div className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                 {f.text.split('').map((char, i) => {
                    const isMatched = targetedId === f.id && i < input.length;
                    return (
                       <span key={i} className={isMatched ? 'text-white' : ''}>{char}</span>
                    );
                 })}
              </div>

              {/* Decode Progress Bar for visual flair */}
              <div className="w-full h-0.5 bg-gray-800 mt-1">
                 <div 
                    className={`h-full ${f.type === 'FIREWALL' ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${Math.random() * 100}%`, opacity: 0.5 }} 
                 />
              </div>
            </div>
          ))}

          {/* Laser Targeting Line */}
          {targetCoords && (
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <line 
                   x1="50%" 
                   y1="90%" 
                   x2={`${targetCoords.x}%`} 
                   y2={`${targetCoords.y + 2}%`} // Aim slightly below text
                   stroke={fragments.find(f => f.id === targetedId)?.type === 'FIREWALL' ? '#ef4444' : '#00f3ff'} 
                   strokeWidth="2" 
                   strokeDasharray="4"
                   className="animate-pulse opacity-50"
                />
             </svg>
          )}
        </div>
      )}

      {/* Start Screen */}
      {gameState === 'START' && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md text-center border-cyber-neonBlue shadow-[0_0_80px_rgba(0,243,255,0.2)]">
             <div className="mb-6 relative">
                <Terminal size={64} className="mx-auto text-cyber-neonBlue relative z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-cyber-neonBlue/20 rounded-full blur-xl animate-pulse" />
             </div>
             
             <h1 className="text-4xl font-bold text-white mb-2 tracking-widest font-mono">NEURAL BREACH</h1>
             <div className="flex justify-center gap-2 mb-6">
                <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-[10px] border border-red-500/50 rounded uppercase">Firewall: Deadly</span>
                <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-[10px] border border-yellow-500/50 rounded uppercase">Gold: Bonus</span>
             </div>

             <p className="text-gray-400 text-sm mb-8 font-mono leading-relaxed">
                <span className="text-cyber-neonBlue">>></span> INTERCEPT DATA FRAGMENTS<br/>
                <span className="text-cyber-neonBlue">>></span> TYPE COMMANDS TO EXECUTE<br/>
                <span className="text-cyber-neonBlue">>></span> PROTECT SYSTEM INTEGRITY
             </p>
             
             <button 
               onClick={() => setGameState('PLAYING')}
               className="w-full py-4 bg-cyber-neonBlue hover:bg-cyan-400 text-black font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 group transition-all"
             >
               <Play size={20} className="group-hover:scale-110 transition-transform" /> 
               INITIALIZE DECK
             </button>
             <button onClick={onExit} className="mt-4 text-xs text-gray-500 hover:text-white font-mono uppercase tracking-wider">Abort Mission</button>
          </GlassCard>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-red-950/90 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="text-center p-8 border-2 border-red-500 rounded-2xl bg-black max-w-md w-full shadow-[0_0_100px_rgba(220,38,38,0.6)] relative overflow-hidden">
             {/* Glitch Overlay */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse mix-blend-overlay" />

             <Skull size={80} className="mx-auto text-red-500 mb-4 animate-shake" />
             <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">CRITICAL ERROR</h2>
             <p className="text-red-400 font-mono text-sm mb-6 uppercase tracking-widest">System Integrity Compromised</p>
             
             <div className="bg-red-900/20 border border-red-500/30 p-4 rounded mb-8">
                <div className="text-xs text-gray-400 uppercase">Final Score</div>
                <div className="text-4xl text-white font-mono font-bold tracking-widest">{score.toLocaleString()}</div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <button 
                  onClick={() => {
                    setFragments([]);
                    setScore(0);
                    setIntegrity(100);
                    setCombo(0);
                    setDifficulty(1);
                    setGameState('PLAYING');
                  }}
                  className="py-3 bg-white text-black font-bold uppercase rounded hover:bg-gray-200 flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw size={16} /> Reboot
                </button>
                <button 
                  onClick={() => {
                    const text = `I hacked the mainframe with ${score} PTS in StudyClash! 🤖 #NeuralHack`;
                    navigator.clipboard.writeText(text);
                    alert("Score copied!");
                  }}
                  className="py-3 bg-blue-600 text-white font-bold uppercase rounded hover:bg-blue-500 flex items-center justify-center gap-2 text-sm"
                >
                  <Share2 size={16} /> Share
                </button>
             </div>
             
             <button 
               onClick={() => {
                  onScoreSubmit(Math.floor(score / 10)); 
                  onExit();
               }} 
               className="text-gray-500 hover:text-white uppercase text-xs tracking-widest relative z-10"
             >
               Exit & Extract {Math.floor(score / 10)} Credits
             </button>
          </div>
        </div>
      )}

      {/* Player Terminal Input */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-30">
         <div className="max-w-md mx-auto relative">
            {/* Input Bezel */}
            <div className="absolute inset-0 bg-cyber-neonBlue/10 blur-xl rounded-full opacity-50" />
            
            <div className="relative bg-black/80 border-2 border-cyber-neonBlue rounded-lg flex items-center overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.3)]">
               <div className="pl-4 pr-2 text-cyber-neonBlue animate-pulse">
                  <Crosshair size={24} />
               </div>
               <input
                 ref={inputRef}
                 type="text"
                 value={input}
                 onChange={handleInput}
                 onBlur={() => gameState === 'PLAYING' && inputRef.current?.focus()}
                 className="w-full bg-transparent border-none text-center text-3xl font-bold text-white py-4 uppercase outline-none font-mono tracking-widest placeholder-gray-700"
                 placeholder="CMD_READY"
               />
               <div className="pr-4 pl-2 text-cyber-neonBlue">
                  <Cpu size={20} />
               </div>
            </div>
            
            {/* Keyboard hint */}
            <div className="text-center mt-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
               Type falling codes to execute
            </div>
         </div>
      </div>

    </div>
  );
};
