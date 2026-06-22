
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { NotificationService } from '../services/binance.ts';
import { Bell, Trash2, Check, Clock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(NotificationService.getNotifications());

  useEffect(() => {
    NotificationService.markAllAsRead();
    const update = () => setNotifications(NotificationService.getNotifications());
    window.addEventListener('notificationsUpdated', update);
    return () => window.removeEventListener('notificationsUpdated', update);
  }, []);

  const clearAll = () => {
    localStorage.setItem('z_codeshack_notifications', JSON.stringify([]));
    setNotifications([]);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 glass-effect rounded-xl text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black tracking-tighter">ALERTS CENTER</h1>
        <button onClick={clearAll} className="p-2 glass-effect rounded-xl text-red-400">
          <Trash2 size={20} />
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n: any) => (
            <GlassCard key={n.id} className={`p-4 border-white/5 ${n.type === 'success' ? 'border-l-4 border-l-green-500' : n.type === 'error' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">{n.title}</span>
                <span className="text-[9px] text-gray-500 flex items-center gap-1 font-bold">
                  <Clock size={10} /> {n.time}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">{n.message}</p>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 opacity-30 gap-4">
          <Bell size={60} strokeWidth={1} />
          <p className="text-xs font-black uppercase tracking-widest">No New Alerts</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
