
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-16 h-16", showText = true }) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative">
        <svg width="100%" height="100%" viewBox="80 40 150 160" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
          <defs>
            <linearGradient id="gold-logo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5d37a"/>
              <stop offset="50%" stopColor="#d4a84f"/>
              <stop offset="100%" stopColor="#b8892b"/>
            </linearGradient>
          </defs>
          <g>
            <path d="M0 60 L120 60 L30 160 L150 160" 
                  fill="none" stroke="url(#gold-logo)" strokeWidth="16" strokeLinecap="round"
                  transform="translate(80,40) scale(0.8)" />
            
            <path d="M40 140 L100 80 L120 100" 
                  fill="none" stroke="url(#gold-logo)" strokeWidth="12" strokeLinecap="round"
                  transform="translate(80,40) scale(0.8)" />
          </g>
        </svg>
      </div>
      {showText && (
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tighter text-white leading-none">ZMEX</h1>
          <p className="text-[7px] font-bold tracking-[0.3em] text-[#d4a84f] uppercase mt-1">Premium Trading Platform</p>
        </div>
      )}
    </div>
  );
};
