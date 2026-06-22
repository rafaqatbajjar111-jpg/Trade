
import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { NotificationToast } from './components/NotificationToast.tsx';
import { AuthService } from './services/binance.ts';
import { 
  Home as HomeIcon, 
  PieChart, 
  LayoutGrid, 
  ArrowLeftRight, 
  User as UserIcon,
  Loader2,
  Smartphone
} from 'lucide-react';

// Lazy Load Pages for Code Splitting (Outputs separate JS files)
const Home = React.lazy(() => import('./pages/Home.tsx'));
const Markets = React.lazy(() => import('./pages/Markets.tsx'));
const Trade = React.lazy(() => import('./pages/Trade.tsx'));
const Holding = React.lazy(() => import('./pages/Holding.tsx'));
const Profile = React.lazy(() => import('./pages/Profile.tsx'));
const Notifications = React.lazy(() => import('./pages/Notifications.tsx'));
const Auth = React.lazy(() => import('./pages/Auth.tsx'));
const Recharge = React.lazy(() => import('./pages/Recharge.tsx'));
const Withdrawal = React.lazy(() => import('./pages/Withdrawal.tsx'));
const Invite = React.lazy(() => import('./pages/Invite.tsx'));
const Team = React.lazy(() => import('./pages/Team.tsx'));
const Rules = React.lazy(() => import('./pages/Rules.tsx'));
const Support = React.lazy(() => import('./pages/Support.tsx'));
const WalletPage = React.lazy(() => import('./pages/Wallet.tsx'));
const KYC = React.lazy(() => import('./pages/KYC.tsx'));
const WithdrawSettings = React.lazy(() => import('./pages/WithdrawSettings.tsx'));
const TransactionHistory = React.lazy(() => import('./pages/TransactionHistory.tsx'));

// Shared Authentication State
export const AuthContext = createContext<{
  user: any;
  profile: any;
  loading: boolean;
}>({ user: null, profile: null, loading: true });

const ViewportController: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      if (location.pathname.startsWith('/admin')) {
        // Enable zooming for Admin panel if needed
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      } else {
        // Strictly disable zooming for User panel as requested
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
      }
    }
  }, [location.pathname]);

  return null;
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const { profile } = useContext(AuthContext);
  
  // Hide navbar on auth and admin pages
  if (location.pathname === '/auth' || location.pathname === '/admin') return null;
  // If not logged in, don't show navbar
  if (!profile) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon size={24} /> },
    { path: '/trade', label: 'Trade', icon: <ArrowLeftRight size={24} /> },
    { path: '/holding', label: 'Holdings', icon: <PieChart size={24} /> },
    { path: '/markets', label: 'Markets', icon: <LayoutGrid size={24} /> },
    { path: '/profile', label: 'Profile', icon: <UserIcon size={24} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass-effect border-t border-white/10 z-50 px-6">
      <div className="max-w-md mx-auto h-full flex items-center justify-between">
        {navItems.map((item) => (
          <Link 
            key={item.path} to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${location.pathname === item.path ? 'text-yellow-400 scale-110' : 'text-gray-500 hover:text-white'}`}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] gap-4">
        <Loader2 className="animate-spin text-yellow-400" size={48} />
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse italic">Loading account...</p>
      </div>
    );
  }

  // If no firebase user, definitely redirect to auth
  if (!user) return <Navigate to="/auth" replace />;
  
  // If user exists but profile doesn't, they are partially logged in
  // Usually this means they need to register in the new project
  if (!profile) return <Navigate to="/auth" replace />;

  if (profile.isBanned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-10 text-center gap-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/10">
           <Smartphone size={40} />
        </div>
        <div className="space-y-2">
           <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Access Terminated</h2>
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
             This account has been flagged for violating platform integrity policies. Contact executive support.
           </p>
        </div>
        <button 
          onClick={() => AuthService.logout().then(() => window.location.reload())}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
        >
          Return to login
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<{user: any, profile: any}>({ user: null, profile: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = AuthService.onAuthChange((data) => {
      setAuthState(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, loading }}>
      <BrowserRouter>
        <ViewportController />
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-yellow-400 selection:text-black">
          <NotificationToast />
          <main className="max-w-md mx-auto px-5 pt-8 pb-24">
            <React.Suspense fallback={
              <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-yellow-400" size={36} />
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse italic">Loading section...</p>
              </div>
            }>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/register/:ref" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
                <Route path="/trade" element={<ProtectedRoute><Trade /></ProtectedRoute>} />
                <Route path="/holding" element={<ProtectedRoute><Holding /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/recharge" element={<ProtectedRoute><Recharge /></ProtectedRoute>} />
                <Route path="/withdrawal" element={<ProtectedRoute><Withdrawal /></ProtectedRoute>} />
                <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                <Route path="/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
                <Route path="/withdraw-settings" element={<ProtectedRoute><WithdrawSettings /></ProtectedRoute>} />
                <Route path="/transaction-history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </main>
          <Navbar />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
