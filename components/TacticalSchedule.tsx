
import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { ScheduleItem } from '../types';
import { Plus, Trash2, Brain, Coffee, Lock, ShieldAlert, Loader2 } from 'lucide-react';

interface TacticalScheduleProps {
  schedule: ScheduleItem[];
  onAdd: (task: ScheduleItem) => void;
  onRemove: (id: string) => void;
}

export const TacticalSchedule: React.FC<TacticalScheduleProps> = ({ schedule, onAdd, onRemove }) => {
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<'STUDY' | 'REST' | 'WORKOUT' | 'SYSTEM'>('STUDY');
  const [isStrict, setIsStrict] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!newTask || !newTime) return;
    
    setIsDeploying(true);
    
    const task: ScheduleItem = {
      id: "temp-" + Date.now(),
      title: newTask,
      startTime: newTime,
      type: newType,
      completed: false,
      strictMode: isStrict
    };

    // Immediate state update via prop
    onAdd(task);
    
    // Clear inputs and give UI feedback
    setNewTask("");
    setNewTime("");
    
    setTimeout(() => {
      setIsDeploying(false);
    }, 600);
  };

  const sortedSchedule = [...schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 animate-spring pb-12">
      <div className="px-1">
        <h2 className="text-3xl font-black tracking-tighter text-white italic uppercase leading-none">Tactical Plan</h2>
        <p className="text-ios-gray text-[10px] font-black uppercase tracking-[0.2em] mt-2">Neural Timeline Management</p>
      </div>

      <GlassCard className="p-6 border-white/5 space-y-5 bg-white/5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-[9px] font-black uppercase text-ios-gray tracking-widest ml-1">Directive Name</p>
            <input 
              type="text" 
              placeholder="e.g. Quantum Physics Revision"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="ios-input w-full text-base font-bold"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <p className="text-[9px] font-black uppercase text-ios-gray tracking-widest ml-1">Sync Time</p>
              <input 
                type="time" 
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="ios-input w-full font-mono text-center"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="text-[9px] font-black uppercase text-ios-gray tracking-widest ml-1">Core Objective</p>
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 h-[52px]">
                {(['STUDY', 'REST'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`flex-1 text-[9px] font-black uppercase rounded-xl transition-all duration-300 ${newType === t ? 'bg-white text-black shadow-lg' : 'text-white/30'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsStrict(!isStrict)}
            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${isStrict ? 'border-ios-red/50 bg-ios-red/10 text-ios-red shadow-[0_0_15px_rgba(255,59,48,0.2)]' : 'border-white/5 bg-white/5 text-white/30'}`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert size={18} />
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-widest block leading-none">Strict Protocol</span>
                <span className="text-[8px] opacity-60 uppercase font-bold tracking-tighter">Enable Chrono-Lockdown</span>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${isStrict ? 'bg-ios-red' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isStrict ? 'right-1' : 'left-1'}`} />
            </div>
          </button>

          <button 
            onClick={handleDeploy}
            disabled={!newTask || !newTime || isDeploying}
            className="ios-btn-primary w-full py-5 text-sm font-black uppercase tracking-[0.2em] disabled:opacity-20 disabled:scale-100 ios-tap shadow-xl flex items-center justify-center gap-2"
          >
            {isDeploying ? <Loader2 className="animate-spin" size={18} /> : "Deploy Directive"}
          </button>
        </div>
      </GlassCard>

      <div className="space-y-3 px-1">
        <p className="text-[9px] font-black uppercase text-ios-gray tracking-widest ml-1 mb-1">Active Timeline</p>
        {sortedSchedule.length === 0 ? (
          <div className="text-center py-16 glass-ios rounded-[2.5rem] border-dashed border-white/10">
             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-ios-gray">
                <Plus size={24} />
             </div>
             <p className="text-ios-gray text-[10px] font-black uppercase tracking-widest">No Directives Logged</p>
          </div>
        ) : (
          sortedSchedule.map((item) => (
            <div key={item.id} className={`glass-ios p-5 rounded-[2rem] flex items-center justify-between animate-spring border-l-4 ${item.strictMode ? 'border-l-ios-red' : 'border-l-ios-blue'} ${item.completed ? 'opacity-40 grayscale' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === 'STUDY' ? 'bg-ios-blue/10 text-ios-blue' : 'bg-ios-purple/10 text-ios-purple'}`}>
                  {item.type === 'STUDY' ? <Brain size={22} /> : <Coffee size={22} />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-2">
                    {item.title}
                    {item.strictMode && <Lock size={12} className="text-ios-red" />}
                  </h4>
                  <p className="text-[10px] font-black text-ios-gray uppercase tracking-widest mt-0.5">{item.startTime}</p>
                </div>
              </div>
              <button 
                onClick={() => onRemove(item.id)}
                className="w-10 h-10 rounded-full bg-ios-red/10 text-ios-red flex items-center justify-center ios-tap"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
