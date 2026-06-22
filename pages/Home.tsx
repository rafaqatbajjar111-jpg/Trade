
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { BinanceService, formatINR, WalletService, AuthService, USDT_INR_RATE } from '../services/binance.ts';
import { ZMXLogo } from '../components/ZMXLogo.tsx';
import { 
  Wallet, Users, Bell, Info,
  Download, Upload, UserPlus, BookOpen, 
  MessageSquare, PieChart, TrendingUp, ArrowUpRight, Globe, Shield,
  TrendingDown, Activity, Zap, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [marketStats, setMarketStats] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [todayProfit, setTodayProfit] = useState(0);
  const [yieldRate, setYieldRate] = useState(0);

  useEffect(() => {
    AuthService.getCurrentUser().then(u => {
      if (u) setUser(u);
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = WalletService.subscribeToWallet(user.id, (data) => {
      setWallet(data);
    });

    const fetchMarket = async () => {
      const tickers = await BinanceService.getTickers();
      setMarketStats(tickers);
      
      const btc = tickers.find(t => t.symbol === 'BTCUSDT');
      if (btc) {
        setYieldRate(parseFloat(btc.priceChangePercent) || 0);
      }
    };
    
    fetchMarket();
    const interval = setInterval(fetchMarket, 10000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  // Recalculate profit and totals whenever wallet or market stats update
  useEffect(() => {
    if (!wallet || marketStats.length === 0) return;

    let totalPL = 0;
    if (wallet.holdings) {
      Object.entries(wallet.holdings).forEach(([symbol, data]: [string, any]) => {
        const ticker = marketStats.find(s => s.symbol === symbol);
        if (ticker) {
          const currentPrice = parseFloat(ticker.lastPrice);
          const qty = typeof data === 'object' ? (data.qty || 0) : (data || 0);
          const avgPrice = typeof data === 'object' ? (data.avgPrice || 0) : 0;
          
          if (avgPrice > 0) {
            totalPL += (currentPrice - avgPrice) * qty * USDT_INR_RATE;
          }
        }
      });
    }
    setTodayProfit(totalPL);
  }, [wallet, marketStats]);

  if (!user || !wallet) {
    return (
      <div className="space-y-6 pb-28 page-transition animate-pulse">
        {/* Top Bar Skeleton */}
        <div className="flex justify-between items-center mt-2 px-1">
          <div className="h-6 w-24 bg-white/[0.03] rounded-md"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/[0.03] rounded-[1.1rem]"></div>
            <div className="w-10 h-10 bg-white/[0.03] rounded-[1.1rem]"></div>
          </div>
        </div>

        {/* Ticker Skeleton */}
        <div className="border-y border-white/5 py-3 -mx-5 flex gap-6 overflow-hidden bg-white/[0.01]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-2 items-center shrink-0">
              <div className="h-2.5 w-8 bg-white/[0.03] rounded"></div>
              <div className="h-3 w-16 bg-white/[0.03] rounded"></div>
              <div className="h-2 w-8 bg-white/[0.03] rounded"></div>
            </div>
          ))}
        </div>

        {/* Main Card Skeleton */}
        <div className="px-1">
          <div className="w-full h-44 bg-white/[0.02] border border-white/5 rounded-[2.2rem] p-5 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <div className="h-2 w-16 bg-white/[0.03] rounded"></div>
                <div className="h-6 w-36 bg-white/[0.03] rounded-md"></div>
              </div>
              <div className="h-5 w-16 bg-white/[0.03] rounded-md"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 bg-white/[0.02] border border-white/5 rounded-xl"></div>
              <div className="h-14 bg-[#ffffff]/[0.02] border border-white/5 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Action Grid Skeleton */}
        <div className="grid grid-cols-4 gap-y-6 gap-x-3 px-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-white/[0.02] border border-white/5 rounded-[1.3rem]"></div>
              <div className="h-2 w-12 bg-white/[0.03] rounded"></div>
            </div>
          ))}
        </div>

        {/* Trends Row Skeletons */}
        <div className="px-1 space-y-3 pt-2">
          <div className="flex justify-between items-end px-1">
             <div className="h-3.5 w-24 bg-white/[0.03] rounded"></div>
             <div className="h-2.5 w-12 bg-white/[0.03] rounded"></div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate Balances safely to avoid NaN
  const availableUSDT = wallet.balanceUSDT || 0;
  const availableINR = availableUSDT * USDT_INR_RATE;

  let holdingsValueUSDT = 0;
  if (wallet.holdings && marketStats.length > 0) {
    Object.entries(wallet.holdings).forEach(([symbol, data]: [string, any]) => {
      const ticker = marketStats.find(s => s.symbol === symbol);
      if (ticker) {
        const qty = typeof data === 'object' ? (data.qty || 0) : (data || 0);
        holdingsValueUSDT += qty * parseFloat(ticker.lastPrice || "0");
      }
    });
  }
  const holdingsValueINR = holdingsValueUSDT * USDT_INR_RATE;

  return (
    <div className="space-y-6 pb-28 page-transition">
      {/* Top Bar */}
      <div className="flex justify-between items-center mt-2 px-1">
        <ZMXLogo size={18} />
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/notifications')} className="w-10 h-10 glass-effect rounded-[1.1rem] flex items-center justify-center relative active:scale-90 transition-all border-white/5 bg-white/[0.03]">
            <Bell size={16} className="text-gray-400" />
            <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_8px_#facc15]"></span>
          </button>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-[1.1rem] overflow-hidden border border-white/10 active:scale-90 transition-all">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
              alt="Avatar" 
              className="w-full h-full object-cover bg-[#161b22]"
            />
          </button>
        </div>
      </div>

      {/* Market Ticker */}
      <div className="overflow-hidden bg-white/[0.01] border-y border-white/5 -mx-5 py-1.5">
        <div className="flex gap-6 animate-marquee whitespace-nowrap px-5">
          {marketStats.slice(0, 10).map((coin, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[8px] font-black text-gray-600 uppercase">{coin.symbol.replace('USDT', '')}</span>
              <span className="text-[9px] font-black text-white">₹{(parseFloat(coin.lastPrice || "0") * USDT_INR_RATE).toLocaleString()}</span>
              <span className={`text-[7px] font-black ${parseFloat(coin.priceChangePercent || "0") >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {coin.priceChangePercent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Asset Card - Premium Glassmorphism */}
      <div className="relative group px-1">
        <div className="absolute inset-x-10 -top-4 h-12 bg-yellow-400/20 blur-[50px] rounded-full -z-10 group-hover:bg-yellow-400/30 transition-all duration-700 pointer-events-none"></div>
        <GlassCard className="border-white/10 bg-gradient-to-br from-white/[0.08] via-transparent to-yellow-400/[0.03] pt-5 pb-4 shadow-2xl overflow-hidden group border-[0.5px] rounded-[2.2rem]">
          <div className="absolute top-0 right-0 p-3">
             <div className="group/info relative">
               <Info size={11} className="text-gray-700 cursor-help hover:text-yellow-400 transition-colors" />
               <div className="absolute right-0 top-6 w-48 p-2.5 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-xl text-[7px] text-gray-400 font-bold uppercase tracking-widest leading-normal opacity-0 group-hover/info:opacity-100 transition-opacity z-50 pointer-events-none shadow-3xl text-center">
                 Users profit from AI Trading. Admin earns via 5% service fees.
               </div>
             </div>
          </div>

          <div className="relative z-10 px-5">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.3em] mb-0.5">Global Portfolio</p>
                  <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                    {formatINR(availableUSDT + holdingsValueUSDT)}
                  </h2>
               </div>
               <div className="bg-yellow-400/10 px-2 py-0.5 rounded-lg border border-yellow-400/20 flex items-center gap-1">
                  <Activity size={10} className="text-yellow-400 animate-pulse" />
                  <span className="text-[6px] font-black text-yellow-400 uppercase tracking-widest">Secured</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                <p className="text-[6px] text-gray-600 font-bold uppercase tracking-widest mb-1 leading-none">Wallet Bal</p>
                <p className="text-[11px] font-black text-white leading-none">₹{(availableINR).toLocaleString()}</p>
                <p className="text-[6px] font-bold text-gray-500 uppercase mt-1 leading-none">{availableUSDT.toFixed(2)} USDT</p>
              </div>
              
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                <p className="text-[6px] text-gray-600 font-bold uppercase tracking-widest mb-1 leading-none">Holdings</p>
                <p className="text-[11px] font-black text-sky-400 leading-none">₹{(holdingsValueINR).toLocaleString()}</p>
                <p className="text-[6px] font-bold text-gray-500 uppercase mt-1 leading-none">{holdingsValueUSDT.toFixed(2)} USDT</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3.5">
               <div className="flex items-center gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[6px] text-gray-600 font-black uppercase tracking-tighter">Day P/L</p>
                    <p className={`text-[10px] font-black ${todayProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {todayProfit >= 0 ? '+' : ''}₹{todayProfit.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[6px] text-gray-600 font-black uppercase tracking-tighter">AI Signal</p>
                    <p className="text-[10px] font-black text-white">
                      {yieldRate > 0 ? '+' : ''}{yieldRate.toFixed(2)}%
                    </p>
                  </div>
               </div>
               <button onClick={() => navigate('/holding')} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 hover:bg-yellow-400 hover:text-black transition-all">
                  <ArrowUpRight size={12} />
               </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-4 gap-y-8 gap-x-3 px-1">
        {[
          { icon: <Download size={24} />, label: 'Recharge', action: () => navigate('/recharge'), color: 'text-green-400' },
          { icon: <Upload size={24} />, label: 'Payout', action: () => navigate('/withdrawal'), color: 'text-red-400' },
          { icon: <UserPlus size={24} />, label: 'Affiliate', action: () => navigate('/invite'), color: 'text-sky-400' },
          { icon: <Users size={24} />, label: 'Network', action: () => navigate('/team'), color: 'text-purple-400' },
          { icon: <BookOpen size={24} />, label: 'Bylaws', action: () => navigate('/rules'), color: 'text-orange-400' },
          { icon: <PieChart size={24} />, label: 'Vault', action: () => navigate('/holding'), color: 'text-yellow-400' },
          { icon: <Wallet size={24} />, label: 'Assets', action: () => navigate('/wallet'), color: 'text-blue-400' },
          { icon: <MessageSquare size={24} />, label: 'Help', action: () => navigate('/support'), color: 'text-pink-400' },
        ].map((item, i) => (
          <div key={i} onClick={item.action} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-all">
             <div className="w-14 h-14 glass-effect rounded-[1.3rem] flex items-center justify-center border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent shadow-2xl group-hover:border-yellow-400/30 transition-all">
                <div className={`${item.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                   {item.icon}
                </div>
             </div>
             <span className="text-[7.5px] text-gray-500 font-black uppercase tracking-widest text-center leading-tight group-hover:text-white transition-colors">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Market Movers Preview */}
      <div className="px-1 space-y-4">
        <div className="flex justify-between items-end px-1">
           <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-yellow-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Market Trends</h3>
           </div>
           <button onClick={() => navigate('/markets')} className="text-[8px] font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1">
             View All <ChevronRight size={10} />
           </button>
        </div>
        
        <div className="space-y-3">
          {marketStats.slice(0, 3).map((coin, i) => (
            <div key={i} onClick={() => navigate(`/trade?symbol=${coin.symbol}`)} className="p-3.5 glass-effect rounded-2xl border-white/5 flex items-center justify-between active:scale-[0.98] transition-all bg-white/[0.01]">
              <div className="flex items-center gap-2.5">
                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] text-yellow-400 border border-white/10">
                    {coin.symbol[0]}
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none">{coin.symbol.replace('USDT', '')}</p>
                    <p className="text-[7px] text-gray-700 font-black uppercase mt-1 leading-none tracking-widest">Global Live</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[11px] font-black text-white tracking-tighter leading-none">₹{(parseFloat(coin.lastPrice || "0") * USDT_INR_RATE).toLocaleString()}</p>
                 <p className={`text-[8px] font-black mt-1 leading-none ${parseFloat(coin.priceChangePercent || "0") >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                   {parseFloat(coin.priceChangePercent || "0") >= 0 ? '+' : ''}{coin.priceChangePercent}%
                 </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
