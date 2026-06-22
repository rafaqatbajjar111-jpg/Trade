
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, onClick }) => {
  return (
    <div 
      className={`relative overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      onClick={onClick}
      style={{
        background: 'rgba(15, 15, 15, 0.5)',
        backdropFilter: 'blur(35px) saturate(180%)',
        WebkitBackdropFilter: 'blur(35px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}
    >
      {/* Liquid Accent Shine */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="relative z-10 p-6">
        {title && <h3 className="text-[10px] font-black text-gray-500 mb-4 uppercase tracking-[0.3em]">{title}</h3>}
        {children}
      </div>
    </div>
  );
};
