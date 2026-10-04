import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { IncidentDetailModal } from '../components/modals/IncidentDetailModal';
import { AssignStaffModal } from '../components/modals/AssignStaffModal';
import {
  Layers,
  Sparkles,
  MapPin,
  Users,
  Clock,
  Zap,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  HelpCircle,
  Move,
  Check
} from 'lucide-react';

const COLUMNS = [
  { id: 'Critical', label: 'Critical Priority', color: 'rose', bgLight: 'bg-rose-50/50 dark:bg-rose-950/20', border: 'border-rose-300 dark:border-rose-900/50' },
  { id: 'High', label: 'High Priority', color: 'amber', bgLight: 'bg-amber-50/50 dark:bg-amber-950/20', border: 'border-amber-300 dark:border-amber-900/50' },
  { id: 'Medium', label: 'Medium Priority', color: 'cyan', bgLight: 'bg-cyan-50/50 dark:bg-cyan-950/20', border: 'border-cyan-300 dark:border-cyan-900/50' },
  { id: 'Low', label: 'Low Priority', color: 'slate', bgLight: 'bg-slate-50/50 dark:bg-slate-900/40', border: 'border-slate-300 dark:border-slate-800' }
];

export const PriorityQueue = () => {
  const { isAdmin } = useAuth();
  const { socket } = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedIncidentId, setDraggedIncidentId] = useState(null);

  // Modals
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [assignIncident, setAssignIncident] = useState(null);

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incidents?limit=100');
      if (res.data.success) {
        setIncidents(res.data.incidents || []);
      }
    } catch (e) {
      console.error('[PriorityQueue fetch error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    if (socket) {
      socket.on('incident:new', () => fetchIncidents());
      socket.on('incident:updated', () => fetchIncidents());
      socket.on('incident:priorityUpdated', () => fetchIncidents());
      socket.on('incident:statusUpdated', () => fetchIncidents());
    }
  }, [socket]);

  // Drag and Drop handlers
  const handleDragStart = (e, id) => {
    setDraggedIncidentId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetPriority) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedIncidentId;
    if (!id) return;

    const currentInc = incidents.find(i => i._id === id);
    if (!currentInc || currentInc.priority === targetPriority) return;

    // Optimistic UI update
    setIncidents(prev =>
      prev.map(i => (i._id === id ? { ...i, priority: targetPriority } : i))
    );

    try {
      await api.patch(`/incidents/${id}/priority`, { priority: targetPriority });
    } catch (err) {
      console.error('[Failed to update priority via drag]', err);
      fetchIncidents(); // Revert on failure
    } finally {
      setDraggedIncidentId(null);
    }
  };

  const handleQuickResolve = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/incidents/${id}/status`, { status: 'Resolved' });
      fetchIncidents();
    } catch (err) {
      alert('Failed to resolve incident.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Priority Queue</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Kanban
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Drag cards across columns to dynamically override AI priority or re-allocate response velocity.
          </p>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Move className="w-4 h-4 text-cyan-500 shrink-0" />
          <span>Drag & Drop live database sync enabled</span>
        </div>
      </div>

      {/* 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colIncidents = incidents.filter(i => i.priority === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-3xl border ${col.border} ${col.bgLight} p-4 flex flex-col min-h-[600px] transition-colors`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    col.id === 'Critical' ? 'bg-rose-500 animate-ping' :
                    col.id === 'High' ? 'bg-amber-500' :
                    col.id === 'Medium' ? 'bg-cyan-500' : 'bg-slate-400'
                  }`}></span>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    {col.label}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold shadow-2xs">
                  {colIncidents.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colIncidents.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                    Drop incidents here
                  </div>
                ) : (
                  colIncidents.map((inc) => {
                    const isResolved = inc.status === 'Resolved' || inc.status === 'Closed';

                    return (
                      <div
                        key={inc._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, inc._id)}
                        onClick={() => setSelectedIncident(inc)}
                        className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-cyan-500/50 transition-all cursor-grab active:cursor-grabbing space-y-2.5 ${
                          isResolved ? 'opacity-75' : ''
                        }`}
                      >
                        {/* Top ID & AI Risk badge */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            {inc.incidentId}
                          </span>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-mono font-extrabold text-[11px]">
                            <Zap className="w-3 h-3 text-purple-500" />
                            <span>{inc.aiScore || 75}%</span>
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                            {inc.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {inc.category}
                          </span>
                        </div>

                        {/* Location & Impact */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 truncate">
                            <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                            <span className="truncate">{inc.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-amber-500" />
                              {inc.affectedPeople || 1} people
                            </span>
                            <span className={`text-[10px] font-bold ${
                              isResolved ? 'text-emerald-500' : 'text-slate-400'
                            }`}>
                              {inc.status}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Assigned & Action Bar */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center">
                              {inc.assignedTo?.name ? inc.assignedTo.name.slice(0, 1) : '?'}
                            </div>
                            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-20">
                              {inc.assignedTo?.name || 'Unassigned'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {!isResolved && (
                              <button
                                onClick={(e) => handleQuickResolve(inc._id, e)}
                                title="Quick Resolve"
                                className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow-2xs"
                              >
                                <Check className="w-3 h-3" />
                                <span>Resolve</span>
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAssignIncident(inc);
                                }}
                                title="AI Smart Dispatch"
                                className="p-1 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <IncidentDetailModal
        isOpen={!!selectedIncident}
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdated={(upd) => {
          setSelectedIncident(upd);
          fetchIncidents();
        }}
        onOpenAssign={(inc) => {
          setSelectedIncident(null);
          setAssignIncident(inc);
        }}
      />

      <AssignStaffModal
        isOpen={!!assignIncident}
        incident={assignIncident}
        onClose={() => setAssignIncident(null)}
        onAssigned={() => {
          setAssignIncident(null);
          fetchIncidents();
        }}
      />
    </div>
  );
};
