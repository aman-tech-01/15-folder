import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Shield,
  Send,
  UserCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Check
} from 'lucide-react';

export const IncidentDetailModal = ({ isOpen, onClose, incident, onUpdated, onOpenAssign }) => {
  const { user, isAdmin } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !incident) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setError('');
    try {
      const res = await api.patch(`/incidents/${incident._id}/status`, {
        status: newStatus
      });
      if (res.data.success) {
        if (onUpdated) onUpdated(res.data.incident);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    setError('');
    try {
      const res = await api.post(`/incidents/${incident._id}/notes`, {
        text: newNote.trim()
      });
      if (res.data.success) {
        incident.notes = res.data.notes;
        setNewNote('');
        if (onUpdated) onUpdated({ ...incident, notes: res.data.notes });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to append note.');
    } finally {
      setAddingNote(false);
    }
  };

  const isResolved = incident.status === 'Resolved' || incident.status === 'Closed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
              {incident.incidentId}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              incident.priority === 'Critical' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
              incident.priority === 'High' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
              'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
            }`}>
              {incident.priority} Priority
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isResolved ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {incident.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {incident.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Location & Room</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="truncate">{incident.location}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">AI Risk Score</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>{incident.aiScore || 75}% Risk</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Impacted People</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>{incident.affectedPeople || 1} people</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SLA Status</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{incident.slaStatus || 'On Track'}</span>
              </div>
            </div>
          </div>

          {/* Assigned Staff Banner */}
          <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">
                {incident.assignedTo?.name ? incident.assignedTo.name.slice(0, 2).toUpperCase() : <Users className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-400">Assigned Operative</span>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {incident.assignedTo?.name || 'Unassigned (In Dispatch Queue)'}
                </div>
                {incident.assignedTo?.department && (
                  <p className="text-[11px] text-slate-500">{incident.assignedTo.department}</p>
                )}
              </div>
            </div>

            {isAdmin && onOpenAssign && (
              <button
                onClick={() => onOpenAssign(incident)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{incident.assignedTo ? 'Reassign' : 'Smart Assign'}</span>
              </button>
            )}
          </div>

          {/* Status Controls */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Update Operational Status
            </span>
            <div className="flex flex-wrap gap-2">
              {['New', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                <button
                  key={st}
                  disabled={updatingStatus || incident.status === st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    incident.status === st
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 ring-2 ring-cyan-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Log */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Incident Notes & Action Log ({incident.notes?.length || 0})
            </span>

            <div className="space-y-2 max-h-44 overflow-y-auto">
              {incident.notes?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No notes added yet.</p>
              ) : (
                incident.notes?.map((n, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      <span>{n.author} ({n.authorRole})</span>
                      <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200">{n.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type operational update or field report note..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
