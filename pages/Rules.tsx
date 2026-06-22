
import React from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { ChevronLeft, BookOpen, Shield, Gavel, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Rules: React.FC = () => {
  const navigate = useNavigate();

  const rules = [
    { title: "Trading Policy", content: "All trades executed on the ZMEX platform are finalized on the global order book. Demo funds are for simulation purposes only." },
    { title: "Withdrawal Terms", content: "Withdrawals are processed instantly for amounts under ₹10L. VIP levels 1-5 enjoy zero processing fees." },
    { title: "Team Ethics", content: "Systematic abuse of referral links or multi-accounting will result in immediate account suspension and asset lock." },
    { title: "KYC Compliance", content: "Users must complete Level 1 verification to unlock withdrawal features. Level 2 is required for higher limit trading." }
  ];

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 glass-effect rounded-xl text-gray-400">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-black tracking-tighter uppercase">BYLAWS</h1>
      </div>

      <div className="text-center mb-6">
         <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-yellow-400 border border-white/10 shadow-xl mx-auto mb-3">
            <BookOpen size={24} />
         </div>
         <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest leading-none">v1.2.4</p>
         <h2 className="text-sm font-black text-white mt-1 uppercase italic tracking-tighter">Guidelines</h2>
      </div>

      <div className="space-y-2.5">
        {rules.map((rule, i) => (
          <GlassCard key={i} className="p-3 border-white/5 space-y-1.5">
             <div className="flex items-center gap-2">
                <div className="p-1 bg-yellow-400/10 rounded-lg">
                   {i === 0 ? <Gavel size={12} className="text-yellow-400" /> : <FileText size={12} className="text-yellow-400" />}
                </div>
                <h3 className="text-[9px] font-black uppercase tracking-widest">{rule.title}</h3>
             </div>
             <p className="text-[8px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
                {rule.content}
             </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-3 border-yellow-400/20 bg-yellow-400/5 flex items-center gap-3">
         <Shield size={16} className="text-yellow-400 shrink-0" />
         <div className="space-y-0.5">
            <p className="text-[8px] text-white font-black uppercase tracking-widest leading-none text-left">Security First</p>
            <p className="text-[7px] text-gray-500 font-bold uppercase leading-tight text-left">Assets insured via Safeguard Initiative.</p>
         </div>
      </GlassCard>
    </div>
  );
};

export default Rules;
