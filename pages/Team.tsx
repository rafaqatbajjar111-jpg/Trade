
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { ChevronLeft, Users, TrendingUp, UserCheck, Wallet, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthService, WalletService } from '../services/binance.ts';

const Team: React.FC = () => {
  const navigate = useNavigate();
  const [activeTier, setActiveTier] = useState(1);
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any>({
    level1: [],
    level2: [],
    level3: [],
    totalCount: 0
  });

  useEffect(() => {
    AuthService.getCurrentUser().then(user => {
      if (user) {
        WalletService.getTeamData(user.id).then(data => {
          setTeamData(data);
          setLoading(false);
        });
      }
    });
  }, []);

  if (loading) return (
    <div className="space-y-6 pb-24 page-transition animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/[0.03] rounded-xl border border-white/5"></div>
        <div className="h-4 w-28 bg-white/[0.03] rounded"></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
         <div className="h-16 bg-white/[0.02] border border-white/5 rounded-xl"></div>
         <div className="h-16 bg-white/[0.02] border border-white/5 rounded-xl"></div>
      </div>
      <div className="h-10 bg-white/[0.02] border border-white/5 rounded-xl"></div>
      <div className="space-y-2.5 pt-2">
         {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl"></div>
         ))}
      </div>
    </div>
  );

  const currentLevelMembers = activeTier === 1 ? teamData.level1 : activeTier === 2 ? teamData.level2 : teamData.level3;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 glass-effect rounded-xl text-gray-400">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-black tracking-tighter uppercase">NETWORK</h1>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
         <GlassCard className="p-3 border-yellow-400/10 space-y-0.5">
            <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest leading-none">Size</p>
            <div className="flex items-center gap-2">
               <Users size={14} className="text-yellow-400" />
               <span className="text-lg font-black tracking-tighter">{teamData.totalCount}</span>
            </div>
         </GlassCard>
         <GlassCard className="p-3 border-green-500/10 space-y-0.5">
            <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest leading-none">Status</p>
            <div className="flex items-center gap-2">
               <TrendingUp size={14} className="text-green-400" />
               <span className="text-lg font-black tracking-tighter">LVL {activeTier}</span>
            </div>
         </GlassCard>
      </div>

      <div className="flex p-0.5 glass-effect rounded-xl border-white/10 bg-white/5">
        {[1, 2, 3].map((tier) => (
          <button 
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeTier === tier ? 'bg-yellow-400 text-black shadow-lg animate-pulse' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Tier {tier}
          </button>
        ))}
      </div>

      <GlassCard className="p-4 border-white/5 space-y-3">
         <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <div>
               <h3 className="text-xs font-black tracking-tighter uppercase italic">Level {activeTier} Data</h3>
            </div>
         </div>

         <div className="space-y-1.5">
            {currentLevelMembers.length === 0 ? (
               <div className="text-center py-5 opacity-20">
                  <p className="text-[8px] font-black uppercase tracking-widest">Empty Level</p>
               </div>
            ) : currentLevelMembers.map((member: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-xl border border-white/5 group">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-yellow-400/30 transition-all">
                       <img 
                         src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`} 
                         alt="Avatar" 
                         className="w-full h-full object-cover"
                       />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter block leading-none">{member.name || member.email.split('@')[0]}</span>
                      <span className="text-[6px] text-gray-600 uppercase font-black tracking-widest">Verified Account</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-1.5 opacity-60">
                    <UserCheck size={10} className="text-green-400" />
                    <span className="text-[7px] font-black text-gray-500 uppercase">LINKED</span>
                 </div>
              </div>
            ))}
         </div>
      </GlassCard>

      <div className="p-4 bg-yellow-400/5 rounded-2xl border border-yellow-400/10 flex items-center gap-4">
         <TrendingUp className="text-yellow-400 shrink-0" size={24} />
         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
            Invite more members to unlock <span className="text-yellow-400">High-Yield Commission Levels</span> and boost your team ranking.
         </p>
      </div>
    </div>
  );
};

export default Team;
