import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  X,
  Sparkles,
  UserCheck,
  Award,
  Zap,
  CheckCircle2,
  Clock,
  Shield,
  Activity
} from 'lucide-react';

export const AssignStaffModal = ({ isOpen, onClose, incident, onAssigned }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!incident?._id) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/users/suggestions/${incident._id}`);
        if (res.data.success) {
          setSuggestions(res.data.suggestions || []);
          if (res.data.suggestions?.length > 0) {
            setSelectedStaffId(res.data.suggestions[0].staffId);
          }
        }
      } catch (err) {
        setError('Failed to calculate AI staff suggestions.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && incident) {
      fetchSuggestions();
    }
  }, [isOpen, incident]);

  if (!isOpen || !incident) return null;

  const handleAssign = async () => {
    if (!selectedStaffId) return;
    setAssigning(true);
    setError('');

    const target = suggestions.find(s => s.staffId === selectedStaffId);

    try {
      const res = await api.post('/assignments', {
        incidentId: incident._id,
        staffId: selectedStaffId,
        assignmentScore: target?.overallSuitability || 85
      });

      if (res.data.success) {
        if (onAssigned) onAssigned(res.data.assignment);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch staff.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Smart Resource Allocation Engine</h2>
              <p className="text-xs text-slate-500">Autonomous skill match & workload optimization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incident Target Overview */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              {incident.incidentId} • {incident.category}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
              {incident.title}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">Location</span>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{incident.location}</div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Candidate List */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-500 animate-spin" />
              <span>Analyzing roster skills, availability & live workload...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No staff members found matching criteria.
            </div>
          ) : (
            suggestions.map((cand, idx) => (
              <div
                key={cand.staffId}
                onClick={() => setSelectedStaffId(cand.staffId)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedStaffId === cand.staffId
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-xs ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}>
                    {cand.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{cand.name}</span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold flex items-center gap-1">
                          <Award className="w-3 h-3" /> Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {cand.department} • <span className="font-medium text-slate-600 dark:text-slate-300">Skills:</span> {cand.skills.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Live Workload</div>
                    <div className={`text-xs font-bold ${cand.workloadPercentage >= 80 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {cand.workloadPercentage}%
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center min-w-16">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">AI Match</div>
                    <div className="text-xs font-mono font-extrabold text-purple-600 dark:text-purple-400">
                      {cand.overallSuitability}%
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Auto-dispatches notification and updates staff workload.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={assigning || !selectedStaffId}
              onClick={handleAssign}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{assigning ? 'Dispatching...' : 'Dispatch Selected Staff'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
