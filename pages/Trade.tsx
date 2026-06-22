
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard.tsx';
import { LiquidButton } from '../components/LiquidButton.tsx';
import { CryptoChart } from '../components/CryptoChart.tsx';
import { BinanceService, WalletService, formatINR, NotificationService, AuthService, USDT_INR_RATE } from '../services/binance.ts';
import { 
  ChevronDown, Loader2, Zap, 
  Wallet as WalletIcon, X, 
  ArrowRightLeft, AlertCircle,
  TrendingUp, TrendingDown
} from 'lucide-react';

const Trade: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [inputMode, setInputMode] = useState<'inr' | 'coin'>('inr');
  const [loading, setLoading] = useState(true);
  const [coinData, setCoinData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<{asks: any[], bids: any[]}>({ asks: [], bids: [] });
  const [inputValue, setInputValue] = useState('');
  const [wallet, setWallet] = useState<any>(null);
  const [uid, setUid] = useState<string | null>(null);

  // Coin Selector
  const [showSelector, setShowSelector] = useState(false);
  const [availableCoins, setAvailableCoins] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    AuthService.getCurrentUser().then(user => {
      if (user) {
        setUid(user.id);
        const unsub = WalletService.subscribeToWallet(user.id, setWallet);
        return () => unsub();
      }
    });

    BinanceService.getTickers().then(setAvailableCoins);
    const fetchData = async () => {
      try {
        const [ticker, klines, depth] = await Promise.all([
          BinanceService.getTicker(symbol),
          BinanceService.getKlines(symbol, '15m', 40),
          BinanceService.getOrderBook(symbol, 8)
        ]);
        setCoinData(ticker);
        setHistory(klines);
        setOrderBook({
          asks: depth.asks.map((a: any) => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) })),
          bids: depth.bids.map((b: any) => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) }))
        });
        setLoading(false);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [symbol]);

  const price = parseFloat(coinData?.lastPrice || "0");
  const availableINR = (wallet?.balanceUSDT || 0) * USDT_INR_RATE;
  const assetName = symbol.replace('USDT', '');
  
  // Robust holdings check
  const holdingData = wallet?.holdings?.[symbol];
  const ownedQty = (typeof holdingData === 'object' && holdingData !== null) ? (holdingData.qty || 0) : (holdingData || 0);
  const avgPrice = (typeof holdingData === 'object' && holdingData !== null) ? (holdingData.avgPrice || 0) : 0;
  
  // Real-time P/L calculation
  const currentPL = avgPrice > 0 ? ((price - avgPrice) / avgPrice) * 100 : 0;
  const plAmountINR = ownedQty * (price - avgPrice) * USDT_INR_RATE;

  // Real-time calculations for the form
  let calculatedQty = 0;
  let calculatedINR = 0;

  if (inputValue) {
    const val = parseFloat(inputValue) || 0;
    if (inputMode === 'inr') {
      calculatedINR = val;
      calculatedQty = price > 0 ? calculatedINR / (USDT_INR_RATE * price) : 0;
    } else {
      calculatedQty = val;
      calculatedINR = calculatedQty * price * USDT_INR_RATE;
    }
  }

  const handleAction = async () => {
    if (!uid || !wallet || price <= 0) return;
    
    const qtyToTrade = calculatedQty;
    const currentMarketValueUSDT = qtyToTrade * price;
    const currentMarketValueINR = currentMarketValueUSDT * USDT_INR_RATE;

    if (!qtyToTrade || qtyToTrade <= 0) {
      NotificationService.add("Error", "Please enter a valid amount", "error");
      return;
    }

    const newHoldings = { ...(wallet.holdings || {}) };

    if (tradeType === 'buy') {
      if (currentMarketValueINR > availableINR) {
        NotificationService.add("Balance Error", `Insufficient funds. Needed: ₹${currentMarketValueINR.toFixed(2)}`, "error");
        return;
      }
      
      const currentQty = (typeof newHoldings[symbol] === 'object' && newHoldings[symbol] !== null) ? (newHoldings[symbol].qty || 0) : (newHoldings[symbol] || 0);
      const currentAvg = (typeof newHoldings[symbol] === 'object' && newHoldings[symbol] !== null) ? (newHoldings[symbol].avgPrice || 0) : 0;
      
      const totalQty = currentQty + qtyToTrade;
      // Re-calculate average price
      const totalCost = (currentQty * currentAvg) + (qtyToTrade * price);
      const newAvg = totalCost / totalQty;
      
      newHoldings[symbol] = { qty: totalQty, avgPrice: newAvg };
      
      const updatedWallet = { 
        ...wallet, 
        balanceUSDT: Math.max(0, (wallet.balanceUSDT || 0) - currentMarketValueUSDT), 
        holdings: newHoldings 
      };
      
      await WalletService.updateWallet(uid, updatedWallet);
      await WalletService.logTrade(uid, { type: 'BUY', symbol, qty: qtyToTrade, price, total: currentMarketValueINR });
      NotificationService.add("Success", `Bought ${qtyToTrade.toFixed(6)} ${assetName}`, "success");
    } else {
      if (qtyToTrade > ownedQty + 0.00000001) { // small buffer for floating point
        NotificationService.add("Asset Error", `Insufficient ${assetName}`, "error");
        return;
      }
      
      const remainingQty = Math.max(0, ownedQty - qtyToTrade);
      if (remainingQty <= 0.00000001) {
        delete newHoldings[symbol];
      } else {
        newHoldings[symbol] = { qty: remainingQty, avgPrice: avgPrice };
      }
      
      // Selling adds the CURRENT MARKET VALUE to the balance (this reflects profit/loss)
      const updatedWallet = { 
        ...wallet, 
        balanceUSDT: (wallet.balanceUSDT || 0) + currentMarketValueUSDT, 
        holdings: newHoldings 
      };
      
      await WalletService.updateWallet(uid, updatedWallet);
      await WalletService.logTrade(uid, { type: 'SELL', symbol, qty: qtyToTrade, price, total: currentMarketValueINR });
      
      const tradePL = (price - avgPrice) * qtyToTrade * USDT_INR_RATE;
      if (tradePL >= 0) {
        NotificationService.add("Trade Profit", `Profit: +₹${tradePL.toFixed(2)}`, "success");
      } else {
        NotificationService.add("Trade Loss", `Loss: -₹${Math.abs(tradePL).toFixed(2)}`, "error");
      }
    }
    setInputValue('');
  };

  const setMax = () => {
    if (tradeType === 'buy') {
      setInputValue(Math.floor(availableINR).toString());
      setInputMode('inr');
    } else {
      setInputValue(ownedQty.toString());
      setInputMode('coin');
    }
  };

  if (loading && !coinData) return (
    <div className="space-y-6 pb-24 page-transition animate-pulse">
      {/* Skeleton Header */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 px-4 py-2.5 rounded-xl w-36 h-12"></div>
        <div className="text-right space-y-1.5">
          <div className="h-2 w-12 bg-white/[0.03] rounded ml-auto"></div>
          <div className="h-5 w-24 bg-white/[0.03] rounded"></div>
        </div>
      </div>

      {/* Skeleton Chart */}
      <div className="w-full h-56 bg-white/[0.02] border border-white/5 rounded-3xl p-4 flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <div className="h-6 w-16 bg-white/[0.03] rounded-md"></div>
            <div className="h-6 w-16 bg-white/[0.03] rounded-md"></div>
          </div>
          <div className="h-5 w-12 bg-white/[0.03] rounded-md"></div>
        </div>
        <div className="h-32 bg-white/[0.01] rounded-2xl flex items-end justify-between px-2 pb-2 gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex-1 bg-white/[0.03] rounded-sm" style={{ height: `${20 + Math.random() * 60}%` }}></div>
          ))}
        </div>
      </div>

      {/* Skeleton Interface Grid */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5 space-y-2">
          <div className="h-3 w-16 bg-white/[0.03] rounded"></div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-2.5 w-12 bg-white/[0.03] rounded text-xs"></div>
              <div className="h-2.5 w-10 bg-white/[0.03] rounded text-xs"></div>
            </div>
          ))}
        </div>
        <div className="col-span-7 space-y-4">
          <div className="h-10 bg-white/[0.03] rounded-2xl"></div>
          <div className="h-20 bg-white/[0.03] rounded-2xl"></div>
          <div className="h-12 bg-white/[0.03] rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 page-transition">
      {/* Header */}
      <div className="flex justify-between items-center mt-2 relative z-50">
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowSelector(!showSelector)} 
            className="flex items-center gap-2 py-2 px-3.5 bg-gradient-to-b from-[#161618] to-[#0b0b0d] border border-white/10 rounded-xl hover:border-yellow-450/45 active:scale-[0.97] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] group"
          >
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-black font-black text-[9px] shadow-[0_1px_5px_rgba(234,179,8,0.2)]">
              {symbol[0]}
            </div>
            <span className="font-extrabold text-[11px] text-white tracking-[0.12em] group-hover:text-yellow-400 transition-colors uppercase">
              {symbol.replace('USDT', '')} / USDT
            </span>
            <ChevronDown size={11} className="text-gray-500 group-hover:text-yellow-400 transition-colors ml-0.5" />
          </button>

          {showSelector && (
            <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-gradient-to-b from-[#141416] to-[#0a0a0c] border border-white/10 rounded-2xl p-4 shadow-[0_10px_45px_rgba(0,0,0,0.9)] animate-in slide-in-from-top-2 duration-200">
              <div className="relative mb-3 group">
                <span className="material-symbols-outlined text-gray-500 text-[14px] absolute left-3 top-1/2 -translate-y-1/2">search</span>
                <input 
                  type="text" 
                  placeholder="SEARCH COIN..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/5 pl-8 pr-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white focus:border-yellow-400/30 outline-none transition-colors"
                />
              </div>

              <div className="space-y-0.5 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
                {availableCoins.filter(c => c.symbol.includes(searchQuery.toUpperCase())).map(c => (
                  <div 
                    key={c.symbol} 
                    onClick={() => { setSearchParams({ symbol: c.symbol }); setShowSelector(false); }} 
                    className="flex justify-between items-center py-2 px-2 hover:bg-white/[0.04] rounded-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-extrabold text-[7px] group-hover:scale-105 transition-transform">{c.symbol[0]}</div>
                      <span className="font-extrabold text-[10px] text-gray-300 group-hover:text-yellow-400 tracking-wider transition-colors">{c.symbol.replace('USDT', '')}</span>
                    </div>
                    <span className="text-yellow-400 font-mono text-[9px] font-black">₹{(parseFloat(c.lastPrice || "0") * USDT_INR_RATE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-right">
           <p className="text-[7.5px] text-gray-500 font-black uppercase tracking-widest mb-1">Global Price</p>
           <h3 className="text-lg font-black text-white italic tracking-tighter leading-none">₹{(price * USDT_INR_RATE).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
      </div>

      {/* Unrealized P/L Panel */}
      {ownedQty > 0 && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in slide-in-from-top-2 duration-300 ${currentPL >= 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentPL >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
               {currentPL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <div>
               <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Current Position P/L</p>
               <p className={`text-xs font-black uppercase ${currentPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {currentPL >= 0 ? '+' : ''}{currentPL.toFixed(2)}% (₹{plAmountINR.toFixed(2)})
               </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Avg Buy Price</p>
            <p className="text-[10px] font-black text-white">₹{(avgPrice * USDT_INR_RATE).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <GlassCard className="p-0 border-white/5 overflow-hidden">
        <div className="p-4 flex justify-between items-end">
          <div className="flex gap-4">
             <div>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">24h High</p>
                <p className="text-[10px] font-black text-green-400">₹{(parseFloat(coinData?.highPrice || "0") * USDT_INR_RATE).toLocaleString()}</p>
             </div>
             <div>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">24h Low</p>
                <p className="text-[10px] font-black text-red-400">₹{(parseFloat(coinData?.lowPrice || "0") * USDT_INR_RATE).toLocaleString()}</p>
             </div>
          </div>
          <div className={`px-2 py-0.5 rounded-md text-[9px] font-black ${parseFloat(coinData?.priceChangePercent || "0") >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
             {coinData?.priceChangePercent || "0"}%
          </div>
        </div>
        <CryptoChart data={history} height={160} color={parseFloat(coinData?.priceChangePercent || "0") >= 0 ? "#facc15" : "#f87171"} />
      </GlassCard>

      {/* Trading Interface */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left: Orderbook */}
        <div className="col-span-5 space-y-1">
           <div className="flex items-center gap-2 mb-3">
              <Zap size={10} className="text-yellow-400" />
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em]">Real-time Book</p>
           </div>
           <div className="space-y-0.5">
             {orderBook.asks.slice(0, 5).reverse().map((a, i) => (
               <div key={`ask-${i}`} className="flex justify-between text-[9px] font-black">
                 <span className="text-red-500/70">{(a.price * USDT_INR_RATE).toFixed(0)}</span>
                 <span className="text-gray-600">{a.amount.toFixed(3)}</span>
               </div>
             ))}
           </div>
           <div className="py-2.5 text-center bg-white/[0.03] rounded-lg my-2 border-y border-white/5">
              <span className="text-[11px] font-black text-white italic">{(price * USDT_INR_RATE).toFixed(1)}</span>
           </div>
           <div className="space-y-0.5">
             {orderBook.bids.slice(0, 5).map((b, i) => (
               <div key={`bid-${i}`} className="flex justify-between text-[9px] font-black">
                 <span className="text-green-500/70">{(b.price * USDT_INR_RATE).toFixed(0)}</span>
                 <span className="text-gray-600">{b.amount.toFixed(3)}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Right: Execution Form */}
        <div className="col-span-7 space-y-4">
          <div className="flex p-0.5 glass-effect rounded-2xl border-white/5 bg-white/5">
            <button 
              onClick={() => setTradeType('buy')} 
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tradeType === 'buy' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-500'}`}
            >
              Buy
            </button>
            <button 
              onClick={() => setTradeType('sell')} 
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tradeType === 'sell' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-500'}`}
            >
              Sell
            </button>
          </div>
          
          <div className="glass-effect rounded-2xl p-3 border-white/5 relative group bg-white/[0.02]">
            <div className="flex justify-between items-center mb-0.5">
              <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest leading-none">
                Amount ({inputMode === 'inr' ? 'INR' : assetName})
              </p>
              <button onClick={() => setInputMode(inputMode === 'inr' ? 'coin' : 'inr')} className="text-yellow-400 p-1">
                <ArrowRightLeft size={10} />
              </button>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-lg font-black text-gray-700 mb-0.5">{inputMode === 'inr' ? '₹' : ''}</span>
              <input 
                type="number" 
                placeholder="0.00" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-transparent text-xl font-black text-white focus:outline-none placeholder:text-gray-900"
              />
            </div>
            
            {inputValue && (
              <div className="mt-1.5 pt-1.5 border-t border-white/5 flex justify-between items-center">
                 <span className="text-[6px] text-gray-600 font-black uppercase tracking-widest">Est. Out</span>
                 <span className="text-[8px] font-black text-yellow-400">
                    {inputMode === 'inr' ? `${calculatedQty.toFixed(6)} ${assetName}` : `₹${calculatedINR.toLocaleString()}`}
                 </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-1">
                   <WalletIcon size={10} className="text-gray-600" />
                   <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest">Balance</span>
                </div>
                <button onClick={setMax} className="text-[8px] font-black text-yellow-400 uppercase tracking-widest hover:underline px-1 py-0.5">
                  {tradeType === 'buy' ? formatINR(availableINR) : `${ownedQty.toFixed(4)} ${assetName}`} <span className="opacity-60">(MAX)</span>
                </button>
             </div>

             <LiquidButton 
              onClick={handleAction} 
              fullWidth 
              variant={tradeType === 'buy' ? 'success' : 'danger'}
             >
                Execute {tradeType === 'buy' ? 'Buy' : 'Sell'}
             </LiquidButton>
          </div>
        </div>
          
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
             <AlertCircle size={14} className="text-gray-600 shrink-0 mt-0.5" />
             <p className="text-[8px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
               Orders are matched against the Global Spot Market. Execution is final and cannot be reversed.
             </p>
          </div>
        </div>
      </div>
    );
  };

export default Trade;
