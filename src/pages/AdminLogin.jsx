import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  KeyRound,
  AlertCircle
} from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('admin@campus.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'ADMIN') {
          navigate('/command-center');
        } else {
          navigate('/staff-dashboard');
        }
      } else {
        setError(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection error with authentication core.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setEmail('admin@campus.com');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Left side: Navy / Tactical Operations panel (Matches Image 2) */}
      <div className="w-full md:w-5/12 bg-slate-900 dark:bg-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            SmartCampus <span className="text-purple-400 font-extrabold">OS</span>
          </span>
        </div>

        {/* Center / Bottom Info */}
        <div className="my-auto py-12 z-10">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-6 shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            System Administration
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            Authorized access only. Control campus infrastructure, manage access levels, and oversee entire system configurations.
          </p>
        </div>

        {/* Bottom indicator */}
        <div className="text-[11px] text-slate-500 font-mono z-10 flex items-center justify-between">
          <span>SECURE PROTOCOL v2.6</span>
          <span className="text-purple-400 font-bold">256-BIT ENCRYPTION</span>
        </div>
      </div>

      {/* Right side: Clean Admin Login form (Matches Image 2) */}
      <div className="w-full md:w-7/12 flex flex-col justify-between p-8 sm:p-14 bg-white dark:bg-slate-900 transition-colors">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to selection</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Admin Login
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enter administrator credentials to access the system core.
          </p>

          {/* Quick Demo Autofill Pill */}
          <div className="mt-4 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-purple-900 dark:text-purple-300">
              <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Demo Account: <strong>admin@campus.com</strong></span>
            </div>
            <button
              type="button"
              onClick={autofillDemo}
              className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
            >
              Fill Demo
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartcampus.edu"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-400">
          SmartCampus Command Center • Enterprise Security Engine
        </div>
      </div>
    </div>
  );
};
