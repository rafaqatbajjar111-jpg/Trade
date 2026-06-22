import React from 'react';
import { Loader2 } from 'lucide-react';

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'success' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles = "relative px-4 py-2 rounded-lg font-extrabold uppercase tracking-[0.14em] text-[9.5px] flex items-center justify-center gap-2 transition-all duration-200 overflow-hidden active:scale-[0.97] disabled:opacity-55 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:brightness-105 active:scale-95 shadow-md border border-yellow-300/20",
    success: "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-105 active:scale-95 shadow-md border border-emerald-400/20",
    danger: "bg-gradient-to-r from-rose-600 via-red-600 to-red-700 text-white hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:brightness-105 active:scale-95 shadow-md border border-rose-500/20",
    outline: "border border-white/10 text-white bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 active:scale-95 backdrop-blur-md",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5 active:scale-95"
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {/* Glare Reflex effect on premium hover */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
      
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin text-current shrink-0" size={14} />
          <span className="animate-pulse tracking-[0.2em]">PROCESSING...</span>
        </span>
      ) : (
        <>
          {children}
        </>
      )}
    </button>
  );
};
