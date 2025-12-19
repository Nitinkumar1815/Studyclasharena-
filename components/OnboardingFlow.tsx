import React, { useState, useEffect } from 'react';
import { Sword, BookOpen, ChevronRight, GraduationCap, Target, Zap, Lock, ArrowRight, Loader2, Layers, Cpu, Trophy } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const Particles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cyber-neonBlue opacity-20 animate-float"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animationDuration: Math.random() * 8 + 4 + 's',
            animationDelay: Math.random() * 5 + 's'
          }}
        />
      ))}
    </div>
  );
};

// --- Added QuizCard component to fix missing reference ---
interface QuizCardProps {
  title: string;
  question: string;
  options: { label: string; icon: React.ElementType; val: string }[];
  onSelect: (val: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ title, question, options, onSelect }) => {
  return (
    <GlassCard className="h-full border-cyber-neonBlue/30 bg-black/40 flex flex-col p-8">
      <div className="mb-8">
        <h3 className="text-cyber-neonBlue font-mono text-xs uppercase tracking-[0.4em] mb-2">{title}</h3>
        <h2 className="text-2xl font-bold text-white">{question}</h2>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSelect(opt.val)}
            className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-cyber-neonBlue hover:bg-cyber-neonBlue/10 transition-all text-left"
          >
            <div className="p-3 rounded-lg bg-black/40 text-gray-400 group-hover:text-cyber-neonBlue transition-colors">
              <opt.icon size={24} />
            </div>
            <span className="font-bold text-gray-300 group-hover:text-white transition-colors uppercase tracking-widest text-sm">{opt.label}</span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'SPLASH' | 'QUIZ' | 'TRANSITION'>('SPLASH');
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stage === 'SPLASH') {
      const timer = setTimeout(() => {
        setStage('QUIZ');
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    
    if (quizStep < 2) {
      setTimeout(() => setQuizStep(prev => prev + 1), 400);
    } else {
      setTimeout(() => setStage('TRANSITION'), 400);
      setTimeout(() => {
        onComplete();
      }, 3000); 
    }
  };

  if (stage === 'SPLASH') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0a0a1a_0%,_#000000_100%)]" />
        <div className="absolute inset-0 opacity-10" 
             style={{ 
               backgroundImage: `linear-gradient(to right, #00f3ff 1px, transparent 1px), linear-gradient(to bottom, #00f3ff 1px, transparent 1px)`,
               backgroundSize: '60px 60px',
               maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)'
             }} 
        />
        
        <Particles />

        <div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
           
           {/* Glow Effects */}
           <div className="absolute w-[600px] h-[600px] bg-cyber-neonBlue/10 blur-[120px] rounded-full animate-pulse" />
           <div className="absolute w-[450px] h-[450px] bg-cyber-neonPurple/5 blur-[100px] rounded-full animate-pulse delay-700" />

           {/* Central Logo Construction */}
           <div className="relative w-72 h-72 md:w-[400px] md:h-[400px] flex items-center justify-center">
              
              {/* Spinning Tech Rings */}
              <div className="absolute inset-0 border border-cyber-neonBlue/30 rounded-full animate-spin-slow" />
              <div className="absolute inset-8 border border-dashed border-cyber-neonPurple/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute inset-[-20px] border-2 border-t-cyber-neonBlue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '3s' }} />

              {/* Corner Brackets */}
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-cyber-neonBlue rounded-tl-xl shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
              <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-cyber-neonBlue rounded-tr-xl shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-cyber-neonBlue rounded-bl-xl shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-cyber-neonBlue rounded-br-xl shadow-[0_0_15px_rgba(0,243,255,0.5)]" />

              {/* The Provided Logo Image */}
              <div className="relative w-full h-full p-10 bg-black/40 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden group shadow-2xl">
                 <div className="absolute inset-0 bg-gradient-to-tr from-cyber-neonBlue/5 to-transparent pointer-events-none" />
                 
                 <img 
                   src="IMG_20251207_201015_824.webp" 
                   alt="StudyClash Arena" 
                   className="w-full h-full object-contain relative z-10 animate-float"
                   style={{ filter: 'drop-shadow(0 0 30px rgba(0, 243, 255, 0.4))' }}
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                     if (fallback) fallback.classList.remove('hidden');
                   }}
                 />

                 {/* Fallback Graphic */}
                 <div className="logo-fallback hidden absolute inset-0 flex flex-col items-center justify-center text-cyber-neonBlue animate-pulse p-12">
                    <Sword size={120} className="mb-4 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]" />
                    <span className="text-3xl font-black italic tracking-tighter uppercase">StudyClash<span className="text-white">Arena</span></span>
                    <span className="text-xs font-mono tracking-[0.5em] text-gray-400 mt-2">Arena Protocol</span>
                 </div>

                 {/* Vertical Scanline */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-cyber-neonBlue/30 animate-scanline z-20 shadow-[0_0_15px_#00f3ff]" />
              </div>
           </div>

           {/* Brand Caption */}
           <div className="mt-20 text-center space-y-4">
              <div className="flex items-center gap-4 justify-center">
                 <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyber-neonBlue" />
                 <span className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.8em] animate-pulse">Syncing Neural Core</span>
                 <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyber-neonBlue" />
              </div>
              <h1 className="text-white font-mono text-sm font-bold tracking-[1.2em] uppercase">
                Establishing Link
              </h1>
              <div className="flex gap-2 justify-center pt-2">
                 <div className="w-1.5 h-1.5 bg-cyber-neonBlue rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <div className="w-1.5 h-1.5 bg-cyber-neonBlue rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-1.5 h-1.5 bg-cyber-neonBlue rounded-full animate-bounce" />
              </div>
           </div>
        </div>

        {/* Footer Detail */}
        <div className="absolute bottom-10 left-0 w-full px-12 flex justify-between items-center text-gray-700 font-mono text-[9px] uppercase tracking-widest opacity-40">
           <span>© 2025 STUDYCLASH SYSTEMS</span>
           <span className="flex items-center gap-2"><Cpu size={10}/> SECURE_UPLINK_V.1.0.8</span>
        </div>
      </div>
    );
  }

  if (stage === 'TRANSITION') {
     return (
        <div className="fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="relative">
              <div className="w-24 h-24 border-t-4 border-cyber-neonBlue border-r-4 border-r-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Zap className="text-yellow-500 animate-pulse" size={32} fill="currentColor" />
              </div>
           </div>
           <h2 className="mt-12 text-2xl font-bold text-white uppercase tracking-[0.4em] animate-pulse">
              Calibrating Profile
           </h2>
           <p className="text-cyber-neonBlue/60 font-mono text-[10px] mt-4 uppercase tracking-widest">
              Role: {answers.role || 'Operator'} // Module: {answers.class || 'Standard'}
           </p>
        </div>
     );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyber-neonBlue/5 rounded-full blur-[150px]" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyber-neonPurple/5 rounded-full blur-[150px]" />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md perspective-1000">
            <div className="flex gap-2 mb-12 justify-center">
              {[0, 1, 2].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i <= quizStep ? 'w-10 bg-cyber-neonBlue shadow-[0_0_10px_#00f3ff]' : 'w-6 bg-gray-800'}`} />
              ))}
            </div>

            <div className="relative h-[520px]">
              <div className={`absolute inset-0 transition-all duration-700 transform-style-3d ${quizStep === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full rotate-y-12 pointer-events-none'}`}>
                  <QuizCard 
                    title="Identity Verification"
                    question="Select your operational sector."
                    options={[
                      { label: 'School Student', icon: GraduationCap, val: 'school' },
                      { label: 'Dropper / Alumnus', icon: ChevronRight, val: 'dropper' },
                      { label: 'Competitive Aspirant', icon: Target, val: 'aspirant' }
                    ]}
                    onSelect={(val) => handleAnswer('role', val)}
                  />
              </div>

              <div className={`absolute inset-0 transition-all duration-700 transform-style-3d ${quizStep === 1 ? 'opacity-100 translate-x-0' : quizStep < 1 ? 'opacity-0 translate-x-full -rotate-y-12 pointer-events-none' : 'opacity-0 -translate-x-full rotate-y-12 pointer-events-none'}`}>
                  <QuizCard 
                    title="Objective Set"
                    question="What is your primary directive?"
                    options={[
                      { label: 'Exam Supremacy', icon: Trophy, val: 'crack' },
                      { label: 'Neural Efficiency', icon: Zap, val: 'improve' },
                      { label: 'Void Protocol (Focus)', icon: Lock, val: 'focus' }
                    ]}
                    onSelect={(val) => handleAnswer('goal', val)}
                  />
              </div>

              <div className={`absolute inset-0 transition-all duration-700 transform-style-3d ${quizStep === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full -rotate-y-12 pointer-events-none'}`}>
                  <QuizCard 
                    title="Module Sync"
                    question="Configure grade parameters."
                    options={[
                      { label: 'Grade 9 - 10', icon: GraduationCap, val: '9-10' },
                      { label: 'Grade 11 - 12', icon: GraduationCap, val: '11-12' },
                      { label: 'Advanced Core (JEE/NEET)', icon: Target, val: 'competitive' },
                      { label: 'Other Protocols', icon: Layers, val: 'others' }
                    ]}
                    onSelect={(val) => handleAnswer('class', val)}
                  />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};