import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Wind, Play, RotateCcw, Activity, Move, Eye, ChevronRight, CheckCircle2, Hand } from 'lucide-react';

type Mode = 'BREATH' | 'YOGA' | 'DRILLS';

interface ActivityStep {
  step: number;
  text: string;
}

interface ActivityCard {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: React.ElementType;
  steps: ActivityStep[];
  benefit: string;
  animationType: 'idle' | 'twist' | 'bend' | 'jump' | 'wave' | 'plank';
}

const YOGA_PROTOCOLS: ActivityCard[] = [
  {
    id: 'y1',
    title: 'Neural Link Twist',
    subtitle: 'Seated Spinal Release',
    duration: '2 Min',
    icon: Move,
    benefit: 'Relieves spinal compression from prolonged sitting.',
    animationType: 'twist',
    steps: [
      { step: 1, text: 'Sit upright in your chair, feet flat on the floor.' },
      { step: 2, text: 'Inhale deeply, elongating your spine (the mainframe).' },
      { step: 3, text: 'Exhale and twist to the right, holding the chair back.' },
      { step: 4, text: 'Hold for 15 seconds. Scan for tension. Release.' },
      { step: 5, text: 'Repeat on the left side to balance the system.' }
    ]
  },
  {
    id: 'y2',
    title: 'Cervical Realignment',
    subtitle: 'Neck Decompression',
    duration: '1 Min',
    icon: Activity,
    benefit: 'Corrects "Text Neck" and reduces cranial pressure.',
    animationType: 'wave', // Using wave as a proxy for neck movement visual
    steps: [
      { step: 1, text: 'Lower your shoulders away from your ears.' },
      { step: 2, text: 'Slowly drop right ear to right shoulder.' },
      { step: 3, text: 'Extend left arm down to increase the stretch.' },
      { step: 4, text: 'Hold for 3 breath cycles.' },
      { step: 5, text: 'Rotate head slowly to switch inputs to the left side.' }
    ]
  },
  {
    id: 'y3',
    title: 'System Reboot Fold',
    subtitle: 'Standing Forward Fold',
    duration: '3 Min',
    icon: RotateCcw,
    benefit: 'Increases blood flow to the brain for focus.',
    animationType: 'bend',
    steps: [
      { step: 1, text: 'Stand up and place feet hip-width apart.' },
      { step: 2, text: 'Exhale and hinge at your hips, folding forward.' },
      { step: 3, text: 'Keep knees slightly bent. Let your head hang heavy.' },
      { step: 4, text: 'Grab opposite elbows and sway gently.' },
      { step: 5, text: 'Roll up slowly to avoid system vertigo.' }
    ]
  },
  {
    id: 'y4',
    title: 'Wrist Protocol',
    subtitle: 'Carpal Tunnel Defense',
    duration: '1 Min',
    icon: Hand,
    benefit: 'Essential for keyboard warriors. Prevents RSI.',
    animationType: 'idle',
    steps: [
      { step: 1, text: 'Extend right arm forward, palm facing up.' },
      { step: 2, text: 'Use left hand to gently pull fingers back.' },
      { step: 3, text: 'Hold for 15 seconds. Feel the data channels open.' },
      { step: 4, text: 'Flip hand (palm down) and press knuckles.' },
      { step: 5, text: 'Switch to left hand accumulator.' }
    ]
  }
];

const KINETIC_DRILLS: ActivityCard[] = [
  {
    id: 'e1',
    title: 'Ocular Calibration',
    subtitle: 'Palming Technique',
    duration: '2 Min',
    icon: Eye,
    benefit: 'Resets visual sensors after high screen time.',
    animationType: 'idle',
    steps: [
      { step: 1, text: 'Rub palms together vigorously to generate heat.' },
      { step: 2, text: 'Cup palms over closed eyes without pressing.' },
      { step: 3, text: 'Visualize complete darkness (Void Mode).' },
      { step: 4, text: 'Breathe deeply into the darkness for 10 cycles.' },
      { step: 5, text: 'Slowly lower hands and open eyes.' }
    ]
  },
  {
    id: 'e2',
    title: 'Synaptic Jumpstart',
    subtitle: 'Rapid Jumping Jacks',
    duration: '45 Sec',
    icon: Activity,
    benefit: 'Spikes heart rate to banish fatigue immediately.',
    animationType: 'jump',
    steps: [
      { step: 1, text: 'Ensure immediate area is clear of obstacles.' },
      { step: 2, text: 'Perform jumping jacks at maximum velocity.' },
      { step: 3, text: 'Focus on rhythmic breathing.' },
      { step: 4, text: 'Continue for 45 seconds or until failure.' },
      { step: 5, text: 'Stop and feel the energy surge through the network.' }
    ]
  },
  {
    id: 'e3',
    title: 'Core Firewall',
    subtitle: 'High Plank Hold',
    duration: '1 Min',
    icon: Activity,
    benefit: 'Strengthens stability matrix (Core).',
    animationType: 'plank',
    steps: [
      { step: 1, text: 'Get into push-up position, hands under shoulders.' },
      { step: 2, text: 'Engage core, keep back straight (flat signal).' },
      { step: 3, text: 'Hold position. Do not let the system sag.' },
      { step: 4, text: 'Breathe steadily. Ignore the heat warning.' },
      { step: 5, text: 'Release to knees.' }
    ]
  }
];

