
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { AuthService, formatINR, WalletService } from '../services/binance.ts';
import { ChevronLeft, ArrowDownCircle, ArrowUpCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw' | 'trade'>('all');

  useEffect(() => {
    const fetchData = async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) { 
        navigate('/auth'); 
        return; 
      }

      // Fetch from Firebase services instead of DB helper
      const [deposits, withdrawals, trades] = await Promise.all([
        WalletService.getDeposits(user.id),
        WalletService.getWithdrawals(user.id),
        WalletService.getTradeHistory(user.id)
      ]);

      const all = [
        ...deposits.map((d: any) => ({ ...d, type: 'deposit' })),
        ...withdrawals.map((w: any) => ({ ...w, type: 'withdraw' })),
        ...trades.map((t: any) => ({ ...t, type: 'trade', type_sub: t.type }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setTransactions(all);
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter);

  return (
    <div className="space-y-6 pb-24 page-transition">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/profile')} className="p-3 glass-effect rounded-2xl text-yellow-400 active:scale-90">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">LEDGER HISTORY</h1>
      </div>

      <div className="flex p-1.5 glass-effect rounded-2xl border-white/10">
        {(['all', 'deposit', 'withdraw', 'trade'] as const).map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-yellow-400 font-black animate-pulse">Syncing Cloud Ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-black text-[10px] tracking-widest">Empty History</div>
        ) : filtered.map((tx) => (
          <GlassCard key={tx.id} className="p-5 border-white/5 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-400' : tx.type === 'withdraw' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {tx.type === 'deposit' ? <ArrowDownCircle size={20} /> : tx.type === 'withdraw' ? <ArrowUpCircle size={20} /> : tx.type === 'trade' && tx.type_sub === 'BUY' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-tight">
                    {tx.type === 'deposit' ? 'Recharge' : tx.type === 'withdraw' ? 'Withdrawal' : `${tx.type_sub || 'Order'} ${tx.symbol || ''}`}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 opacity-50">
                    <Clock size={10} />
                    <span className="text-[8px] font-bold uppercase">{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black tracking-tight ${tx.type === 'deposit' || (tx.type === 'trade' && tx.type_sub === 'SELL') ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'deposit' ? '+' : '-'} ₹{(tx.amount || tx.total)?.toLocaleString()}
                </p>
                <span className="text-[7px] font-black uppercase bg-white/5 px-2 py-0.5 rounded-full">{tx.status || 'Success'}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
