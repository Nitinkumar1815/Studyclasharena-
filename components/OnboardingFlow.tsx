
import React, { useState, useEffect } from 'react';
import { Sword, BookOpen, ChevronRight, GraduationCap, Target, Zap, Lock, ArrowRight, Loader2, Layers, Cpu, Trophy, User, Sparkles, ShieldCheck } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

interface OnboardingFlowProps {
  onComplete: (data: Record<string, string>) => void;
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
        <h2 className="text-2xl font-bold text-white leading-tight">{question}</h2>
      </div>
      <div className="flex-1 flex flex-col gap-3">
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
  const [stage, setStage] = useState<'SPLASH' | 'QUIZ' | 'ASSIGNING' | 'DONE'>('SPLASH');
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stage === 'SPLASH') {
      const timer = setTimeout(() => {
        setStage('QUIZ');
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleAnswer = (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    
    if (quizStep < 2) {
      setTimeout(() => setQuizStep(prev => prev + 1), 400);
    } else {
      setTimeout(() => setStage('ASSIGNING'), 400);
      setTimeout(() => setStage('DONE'), 4500);
      setTimeout(() => {
        onComplete(newAnswers);
      }, 6500); 
    }
  };

  if (stage === 'SPLASH') {
    return (
      <div className="fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0a0a1a_0%,_#000000_100%)]" />
        <Particles />
        <div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
           <div className="relative w-72 h-72 md:w-[400px] md:h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 border border-cyber-neonBlue/30 rounded-full animate-spin-slow" />
              <div className="absolute inset-8 border border-dashed border-cyber-neonPurple/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              <div className="relative w-full h-full p-10 bg-black/40 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden group shadow-2xl">
                 <img src="IMG_20251207_201015_824.webp" alt="StudyClash Arena" className="w-full h-full object-contain relative z-10 animate-float" style={{ filter: 'drop-shadow(0 0 30px rgba(0, 243, 255, 0.4))' }} />
                 <div className="absolute top-0 left-0 w-full h-1 bg-cyber-neonBlue/30 animate-scanline z-20 shadow-[0_0_15px_#00f3ff]" />
              </div>
           </div>
           <div className="mt-12 text-center space-y-2">
              <h2 className="text-2xl font-black italic tracking-widest text-white uppercase">Welcome Recruit</h2>
              <p className="text-cyber-neonBlue font-mono text-xs uppercase tracking-[0.5em] animate-pulse">Initializing Identity Forge...</p>
           </div>
        </div>
      </div>
    );
  }

  if (stage === 'ASSIGNING') {
     return (
        <div className="fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
           <div className="relative w-48 h-48 mb-12">
              <div className="absolute inset-0 border-4 border-cyber-neonBlue border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-4 border border-dashed border-cyber-neonPurple rounded-full animate-[spin_5s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="text-white animate-pulse" size={48} />
              </div>
           </div>
           <div className="space-y-4 max-w-sm">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Analyzing Neural Affinity</h2>
              <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-widest text-cyber-neonBlue">
                 <div className="flex justify-between border-b border-white/5 pb-1"><span>Sector:</span> <span className="text-white">{answers.role}</span></div>
                 <div className="flex justify-between border-b border-white/5 pb-1"><span>Goal:</span> <span className="text-white">{answers.goal}</span></div>
                 <div className="flex justify-between border-b border-white/5 pb-1"><span>Module:</span> <span className="text-white">{answers.class}</span></div>
              </div>
              <p className="text-gray-500 text-xs mt-6 animate-pulse">GENERATING MARVEL RANK...</p>
           </div>
        </div>
     );
  }

  if (stage === 'DONE') {
      return (
        <div className="fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
           <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
              <ShieldCheck size={48} className="text-green-500" />
           </div>
           <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2">LINK ESTABLISHED</h2>
           <p className="text-cyber-neonBlue font-mono text-sm tracking-widest">Operator Synchronized with the Arena.</p>
           <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping delay-75" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping delay-150" />
           </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyber-neonBlue/5 rounded-full blur-[150px]" />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
            <div className="flex gap-2 mb-12 justify-center">
              {[0, 1, 2].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i <= quizStep ? 'w-10 bg-cyber-neonBlue shadow-[0_0_10px_#00f3ff]' : 'w-6 bg-gray-800'}`} />
              ))}
            </div>

            <div className="relative h-[480px]">
              <div className={`absolute inset-0 transition-all duration-700 transform-style-3d ${quizStep === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full rotate-y-12 pointer-events-none'}`}>
                  <QuizCard 
                    title="ID Verification"
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
