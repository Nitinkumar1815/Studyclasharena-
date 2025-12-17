
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, X, Headphones, CloudRain, Zap, Radio, Play, Pause, Waves, Activity, BrainCircuit, Lock, Moon, Sun, Sparkles, Wind, Flame, Trees, Droplets, Mountain, Disc, Music, Keyboard, Fan, Server, Globe, Box, Piano, Mic, Drum, Star } from 'lucide-react';
import { MARKET_ITEMS } from '../constants';

interface SoundscapeControlProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: string[]; // List of owned items (Marketplace IDs)
}

// 1. DEFAULT TRACKS (5 Unlocked Sounds - "Pehle se the")
const DEFAULT_TRACKS = [
  { 
    id: 'free_rain', 
    name: 'Neon Rain', 
    desc: 'Environment Ambience',
    icon: CloudRain, 
    url: 'https://assets.mixkit.co/active_storage/sfx/1169/1169-preview.mp3', 
    theme: 'blue',
    color: 'text-blue-500',
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-500/50',
    bgGradient: 'from-blue-900/40 via-black to-black'
  },
  { 
    id: 'free_cyber', 
    name: 'City Drone', 
    desc: 'Environment Ambience',
    icon: Zap, 
    url: 'https://assets.mixkit.co/active_storage/sfx/170/170-preview.mp3', 
    theme: 'cyan',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400',
    glowColor: 'shadow-cyan-400/50',
    bgGradient: 'from-cyan-900/40 via-black to-black'
  },
  { 
    id: 'binaural_alpha', 
    name: 'Alpha Waves', 
    desc: '8-12Hz (Relaxed Focus)',
    icon: Waves, 
    url: 'https://assets.mixkit.co/active_storage/sfx/142/142-preview.mp3', 
    theme: 'green',
    color: 'text-green-500',
    borderColor: 'border-green-500',
    glowColor: 'shadow-green-500/50',
    bgGradient: 'from-green-900/40 via-black to-black'
  },
  { 
    id: 'binaural_theta', 
    name: 'Theta Waves', 
    desc: '4-8Hz (Deep Learning)',
    icon: BrainCircuit, 
    url: 'https://assets.mixkit.co/active_storage/sfx/1002/1002-preview.mp3', 
    theme: 'purple',
    color: 'text-purple-500',
    borderColor: 'border-purple-500',
    glowColor: 'shadow-purple-500/50',
    bgGradient: 'from-purple-900/60 via-black to-black'
  },
  { 
    id: 'binaural_gamma', 
    name: 'Gamma Waves', 
    desc: '40Hz (Peak Flow)',
    icon: Activity, 
    url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 
    theme: 'amber',
    color: 'text-amber-500',
    borderColor: 'border-amber-500',
    glowColor: 'shadow-amber-500/50',
    bgGradient: 'from-amber-900/40 via-black to-black'
  },
];

// Reusable audio URLs for demo purposes (cycling through working Mixkit links)
const URLS = {
  drone: 'https://assets.mixkit.co/active_storage/sfx/1002/1002-preview.mp3',
  hum: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  rain: 'https://assets.mixkit.co/active_storage/sfx/1169/1169-preview.mp3',
  white: 'https://assets.mixkit.co/active_storage/sfx/142/142-preview.mp3', // Static-like
  tech: 'https://assets.mixkit.co/active_storage/sfx/170/170-preview.mp3',
  alert: 'https://assets.mixkit.co/active_storage/sfx/535/535-preview.mp3'
};

