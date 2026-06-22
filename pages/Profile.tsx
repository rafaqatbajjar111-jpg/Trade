import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Download, 
  Send, 
  CreditCard,
  History,
  Copy,
  Bell,
  Award,
  Shield,
  Headphones,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthService, NotificationService, KYCService, AdminSettingsService } from '../services/binance.ts';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  status?: string;
  statusColor?: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, status, statusColor, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between px-5 py-4 border-b border-white/[0.03] last:border-0 active:bg-white/5 transition-colors group"
  >
    <div className="flex items-center gap-3.5">
      <div className="text-yellow-400 opacity-80 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <span className="font-extrabold text-[11px] text-gray-300 group-hover:text-white uppercase tracking-wider transition-colors">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {status && (
        <span className={`${statusColor || 'text-gray-500'} text-[8px] font-black px-1.5 py-0.5 rounded border border-current uppercase tracking-wider`}>
          {status}
        </span>
      )}
      <ChevronRight className="text-gray-650 group-hover:text-amber-400 transition-colors" size={12} />
    </div>
  </button>
);

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>('unverified');
  const [payoutConfigured, setPayoutConfigured] = useState(false);
  const [channelUrl, setChannelUrl] = useState('');

  useEffect(() => {
    AuthService.getCurrentUser().then((user) => {
      if (user) {
        setProfile(user);
        KYCService.getStatus(user.id).then(res => setKycStatus(res.status || 'unverified'));
        AuthService.getSettlementConfig(user.id).then(config => {
          if (config && (config.account_number || config.upi_id || config.usdt_address)) {
            setPayoutConfigured(true);
          }
        });
      }
    });

    AdminSettingsService.getChannelSettings().then(settings => {
      setChannelUrl(settings.telegram_channel);
    });
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    NotificationService.add("Logout Successful", "You have been signed out.", "info");
    navigate('/auth');
  };

  const copyUid = () => {
    if (profile?.id) {
      navigator.clipboard.writeText(profile.id);
      NotificationService.add("Copied", "UID copied to clipboard.", "success");
    }
  };

  const openTelegramChannel = () => {
    if (channelUrl) {
      window.open(channelUrl, '_blank');
    } else {
      NotificationService.add("Channel Offline", "Telegram route not configured yet.", "error");
    }
  };

  return (
    <div className="min-h-screen font-display bg-[#0a0a0c] text-white flex flex-col page-transition -mx-5 -mt-8 pb-10">
      <header className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/[0.05] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCircle className="text-yellow-400" size={18} />
          <h1 className="text-xs font-black tracking-[0.15em] uppercase italic text-white">Profile Control</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-1 active:scale-95 transition-transform" onClick={() => navigate('/notifications')}>
            <Bell className="text-gray-400 hover:text-yellow-400" size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 pb-24 space-y-6">
        <section className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full border-2 border-yellow-400/20 p-1 flex items-center justify-center bg-black/60 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
               <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/5">
                  {profile?.email ? (
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={32} className="text-slate-600" />
                  )}
               </div>
            </div>
            <div className="absolute bottom-0 right-0 bg-yellow-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full border border-black uppercase shadow-md transform translate-x-1 translate-y-1">
               {profile?.level || 'Elite'}
            </div>
          </div>
          <h2 className="text-base font-black tracking-tight text-white mb-0.5 uppercase italic">{profile?.name || 'Trader'}</h2>
          <p className="text-gray-500 text-[8.5px] font-bold tracking-widest uppercase mb-3">{profile?.email}</p>
          
          <div className="flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.04] px-3.5 py-1.5 rounded-xl border border-white/5 cursor-pointer active:scale-95 transition-all" onClick={copyUid}>
            <span className="text-[8.5px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">UID: {profile?.id?.slice(0, 12).toUpperCase() || 'ZMEX-ID'}</span>
            <Copy size={10} className="text-yellow-400" />
          </div>
        </section>

        <section>
          <div className="bg-gradient-to-r from-yellow-400/5 via-amber-400/[0.02] to-transparent rounded-2xl border border-white/5 p-4 relative overflow-hidden flex items-center justify-between shadow-2xl">
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-1.5">
                <Award className="text-yellow-400" size={14} />
                <span className="text-yellow-400 font-black text-[9px] uppercase tracking-widest">Elite Plus Member</span>
              </div>
              <p className="text-gray-400 text-[8px] font-bold uppercase tracking-wide">Standard tier grants optimized 0.01% platform fee</p>
              <div className="pt-1.5">
                <button className="bg-yellow-400 hover:bg-yellow-300 text-black text-[8.5px] font-black uppercase tracking-wider px-3 py-1 rounded-lg transition-all active:scale-95">
                  Benefits Table
                </button>
              </div>
            </div>
            <div className="opacity-5 absolute -right-3 -bottom-3">
              <Shield className="text-yellow-400" size={70} />
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="px-5 pt-3.5 pb-1">
              <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Account & Security</h3>
            </div>
            <div>
              <MenuItem icon={<UserIcon size={14} />} label="Account Settings" onClick={() => navigate('/profile')} />
              <MenuItem icon={<ShieldCheck size={14} />} label="Identity Verification" onClick={() => navigate('/kyc')} status={kycStatus.toUpperCase()} statusColor={kycStatus === 'verified' ? 'text-green-500' : 'text-amber-500'} />
              <MenuItem icon={<CreditCard size={14} />} label="Auto Payout Method" onClick={() => navigate('/withdraw-settings')} status={payoutConfigured ? 'ENABLED' : 'NOT SET'} statusColor={payoutConfigured ? 'text-yellow-400' : 'text-gray-500'} />
            </div>
          </section>

          <section className="bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="px-5 pt-3.5 pb-1">
              <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Financial Records</h3>
            </div>
            <div>
              <MenuItem icon={<History size={14} />} label="Transaction History" onClick={() => navigate('/transaction-history')} />
            </div>
          </section>

          <section className="bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="px-5 pt-3.5 pb-1">
              <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Support & Community</h3>
            </div>
            <div>
              <MenuItem 
                icon={<Send size={14} />} 
                label="Telegram Channel" 
                status="JOIN CLIENT"
                statusColor="text-yellow-400"
                onClick={openTelegramChannel} 
              />
              <MenuItem icon={<Headphones size={14} />} label="Customer Support" onClick={() => navigate('/support')} />
              <MenuItem icon={<Download size={14} />} label="Download System" status="v2.1" statusColor="text-gray-400" onClick={() => {}} />
            </div>
          </section>

          <div className="px-2 pt-2 text-center">
            <button onClick={handleLogout} className="w-full py-2.5 text-red-500 font-black uppercase tracking-[0.2em] text-[9.5px] border border-red-500/10 hover:border-red-500/20 rounded-xl transition-all active:scale-[0.98] bg-red-500/[0.02]">
              <LogOut size={11} className="inline mr-1.5 -mt-0.5" /> Close session
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
