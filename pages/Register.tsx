import React, { useState, useEffect } from 'react';
import { AuthService, NotificationService } from '../services/binance.ts';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Clipboard, ShieldAlert, Fingerprint } from 'lucide-react';

interface RegisterProps {
  onToggle: () => void;
}

const Register: React.FC<RegisterProps> = ({ onToggle }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ref: pathRef } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: ''
  });

  // Balanced entry skeleton trigger
  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const ref = pathRef || searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, [searchParams, pathRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    try {
      await AuthService.register(formData.email, formData.password, formData.name, formData.referralCode);
      NotificationService.add("Success", "Security profile generated. Welcome inside.", "success");
      onToggle(); // Route user back to login view
    } catch (error: any) {
      NotificationService.add("Profile Error", error.message || "Could not register trade profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-[360px] p-8 rounded-[2rem] bg-gradient-to-b from-[#121214] to-[#070709] border border-white/5 shadow-2xl relative overflow-hidden animate-pulse">
        {/* Glow Line */}
        <div className="absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
        {/* Title skeleton */}
        <div className="h-5 w-2/5 bg-white/5 rounded mx-auto mb-2 mt-4"></div>
        <div className="h-3 w-1/3 bg-white/5 rounded mx-auto mb-10"></div>
        {/* Fields */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-2.5 w-1/5 bg-white/5 rounded ml-1"></div>
              <div className="h-12 w-full bg-white/[0.03] border border-white/5 rounded-xl"></div>
            </div>
          ))}
        </div>
        {/* Button */}
        <div className="h-13 w-full bg-white/5 rounded-xl mt-8"></div>
        {/* Footer */}
        <div className="h-[1px] w-full bg-white/5 mt-8 mb-6"></div>
        <div className="h-3 w-1/2 bg-white/5 rounded mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center page-transition relative animate-in fade-in zoom-in-95 duration-200">
      {/* Background ambient radial glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-56 bg-yellow-400/[0.04] blur-3xl rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[360px] rounded-[2rem] bg-gradient-to-b from-[#131316] to-[#09090b] border border-white/[0.04] shadow-2xl p-7 relative overflow-hidden">
        {/* Active laser boundary accent */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
        
        {/* Decorative corner tag */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
          <Fingerprint size={9} className="text-yellow-400 animate-pulse" />
          <span className="text-[7.5px] font-black text-yellow-500 uppercase tracking-wider">REGISTRATION SYSTEM</span>
        </div>

        {/* Brand identity header */}
        <div className="text-center mb-6 pt-2">
          <h2 className="text-base font-black tracking-[0.25em] text-white uppercase italic leading-none">
            CREATE PRO
          </h2>
          <p className="text-[8px] font-extrabold text-gray-500 uppercase tracking-widest mt-2 leading-none">
            GENERATE TRADING SIGNATURE
          </p>
        </div>

        {/* Form Body */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div className="space-y-1.5 group">
            <label className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest px-1 ml-0.5 transition-colors group-focus-within:text-yellow-400">
              Full Name
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-black/50 border border-white/[0.04] rounded-xl focus-within:border-yellow-400/30 focus-within:bg-black/75 shadow-inner transition-all duration-300">
              <User size={15} className="text-gray-600 shrink-0 group-focus-within:text-yellow-450 transition-colors" />
              <input 
                className="bg-transparent border-none p-0 w-full text-xs font-semibold text-white placeholder:text-gray-700 focus:ring-0 outline-none" 
                placeholder="Ex. John Doe" 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Email address */}
          <div className="space-y-1.5 group">
            <label className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest px-1 ml-0.5 transition-colors group-focus-within:text-yellow-400">
              Email Address
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-black/50 border border-white/[0.04] rounded-xl focus-within:border-yellow-400/30 focus-within:bg-black/75 shadow-inner transition-all duration-300">
              <Mail size={15} className="text-gray-600 shrink-0 group-focus-within:text-yellow-450 transition-colors" />
              <input 
                className="bg-transparent border-none p-0 w-full text-xs font-semibold text-white placeholder:text-gray-700 focus:ring-0 outline-none" 
                placeholder="Ex. john@example.com" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Choose Password */}
          <div className="space-y-1.5 group">
            <label className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest px-1 ml-0.5 transition-colors group-focus-within:text-yellow-400">
              Choose Password
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-black/50 border border-white/[0.04] rounded-xl focus-within:border-yellow-400/30 focus-within:bg-black/75 shadow-inner transition-all duration-300">
              <Lock size={15} className="text-gray-600 shrink-0 group-focus-within:text-yellow-450 transition-colors" />
              <input 
                className="bg-transparent border-none p-0 w-full text-xs font-semibold text-white placeholder:text-gray-700 focus:ring-0 outline-none" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button 
                type="button" 
                className="text-gray-600 hover:text-white transition-colors cursor-pointer focus:outline-none shrink-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-1.5 group">
            <div className="flex justify-between items-center px-1">
              <label className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-yellow-400">
                Referral Code
              </label>
              <span className="text-[7px] font-black text-gray-650 tracking-wider">OPTIONAL</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-black/50 border border-white/[0.04] rounded-xl focus-within:border-yellow-400/30 focus-within:bg-black/75 shadow-inner transition-all duration-300">
              <Clipboard size={15} className="text-gray-650 shrink-0 group-focus-within:text-yellow-450 transition-colors" />
              <input 
                className="bg-transparent border-none p-0 w-full text-xs font-bold uppercase text-yellow-400 placeholder:text-gray-700 placeholder:normal-case focus:ring-0 outline-none" 
                placeholder="Ex. 1111" 
                type="text"
                value={formData.referralCode}
                onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
              />
            </div>
          </div>

          {/* Secure Protocol note */}
          <div className="flex items-start gap-2 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
            <ShieldAlert size={13} className="text-yellow-450 shrink-0 mt-0.5" />
            <span className="text-[8.5px] text-gray-500 font-semibold leading-relaxed uppercase tracking-wider">
              By submitting, you agree to secure protocol conditions on instant trades & withdrawals.
            </span>
          </div>

          {/* Submit action */}
          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 group transition-all duration-300 shadow-xl ${
                loading 
                  ? "bg-white/[0.03] border border-white/5 text-gray-500 cursor-not-allowed" 
                  : "bg-yellow-400 hover:bg-yellow-500 text-black font-black active:scale-[0.98] cursor-pointer"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">GENERATING AGENT PROFILE...</span>
                </div>
              ) : (
                <>
                  <span className="text-[9.5px] font-black uppercase tracking-[0.2em] leading-none">
                    REGISTER & COMMENCE
                  </span>
                  <Fingerprint size={14} className="group-hover:scale-110 transition-transform shrink-0" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider lines */}
        <div className="mt-8 mb-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[7px] font-black uppercase tracking-widest">
            <span className="bg-[#0b0b0c] px-3 text-gray-600">PREMIUM SYSTEM GATEWAY</span>
          </div>
        </div>

        {/* Footer link */}
        <div className="text-center pb-1">
          <p className="text-[9px] font-semibold tracking-wider text-gray-500 uppercase">
            Already registered?{" "}
            <button 
              type="button" 
              onClick={onToggle} 
              className="text-yellow-400 hover:text-yellow-300 font-extrabold transition-colors ml-1 uppercase hover:underline underline-offset-4"
            >
              Authorize Credentials
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