// HELPER to generate track config based on Marketplace Item
const getTrackConfig = (item: any) => {
  let icon = Music;
  let url = URLS.drone;
  let theme = 'gray';
  let color = 'text-gray-500';
  let border = 'border-gray-500';
  let glow = 'shadow-gray-500/50';
  let bg = 'from-gray-900/40 via-black to-black';

  // --- Logic to assign visuals based on ID/Name ---
  if (item.name.includes('Noise')) {
     icon = Radio;
     url = URLS.white;
     theme = 'zinc';
     color = 'text-zinc-400';
     border = 'border-zinc-400';
     bg = 'from-zinc-900/40 via-black to-black';
  } else if (item.name.includes('Hz')) {
     icon = Sparkles;
     url = URLS.hum;
     theme = 'pink';
     color = 'text-pink-400';
     border = 'border-pink-400';
     bg = 'from-pink-900/40 via-black to-black';
  } else if (item.name.includes('Rain') || item.name.includes('Water') || item.name.includes('Ocean')) {
     icon = Droplets;
     url = URLS.rain;
     theme = 'blue';
     color = 'text-blue-400';
     border = 'border-blue-400';
     bg = 'from-blue-900/40 via-black to-black';
  } else if (item.name.includes('Fire')) {
     icon = Flame;
     url = URLS.white;
     theme = 'orange';
     color = 'text-orange-500';
     border = 'border-orange-500';
     bg = 'from-orange-900/40 via-black to-black';
  } else if (item.name.includes('Forest') || item.name.includes('Jungle')) {
     icon = Trees;
     url = URLS.drone;
     theme = 'green';
     color = 'text-green-500';
     border = 'border-green-500';
     bg = 'from-green-900/40 via-black to-black';
  } else if (item.name.includes('Space') || item.name.includes('Cyber') || item.name.includes('Matrix')) {
     icon = Globe;
     url = URLS.tech;
     theme = 'indigo';
     color = 'text-indigo-500';
     border = 'border-indigo-500';
     bg = 'from-indigo-900/40 via-black to-black';
  } else if (item.name.includes('Delta') || item.name.includes('Sleep')) {
     icon = Moon;
     url = URLS.drone;
     theme = 'indigo';
     color = 'text-indigo-400';
     border = 'border-indigo-400';
     bg = 'from-indigo-900/40 via-black to-black';
  } else if (item.name.includes('Beta') || item.name.includes('Alert')) {
     icon = Sun;
     url = URLS.hum;
     theme = 'yellow';
     color = 'text-yellow-400';
     border = 'border-yellow-400';
     bg = 'from-yellow-900/40 via-black to-black';
  } else if (item.name.includes('Piano') || item.name.includes('LoFi')) {
     icon = Piano;
     url = URLS.drone;
     theme = 'rose';
     color = 'text-rose-400';
     border = 'border-rose-400';
     bg = 'from-rose-900/40 via-black to-black';
  }

  return {
     id: `track_${item.id}`,
     marketId: item.id,
     name: item.name,
     desc: item.type === 'music' ? 'Premium Frequency' : 'Soundscape',
     icon,
     url,
     theme,
     color,
     borderColor: border,
     glowColor: glow,
     bgGradient: bg,
     locked: true // Default lock state, override later
  };
};

