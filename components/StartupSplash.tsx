
import React, { useEffect, useState } from 'react';
import { Cpu, Zap, ShieldCheck, Wifi } from 'lucide-react';

export const StartupSplash: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const startupLogs = [
    "INITIALIZING NEURAL KERNEL...",
    "ESTABLISHING SECURE UPLINK...",
    "CALIBRATING BIOMETRIC SENSORS...",
    "SYNCING SECTOR DATA...",
    "LOAD PROTOCOL: ARENA_V1.0.8",
    "BYPASSING FIREWALLS...",
    "MARVEL RANK REGISTRY LOADED",
    "ACCESS GRANTED."
  ];

  useEffect(() => {
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < startupLogs.length) {
        setLogs(prev => [...prev, startupLogs[logIndex]]);
        logIndex++;
        setProgress(prev => Math.min(100, prev + 12.5));
      } else {
        clearInterval(logInterval);
        setTimeout(onFinish, 1000);
      }
    }, 400);

    return () => clearInterval(logInterval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[200] bg-cyber-black flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0a0a1a_0%,_#000000_100%)] opacity-50" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo Graphic */}
        <div className="relative w-40 h-40 mb-12">
          <div className="absolute inset-0 border-2 border-cyber-neonBlue/20 rounded-full animate-spin-slow" />
          <div className="absolute inset-2 border border-dashed border-cyber-neonBlue/40 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-20 h-20 bg-cyber-neonBlue/10 rounded-2xl flex items-center justify-center border border-cyber-neonBlue shadow-[0_0_30px_rgba(0,243,255,0.3)] animate-pulse">
                <Cpu size={40} className="text-cyber-neonBlue" />
             </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
           <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">
             StudyClash<span className="text-cyber-neonBlue">Arena</span>
           </h1>
           <p className="text-[10px] text-cyber-neonBlue font-mono tracking-[0.6em] uppercase animate-pulse">Neural Operating System</p>
        </div>

        {/* Loading Terminal */}
        <div className="w-full bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-[9px] h-32 overflow-hidden flex flex-col justify-end">
           {logs.map((log, i) => (
             <div key={i} className="flex items-center gap-2 mb-1">
                <span className="text-cyber-neonBlue">>></span>
                <span className="text-gray-400">{log}</span>
             </div>
           ))}
           <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-1 bg-gray-900 rounded-full overflow-hidden">
                 <div className="h-full bg-cyber-neonBlue transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-cyber-neonBlue font-bold">{Math.floor(progress)}%</span>
           </div>
        </div>

        {/* Bottom Vitals */}
        <div className="mt-8 flex justify-between w-full text-[8px] font-mono text-gray-700 uppercase tracking-widest px-2">
           <div className="flex items-center gap-2"><Wifi size={10} /> Link Status: Active</div>
           <div className="flex items-center gap-2"><ShieldCheck size={10} /> Kernel: Secured</div>
        </div>
      </div>
    </div>
  );
};