// 3D Holographic Instructor Component
const HoloAvatar: React.FC<{ animation: string }> = ({ animation }) => {
  const getAnimationClass = () => {
    switch(animation) {
      case 'jump': return 'animate-holo-jump';
      case 'twist': return 'animate-holo-twist';
      case 'bend': return 'animate-holo-bend';
      case 'wave': return 'animate-holo-arm-wave';
      case 'plank': return 'rotate-90 translate-y-20'; // Static transform for plank
      default: return 'animate-float';
    }
  };

  return (
    <div className="relative w-48 h-64 perspective-1000 flex items-center justify-center">
       {/* Hologram Base */}
       <div className="absolute bottom-0 w-32 h-32 bg-cyber-neonBlue/20 rounded-full blur-md transform rotate-x-60 animate-pulse" />
       <div className="absolute bottom-0 w-40 h-40 border border-cyber-neonBlue/30 rounded-full transform rotate-x-60 animate-spin-slow" />

       {/* Scanlines */}
       <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-cyber-neonBlue/10 to-transparent bg-[length:100%_4px] pointer-events-none opacity-30" />

       {/* The Avatar Construct */}
       <div className={`relative z-10 transform-style-3d transition-all duration-500 ${getAnimationClass()}`}>
          {/* Head */}
          <div className="w-12 h-14 bg-cyber-neonBlue/20 border border-cyber-neonBlue rounded-lg mx-auto mb-1 relative backdrop-blur-sm">
             <div className="absolute top-4 left-2 w-8 h-2 bg-cyber-neonBlue/50" /> {/* Visor */}
          </div>
          
          {/* Torso */}
          <div className="w-16 h-24 bg-cyber-neonBlue/10 border border-cyber-neonBlue/50 rounded mx-auto relative backdrop-blur-sm">
             <div className="w-8 h-8 rounded-full border border-white/20 mx-auto mt-4 animate-pulse" /> {/* Core */}
          </div>

          {/* Arms */}
          <div className="absolute top-16 -left-4 w-4 h-20 bg-cyber-neonBlue/30 border border-cyber-neonBlue/40 rounded origin-top transform -rotate-12" />
          <div className="absolute top-16 -right-4 w-4 h-20 bg-cyber-neonBlue/30 border border-cyber-neonBlue/40 rounded origin-top transform rotate-12" />

          {/* Legs */}
          <div className="absolute top-36 left-2 w-5 h-24 bg-cyber-neonBlue/30 border border-cyber-neonBlue/40 rounded origin-top transform -rotate-6" />
          <div className="absolute top-36 right-2 w-5 h-24 bg-cyber-neonBlue/30 border border-cyber-neonBlue/40 rounded origin-top transform rotate-6" />
       </div>
    </div>
  );
};

