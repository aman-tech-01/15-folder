import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import {
  Shield,
  Search,
  PlusCircle,
  Sun,
  Moon,
  Bell,
  LogOut,
  AlertTriangle,
  Clock,
  User as UserIcon,
  CheckCircle,
  Radio
} from 'lucide-react';

export const Navbar = ({ onOpenReportModal, onOpenEmergencyModal }) => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Campus digital clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (socket) {
      socket.on('notification:new', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(c => c + 1);
      });
    }
  }, [socket]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/incidents?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors shadow-xs">
      {/* Left: Brand / System Status */}
      <div className="flex items-center gap-4">
        <Link to="/command-center" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              SmartCampus <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">OS</span>
            </span>
          </div>
        </Link>

        {/* Live campus status badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online</span>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <div className="flex-1 max-w-md mx-4 hidden lg:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search systems, incidents, buildings, staff..."
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </form>
      </div>

      {/* Right: Actions, Clock, Theme, Notifications & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Report Incident button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-medium text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report</span>
        </button>

        {/* Live IST Campus Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>
            {currentTime.toLocaleTimeString('en-US', { hour12: false })} IST
          </span>
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Campus Alerts</h3>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto my-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div
                      key={notif._id || idx}
                      className={`py-2.5 px-1 flex items-start gap-2.5 transition-colors ${
                        !notif.read ? 'bg-cyan-50/50 dark:bg-cyan-950/20 rounded-lg px-2' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'emergency' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        ) : notif.type === 'assignment' ? (
                          <Radio className="w-4 h-4 text-cyan-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center uppercase tracking-wider overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name ? user.name.slice(0, 2) : 'US'}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
              {user?.name || 'User'}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">
              {user?.role === 'ADMIN' ? 'SUPER ADMIN' : user?.department || 'STAFF'}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