export const SoundscapeControl: React.FC<SoundscapeControlProps> = ({ isOpen, onClose, inventory }) => {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Get all 'music' items from MARKET_ITEMS
  const marketMusicItems = MARKET_ITEMS.filter(item => item.type === 'music');
  
  // 2. Convert them to Track Configs
  const premiumTracks = marketMusicItems.map(item => {
      const config = getTrackConfig(item);
      // Check ownership live
      config.locked = !inventory.includes(item.id);
      return config;
  });

  // 3. Combine Defaults + Premium
  const allTracks = [...DEFAULT_TRACKS, ...premiumTracks];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrackId) {
      // Find track
      const track = allTracks.find(t => t.id === activeTrackId);
      
      // Safety check for lock
      if (track && 'marketId' in track && (track as any).locked) {
          setActiveTrackId(null);
          setIsPlaying(false);
          return;
      }

      if (track && audio.src !== track.url) {
        audio.src = track.url;
        audio.load(); 
      }

      if (isPlaying) {
        audio.play().catch(e => setIsPlaying(false));
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }
  }, [activeTrackId, isPlaying, inventory]);

  const handleTrackSelect = (track: any) => {
    if (track.locked) {
        alert("SOUND LOCKED: Acquire this frequency in the Black Market to add it to your deck.");
        return;
    }

    if (activeTrackId === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrackId(track.id);
      setIsPlaying(true);
    }
  };

  const activeTrack = allTracks.find(t => t.id === activeTrackId) || DEFAULT_TRACKS[0];
  const isActuallyPlaying = isPlaying && activeTrackId !== null;

  return (
    <>
      <audio 
        ref={audioRef} 
        loop 
        crossOrigin="anonymous"
      />
      
      {/* UI Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
           
           <div 
              className={`w-full max-w-lg h-[80vh] flex flex-col relative transition-all duration-700 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]`}
              onClick={(e) => e.stopPropagation()}
           >
              {/* Dynamic Background */}
              <div className={`absolute inset-0 bg-gradient-to-b ${activeTrackId ? activeTrack.bgGradient : 'from-gray-900 via-black to-black'} transition-colors duration-1000`} />
              
              {/* Grid Texture */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                 
                 {/* Header */}
                 <div className="flex-none p-6 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg bg-black/50 border ${isActuallyPlaying ? activeTrack.borderColor : 'border-gray-700'}`}>
                          <Headphones className={`w-5 h-5 ${isActuallyPlaying ? activeTrack.color : 'text-gray-500'}`} />
                       </div>
                       <div>
                          <h2 className="text-lg font-bold text-white tracking-widest uppercase font-mono">Binaural Uplink</h2>
                          <div className="flex items-center gap-2 text-[10px] uppercase font-mono">
                             <span className={`w-2 h-2 rounded-full ${isActuallyPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                             {isActuallyPlaying ? 'WAVES ACTIVE' : 'SILENT'}
                          </div>
                       </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                       <X size={20} className="text-gray-400 group-hover:text-white" />
                    </button>
                 </div>

                 {/* Visualizer & Controls Area */}
                 <div className="flex-none flex flex-col items-center justify-center mb-6">
                    {/* Visualizer */}
                    <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                        <div className={`absolute inset-0 border-[1px] border-dashed rounded-full transition-all duration-1000 ${isActuallyPlaying ? `opacity-100 animate-[spin_10s_linear_infinite] ${activeTrack.borderColor}` : 'opacity-20 border-gray-600'}`} />
                        <div className={`absolute inset-4 border-[2px] border-dotted rounded-full transition-all duration-1000 ${isActuallyPlaying ? `opacity-100 animate-[spin_15s_linear_infinite_reverse] ${activeTrack.borderColor}` : 'opacity-20 border-gray-600'}`} />
                        {isActuallyPlaying && (
                           <div className={`absolute inset-0 rounded-full blur-[50px] opacity-40 animate-pulse ${activeTrack.color.replace('text-', 'bg-')}`} />
                        )}
                        <div className={`
                           w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl border-4 shadow-2xl transition-all duration-500 z-20
                           ${isActuallyPlaying ? `${activeTrack.borderColor} ${activeTrack.glowColor} shadow-[0_0_30px_rgba(0,0,0,0.5)] scale-105` : 'border-gray-800 bg-black/50 scale-100'}
                        `}>
                            <button 
                               onClick={() => setIsPlaying(!isPlaying)}
                               disabled={!activeTrackId}
                               className={`w-full h-full rounded-full flex flex-col items-center justify-center transition-all group overflow-hidden relative`}
                            >
                                <div className={`relative z-10 transition-transform duration-300 ${isActuallyPlaying ? 'group-hover:scale-90' : 'group-hover:scale-110'}`}>
                                   {isActuallyPlaying ? (
                                      <Pause size={24} className="text-white fill-white" />
                                   ) : (
                                      <Play size={24} className="text-gray-400 ml-1 group-hover:text-white group-hover:fill-white transition-colors" />
                                   )}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Track Name */}
                    <div className="text-center h-12">
                        {activeTrackId ? (
                           <div className="animate-in slide-in-from-bottom-2 fade-in">
                              <h3 className={`text-xl font-bold uppercase tracking-widest ${activeTrack.color} drop-shadow-md`}>{activeTrack.name}</h3>
                           </div>
                        ) : (
                           <div className="text-gray-600 font-mono text-sm uppercase tracking-widest pt-2">
                              Select Frequency
                           </div>
                        )}
                    </div>

                    {/* Volume */}
                    <div className="w-64 bg-black/40 border border-white/10 rounded-full p-2 px-4 flex items-center gap-4 backdrop-blur-sm">
                        <Volume2 size={16} className="text-gray-400" />
                        <input 
                           type="range" 
                           min="0" max="1" step="0.01" 
                           value={volume}
                           onChange={(e) => setVolume(parseFloat(e.target.value))}
                           className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-800 accent-white hover:accent-gray-200 transition-all`}
                        />
                    </div>
                 </div>

                 {/* Scrollable Track List */}
                 <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-3 sticky top-0 bg-black/80 backdrop-blur py-2 z-10">
                        Available Frequencies ({allTracks.length})
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {allTracks.map(track => {
                           const isActive = activeTrackId === track.id;
                           const isLocked = (track as any).locked; 

                           return (
                             <button 
                               key={track.id}
                               onClick={() => handleTrackSelect(track)}
                               className={`
                                  relative p-3 rounded-xl border flex items-center gap-3 transition-all duration-200 group overflow-hidden text-left
                                  ${isActive 
                                     ? `bg-white/5 ${track.borderColor} shadow-[0_0_15px_rgba(0,0,0,0.5)]` 
                                     : isLocked
                                        ? 'bg-black/60 border-gray-800 opacity-60 grayscale hover:opacity-100 hover:border-gray-600'
                                        : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/20'
                                  }
                               `}
                             >
                                {/* Active Indicator Bar */}
                                {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 ${track.color.replace('text-', 'bg-')}`} />}

                                <div className={`
                                   w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0
                                   ${isActive ? 'bg-black/50 text-white' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'}
                                `}>
                                   {isLocked ? <Lock size={14} /> : <track.icon size={16} className={isActive ? track.color : ''} />}
                                </div>

                                <div className="min-w-0">
                                   <div className={`text-[10px] font-bold uppercase truncate transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                      {track.name}
                                   </div>
                                   <div className="text-[9px] text-gray-600 font-mono uppercase mt-0.5 truncate">
                                      {isLocked ? 'LOCKED' : isActive ? 'Active' : 'Ready'}
                                   </div>
                                </div>
                             </button>
                           );
                        })}
                    </div>
                 </div>

              </div>
           </div>
        </div>
      )}
    </>
  );
};
