
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Info } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const handleNew = (e: any) => {
      setNotification(e.detail);
      setTimeout(() => setNotification(null), 4000);
    };
    window.addEventListener('newNotification', handleNew);
    return () => window.removeEventListener('newNotification', handleNew);
  }, []);

  if (!notification) return null;

  const icons = {
    success: <CheckCircle className="text-green-400" size={20} />,
    error: <XCircle className="text-red-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />
  };

  const borderColors = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30'
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm glass-effect p-4 rounded-3xl border ${borderColors[notification.type]} shadow-2xl animate-in slide-in-from-top-10 duration-300`}>
      <div className="flex items-start gap-4">
        <div className="mt-0.5">{icons[notification.type as keyof typeof icons]}</div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-white">{notification.title}</h4>
          <p className="text-[11px] text-gray-400 mt-1 font-medium leading-relaxed">{notification.message}</p>
        </div>
      </div>
    </div>
  );
};
