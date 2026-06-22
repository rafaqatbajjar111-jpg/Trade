
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { CryptoChart } from '../components/CryptoChart.tsx';
import { BinanceService, formatINR } from '../services/binance.ts';
import { Search, Star, Filter, Loader2, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Markets: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tickers = await BinanceService.getTickers();
        // Fetch klines for top 20 pairs for sparklines
        const coinsWithSparklines = await Promise.all(
          tickers.map(async (t: any, idx: number) => {
            if (idx < 20) {
              const history = await BinanceService.getKlines(t.symbol, '1h', 15);
              return { ...t, history };
            }
            return t;
          })
        );
        setCoins(coinsWithSparklines);
        setLoading(false);
      } catch (error) {
        console.error("Market fetch error", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter(c => {
    const matchesSearch = c.symbol.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'All' || activeTab === 'INR') return true;
    
    if (activeTab === 'Layer 1') {
      const l1s = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'AVAX', 'NEAR', 'FTM', 'MATIC', 'BNB'];
      return l1s.some(l1 => c.symbol.startsWith(l1));
    }
    
    if (activeTab === 'AI') {
      const ais = ['FET', 'AGIX', 'OCEAN', 'RNDR', 'NEAR', 'GRT', 'INJ'];
      return ais.some(ai => c.symbol.startsWith(ai));
    }

    if (activeTab === 'NFTs') {
      const nfts = ['MANA', 'SAND', 'AXS', 'ENJ', 'CHZ', 'FLOW'];
      return nfts.some(nft => c.symbol.startsWith(nft));
    }

    if (activeTab === 'Favorites') {
      const favs = JSON.parse(localStorage.getItem('favCoins') || '[]');
      return favs.includes(c.symbol);
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-24 page-transition">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400/10 rounded-2xl border border-yellow-400/20">
            <TrendingUp size={20} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter">Market Center</h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 glass-effect rounded-xl text-gray-500"><Filter size={20} /></button>
          <button className="p-2.5 glass-effect rounded-xl text-yellow-400"><Star size={20} fill="currentColor" /></button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-400 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search all USDT crypto pairs..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:border-yellow-400/50 transition-all font-bold text-sm tracking-tight shadow-inner"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide px-1">
        {['All', 'INR', 'Layer 1', 'AI', 'NFTs', 'Favorites'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-yellow-400 text-black shadow-lg scale-105' 
                : 'bg-white/5 text-gray-400 border border-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center px-4 py-3.5 bg-white/[0.01] border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5"></div>
                <div className="space-y-1.5">
                  <div className="h-3 w-16 bg-white/[0.03] rounded"></div>
                  <div className="h-2 w-10 bg-white/[0.03] rounded"></div>
                </div>
              </div>
              <div className="text-right space-y-1.5">
                <div className="h-3.5 w-20 bg-white/[0.03] rounded"></div>
                <div className="h-2 w-10 bg-white/[0.03] rounded ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-0.5">
          {filteredCoins.map((coin, idx) => (
            <Link to={`/trade?symbol=${coin.symbol}`} key={coin.symbol} className="block group">
              <div className={`px-4 py-3.5 hover:bg-white/[0.02] transition-colors border-b border-white/5 active:scale-[0.98] flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-yellow-400 font-black text-[10px]">
                    {coin.symbol[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 leading-none">
                      <h3 className="font-black text-xs tracking-tighter uppercase text-white group-hover:text-yellow-400 transition-colors">{coin.symbol.replace('USDT', '')}</h3>
                      <span className="text-[6px] font-black px-1.5 py-0.5 bg-white/5 rounded text-gray-600 uppercase">USDT</span>
                    </div>
                    <p className="text-[8px] text-gray-600 font-bold uppercase mt-1 leading-none">Vol: ₹{(parseFloat(coin.quoteVolume)/1000).toFixed(1)}K</p>
                  </div>
                </div>
                
                <div className="w-20 h-8 hidden sm:block">
                  {coin.history && (
                    <CryptoChart 
                      data={coin.history} 
                      height={32} 
                      hideAxes 
                      color={parseFloat(coin.priceChangePercent) >= 0 ? "#4ade80" : "#f87171"} 
                    />
                  )}
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-black text-sm tracking-tight text-white">{formatINR(parseFloat(coin.lastPrice))}</p>
                    <p className={`text-[10px] font-black ${parseFloat(coin.priceChangePercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(coin.priceChangePercent) >= 0 ? '+' : ''}{coin.priceChangePercent}%
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-800 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Markets;
