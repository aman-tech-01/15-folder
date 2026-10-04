import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Mail,
  Lock,
  ArrowLeft,
  KeyRound,
  AlertCircle
} from 'lucide-react';

export const StaffLogin = () => {
  const [email, setEmail] = useState('staff@campus.com');
  const [password, setPassword] = useState('Staff@123');
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

  const staffProfiles = [
    { name: 'Vikram Das', dept: 'IT Infrastructure', email: 'staff@campus.com' },
    { name: 'Priya Sharma', dept: 'Facilities & Hostel', email: 'priya@campus.com' },
    { name: 'Rahul Verma', dept: 'Electrical & Power', email: 'rahul@campus.com' },
    { name: 'Dr. Ananya Roy', dept: 'Medical Services', email: 'ananya@campus.com' },
    { name: 'Capt. Suresh', dept: 'Campus Security', email: 'suresh@campus.com' }
  ];

  const selectStaff = (prof) => {
    setEmail(prof.email);
    setPassword('Staff@123');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Left side: Navy / Faculty Command Center panel (Matches Image 3) */}
      <div className="w-full md:w-5/12 bg-slate-900 dark:bg-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            SmartCampus <span className="text-cyan-400 font-extrabold">OS</span>
          </span>
        </div>

        {/* Center / Bottom Info */}
        <div className="my-auto py-12 z-10">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-6 shadow-lg">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Faculty & Operatives Portal
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            Log in to view student queries automatically assigned to your department. Resolve issues, update status, and manage campus safety.
          </p>
        </div>

        {/* Bottom indicator */}
        <div className="text-[11px] text-slate-500 font-mono z-10 flex items-center justify-between">
          <span>OPERATIONAL ROSTER ACTIVE</span>
          <span className="text-cyan-400 font-bold">READY</span>
        </div>
      </div>

      {/* Right side: Clean Staff Login form */}
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
            Staff Login
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select an operative profile or enter credentials to access your task dashboard.
          </p>

          {/* Quick Select Operative Chips */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Quick Switch Operative Identity:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {staffProfiles.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => selectStaff(p)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    email === p.email
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-500'
                  }`}
                >
                  {p.name} ({p.dept.split(' ')[0]})
                </button>
              ))}
            </div>
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
                University Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@smartcampus.edu"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In to Command Center'}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-400">
          Faculty & Operations Command • SmartCampus OS
        </div>
      </div>
    </div>
  );
};
