
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, X, Headphones, CloudRain, Zap, Play, Pause, Waves, Activity, BrainCircuit, Lock, Music, ChevronDown, Sparkles, Wind, Droplets } from 'lucide-react';
import { MARKET_ITEMS } from '../constants';

const ICON_MAP: Record<string, any> = {
  'CloudRain': CloudRain,
  'Zap': Zap,
  'Waves': Waves,
  'BrainCircuit': BrainCircuit,
  'Wind': Wind,
  'Droplets': Droplets,
  'Sparkles': Sparkles,
  'Activity': Activity
};

const DEFAULT_TRACKS = [
  { id: 'free_rain', name: 'Neon Rain', icon: CloudRain, url: 'https://assets.mixkit.co/active_storage/sfx/1169/1169-preview.mp3', color: 'text-blue-500' },
  { id: 'free_cyber', name: 'City Drone', icon: Zap, url: 'https://assets.mixkit.co/active_storage/sfx/170/170-preview.mp3', color: 'text-cyan-400' },
  { id: 'binaural_alpha', name: 'Alpha Waves', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/142/142-preview.mp3', color: 'text-green-500' },
  { id: 'binaural_theta', name: 'Theta Waves', icon: BrainCircuit, url: 'https://assets.mixkit.co/active_storage/sfx/1002/1002-preview.mp3', color: 'text-purple-500' },
];

export const SoundscapeControl: React.FC<{ isOpen: boolean; onClose: () => void; inventory: string[] }> = ({ isOpen, onClose, inventory }) => {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Merge default tracks with owned premium tracks from marketplace
  const availableTracks = useMemo(() => {
    const ownedAudioItems = MARKET_ITEMS.filter(item => item.type === 'music' && inventory.includes(item.id));
    
    const premiumTracks = ownedAudioItems.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.id.includes('rain') ? CloudRain : 
            item.id.includes('binaural') || item.id.includes('frequency') ? Waves : 
            item.id.includes('lofi') ? Music : 
            item.id.includes('noise') ? Activity : Sparkles,
      url: 'https://assets.mixkit.co/active_storage/sfx/142/142-preview.mp3', // Note: In a real app, these would be unique URLs
      color: item.id.includes('lofi') ? 'text-ios-orange' : 'text-ios-purple'
    }));

    return [...DEFAULT_TRACKS, ...premiumTracks];
  }, [inventory]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrackId) return;
    const track = availableTracks.find(t => t.id === activeTrackId);
    if (track && audio.src !== track.url) {
      audio.src = track.url;
      audio.load();
    }
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [activeTrackId, isPlaying, availableTracks]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-3xl animate-spring flex items-end">
      <audio ref={audioRef} loop />
      
      <div className="w-full max-w-lg mx-auto h-[90vh] glass-ios rounded-t-[3rem] p-6 flex flex-col animate-sheet-up">
        <div className="flex justify-center mb-6">
           <button onClick={onClose} className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="flex justify-between items-start mb-6">
           <div>
              <h2 className="text-3xl font-bold tracking-tight">Audio Focus</h2>
              <p className="text-ios-gray font-medium">{availableTracks.length} Channels Synced</p>
           </div>
           <button onClick={onClose} className="w-10 h-10 glass-ios rounded-full flex items-center justify-center ios-tap">
              <ChevronDown size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
           {availableTracks.map(track => (
             <button 
               key={track.id} 
               onClick={() => { setActiveTrackId(track.id); setIsPlaying(true); }}
               className={`w-full p-4 rounded-[2rem] flex items-center justify-between transition-all ios-tap ${activeTrackId === track.id ? 'bg-white/10 ring-1 ring-ios-blue shadow-[0_0_20px_rgba(0,122,255,0.2)]' : 'glass-ios hover:bg-white/5'}`}
             >
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 ${track.color}`}>
                      <track.icon size={24} />
                   </div>
                   <div className="text-left overflow-hidden">
                      <p className="font-bold text-sm truncate">{track.name}</p>
                      <p className="text-[9px] text-ios-gray uppercase font-black tracking-widest truncate">Neural Frequency</p>
                   </div>
                </div>
                {activeTrackId === track.id && isPlaying && (
                   <div className="flex gap-1 items-end h-4 mr-2">
                      <div className="w-1 h-3 bg-ios-blue animate-pulse" />
                      <div className="w-1 h-4 bg-ios-blue animate-pulse delay-75" />
                      <div className="w-1 h-2 bg-ios-blue animate-pulse delay-150" />
                   </div>
                )}
             </button>
           ))}
        </div>

        <div className="mt-6 p-6 glass-ios rounded-[2.5rem] space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black ios-tap">
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                 </button>
                 <div className="overflow-hidden">
                    <p className="font-bold text-white truncate max-w-[180px]">{availableTracks.find(t => t.id === activeTrackId)?.name || 'Silence'}</p>
                    <p className="text-xs text-ios-gray">System Link Active</p>
                 </div>
              </div>
              <div className="p-3 bg-white/5 rounded-full">
                <Volume2 size={20} className="text-ios-gray" />
              </div>
           </div>
           
           <div className="px-2">
             <input 
               type="range" min="0" max="1" step="0.01" value={volume} 
               onChange={(e) => setVolume(parseFloat(e.target.value))}
               className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-white ios-tap"
             />
           </div>
        </div>
      </div>
    </div>
  );
};
