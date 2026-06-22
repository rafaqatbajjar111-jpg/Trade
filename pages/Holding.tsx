
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { WalletService, BinanceService, formatINR, AuthService, USDT_INR_RATE } from '../services/binance.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';

const Holding: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    AuthService.getCurrentUser().then(user => {
      if (user) {
        unsubscribe = WalletService.subscribeToWallet(user.id, (data) => {
          setWallet(data);
        });
      } else {
        // Not logged in or user profile missing
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    // If no wallet yet, wait
    if (!wallet) return;
    
    // If no holdings, stop loading immediately
    if (!wallet.holdings || Object.keys(wallet.holdings).length === 0) {
      setLoading(false);
      return;
    }
    
    const fetchPrices = async () => {
      try {
        const symbols = Object.keys(wallet.holdings);
        // Optimized: Fetch all prices in parallel
        const results = await Promise.all(symbols.map(async (s) => {
          return { symbol: s, price: await BinanceService.getPrice(s) };
        }));
        
        const priceMap: Record<string, number> = {};
        results.forEach(res => {
          priceMap[res.symbol] = res.price;
        });
        
        setPrices(priceMap);
      } catch (err) {
        console.error("Error fetching prices:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [wallet?.holdings]);

  if (!wallet) return (
    <div className="space-y-6 pb-24 page-transition animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-white/[0.03] rounded"></div>
      </div>
      <div className="w-full h-44 bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-16 bg-white/[0.03] rounded"></div>
          <div className="h-6 w-36 bg-white/[0.03] rounded-md"></div>
        </div>
        <div className="h-20 bg-white/[0.01] rounded-2xl"></div>
      </div>
      <div className="space-y-3 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );

  const assetData = Object.entries(wallet.holdings || {}).map(([symbol, data], index) => {
    // Handle both old (number) and new (object with avgPrice) formats
    // Fix: Using type assertion to any when data is an object to avoid "Property does not exist on type 'object'" error
    const qty = (typeof data === 'object' && data !== null) ? (data as any).qty : (data as number);
    const avgPrice = (typeof data === 'object' && data !== null) ? (data as any).avgPrice : 0;
    
    const currentPrice = prices[symbol] || 0;
    const currentValue = qty * currentPrice;
    const investedValue = qty * avgPrice;
    const plAmount = currentValue - investedValue;
    const plPercentage = avgPrice > 0 ? (plAmount / investedValue) * 100 : 0;

    return {
      name: symbol.replace('USDT', ''),
      value: currentValue,
      qty: qty,
      avgPrice: avgPrice,
      investedValue: investedValue,
      plAmount: plAmount,
      plPercentage: plPercentage,
      symbol: symbol,
      color: ['#facc15', '#a78bfa', '#4ade80', '#f87171', '#38bdf8'][index % 5]
    };
  }).filter(a => a.qty > 0);

  const totalCurrentValueUSDT = assetData.reduce((acc, curr) => acc + curr.value, 0);
  const totalInvestedValueUSDT = assetData.reduce((acc, curr) => acc + curr.investedValue, 0);
  const totalPLINR = (totalCurrentValueUSDT - totalInvestedValueUSDT) * USDT_INR_RATE;

  return (
    <div className="space-y-6 pb-24 page-transition">
      <h1 className="text-xl font-black italic uppercase tracking-tighter">PORTFOLIO</h1>

      {loading && assetData.length === 0 ? (
        <div className="space-y-3.5 animate-pulse pt-2">
           {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl"></div>
           ))}
        </div>
      ) : assetData.length > 0 ? (
        <>
          <GlassCard className="flex flex-col items-center p-6 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
            
            <div className="text-center mb-6">
              <p className="text-[8px] text-gray-600 uppercase font-black tracking-[0.2em] leading-none">Net Worth (INR)</p>
              <h2 className="text-2xl font-black tracking-tighter text-white mt-1.5 uppercase italic leading-none">
                 {formatINR(totalCurrentValueUSDT + (wallet.balanceUSDT || 0))}
              </h2>
              <div className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase ${totalPLINR >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {totalPLINR >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {totalPLINR >= 0 ? '+' : ''}₹{Math.abs(totalPLINR).toFixed(2)}
              </div>
            </div>

            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[...assetData, { name: 'USDT', value: (wallet.balanceUSDT || 0), color: '#334155' }]}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {[...assetData, { color: '#334155' }].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6 w-full px-4 border-t border-white/5 pt-6">
              {assetData.map((h, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: h.color }}></div>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-tight">{h.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-white">
                    {((h.value / (totalCurrentValueUSDT + (wallet.balanceUSDT || 0))) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] px-2 text-gray-500">Active Allocations</h2>
            {assetData.map((asset, i) => (
              <GlassCard key={i} className={`flex flex-col py-4 border-white/5 active:scale-[0.98] transition-all ${asset.plAmount >= 0 ? 'border-r-4 border-r-green-500' : 'border-r-4 border-r-red-500'}`}>
                <div className="flex justify-between items-center px-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-yellow-400 font-black text-xs border border-white/10">
                      {asset.name[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tighter">{asset.name}</h4>
                      <p className="text-[9px] text-gray-600 font-bold uppercase">{asset.qty.toFixed(4)} Units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xs text-white leading-none">{formatINR(asset.value)}</p>
                    <div className={`text-[8px] font-black uppercase flex items-center gap-1 justify-end mt-1 ${asset.plAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.plAmount >= 0 ? '+' : ''}{asset.plPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-px bg-white/5 mt-2 rounded-xl overflow-hidden border border-white/5">
                   <div className="bg-black/20 p-3 text-center">
                      <p className="text-[8px] text-gray-600 font-black uppercase mb-1">Invested</p>
                      <p className="text-[10px] font-black text-gray-400">₹{(asset.investedValue * USDT_INR_RATE).toLocaleString()}</p>
                   </div>
                   <div className="bg-black/20 p-3 text-center">
                      <p className="text-[8px] text-gray-600 font-black uppercase mb-1">P/L Amount</p>
                      <p className={`text-[10px] font-black ${asset.plAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.plAmount >= 0 ? '+' : ''}₹{(asset.plAmount * USDT_INR_RATE).toFixed(2)}
                      </p>
                   </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
           <PieChartIcon size={60} strokeWidth={1} />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Trades Found</p>
        </div>
      )}
    </div>
  );
};

export default Holding;
