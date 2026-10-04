import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Settings as SettingsIcon,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Save,
  Lock,
  Radio,
  Sliders,
  AlertTriangle,
  Info
} from 'lucide-react';

export const Settings = () => {
  const { isAdmin } = useAuth();
  const { socket, lockdownAlert } = useSocket();

  const [settings, setSettings] = useState({
    predictiveAnomalyDetection: true,
    aiAutomation: true,
    aiIncidentPrioritization: true,
    smartResourceAllocation: true,
    strictBiometricMode: false,
    notifications: true,
    campusLockdown: false,
    sessionTimeout: 60,
    auditLogging: true
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState(false);
  const [lockdownConfirmText, setLockdownConfirmText] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.settings || {});
      }
    } catch (e) {
      console.error('[Fetch settings error]', e);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        setSuccessMsg('System configuration saved and synced across active clusters.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLockdown = async () => {
    if (!settings.campusLockdown && lockdownConfirmText.trim().toUpperCase() !== 'LOCKDOWN') {
      alert('Type LOCKDOWN to initiate simulation protocol.');
      return;
    }

    try {
      const res = await api.post('/settings/lockdown');
      if (res.data.success) {
        setSettings(prev => ({ ...prev, campusLockdown: res.data.lockdown }));
        setIsLockdownModalOpen(false);
        setLockdownConfirmText('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle lockdown protocol.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Global System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure autonomous AI engines, perimeter access security parameters, and emergency lockdown procedures.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Card 1: AI & Automation Engine */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                AI & Autonomous Prioritization Engine
              </h2>
              <p className="text-xs text-slate-500">Real-time heuristics and heuristic risk engine parameters</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Predictive Anomaly & Sensor Spike Detection
                </span>
                <p className="text-slate-500 text-[11px]">
                  Automatically analyzes IoT sensor deviations and triggers warning activity logs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.predictiveAnomalyDetection}
                onChange={(e) => setSettings({ ...settings, predictiveAnomalyDetection: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  AI Incident Risk Prioritization
                </span>
                <p className="text-slate-500 text-[11px]">
                  Calculates composite severity, population impact, and location hazard scores.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.aiIncidentPrioritization}
                onChange={(e) => setSettings({ ...settings, aiIncidentPrioritization: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Smart Resource Allocation Suggestions
                </span>
                <p className="text-slate-500 text-[11px]">
                  Ranks staff operatives based on skill match %, current duty capacity, and department affinity.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.smartResourceAllocation}
                onChange={(e) => setSettings({ ...settings, smartResourceAllocation: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Card 2: Security & Access Controls */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Access Security & Session Controls
              </h2>
              <p className="text-xs text-slate-500">Role verification, audit trail, and biometric session policies</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Strict Biometric Authentication Protocol
                </span>
                <p className="text-slate-500 text-[11px]">
                  Requires multi-factor WebAuthn / Passkey validation for elevated administrative commands.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.strictBiometricMode}
                onChange={(e) => setSettings({ ...settings, strictBiometricMode: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Immutable Audit Trail Logging
                </span>
                <p className="text-slate-500 text-[11px]">
                  Logs state mutations, password updates, and lockdown requests to persistent audit collection.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.auditLogging}
                onChange={(e) => setSettings({ ...settings, auditLogging: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
            </label>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Session Expiration Timeout
                </span>
                <p className="text-slate-500 text-[11px]">
                  Inactivity threshold before automatic re-authentication is mandated.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={settings.sessionTimeout || 60}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                  className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-center font-mono font-bold"
                />
                <span className="text-slate-400">minutes</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Danger Zone: Campus Lockdown Protocol */}
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-500/40 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500 text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400">
              Danger Zone: Campus Lockdown Protocol
            </h2>
            <p className="text-xs text-slate-500">Elevated security demonstration lockdown sequence</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>
            <strong>Safe Software Demonstration Notice:</strong> Initiating lockdown protocol triggers simulation mode only. It broadcasts high-priority alerts across active clients and logs state changes. It does NOT control real-world physical locks, alarms, or infrastructure.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Current State: {settings.campusLockdown ? '⚠️ LOCKDOWN ACTIVE (DEMO)' : 'Nominal Perimeter Access'}
            </span>
            <p className="text-[11px] text-slate-500">
              {settings.campusLockdown ? 'Perimeter access gates reported restricted in UI.' : 'All gates open according to standard campus schedule.'}
            </p>
          </div>

          <button
            onClick={() => setIsLockdownModalOpen(true)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
              settings.campusLockdown
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {settings.campusLockdown ? 'Lift Lockdown Protocol' : 'Initiate Lockdown Protocol'}
          </button>
        </div>
      </div>

      {/* Lockdown Confirmation Modal */}
      {isLockdownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-3xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
              <h3 className="font-bold text-base">
                {settings.campusLockdown ? 'Lift Lockdown Sequence?' : 'Confirm Campus Lockdown Protocol'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {settings.campusLockdown
                ? 'This will restore campus alert status to normal and notify all connected command portals.'
                : 'This demonstration protocol will notify all campus personnel and activate UI lockdown banners.'}
            </p>

            {!settings.campusLockdown && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Type <span className="text-rose-500 font-mono">LOCKDOWN</span> to confirm
                </label>
                <input
                  type="text"
                  value={lockdownConfirmText}
                  onChange={(e) => setLockdownConfirmText(e.target.value)}
                  placeholder="LOCKDOWN"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLockdownModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleLockdown}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
