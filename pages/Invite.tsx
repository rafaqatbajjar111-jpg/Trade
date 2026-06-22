
import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { LiquidButton } from '../components/LiquidButton.tsx';
import { NotificationService, AuthService } from '../services/binance.ts';
import { ChevronLeft, UserPlus, Copy, Share2, Award, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Invite: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    AuthService.getCurrentUser().then((p) => {
      setProfile(p);
      // Generate code for existing users if missing
      if (p && !p.referralCode) {
        const newCode = Math.floor(1000 + Math.random() * 9000).toString();
        AuthService.updateProfile(p.id, { referralCode: newCode }).then(() => {
          setProfile({ ...p, referralCode: newCode });
        });
      }
    });
  }, []);

  // Use the 4-digit referral code from profile
  const referralCode = profile?.referralCode || profile?.id || "ZMEX-LOADING";
  
  // Full site link with referral parameter using the NEW /register path
  const inviteLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    NotificationService.add("Copied", "Full invitation link copied to clipboard", "success");
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 glass-effect rounded-xl text-gray-400">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-black tracking-tighter uppercase">AFFILIATE</h1>
      </div>

      <GlassCard className="p-4 border-yellow-400/20 relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-transparent">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/5 blur-3xl"></div>
        <div className="text-center mb-5">
           <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black shadow-xl mx-auto mb-2 rotate-6">
              <UserPlus size={20} />
           </div>
           <h2 className="text-lg font-black tracking-tighter uppercase italic text-white">Daily Yield</h2>
           <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] mt-0.5 leading-none">Trading empire hub</p>
        </div>

        <div className="space-y-5">
           <div className="space-y-1.5 ">
              <p className="text-[7.5px] text-gray-500 font-black uppercase tracking-widest text-center">Your Referral Signature</p>
              <div className="flex items-center gap-2">
                 <div className="flex-1 bg-black/60 border border-white/5 rounded-xl py-3 px-4 text-center font-black text-xs tracking-[0.3em] text-yellow-400 uppercase shadow-inner">
                    {referralCode}
                 </div>
                 <button 
                  onClick={copyToClipboard}
                  className="p-3 bg-gradient-to-b from-white/10 to-white/5 hover:bg-white/15 text-white border border-white/10 rounded-xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center"
                 >
                    <Copy size={14} />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 glass-effect rounded-xl border-white/5 space-y-0.5">
                 <div className="flex items-center gap-1 text-yellow-400">
                    <Users size={10} />
                    <span className="text-[7px] font-black uppercase tracking-widest">Lvl 1</span>
                 </div>
                 <p className="text-base font-black">1.5%</p>
                 <p className="text-[6px] text-gray-600 font-bold uppercase leading-none">Direct Commission</p>
              </div>
              <div className="p-3 glass-effect rounded-xl border-white/5 space-y-0.5">
                 <div className="flex items-center gap-1 text-purple-400">
                    <Award size={10} />
                    <span className="text-[7px] font-black uppercase tracking-widest">Lvl 2</span>
                 </div>
                 <p className="text-base font-black">0.8%</p>
                 <p className="text-[6px] text-gray-600 font-bold uppercase leading-none">Indirect Commission</p>
              </div>
           </div>

           <LiquidButton 
            fullWidth 
            className="font-black shadow-lg"
            onClick={copyToClipboard}
           >
              <Share2 size={12} className="mr-1" /> COPY LINK
           </LiquidButton>
        </div>
      </GlassCard>

      <div className="space-y-4 px-4">
         <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" /> PROGRAM BENEFITS
         </h3>
         <div className="space-y-2">
            {[
              "Real-time settlement of commissions",
              "Unlimited referral invitations",
              "Dedicated account manager for VIPs",
              "Full transparency on revenue performance"
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 p-3 glass-effect rounded-xl border-white/5">
                 <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0"></div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">{text}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Invite;
