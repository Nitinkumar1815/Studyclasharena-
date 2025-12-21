
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
        glass-ios rounded-[2.2rem] p-6 relative overflow-hidden transition-all duration-300
        ${hoverEffect ? 'active:scale-95 cursor-pointer ios-tap' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
