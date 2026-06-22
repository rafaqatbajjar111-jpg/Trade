import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { LiquidButton } from '../components/LiquidButton.tsx';
import { ChevronLeft, Save, Landmark, Wallet, Smartphone, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthService, NotificationService } from '../services/binance.ts';

const WithdrawSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    recipient_name: '',
    bank_name: '',
    account_number: '',
    ifsc: '',
    upi_id: '',
    usdt_address: ''
  });
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'upi' | 'usdt'>('bank');
  const [uid, setUid] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedMethod, setLockedMethod] = useState<'bank' | 'upi' | 'usdt' | null>(null);

  useEffect(() => {
    AuthService.getCurrentUser().then((user) => {
      if (user) {
        setUid(user.id);
        AuthService.getSettlementConfig(user.id).then((data) => {
          if (data) {
            setFormData({
              recipient_name: data.recipient_name || '',
              bank_name: data.bank_name || '',
              account_number: data.account_number || '',
              ifsc: data.ifsc || '',
              upi_id: data.upi_id || '',
              usdt_address: data.usdt_address || ''
            });

            // Determine if already configured and locked
            const hasBank = !!(data.bank_name && data.account_number);
            const hasUpi = !!data.upi_id;
            const hasUsdt = !!data.usdt_address;

            if (hasBank) {
              setIsLocked(true);
              setLockedMethod('bank');
              setSelectedMethod('bank');
            } else if (hasUpi) {
              setIsLocked(true);
              setLockedMethod('upi');
              setSelectedMethod('upi');
            } else if (hasUsdt) {
              setIsLocked(true);
              setLockedMethod('usdt');
              setSelectedMethod('usdt');
            }
          }
          setLoading(false);
        });
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  const handleSave = async () => {
    if (!uid) return;

    // Validation
    if (selectedMethod === 'bank') {
      if (!formData.recipient_name.trim()) return NotificationService.add("Validation Error", "Please enter Holder Name.", "error");
      if (!formData.bank_name.trim()) return NotificationService.add("Validation Error", "Please enter Bank Name.", "error");
      if (!formData.account_number.trim()) return NotificationService.add("Validation Error", "Please enter Account Number.", "error");
      if (!formData.ifsc.trim()) return NotificationService.add("Validation Error", "Please enter IFSC Code.", "error");

      // clear other fields to keep exactly one option active
      formData.upi_id = '';
      formData.usdt_address = '';
    } else if (selectedMethod === 'upi') {
      if (!formData.recipient_name.trim()) return NotificationService.add("Validation Error", "Please enter Payee Name.", "error");
      if (!formData.upi_id.trim()) return NotificationService.add("Validation Error", "Please enter UPI ID.", "error");

      // clear other fields
      formData.bank_name = '';
      formData.account_number = '';
      formData.ifsc = '';
      formData.usdt_address = '';
    } else if (selectedMethod === 'usdt') {
      if (!formData.usdt_address.trim()) return NotificationService.add("Validation Error", "Please enter TRC20 Wallet Address.", "error");

      // clear other fields
      formData.recipient_name = '';
      formData.bank_name = '';
      formData.account_number = '';
      formData.ifsc = '';
      formData.upi_id = '';
    }

    setSaving(true);
    try {
      await AuthService.saveSettlementConfig(uid, formData);
      NotificationService.add("Success", "Payout settings saved successfully.", "success");
      setIsLocked(true);
      setLockedMethod(selectedMethod);
      setTimeout(() => navigate('/profile'), 1200);
    } catch (e: any) {
      NotificationService.add("Save Error", e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-black/60 border border-white/5 disabled:opacity-75 disabled:text-gray-400 rounded-xl py-3.5 px-4 focus:outline-none focus:border-yellow-400/40 transition-all font-bold text-[11px] tracking-wider text-white placeholder:text-gray-700";

  if (loading) return (
    <div className="space-y-6 pb-24 page-transition animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/[0.03] rounded-2xl border border-white/5"></div>
        <div className="h-5 w-40 bg-white/[0.03] rounded-md"></div>
      </div>
      <div className="w-full h-80 bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
        <div className="h-4 w-28 bg-white/[0.03] rounded mb-2"></div>
        <div className="space-y-3.5">
          <div className="h-12 w-full bg-white/[0.03] rounded-xl"></div>
          <div className="h-12 w-full bg-white/[0.03] rounded-xl"></div>
          <div className="h-12 w-full bg-white/[0.03] rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 page-transition">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/profile')} className="p-2.5 glass-effect rounded-2xl text-yellow-400 active:scale-95 transition-transform border border-white/5 bg-white/[0.02]">
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-black tracking-tighter uppercase italic text-white leading-none">Payout Settings</h1>
      </div>

      {isLocked && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-4 px-5 rounded-2xl flex items-start gap-3.5 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg">
          <ShieldCheck className="shrink-0 mt-0.5 text-emerald-400" size={18} />
          <div>
            <p className="font-extrabold uppercase tracking-wide text-[10px]">PAYOUT VERIFIED & LOCKED</p>
            <p className="text-[9px] text-emerald-400/80 mt-1 font-bold">This secure endpoint is linked permanently. Future changes require contacting direct premium agent verification support.</p>
          </div>
        </div>
      )}

      {!isLocked && (
        <div className="bg-amber-500/5 border border-amber-500/20 text-amber-500 text-xs py-4 px-5 rounded-2xl flex items-start gap-3.5 shadow-lg">
          <AlertTriangle className="shrink-0 mt-0.5 text-amber-400" size={18} />
          <div>
            <p className="font-extrabold uppercase tracking-wide text-[10px]">ONE-TIME ACCOUNT LINKING WARNING</p>
            <p className="text-[9px] text-amber-400/80 mt-1 font-bold">Select and configure your preferred payout account. Once stored, you CANNOT change or modify these fields again. Check details carefully.</p>
          </div>
        </div>
      )}

      {/* Selector tab if not locked */}
      {!isLocked && (
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl">
          <button
            type="button"
            onClick={() => setSelectedMethod('bank')}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all border ${selectedMethod === 'bank' ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg font-black' : 'bg-transparent border-transparent text-gray-500 font-bold hover:text-gray-300'}`}
          >
            <Landmark size={14} />
            <span className="text-[8.5px] uppercase tracking-wider">Bank</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all border ${selectedMethod === 'upi' ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg font-black' : 'bg-transparent border-transparent text-gray-500 font-bold hover:text-gray-300'}`}
          >
            <Smartphone size={14} />
            <span className="text-[8.5px] uppercase tracking-wider">UPI</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('usdt')}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all border ${selectedMethod === 'usdt' ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg font-black' : 'bg-transparent border-transparent text-gray-500 font-bold hover:text-gray-300'}`}
          >
            <Wallet size={14} />
            <span className="text-[8.5px] uppercase tracking-wider">USDT</span>
          </button>
        </div>
      )}

      <div className="space-y-6">
        {selectedMethod === 'bank' && (
          <GlassCard className={`p-5 border-white/5 space-y-4 shadow-xl relative overflow-hidden ${isLocked && lockedMethod !== 'bank' ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <Landmark size={18} className="text-blue-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">LINK BANK ACCOUNT</h3>
              </div>
              {isLocked && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black tracking-widest px-1.5 py-0.5 rounded">ACTIVE</span>}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Holder Name</label>
                <input 
                  type="text" 
                  placeholder="E.G. JOHN DOE"
                  disabled={isLocked}
                  value={formData.recipient_name} 
                  onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                  className={inputClass} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Bank Name</label>
                <input 
                  type="text" 
                  placeholder="E.G. STATE BANK OF INDIA"
                  disabled={isLocked}
                  value={formData.bank_name} 
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  className={inputClass} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Account Number</label>
                <input 
                  type="text" 
                  placeholder="12 OR 16 DIGIT ACCOUNT NO."
                  disabled={isLocked}
                  value={formData.account_number} 
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  className={inputClass} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">IFSC Code</label>
                <input 
                  type="text" 
                  placeholder="11 CHARACTER IFSC CODE"
                  disabled={isLocked}
                  value={formData.ifsc} 
                  onChange={(e) => setFormData({...formData, ifsc: e.target.value})}
                  className={inputClass} 
                />
              </div>
            </div>
          </GlassCard>
        )}

        {selectedMethod === 'upi' && (
          <GlassCard className={`p-5 border-white/5 space-y-4 shadow-xl relative overflow-hidden ${isLocked && lockedMethod !== 'upi' ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <Smartphone size={18} className="text-green-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">LINK UPI ENDPOINT</h3>
              </div>
              {isLocked && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black tracking-widest px-1.5 py-0.5 rounded">ACTIVE</span>}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Payee/Holder Name</label>
                <input 
                  type="text" 
                  placeholder="E.G. JOHN DOE"
                  disabled={isLocked}
                  value={formData.recipient_name} 
                  onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                  className={inputClass} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">VPA / UPI ID</label>
                <input 
                  type="text" 
                  placeholder="E.G. NAME@OKAXIS"
                  disabled={isLocked}
                  value={formData.upi_id} 
                  onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                  className={inputClass} 
                />
              </div>
            </div>
          </GlassCard>
        )}

        {selectedMethod === 'usdt' && (
          <GlassCard className={`p-5 border-white/5 space-y-4 shadow-xl relative overflow-hidden ${isLocked && lockedMethod !== 'usdt' ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <Wallet size={18} className="text-yellow-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">LINK USDT (TRC20) WALLET</h3>
              </div>
              {isLocked && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black tracking-widest px-1.5 py-0.5 rounded">ACTIVE</span>}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">USDT (TRC20) Wallet Address</label>
                <input 
                  type="text" 
                  placeholder="E.G. TYK8XPVMTVYRE..."
                  disabled={isLocked}
                  value={formData.usdt_address} 
                  onChange={(e) => setFormData({...formData, usdt_address: e.target.value})}
                  className={inputClass} 
                />
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {!isLocked ? (
        <LiquidButton 
          fullWidth 
          className="font-black shadow-yellow-400/20 py-4 text-[10px] tracking-widest"
          onClick={handleSave}
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <span className="flex items-center justify-center gap-1.5"><Save size={14} /> SAVE DETAILS PERMANENTLY</span>}
        </LiquidButton>
      ) : (
        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl text-center text-[9px] text-gray-500 font-black tracking-widest uppercase italic">
          ACCOUNT ALREADY REGISTERED & SAFE
        </div>
      )}
    </div>
  );
};

export default WithdrawSettings;
