import React from 'react';

export const ZMXLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="bg-[#1a1a1a] border border-yellow-400/30 rounded-xl flex items-center justify-center font-black text-yellow-400 shadow-2xl relative overflow-hidden"
        style={{ width: size * 1.5, height: size * 1.5, fontSize: size * 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 to-transparent"></div>
        Z
      </div>
      <div className="flex flex-col">
        <span className="font-black text-white italic tracking-tighter leading-none" style={{ fontSize: size * 0.8 }}>ZMX <span className="text-yellow-400">PRO</span></span>
        <span className="text-[6px] font-black text-gray-500 uppercase tracking-[0.3em] mt-0.5">EXCHANGE HUB</span>
      </div>
    </div>
  );
};
