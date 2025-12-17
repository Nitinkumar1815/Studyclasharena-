import React, { useState, useEffect, useRef } from 'react';
import { generateGitaGuidance } from '../services/geminiService';
import { Sparkles, Sun, ArrowLeft, Disc, Atom, Zap, Send } from 'lucide-react';

export const WisdomShrine: React.FC = () => {
  // States: INTRO (Shloka Text), READY (Menu), THINKING (Processing), SPEAKING (Text Stream)
  const [state, setState] = useState<'INTRO' | 'READY' | 'THINKING' | 'SPEAKING'>('INTRO');
  const [guidance, setGuidance] = useState("");
  const [displayedGuidance, setDisplayedGuidance] = useState("");
  const [introStep, setIntroStep] = useState(0); // For animating the shloka lines
  const [customQuery, setCustomQuery] = useState(""); // For custom input
  
  // Parallax / 3D State
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const feelings = [
    { text: "I am distracted", sub: "मन विचलित है", icon: Atom },
    { text: "I feel weak", sub: "आत्मविश्वास की कमी", icon: Zap },
    { text: "I fear failure", sub: "असफलता का भय", icon: Disc },
    { text: "I am lost", sub: "सही मार्ग क्या है?", icon: Sparkles }
  ];

  // Parallax Effect Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    setRotation({ 
        x: y * -15, // Increased tilt for more drama
        y: x * 15 
    });
  };

  // Cinematic Intro Sequence
  useEffect(() => {
    const sequence = async () => {
      // Line 1
      await new Promise(r => setTimeout(r, 800));
      setIntroStep(1); 
      // Line 2
      await new Promise(r => setTimeout(r, 1800));
      setIntroStep(2);
      // Line 3
      await new Promise(r => setTimeout(r, 1800));
      setIntroStep(3);
      // Line 4
      await new Promise(r => setTimeout(r, 1800));
      setIntroStep(4);
      // Reveal Shrine
      await new Promise(r => setTimeout(r, 3500));
      setState('READY');
    };
    sequence();
  }, []);

  // Text Streaming Effect (Typewriter)
  useEffect(() => {
    if (state === 'SPEAKING' && guidance) {
      let i = 0;
      setDisplayedGuidance("");
      const interval = setInterval(() => {
        setDisplayedGuidance(guidance.substring(0, i));
        i++;
        if (i > guidance.length) clearInterval(interval);
      }, 30); // Speed of typing
      return () => clearInterval(interval);
    }
  }, [state, guidance]);

  const seekGuidance = async (feeling: string) => {
    if (!feeling.trim()) return;
    setState('THINKING');
    
    // Simulate complex thought process visual
    await new Promise(r => setTimeout(r, 1500)); 

    const text = await generateGitaGuidance(feeling);
    setGuidance(text);
    setState('SPEAKING');
    setCustomQuery(""); // Reset input
  };

  const reset = () => {
    setState('READY');
    setGuidance("");
    setDisplayedGuidance("");
  };

  return (
    <div 
        className="h-full relative overflow-hidden flex flex-col items-center justify-center bg-black perspective-1000 select-none"
        onMouseMove={handleMouseMove}
        ref={containerRef}
    >
      
      {/* 1. Cinematic Intro Overlay (Shloka) */}
      {state === 'INTRO' && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-6 space-y-6 md:space-y-8">
           
           {/* Verse 7 */}
           <div className={`transition-all duration-1000 transform ${introStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600 font-serif tracking-widest drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] leading-relaxed">
                यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।
              </h1>
           </div>
           <div className={`transition-all duration-1000 transform ${introStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600 font-serif tracking-widest drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] leading-relaxed">
                अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥
              </h1>
           </div>

           {/* Verse 8 - Changing tone to action/destruction of evil */}
           <div className={`transition-all duration-1000 transform ${introStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-orange-500 to-red-500 font-serif tracking-widest drop-shadow-[0_0_25px_rgba(249,115,22,0.6)] mt-4 leading-relaxed">
                परित्राणाय साधूनां विनाशाय च दुष्कृताम् ।
              </h1>
           </div>
           <div className={`transition-all duration-1000 transform ${introStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-orange-500 to-red-500 font-serif tracking-widest drop-shadow-[0_0_25px_rgba(249,115,22,0.6)] leading-relaxed">
                धर्मसंस्थापनार्थाय सम्भवामि युगे युगे ॥
              </h1>
           </div>

        </div>
      )}

      {/* 2. Dynamic Background - The Void */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-black">
        {/* Nebulas */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(20,20,40,1)_0%,_rgba(0,0,0,1)_100%)]" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-[spin_240s_linear_infinite]" />
        
        {/* Light Beams */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,215,0,0.03)_20deg,transparent_40deg,rgba(255,215,0,0.03)_60deg,transparent_80deg)] animate-[spin_20s_linear_infinite]" />
      </div>

      {/* 3. The Divine Energy Form (Replacing the Photo) */}
      <div 
        className="relative z-10 w-full h-[50%] flex items-center justify-center transform-style-3d transition-transform duration-200 ease-out"
        style={{
             transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
         {state !== 'INTRO' && (
           <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] animate-in zoom-in duration-[2000ms]">
              
              {/* Core Singularity */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-[40px] animate-pulse z-20 shadow-[0_0_100px_rgba(255,255,255,0.8)]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-100 rounded-full z-30 shadow-[inset_0_0_20px_rgba(234,179,8,1)]" />

              {/* Ring 1: The Golden Sudarshan (Fast Spin) */}
              <div className="absolute inset-0 border-[4px] border-dashed border-yellow-500/40 rounded-full animate-[spin_10s_linear_infinite] shadow-[0_0_30px_rgba(234,179,8,0.2)]" />
              
              {/* Ring 2: The Cosmic Blue (Reverse Spin) */}
              <div className="absolute inset-[-40px] border-[2px] border-dotted border-cyan-500/30 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
              
              {/* Ring 3: The Geometric Runes */}
              <div className="absolute inset-[-80px] rounded-full animate-[spin_60s_linear_infinite] opacity-40">
                 {[...Array(8)].map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute top-0 left-1/2 w-1 h-[50%] bg-gradient-to-b from-transparent via-orange-500 to-transparent origin-bottom transform"
                        style={{ transform: `translateX(-50%) rotate(${i * 45}deg)` }}
                    />
                 ))}
              </div>

              {/* Particles */}
              <div className="absolute inset-[-100px] animate-pulse">
                 {[...Array(12)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full blur-[1px] animate-float"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 3 + 2}s`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                 ))}
              </div>

           </div>
         )}
      </div>

      {/* 4. Interface Layer */}
      <div className="relative z-20 w-full max-w-2xl px-6 pb-12 min-h-[300px] flex flex-col justify-end">
         
         {/* State: READY (Menu) */}
         {state === 'READY' && (
            <div className="space-y-4 animate-in slide-in-from-bottom-20 fade-in duration-1000">
               
               {/* Preset Buttons */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feelings.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => seekGuidance(f.text)}
                        className="group relative overflow-hidden bg-black/40 hover:bg-yellow-900/10 border border-white/10 hover:border-yellow-500/50 p-6 rounded-xl text-left transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="flex items-center justify-between mb-2">
                            <f.icon className="text-yellow-600 group-hover:text-yellow-400 transition-colors" size={24} />
                            <Sparkles className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                        </div>
                        <div className="text-lg font-bold text-gray-200 group-hover:text-white font-serif">{f.text}</div>
                        <div className="text-xs text-gray-500 group-hover:text-yellow-500/80 font-mono mt-1 uppercase tracking-wider">{f.sub}</div>
                      </button>
                  ))}
               </div>
               
               {/* Custom Input */}
               <div className="flex gap-2 items-center bg-gray-900/80 border border-yellow-500/30 p-2 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-all focus-within:border-yellow-500/60 focus-within:shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                  <input 
                      type="text" 
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && seekGuidance(customQuery)}
                      placeholder="Ask your own question to the Universe..."
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-4 py-2 font-serif text-lg"
                  />
                  <button 
                      onClick={() => seekGuidance(customQuery)}
                      disabled={!customQuery.trim()}
                      className="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-500/50 p-3 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  >
                      <Send size={20} />
                  </button>
               </div>
            </div>
         )}

         {/* State: THINKING (Loader) */}
         {state === 'THINKING' && (
            <div className="flex flex-col items-center justify-center animate-in fade-in duration-500 py-10">
               <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-t-2 border-yellow-500 rounded-full animate-spin" />
                  <div className="absolute inset-2 border-r-2 border-cyan-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
               </div>
               <p className="mt-4 text-yellow-500 font-mono text-sm tracking-[0.3em] animate-pulse">CONNECTING TO AKASHIC RECORDS...</p>
            </div>
         )}

         {/* State: SPEAKING (Result) */}
         {state === 'SPEAKING' && (
            <div className="relative animate-in zoom-in-95 duration-500">
               {/* Holo-Glass Container */}
               <div className="bg-black/80 border border-yellow-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden">
                  
                  {/* Decorative Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-500 opacity-50" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-500 opacity-50" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-500 opacity-50" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-500 opacity-50" />

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                     <Sun className="text-yellow-400 animate-[spin_10s_linear_infinite]" size={24} />
                     <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 tracking-widest uppercase">
                        Divine Transmission
                     </h3>
                  </div>

                  {/* Streaming Text */}
                  <div className="min-h-[150px] md:min-h-[200px]">
                     <p className="text-lg md:text-2xl text-gray-100 font-serif leading-relaxed drop-shadow-md">
                        {displayedGuidance}
                        <span className="inline-block w-2 h-6 bg-yellow-500 ml-1 animate-pulse align-middle" />
                     </p>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                     <button 
                        onClick={reset}
                        className="flex items-center gap-2 text-sm text-yellow-500 hover:text-white uppercase tracking-widest transition-colors group"
                     >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Receive New Wisdom
                     </button>
                  </div>
               </div>
            </div>
         )}

      </div>
    </div>
  );
};