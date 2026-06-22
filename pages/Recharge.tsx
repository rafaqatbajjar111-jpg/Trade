
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { LiquidButton } from '../components/LiquidButton.tsx';
import { WalletService, NotificationService, AdminSettingsService, AuthService } from '../services/binance.ts';
import { ChevronLeft, Copy, Smartphone, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Recharge: React.FC = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'upi' | 'crypto'>('upi');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminSettings, setAdminSettings] = useState<any>({ upi_id: '', usdt_address: '', min_recharge: 500 });
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    // Get current user from Local Auth Service instead of Supabase
    AuthService.getCurrentUser().then((user) => {
      if (user) setUid(user.id);
    });
    AdminSettingsService.getSettings().then(setAdminSettings);
  }, []);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    NotificationService.add("Copied", "Address copied to clipboard", "success");
  };

  const handleDepositSubmit = async () => {
    if (!uid) {
      NotificationService.add("Session Error", "Please login again.", "error");
      return;
    }
    const val = parseFloat(amount);
    const minRec = adminSettings.min_recharge || 500;
    
    if (!val || val < minRec) {
      NotificationService.add("Invalid Amount", `Minimum recharge is ₹${minRec}`, "error");
      return;
    }
    if (!transactionId || transactionId.length < 6) {
      NotificationService.add("Verification Required", "Please enter a valid Transaction ID / UTR", "error");
      return;
    }

    setLoading(true);
    try {
      await WalletService.submitDeposit(uid, {
        amount: val,
        method,
        transactionId
      });
      NotificationService.add("Deposit Submitted", "Verification in progress. Funds will reflect soon.", "info");
      
      // Trigger update for admin dashboard
      window.dispatchEvent(new CustomEvent('zmex_db_update', { detail: { key: 'zmex_deposits_ledger' } }));
      
      navigate('/');
    } catch (err: any) {
      NotificationService.add("Submission Failed", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 page-transition">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 glass-effect rounded-xl text-yellow-400 active:scale-90">
          <ChevronLeft size={20} strokeWidth={3} />
        </button>
        <h1 className="text-lg font-black tracking-tighter uppercase italic text-white">DEPOSIT</h1>
      </div>

      <div className="flex p-1 glass-effect rounded-xl border-white/10">
        <button 
          onClick={() => setMethod('upi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${method === 'upi' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500'}`}
        >
          <Smartphone size={12} /> UPI
        </button>
        <button 
          onClick={() => setMethod('crypto')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${method === 'crypto' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500'}`}
        >
          <Wallet size={12} /> USDT
        </button>
      </div>

      <GlassCard className="p-4 border-yellow-400/20 relative overflow-hidden shadow-2xl">
        <div className="text-center mb-5">
           <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1 leading-none">
             {method === 'upi' ? "Pay to UPI ID" : "Deposit USDT"}
           </p>
           <div 
             className="flex items-center justify-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 cursor-pointer active:scale-[0.98] transition-all" 
             onClick={() => copyToClipboard(method === 'upi' ? adminSettings.upi_id : adminSettings.usdt_address)}
           >
              <span className="text-[10px] font-black text-white tracking-tight break-all leading-none">
                {method === 'upi' ? adminSettings.upi_id : (adminSettings.usdt_address?.slice(0, 10) + '...' + adminSettings.usdt_address?.slice(-10))}
              </span>
              <Copy size={12} className="text-yellow-400 shrink-0" />
           </div>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-0.5">
             <label className="text-[7px] text-gray-600 font-black uppercase tracking-widest ml-1">Amount (INR)</label>
             <input 
                type="number" 
                placeholder={`Min ₹${adminSettings.min_recharge || 500}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 font-black text-lg tracking-tighter text-white focus:outline-none focus:border-yellow-400/50"
             />
          </div>

          <div className="space-y-0.5">
             <label className="text-[7px] text-gray-600 font-black uppercase tracking-widest ml-1">Reference ID (UTR)</label>
             <input 
                type="text" 
                placeholder="Transaction ID / UTR"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-5 font-bold text-[9px] tracking-widest text-yellow-400 uppercase focus:outline-none focus:border-yellow-400/50"
             />
          </div>

          <LiquidButton fullWidth onClick={handleDepositSubmit} className="shadow-yellow-400/20 font-black">
            {loading ? 'SUBMITTING...' : 'SUBMIT DEPOSIT'}
          </LiquidButton>
        </div>
      </GlassCard>
    </div>
  );
};

export default Recharge;
