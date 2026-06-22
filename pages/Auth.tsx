
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App.tsx';
import Login from './Login.tsx';
import Register from './Register.tsx';

import { Logo } from '../components/Logo.tsx';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(!location.pathname.startsWith('/register'));

  // Handle path changes if user manually navigates between /auth and /register
  useEffect(() => {
    if (location.pathname.startsWith('/register')) {
      setIsLogin(false);
    } else if (location.pathname === '/auth') {
      setIsLogin(true);
    }
  }, [location.pathname]);

  // Redirect if fully logged in with profile
  useEffect(() => {
    if (!authLoading && user && profile) {
      const isAdmin = profile.role === 'admin' || (user.email && user.email.toLowerCase().includes('admin'));
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [profile, user, authLoading, navigate]);

  // If authenticated but NO profile, suggest registration
  useEffect(() => {
    if (!authLoading && user && !profile) {
      setIsLogin(false);
    }
  }, [user, profile, authLoading]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#050505] -mx-5 -mt-8 font-display">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] bg-yellow-400/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="mb-6 text-center relative z-10 flex flex-col items-center">
        <Logo showText={true} className="w-auto h-auto" />
      </div>

      {!profile && user && (
        <div className="mb-6 p-4 glass-effect border-red-500/30 bg-red-500/5 rounded-2xl max-w-[340px] text-center animate-in fade-in slide-in-from-top-2">
           <p className="text-[9px] font-black uppercase text-red-400 tracking-widest leading-relaxed">
             Authenticated but no record found in this project. <br/>
             <span className="text-white">Please create your account below.</span>
           </p>
        </div>
      )}
      
      <main className="w-full flex justify-center relative z-10">
        {isLogin ? (
          <Login onToggle={() => setIsLogin(false)} />
        ) : (
          <Register onToggle={() => setIsLogin(true)} />
        )}
      </main>

      <footer className="mt-12 text-[10px] font-medium text-white/20 uppercase tracking-[0.2em] relative z-10">
        © 2024 ZMEX Global Trading
      </footer>
    </div>
  );
};

export default Auth;
