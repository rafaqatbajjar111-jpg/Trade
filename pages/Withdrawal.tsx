import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { LiquidButton } from '../components/LiquidButton.tsx';
import { WalletService, NotificationService, formatINR, AuthService, AdminSettingsService } from '../services/binance.ts';
import { ChevronLeft, ArrowUpRight, Loader2, Download, Landmark, Smartphone, Wallet, Lock, ShieldAlert, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Withdrawal: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [settlementConfig, setSettlementConfig] = useState<any>(null);
  const [adminSettings, setAdminSettings] = useState<any>({ min_withdrawal: 210 });
  const [uid, setUid] = useState<string | null>(null);
  const [isMethodConfigured, setIsMethodConfigured] = useState<boolean | null>(null);

  const availableINR = (wallet?.balanceUSDT || 0) * 84.15;

  const [activeMethod, setActiveMethod] = useState<'BANK' | 'UPI' | 'USDT' | null>(null);
  const [activeDetailsText, setActiveDetailsText] = useState('');

  useEffect(() => {
    AuthService.getCurrentUser().then((user) => {
      if (user) {
        setUid(user.id);
        const unsub = WalletService.subscribeToWallet(user.id, setWallet);
        AuthService.getSettlementConfig(user.id).then(config => {
          if (!config || (!config.upi_id && !config.usdt_address && !config.account_number)) {
            setIsMethodConfigured(false);
            return;
          }
          
          setSettlementConfig(config);
          setIsMethodConfigured(true);

          // Detect active configuration
          if (config.bank_name && config.account_number) {
            setActiveMethod('BANK');
            setActiveDetailsText(`${config.bank_name} - A/C: ${config.account_number} (IFSC: ${config.ifsc}) [Holder: ${config.recipient_name || 'N/A'}]`);
          } else if (config.upi_id) {
            setActiveMethod('UPI');
            setActiveDetailsText(`UPI VPA: ${config.upi_id} [Payee: ${config.recipient_name || 'N/A'}]`);
          } else if (config.usdt_address) {
            setActiveMethod('USDT');
            setActiveDetailsText(`USDT (TRC20): ${config.usdt_address}`);
          }
        });
        AdminSettingsService.getSettings().then(setAdminSettings);
        return () => unsub();
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  const handleWithdraw = async () => {
    if (!uid || !activeMethod) return;

    const val = parseFloat(amount);
    const minWit = adminSettings.min_withdrawal || 210;
    
    if (isNaN(val) || val < minWit) {
      NotificationService.add("Error", `Minimum withdrawal is ₹${minWit}`, "error");
      return;
    }
    if (val > availableINR) {
      NotificationService.add("Insufficient Funds", "Withdrawal amount exceeds available balance", "error");
      return;
    }

    if (!password.trim()) {
      NotificationService.add("Action Required", "Please enter your password to authorize withdrawal.", "error");
      return;
    }

    setLoading(true);
    try {
      // Secret password authentication checks
      const isAuthorized = await AuthService.verifyPassword(uid, password);
      if (!isAuthorized) {
        NotificationService.add("Verification Failed", "Incorrect account password. Request rejected.", "error");
        setLoading(false);
        return;
      }

      await WalletService.submitWithdrawal(uid, {
        amount: val,
        method: activeMethod,
        details: activeDetailsText
      });

      NotificationService.add("Withdrawal Requested", `₹${val.toLocaleString()} request routed. Processing time 30-60m.`, "success");
      
      window.dispatchEvent(new CustomEvent('zmex_db_update', { detail: { key: 'zmex_withdraw_ledger' } }));
      navigate('/');
    } catch (err: any) {
      NotificationService.add("Failed", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const setMax = () => {
    setAmount(availableINR.toFixed(0));
  };

  if (isMethodConfigured === null || !wallet) return (
    <div className="space-y-6 pb-24 page-transition animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/[0.03] rounded-xl border border-white/5"></div>
        <div className="h-4 w-28 bg-white/[0.03] rounded"></div>
      </div>
      <div className="w-full h-96 bg-[#ffffff]/[0.01] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
        <div className="flex flex-col items-center space-y-3 mt-4">
          <div className="w-12 h-12 bg-white/[0.03] rounded-2xl border border-white/5"></div>
          <div className="h-2.5 w-16 bg-white/[0.03] rounded"></div>
          <div className="h-7 w-32 bg-white/[0.03] rounded-md"></div>
        </div>
        <div className="h-14 w-full bg-white/[0.03] rounded-2xl mt-4"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 page-transition">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 glass-effect rounded-xl text-yellow-400 active:scale-95 border border-white/5 bg-white/[0.02]">
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-black tracking-tighter uppercase italic text-white leading-none">INITIATE PAYOUT</h1>
      </div>

      {!isMethodConfigured ? (
        <GlassCard className="p-6 border-red-500/20 text-center space-y-6 bg-gradient-to-br from-red-950/10 via-black to-red-950/5 shadow-2xl py-8">
          <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
            <ShieldAlert size={28} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-red-400">YOUR PAYMENT METHOD NOT SET</h2>
            <p className="text-[10px] text-gray-400 font-bold leading-relaxed max-w-xs mx-auto uppercase tracking-wide">
              Your payout details are empty. Please click below to configure your auto payout method inside profile.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/profile')} 
            className="inline-block w-full text-center text-[10px] font-black text-black bg-yellow-400 hover:bg-yellow-500 transition-colors py-3.5 px-4 rounded-xl shadow-lg tracking-widest uppercase cursor-pointer"
          >
            Please Click Here to Set Your Payment Method
          </button>
        </GlassCard>
      ) : (
        <GlassCard className="p-5 border-red-500/20 relative overflow-hidden bg-gradient-to-br from-red-950/10 via-black to-red-950/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl"></div>
          
          <div className="text-center mb-6">
             <div className="w-11 h-11 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-3 border border-red-500/30">
                <Upload size={20} />
             </div>
             <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest leading-none">WITHDRAWABLE NET BALANCE</p>
             <h2 className="text-2xl font-black text-white mt-2">₹{availableINR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
             <p className="text-[8px] text-gray-600 font-bold mt-1">AVAILABLE VALUE IN USDT: {(wallet?.balanceUSDT || 0).toFixed(2)} USDT</p>
          </div>

          <div className="space-y-5">
            {/* Amount input */}
            <div className="space-y-1.5 group">
               <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1 leading-none">Withdrawal Amount</label>
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-base text-red-500">₹</span>
                  <input 
                    type="number" 
                    placeholder={`Min ₹${adminSettings.min_withdrawal || 210}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-9 pr-14 focus:outline-none focus:border-red-500/40 transition-all font-black text-lg tracking-tighter text-white"
                  />
                  <button 
                    type="button"
                    onClick={setMax}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg"
                  >
                    MAX
                  </button>
               </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 group">
               <label className="text-[8px] text-gray-500 font-heavy uppercase tracking-widest ml-1 leading-none">Security Password</label>
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-500">
                    <Lock size={13} />
                  </span>
                  <input 
                    type="password" 
                    placeholder="ENTER LOG-IN PASSWORD TO CONFIRM"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/5 rounded-2xl py-3.5 pl-9 pr-4 focus:outline-none focus:border-red-500/40 transition-all font-bold text-xs tracking-wider text-white"
                  />
               </div>
            </div>

            <div className="p-3.5 bg-white/[0.01] rounded-2xl border border-white/[0.03] space-y-2">
               <div className="flex justify-between items-center">
                  <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Withdrawal Fee</span>
                  <span className="text-[8.5px] text-emerald-400 font-extrabold uppercase tracking-wider">₹0.00 <span className="text-gray-700 ml-1 italic">(REDUCED)</span></span>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Estimated Receive</span>
                  <span className="text-[11px] text-white font-black tracking-tighter">₹{amount ? (parseFloat(amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 0 }) : '0'}</span>
               </div>
            </div>

            <LiquidButton 
              fullWidth 
              variant="danger"
              className="shadow-[0_4px_20px_rgba(220,38,38,0.15)] font-black py-4 text-[10px] tracking-widest"
              onClick={handleWithdraw}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <span className="flex items-center justify-center gap-1.5 uppercase">VERIFY & CONFIRM WITHDRAWAL <ArrowUpRight size={14} /></span>}
            </LiquidButton>
          </div>
        </GlassCard>
      )}

      <div className="flex items-start gap-3.5 p-4 bg-red-950/10 border border-red-950/20 rounded-2xl opacity-75">
        <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500 shrink-0"><ShieldAlert size={16} /></div>
        <div className="space-y-0.5">
          <p className="text-[9px] text-white font-black uppercase tracking-widest">Instant Security Audits</p>
          <p className="text-[8.5px] text-gray-500 font-medium leading-relaxed uppercase tracking-wide">
            ZMEX deploys cryptographic wallet security shields. Forgery or bad/fake credentials are immediately flagged and might suspend trading actions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;
