import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { EmergencyModal } from '../components/modals/EmergencyModal';
import {
  MessageSquare,
  Send,
  AlertOctagon,
  Shield,
  Users,
  Radio,
  Clock,
  CheckCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const CHANNELS = [
  { id: 'Command Center', icon: Shield, desc: 'Central tactical operations and incident triage' },
  { id: 'Security Team', icon: Radio, desc: 'Campus perimeter, access gates, ANPR surveillance' },
  { id: 'Medical', icon: Users, desc: 'Paramedics, clinical staff, triage and ambulance dispatch' },
  { id: 'Facilities', icon: Shield, desc: 'Power substation, HVAC, plumbing, structural repairs' },
  { id: 'IT Support', icon: MessageSquare, desc: 'Fiber backbone, Wi-Fi mesh, compute cluster servers' }
];

export const Communications = () => {
  const { user, isAdmin } = useAuth();
  const { socket, emergencyAlert } = useSocket();

  const [activeChannel, setActiveChannel] = useState('Command Center');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isAlert, setIsAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchMessages = async (channelName) => {
    setLoading(true);
    try {
      const res = await api.get(`/messages?channel=${encodeURIComponent(channelName)}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (e) {
      console.error('[Fetch messages error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(activeChannel);

    if (socket) {
      socket.emit('channel:join', activeChannel);

      const handleIncomingMessage = (newMsg) => {
        if (newMsg.channel === activeChannel) {
          setMessages(prev => [...prev, newMsg]);
        }
      };

      socket.on(`chat:${activeChannel}`, handleIncomingMessage);

      return () => {
        socket.emit('channel:leave', activeChannel);
        socket.off(`chat:${activeChannel}`, handleIncomingMessage);
      };
    }
  }, [activeChannel, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    try {
      const res = await api.post('/messages', {
        channel: activeChannel,
        message: inputText.trim(),
        isAlert,
        senderName: user?.name || 'Aman (Super Admin)',
        senderRole: user?.role || 'ADMIN'
      });

      if (res.data.success) {
        setInputText('');
        setIsAlert(false);
        fetchMessages(activeChannel);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Emergency Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tactical Communications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Encrypted channel radios, team dispatch comms, and emergency broadcast console.
          </p>
        </div>

        {/* Big Red Emergency Alarm Button */}
        {isAdmin && (
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all animate-pulse"
          >
            <AlertOctagon className="w-5 h-5" />
            <span>SOUND EMERGENCY ALARM</span>
          </button>
        )}
      </div>

      {/* Main Tactical Chat UI */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden min-h-[620px]">
        {/* Left Col: Channel Selection */}
        <div className="lg:col-span-1 p-4 border-r border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Tactical Channels
          </span>

          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isActive = activeChannel === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3 ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 shadow-2xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-bold truncate">#{ch.id}</div>
                  <div className="text-[10px] text-slate-400 truncate">{ch.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Col: Chat Area */}
        <div className="lg:col-span-3 flex flex-col justify-between p-6 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Active Channel Header */}
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                #{activeChannel}
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">ENCRYPTED REALTIME SOCKET BUS</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2 max-h-[440px]">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">
                Loading encrypted transmissions...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400">
                No transmissions in this channel yet. Type a dispatch message below.
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.senderName === user?.name || msg.senderRole === user?.role;

                return (
                  <div
                    key={msg._id || i}
                    className={`flex items-start gap-3 text-xs ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isMe ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'
                    }`}>
                      {msg.senderName ? msg.senderName.slice(0, 2).toUpperCase() : 'US'}
                    </div>

                    <div className={`max-w-md p-3.5 rounded-2xl space-y-1 shadow-2xs ${
                      msg.isAlert
                        ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : isMe
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                    }`}>
                      <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 font-semibold">
                        <span>{msg.senderName} ({msg.senderRole || 'STAFF'})</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Input Box */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Transmit message to #${activeChannel}...`}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Transmit</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAlert}
                  onChange={(e) => setIsAlert(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span>Tag as High-Priority Channel Alert</span>
              </label>
            </div>
          </form>
        </div>
      </div>

      {/* Emergency Confirmation Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        currentEmergencyState={!!emergencyAlert}
      />
    </div>
  );
};
