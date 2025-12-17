import React from 'react';
import { GlassCard } from './ui/GlassCard';

export const QuantumMap: React.FC = () => {
  const nodes = [
    { id: 1, x: 20, y: 30, z: 0, label: 'Algebra' },
    { id: 2, x: 50, y: 50, z: -50, label: 'Calculus' },
    { id: 3, x: 80, y: 30, z: 0, label: 'Physics' },
    { id: 4, x: 35, y: 70, z: 50, label: 'History' },
    { id: 5, x: 65, y: 70, z: 20, label: 'Biology' },
  ];

  return (
    <div className="h-full w-full flex flex-col animate-in zoom-in duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-bold text-white neon-text uppercase tracking-widest">Quantum Mind Map</h2>
          <p className="text-gray-400">Visualizing Neural Knowledge Connections</p>
        </div>
        <div className="text-right">
           <div className="text-2xl font-mono text-cyber-neonBlue">5 Nodes Active</div>
           <div className="text-xs text-gray-500">SYNC RATE: 98.4%</div>
        </div>
      </div>

      <div className="flex-1 relative perspective-1000 group">
        <GlassCard className="h-[500px] w-full relative transform-style-3d bg-grid-pattern overflow-hidden flex items-center justify-center border-cyber-neonPurple/50">
           
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyber-neonBlue/10 via-transparent to-transparent opacity-50" />
           
           {/* 3D Container */}
           <div className="relative w-full h-full transform transition-transform duration-1000 group-hover:rotate-y-12 group-hover:rotate-x-6 transform-style-3d">
              {/* Connecting Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#00f3ff" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="#00f3ff" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="35%" y2="70%" stroke="#bc13fe" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="65%" y2="70%" stroke="#0aff60" strokeWidth="1" />
                <line x1="20%" y1="30%" x2="35%" y2="70%" stroke="#00f3ff" strokeWidth="1" className="animate-pulse" />
              </svg>

              {/* Nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute transform-style-3d cursor-pointer hover:scale-110 transition-transform duration-300"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: `translateZ(${node.z}px)`,
                  }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-white animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                    <div className="absolute inset-[-8px] border border-white/30 rounded-full animate-spin-slow" />
                    <div className="absolute inset-[-16px] border border-white/10 rounded-full" />
                    
                    {/* Floating Label */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded border border-white/10 text-xs font-mono whitespace-nowrap backdrop-blur-md">
                      {node.label}
                    </div>
                  </div>
                </div>
              ))}
           </div>

           <div className="absolute bottom-4 left-4 font-mono text-xs text-cyber-neonBlue animate-pulse">
             >> ROTATION CONTROL ENABLED
           </div>
        </GlassCard>
      </div>
    </div>
  );
};