export const MeditationArena: React.FC = () => {
  const [mode, setMode] = useState<Mode>('BREATH');
  const [selectedActivity, setSelectedActivity] = useState<ActivityCard | null>(null);
  
  // Breath State
  const [breathActive, setBreathActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    if (!breathActive) return;
    const cycle = setInterval(() => {
      setPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    const timer = setInterval(() => {
      setTimeLeft((t) => (t <= 0 ? 0 : t - 1));
    }, 1000);
    return () => { clearInterval(cycle); clearInterval(timer); };
  }, [breathActive]);

  const getScale = () => {
    if (phase === 'Inhale') return 'scale-150';
    if (phase === 'Hold') return 'scale-150';
    return 'scale-100';
  };

  const getColor = () => {
    if (phase === 'Inhale') return 'bg-cyan-400';
    if (phase === 'Hold') return 'bg-white';
    return 'bg-purple-500';
  };

  const renderBreathMode = () => (
    <div className="flex flex-col items-center justify-center animate-in fade-in duration-500 py-10">
      <div className="relative w-64 h-64 flex items-center justify-center">
         <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-[4000ms] ${breathActive ? 'bg-cyan-500/20' : 'bg-transparent'}`} />
         <div className={`w-32 h-32 rounded-full blur-md transition-all duration-[4000ms] ease-in-out ${breathActive ? getScale() : 'scale-100'} ${breathActive ? getColor() : 'bg-gray-700'} opacity-50`} />
         <div className={`absolute w-32 h-32 rounded-full border-2 border-white/20 transition-all duration-[4000ms] ease-in-out ${breathActive ? getScale() : 'scale-100'}`} />
         <div className="absolute z-10 text-xl font-bold text-white tracking-widest pointer-events-none">
           {breathActive ? phase.toUpperCase() : <Wind />}
         </div>
      </div>
      <div className="mt-16 space-y-4 text-center">
        <div className="text-4xl font-mono text-gray-300">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        {!breathActive ? (
          <button onClick={() => setBreathActive(true)} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center gap-2 mx-auto transition-all">
            <Play size={16} fill="currentColor" /> INITIATE SEQUENCE
          </button>
        ) : (
          <button onClick={() => { setBreathActive(false); setTimeLeft(180); setPhase('Inhale'); }} className="px-8 py-3 text-gray-500 hover:text-white transition-colors">
            <RotateCcw size={16} className="inline mr-2" /> ABORT
          </button>
        )}
      </div>
    </div>
  );

  const renderActivityList = (activities: ActivityCard[]) => (
    <div className="grid gap-4 animate-in slide-in-from-right duration-300">
      {activities.map((activity) => (
        <GlassCard key={activity.id} onClick={() => setSelectedActivity(activity)} className="flex items-center gap-4 hover:border-cyber-neonGreen/50 group">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyber-neonGreen/10 transition-colors">
            <activity.icon className="text-cyber-neonGreen" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white">{activity.title}</h3>
            <p className="text-xs text-gray-400">{activity.subtitle}</p>
          </div>
          <div className="text-right">
             <span className="text-xs font-mono text-cyber-neonBlue bg-cyber-neonBlue/10 px-2 py-1 rounded border border-cyber-neonBlue/20">
               {activity.duration}
             </span>
             <ChevronRight className="text-gray-600 ml-2 inline" size={16} />
          </div>
        </GlassCard>
      ))}
    </div>
  );

  const renderActivityDetail = () => {
    if (!selectedActivity) return null;
    return (
      <div className="animate-in slide-in-from-right duration-300 h-full flex flex-col">
        <button onClick={() => setSelectedActivity(null)} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-widest w-fit">
          <RotateCcw size={14} /> Return to List
        </button>
        
        <GlassCard className="flex-1 overflow-y-auto border-cyber-neonGreen/30 relative flex flex-col">
          
          <div className="flex flex-col md:flex-row gap-6 mb-6 items-center md:items-start">
             {/* 3D Visualizer Panel */}
             <div className="w-full md:w-1/2 bg-black/40 rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                <div className="absolute top-2 left-3 text-[10px] text-cyber-neonBlue font-mono">SIMULATION_MODE: {selectedActivity.animationType.toUpperCase()}</div>
                <HoloAvatar animation={selectedActivity.animationType} />
                <p className="text-xs text-center text-gray-500 mt-4 animate-pulse">Follow Holographic Guide</p>
             </div>

             {/* Info Panel */}
             <div className="w-full md:w-1/2">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedActivity.title}</h2>
                <p className="text-cyber-neonGreen text-sm font-mono mb-4">{selectedActivity.subtitle} // {selectedActivity.duration}</p>
                
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 mb-6">
                  <h3 className="text-xs uppercase text-gray-400 mb-1 flex items-center gap-2"><CheckCircle2 size={12}/> System Benefit</h3>
                  <p className="text-sm text-gray-200">{selectedActivity.benefit}</p>
                </div>

                <div className="space-y-4">
                  {selectedActivity.steps.map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-cyber-neonBlue/20 border border-cyber-neonBlue text-cyber-neonBlue flex items-center justify-center font-bold text-xs shrink-0">
                        {s.step}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <button onClick={() => setSelectedActivity(null)} className="mt-auto w-full py-3 bg-cyber-neonGreen/20 text-cyber-neonGreen border border-cyber-neonGreen/50 rounded-lg uppercase font-bold tracking-widest hover:bg-cyber-neonGreen/30 transition-all">
            Protocol Complete
          </button>
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col pb-24">
      {/* Header & Tabs */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 tracking-[0.2em] uppercase text-center mb-6">
          Bio-Optimization
        </h2>
        
        {!selectedActivity && (
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            {(['BREATH', 'YOGA', 'DRILLS'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setSelectedActivity(null); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === m 
                    ? 'bg-cyber-neonBlue/20 text-cyber-neonBlue shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {selectedActivity ? (
          renderActivityDetail()
        ) : (
          <>
            {mode === 'BREATH' && renderBreathMode()}
            {mode === 'YOGA' && renderActivityList(YOGA_PROTOCOLS)}
            {mode === 'DRILLS' && renderActivityList(KINETIC_DRILLS)}
          </>
        )}
      </div>
    </div>
  );
};