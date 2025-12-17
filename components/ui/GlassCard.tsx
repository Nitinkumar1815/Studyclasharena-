import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverEffect = true }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300
        ${hoverEffect ? 'hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:border-cyber-neonBlue/30 cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      {children}
    </div>
  );
};