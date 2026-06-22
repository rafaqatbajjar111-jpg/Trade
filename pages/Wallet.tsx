
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { WalletService, formatINR, AuthService } from '../services/binance.ts';
import { ChevronLeft, Wallet as WalletIcon, Download, Upload, Clock, ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  // Fixed: Initialize as null
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    
    AuthService.getCurrentUser().then(user => {
      if (user) {
        unsub = WalletService.subscribeToWallet(user.id, setWallet);
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (!wallet) return (
    <div className="space-y-6 pb-24 page-transition animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/[0.03] rounded-xl border border-white/5"></div>
        <div className="h-4 w-20 bg-white/[0.03] rounded"></div>
      </div>
      <div className="w-full h-44 bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-2 w-16 bg-white/[0.03] rounded"></div>
            <div className="h-6 w-32 bg-white/[0.03] rounded-md"></div>
            <div className="h-2 w-20 bg-white/[0.03] rounded"></div>
          </div>
          <div className="w-10 h-10 bg-white/[0.03] rounded-lg"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-white/[0.02] rounded-xl"></div>
          <div className="h-10 bg-white/[0.02] rounded-xl"></div>
        </div>
      </div>
      <div className="space-y-2.5 pt-2">
        <div className="h-3 w-16 bg-white/[0.03] rounded"></div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-full h-12 bg-white/[0.02] border border-white/5 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );

  const totalAssets = (wallet.balanceUSDT || 0) * 84.15; // Simplified for demo

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 glass-effect rounded-xl text-gray-400">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-black tracking-tighter uppercase">VAULT</h1>
      </div>

      <GlassCard className="p-5 border-yellow-400/20 relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-black">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl"></div>
        <div className="flex justify-between items-start mb-5">
           <div>
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none">Vault Balance</p>
              <h2 className="text-xl font-black tracking-tighter text-white mt-1.5 leading-none">₹{totalAssets.toLocaleString()}</h2>
              <p className="text-[7px] text-yellow-400 font-black uppercase mt-1 leading-none">≈ {(wallet.balanceUSDT || 0).toFixed(2)} USDT</p>
           </div>
           <div className="p-2.5 bg-yellow-400 rounded-lg text-black shadow-xl">
              <WalletIcon size={18} />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
           <button 
            onClick={() => navigate('/recharge')}
            className="flex flex-col items-center gap-1.5 p-2.5 glass-effect border-white/5 rounded-xl hover:bg-yellow-400 hover:text-black transition-all group"
           >
              <Download size={16} className="text-yellow-400 group-hover:text-black" />
              <span className="text-[7px] font-black uppercase tracking-widest leading-none">Recharge</span>
           </button>
           <button 
            onClick={() => navigate('/withdrawal')}
            className="flex flex-col items-center gap-1.5 p-2.5 glass-effect border-white/5 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
           >
              <Upload size={16} className="text-red-400 group-hover:text-white" />
              <span className="text-[7px] font-black uppercase tracking-widest leading-none">Payout</span>
           </button>
        </div>
      </GlassCard>

      <div className="space-y-3">
         <h3 className="text-xs font-black uppercase tracking-tighter flex items-center gap-2 px-2">
            <Clock size={12} className="text-yellow-400" /> RECORDS
         </h3>
         
         <div className="space-y-1.5">
            {[
              { label: "Capital Balance", val: formatINR(wallet.balanceUSDT || 0), icon: <TrendingUp size={12} />, color: "text-blue-400" },
              { label: "Total Deposits", val: `₹${(wallet.totalDeposit || 0).toLocaleString()}`, icon: <Download size={12} />, color: "text-green-400" },
              { label: "Total Payouts", val: `₹${(wallet.totalWithdraw || 0).toLocaleString()}`, icon: <Upload size={12} />, color: "text-red-400" },
              { label: "Vault Security", val: "AES-256 Cloud", icon: <ShieldCheck size={12} />, color: "text-yellow-400" },
            ].map((item, i) => (
              <GlassCard key={i} className="p-3 border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2.5">
                    <div className={`p-1 rounded-md bg-white/5 ${item.color}`}>
                       {item.icon}
                    </div>
                    <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest leading-none">{item.label}</span>
                 </div>
                 <span className="text-[11px] font-black tracking-tighter leading-none">{item.val}</span>
              </GlassCard>
            ))}
         </div>
      </div>
    </div>
  );
};

export default WalletPage;
