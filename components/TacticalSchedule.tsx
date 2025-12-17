
import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { ScheduleItem } from '../types';
import { Plus, Trash2, Brain, Dumbbell, Coffee, List, ShieldCheck, Lock, Fingerprint, ShieldAlert, Bell } from 'lucide-react';

interface TacticalScheduleProps {
  schedule: ScheduleItem[];
  onAdd: (task: ScheduleItem) => void;
  onRemove: (id: string) => void;
}

export const TacticalSchedule: React.FC<TacticalScheduleProps> = ({ schedule, onAdd, onRemove }) => {
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<'STUDY' | 'WORKOUT' | 'REST'>('STUDY');
  const [isStrict, setIsStrict] = useState(true);
  const [showPermissionHint, setShowPermissionHint] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      setShowPermissionHint(true);
    }
  }, []);

  const requestPerms = () => {
    Notification.requestPermission().then(p => {
      if (p === 'granted') setShowPermissionHint(false);
    });
  };

  const initiateAddDirective = () => {
    if (!newTask) {
      alert("Mission Objective Required. Please input directive title.");
      return;
    }
    if (!newTime) {
      alert("Timeline Synchronization Required. Please select a start time.");
      return;
    }
    
    // Create new task object
    const newTaskItem: ScheduleItem = {
      id: Date.now().toString(), // Temp ID, will be replaced by DB
      title: newTask,
      startTime: newTime,
      type: newType,
      completed: false,
      strictMode: isStrict
    };

    onAdd(newTaskItem);
    
    // Reset Form
    setNewTask("");
    setNewTime("");
    setIsStrict(true);
  };

  const getIcon = (type: string) => {
    if (type === 'STUDY') return <Brain size={18} />;
    if (type === 'WORKOUT') return <Dumbbell size={18} />;
    return <Coffee size={18} />;
  };

  // Sort schedule by time
  const sortedSchedule = [...schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="h-full pb-24 space-y-6 animate-in slide-in-from-right-8 relative">
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white neon-text uppercase tracking-widest flex items-center justify-center gap-2">
          <List className="text-cyber-neonBlue" /> Tactical Timeline
        </h2>
        <p className="text-gray-400 text-sm mt-2">Program your day. Deviation triggers System Lock.</p>
      </div>

      {showPermissionHint && (
        <div onClick={requestPerms} className="bg-yellow-500/20 border border-yellow-500/50 p-3 rounded-lg text-yellow-400 text-xs font-bold text-center cursor-pointer hover:bg-yellow-500/30 transition-colors animate-pulse">
           ⚠ ENABLE BACKGROUND ALERTS (Click Here)
        </div>
      )}

      {/* Input Form */}
      <GlassCard className="border-cyber-neonBlue/30">
        <h3 className="text-sm font-bold uppercase text-gray-400 mb-4">Add New Directive</h3>
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            placeholder="Mission Objective (e.g. Calculus Review)" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="bg-black/40 border border-white/20 rounded p-3 text-white focus:border-cyber-neonBlue outline-none"
          />
          <div className="flex gap-3">
             <input 
               type="time" 
               value={newTime}
               onChange={(e) => setNewTime(e.target.value)}
               className="bg-black/40 border border-white/20 rounded p-3 text-white focus:border-cyber-neonBlue outline-none w-1/3"
             />
             <div className="flex bg-black/40 rounded border border-white/10 p-1 flex-1">
               {(['STUDY', 'WORKOUT', 'REST'] as const).map(t => (
                 <button 
                   key={t}
                   onClick={() => setNewType(t)}
                   className={`flex-1 text-[10px] uppercase font-bold rounded transition-colors ${
                     newType === t 
                       ? t === 'STUDY' ? 'bg-cyber-neonBlue/20 text-cyber-neonBlue' : t === 'WORKOUT' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                       : 'text-gray-500'
                   }`}
                 >
                   {t}
                 </button>
               ))}
             </div>
          </div>
          
          {/* Strict Mode Toggle */}
          <div 
            onClick={() => setIsStrict(!isStrict)}
            className={`flex items-center justify-between p-3 rounded cursor-pointer border transition-all ${isStrict ? 'bg-red-900/20 border-red-500/50' : 'bg-black/40 border-white/10'}`}
          >
             <div className="flex items-center gap-2">
                <Lock size={16} className={isStrict ? 'text-red-500' : 'text-gray-500'} />
                <span className={`text-xs font-bold uppercase ${isStrict ? 'text-red-400' : 'text-gray-400'}`}>Strict Protocol (ChronoLock)</span>
             </div>
             <div className={`w-8 h-4 rounded-full relative transition-colors ${isStrict ? 'bg-red-500' : 'bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isStrict ? 'left-4.5' : 'left-0.5'}`} />
             </div>
          </div>

          <button 
            onClick={initiateAddDirective}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Upload to Core
          </button>
        </div>
      </GlassCard>

      {/* 3D Timeline Visualization */}
      <div className="relative pl-8 border-l border-white/10 space-y-8">
         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyber-neonBlue to-transparent opacity-50 shadow-[0_0_15px_#00f3ff]" />
         
         {sortedSchedule.length === 0 && (
           <div className="text-gray-500 italic text-sm ml-4">No directives programmed.</div>
         )}

         {sortedSchedule.map((item) => (
           <div key={item.id} className="relative group perspective-1000">
             <div className="absolute -left-[37px] top-6 w-8 h-px bg-cyber-neonBlue/50" />
             <div className={`absolute -left-[41px] top-5 w-3 h-3 rounded-full border bg-black z-10 ${
               item.strictMode ? 'border-red-500 shadow-[0_0_10px_#ef4444]' : 'border-cyber-neonBlue shadow-[0_0_10px_#00f3ff]'
             }`} />

             <GlassCard className={`transform-style-3d group-hover:rotate-x-12 transition-transform duration-500 relative overflow-visible ${item.strictMode ? 'border-red-500/30' : ''} ${item.completed ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded bg-black/40 border ${
                         item.type === 'STUDY' ? 'border-cyber-neonBlue text-cyber-neonBlue' : 
                         item.type === 'WORKOUT' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'
                      }`}>
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <div className="text-2xl font-mono font-bold text-white leading-none">{item.startTime}</div>
                        <div className="text-sm font-bold text-gray-300 mt-1">{item.title}</div>
                      </div>
                   </div>
                   <button onClick={() => onRemove(item.id)} className="text-gray-600 hover:text-red-500">
                     <Trash2 size={16} />
                   </button>
                </div>
                {item.strictMode && (
                    <div className="absolute right-2 bottom-2 text-[9px] font-mono text-red-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                        <Lock size={10} /> STRICT LOCK ARMED
                    </div>
                )}
                {item.completed && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                      <span className="text-green-500 font-bold uppercase tracking-widest border-2 border-green-500 px-4 py-2 rounded -rotate-12">COMPLETED</span>
                   </div>
                )}
             </GlassCard>
           </div>
         ))}
      </div>
    </div>
  );
};
