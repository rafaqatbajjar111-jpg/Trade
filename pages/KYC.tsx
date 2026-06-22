
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { LiquidButton } from '../components/LiquidButton.tsx';
import { ChevronLeft, ShieldCheck, CheckCircle, Loader2, User, CreditCard, Calendar, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationService, AuthService, KYCService } from '../services/binance.ts';

const KYC: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [dob, setDob] = useState('');
  
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    AuthService.getCurrentUser().then(user => {
      if (user) {
        setUid(user.id);
        KYCService.getStatus(user.id).then(data => {
          setStatus(data);
          setLoading(false);
        });
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!uid) return;
    
    if (!fullName.trim()) {
      NotificationService.add("Missing Data", "Please enter your full name.", "error");
      return;
    }
    if (aadhaarNumber.length !== 12) {
      NotificationService.add("Invalid ID", "Aadhaar number must be exactly 12 digits.", "error");
      return;
    }
    if (!dob) {
      NotificationService.add("Missing Data", "Please provide your date of birth.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await KYCService.submitKYC(uid, { 
        fullName, 
        aadhaarNumber, 
        dob
      });
      NotificationService.add("KYC Submitted", "Application submitted. Waiting for manual approval.", "success");
      setSubmitting(false);
      navigate('/profile');
    } catch (error) {
      NotificationService.add("Submission Failed", "System error. Please try again.", "error");
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-black/60 border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-yellow-400/40 transition-all font-black text-xs tracking-widest text-white uppercase placeholder:text-gray-800";

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-yellow-400" /></div>;

  if (status?.status === 'pending') {
    return (
      <div className="space-y-6 text-center py-20 animate-in fade-in duration-500">
         <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center text-yellow-400 mx-auto animate-pulse">
            <ShieldCheck size={40} />
         </div>
         <h2 className="text-xl font-black uppercase tracking-tighter italic">Verification Pending</h2>
         <p className="text-xs text-gray-500 uppercase font-black px-10">Your personal data is in the verification queue. Approval usually takes 2-4 hours.</p>
         <button onClick={() => navigate('/profile')} className="mt-4 text-yellow-400 text-[10px] font-black uppercase border-b border-yellow-400 pb-1">Return to Profile</button>
      </div>
    );
  }

  if (status?.status === 'verified') {
    return (
      <div className="space-y-6 text-center py-20 animate-in fade-in duration-500">
         <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto">
            <CheckCircle size={40} />
         </div>
         <h2 className="text-xl font-black uppercase tracking-tighter italic">Identity Verified</h2>
         <p className="text-xs text-gray-500 uppercase font-black px-10">Your account is fully verified based on your Aadhaar records. All features are active.</p>
         <button onClick={() => navigate('/profile')} className="mt-4 text-green-400 text-[10px] font-black uppercase border-b border-green-400 pb-1">Back to Profile</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 page-transition">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/profile')} className="p-3 glass-effect rounded-2xl text-yellow-400 active:scale-90 transition-transform">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">IDENTITY VERIFICATION</h1>
      </div>

      <div className="space-y-6">
        {/* Verification Status Banner */}
        <div className="p-4 bg-yellow-400/5 border border-yellow-400/10 rounded-2xl flex items-center gap-4">
           <Info className="text-yellow-400 shrink-0" size={20} />
           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
             Submit your details for <span className="text-yellow-400">Account Verification</span>. No document photos required for this version.
           </p>
        </div>

        {/* Personal Details Section */}
        <GlassCard className="p-6 border-white/5 space-y-4 shadow-xl">
           <div className="flex items-center gap-3 pb-2 border-b border-white/5">
              <User size={20} className="text-yellow-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">Personal Information</h3>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Legal Full Name</label>
                 <input 
                   type="text" 
                   placeholder="Name as per Aadhaar"
                   value={fullName} 
                   onChange={(e) => setFullName(e.target.value)}
                   className={inputClass} 
                 />
              </div>
              
              <div className="space-y-2">
                 <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Aadhaar Number (12 Digits)</label>
                 <div className="relative">
                    <CreditCard size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                      type="number" 
                      placeholder="0000 0000 0000"
                      value={aadhaarNumber} 
                      onChange={(e) => {
                        if (e.target.value.length <= 12) setAadhaarNumber(e.target.value);
                      }}
                      className={`${inputClass} pl-12`} 
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Date of Birth</label>
                 <div className="relative">
                    <Calendar size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                      type="date" 
                      value={dob} 
                      onChange={(e) => setDob(e.target.value)}
                      className={`${inputClass} pl-12`} 
                    />
                 </div>
              </div>
           </div>
        </GlassCard>
      </div>

      <LiquidButton 
        fullWidth 
        onClick={handleSubmit} 
        className="font-black mt-4 shadow-xl shadow-yellow-400/10"
      >
        {submitting ? (
          <div className="flex items-center gap-3">
             <Loader2 className="animate-spin" size={18} />
             <span>PROCESSING...</span>
          </div>
        ) : (
          'SUBMIT FOR VERIFICATION'
        )}
      </LiquidButton>
      
      <p className="text-center text-[8px] text-gray-600 font-bold uppercase tracking-widest px-8">
        By submitting, you confirm the accuracy of your Aadhaar credentials. All data is processed securely through the ZMEX platform.
      </p>
    </div>
  );
};

export default KYC;
