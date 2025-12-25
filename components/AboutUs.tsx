
import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { ShieldCheck, Cpu, Info, ChevronLeft, Globe, Terminal, User, Users, Zap, Award } from 'lucide-react';

interface AboutUsProps {
  onBack: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  return (
    <div className="space-y-8 pb-32 animate-spring">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 glass-ios rounded-full flex items-center justify-center ios-tap">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">System Intel</h2>
      </div>

      <GlassCard className="border-ios-blue/20 bg-ios-blue/5">
        <div className="flex items-center gap-3 mb-4">
          <Terminal size={18} className="text-ios-blue" />
          <h3 className="text-[10px] font-black uppercase text-ios-blue tracking-[0.3em]">Operational Directive</h3>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed font-medium">
          StudyClash Arena was forged with a single objective: to transform the cognitive grind of education into a high-stakes tactical simulation. We believe that focus is a weapon, and knowledge is the ultimate territory to be conquered. This OS provides the infrastructure for students to evolve into elite academic operators.
        </p>
      </GlassCard>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Users size={16} className="text-ios-purple" />
          <h3 className="text-[10px] font-black uppercase text-ios-gray tracking-widest">The Architect Collective</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Founder 1: Nitin Kumar */}
          <GlassCard className="relative overflow-hidden group border-white/5">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cpu size={80} />
            </div>
            <div className="flex gap-5 items-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-ios-blue/10 border border-ios-blue/30 flex items-center justify-center text-ios-blue">
                <User size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight">Nitin Kumar</h4>
                <p className="text-[10px] font-black text-ios-blue uppercase tracking-widest">Lead Architect & Visionary</p>
                <div className="flex gap-2 mt-2">
                  <div className="px-2 py-0.5 bg-ios-blue/10 rounded text-[8px] font-bold text-ios-blue uppercase">Core Logic</div>
                  <div className="px-2 py-0.5 bg-ios-blue/10 rounded text-[8px] font-bold text-ios-blue uppercase">UI Strategy</div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 font-medium leading-relaxed">
              Driving the technical evolution of the Arena. Nitin conceptualized the neural-link interface and the core gamification mechanics that drive Operator engagement.
            </p>
          </GlassCard>

          {/* Founder 2: Ishant Mishra */}
          <GlassCard className="relative overflow-hidden group border-white/5">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap size={80} />
            </div>
            <div className="flex gap-5 items-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-ios-purple/10 border border-ios-purple/30 flex items-center justify-center text-ios-purple">
                <Users size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight">Ishant Mishra</h4>
                <p className="text-[10px] font-black text-ios-purple uppercase tracking-widest">Tactical Partner & Operations</p>
                <div className="flex gap-2 mt-2">
                  <div className="px-2 py-0.5 bg-ios-purple/10 rounded text-[8px] font-bold text-ios-purple uppercase">Global Sync</div>
                  <div className="px-2 py-0.5 bg-ios-purple/10 rounded text-[8px] font-bold text-ios-purple uppercase">Network Growth</div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 font-medium leading-relaxed">
              Ensuring the Arena remains a stable and competitive environment. Ishant oversees the tactical deployment of new features and manages the global operator network.
            </p>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-ios p-5 rounded-3xl border-white/5 flex flex-col items-center text-center">
          <Award className="text-ios-orange mb-2" size={24} />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Integrity Verified</span>
        </div>
        <div className="glass-ios p-5 rounded-3xl border-white/5 flex flex-col items-center text-center">
          <ShieldCheck className="text-ios-green mb-2" size={24} />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Sector Secured</span>
        </div>
      </div>

      <div className="text-center pt-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe size={14} className="text-ios-gray" />
          <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest">Global Protocol V1.0.8</span>
        </div>
        <p className="text-[8px] text-gray-700 font-mono uppercase tracking-tighter">
          All knowledge belongs to the operator who conquers it.
        </p>
      </div>
    </div>
  );
};
