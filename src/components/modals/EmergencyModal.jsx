import React, { useState } from 'react';
import api from '../../services/api';
import {
  AlertOctagon,
  X,
  Radio,
  ShieldAlert,
  Info
} from 'lucide-react';

export const EmergencyModal = ({ isOpen, onClose, currentEmergencyState, onEmergencyToggled }) => {
  const [reason, setReason] = useState('Campus Emergency Response Protocol Activation - Immediate Incident Command');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTrigger = async () => {
    if (!currentEmergencyState && confirmText.trim().toUpperCase() !== 'BROADCAST') {
      setError('Please type BROADCAST to confirm emergency alarm transmission.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/settings/emergency', { reason });
      if (res.data.success) {
        if (onEmergencyToggled) onEmergencyToggled(res.data.emergencyMode);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update emergency alarm state.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500 text-white animate-bounce">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
                {currentEmergencyState ? 'De-escalate Emergency Alarm' : 'SOUND EMERGENCY ALARM'}
              </h2>
              <p className="text-xs text-rose-500/80">Campus-wide tactical alert protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safe Demo Notice Alert */}
        <div className="m-6 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-bold">Software Demonstration Notice:</span>
            <p className="mt-0.5">
              This action operates in software simulation mode. It broadcasts high-priority socket events, updates the Command Center safety index, and dispatches UI notifications across connected browsers. No physical alarms or emergency infrastructure are contacted.
            </p>
          </div>
        </div>

        <div className="px-6 space-y-4">
          {!currentEmergencyState && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tactical Broadcast Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Type <span className="text-rose-600 dark:text-rose-400 font-mono">BROADCAST</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="BROADCAST"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500 uppercase"
                />
              </div>
            </>
          )}

          {currentEmergencyState && (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
              Emergency alarm is currently ACTIVE. Clicking Stand Down will return campus safety readiness to nominal operating condition.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleTrigger}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all cursor-pointer ${
              currentEmergencyState
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700 active:scale-95'
            }`}
          >
            {loading ? 'Transmitting...' : currentEmergencyState ? 'Stand Down Emergency' : '🚨 TRANSMIT EMERGENCY ALARM'}
          </button>
        </div>
      </div>
    </div>
  );
};
