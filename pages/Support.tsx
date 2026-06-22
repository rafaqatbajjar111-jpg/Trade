
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/GlassCard.tsx';
import { LiquidButton } from '../components/LiquidButton.tsx';
import { NotificationService, SupportService, AdminSettingsService } from '../services/binance.ts';
import { 
  ChevronLeft, 
  MessageSquare, 
  Send, 
  Globe, 
  Mail, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ChevronRight,
  Headphones,
  User,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Support: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'main' | 'ticket' | 'chat'>('main');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [channelConfig, setChannelConfig] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = SupportService.getMessages(setMessages);
    AdminSettingsService.getChannelSettings().then(setChannelConfig);
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  useEffect(() => {
    if (view === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, view]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    SupportService.sendMessage(inputText);
    setInputText('');
  };

  const openTelegramSupport = () => {
    if (channelConfig?.telegram_support) {
      const username = channelConfig.telegram_support.replace('@', '');
      window.open(`https://t.me/${username}`, '_blank');
    } else {
      NotificationService.add("Support Offline", "Direct Telegram route not configured.", "error");
    }
  };

  if (view === 'chat') {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] page-transition">
        <div className="flex items-center justify-between p-4 glass-effect border-b border-white/10">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('main')} className="p-2 text-gray-400"><ChevronLeft size={24} /></button>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-white">LIVE SUPPORT</h1>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div><span className="text-[9px] font-black text-green-500 uppercase">Agent Online</span></div>
            </div>
          </div>
          <Headphones className="text-yellow-400" size={24} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium ${m.sender === 'user' ? 'bg-yellow-400 text-black rounded-tr-none' : 'glass-effect border border-white/10 text-gray-300 rounded-tl-none'}`}>
                {m.text}<div className={`text-[8px] mt-2 opacity-60 font-black uppercase`}>{m.time}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-black/60 border-t border-white/10">
          <div className="relative">
            <input type="text" placeholder="Type your message..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs font-bold" />
            <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-yellow-400 text-black rounded-xl"><Send size={20} /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 glass-effect rounded-xl text-gray-400"><ChevronLeft size={20} /></button>
        <h1 className="text-lg font-black tracking-tighter uppercase">HELP CENTER</h1>
      </div>

      <GlassCard className="p-5 border-yellow-400/20 text-center relative overflow-hidden">
        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-black mx-auto mb-3 rotate-12"><MessageSquare size={24} fill="currentColor" /></div>
        <h2 className="text-lg font-black uppercase italic text-white">ZMEX HELP</h2>
        <div className="grid grid-cols-1 gap-2 mt-5">
          <button onClick={() => setView('chat')} className="p-3 glass-effect border-white/5 rounded-2xl flex items-center justify-between group active:scale-95 shadow-xl">
            <div className="flex items-center gap-3"><div className="p-2 bg-yellow-400/10 rounded-xl"><MessageSquare className="text-yellow-400" size={18} /></div><div className="text-left"><p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Live App Chat</p><p className="text-[6px] text-gray-600 font-black uppercase leading-none">Support with active agents</p></div></div><ChevronRight className="text-gray-800" size={14} />
          </button>
          <button onClick={openTelegramSupport} className="p-3 glass-effect border-sky-500/20 rounded-2xl flex items-center justify-between group active:scale-95 shadow-xl">
            <div className="flex items-center gap-3"><div className="p-2 bg-sky-500/10 rounded-xl"><Send className="text-sky-400" size={18} /></div><div className="text-left"><p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Direct Assist</p><p className="text-[6px] text-gray-600 font-black uppercase leading-none">Official Telegram Path</p></div></div><ChevronRight className="text-gray-800" size={14} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Support;
