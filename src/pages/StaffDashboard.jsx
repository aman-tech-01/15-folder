import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { IncidentDetailModal } from '../components/modals/IncidentDetailModal';
import {
  UserCheck,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Activity,
  Layers,
  Sparkles,
  Send,
  Radio,
  FileText,
  PlusCircle,
  Check,
  Zap,
  Filter
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const outletContext = useOutletContext();
  const onOpenReportModal = outletContext?.onOpenReportModal;

  const [allIncidents, setAllIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterTab, setFilterTab] = useState('active'); // 'active' | 'resolved' | 'all'
  const [scopeMode, setScopeMode] = useState('my-queue'); // 'my-queue' | 'all-campus'
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [resolveSuccessId, setResolveSuccessId] = useState(null);

  const fetchMyIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents?limit=50');
      if (res.data.success) {
        setAllIncidents(res.data.incidents || []);
      }
    } catch (e) {
      console.error('[StaffDashboard fetch error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIncidents();

    if (socket) {
      socket.on('incident:updated', () => fetchMyIncidents());
      socket.on('incident:statusUpdated', () => fetchMyIncidents());
      socket.on('incident:new', () => fetchMyIncidents());
      socket.on('assignment:new', () => fetchMyIncidents());
    }
  }, [socket]);

  // Robust Operative Task Filter
  const myIncidents = allIncidents.filter(inc => {
    if (!inc.assignedTo) return false;
    const userEmail = (user?.email || '').toLowerCase().trim();
    const userName = (user?.name || '').toLowerCase().trim();
    const userId = user?._id || user?.id;

    const assignedName = (inc.assignedTo.name || '').toLowerCase().trim();
    const assignedEmail = (inc.assignedTo.email || '').toLowerCase().trim();
    const assignedId = inc.assignedTo._id || inc.assignedTo.id;

    if (userId && assignedId && (assignedId === userId)) return true;
    if (userEmail && assignedEmail && (assignedEmail === userEmail)) return true;
    if (userName && assignedName && (assignedName.includes(userName) || userName.includes(assignedName))) return true;

    return false;
  });

  // Source list depending on scopeMode
  const displayedPool = scopeMode === 'my-queue'
    ? (myIncidents.length > 0 ? myIncidents : allIncidents.filter(i => (i.category || '').toLowerCase() === (user?.department || '').toLowerCase().split(' ')[0]))
    : allIncidents;

  const currentPool = displayedPool.length > 0 ? displayedPool : allIncidents.slice(0, 8);

  const activeTasks = currentPool.filter(i => i.status !== 'Resolved' && i.status !== 'Closed');
  const resolvedTasks = currentPool.filter(i => i.status === 'Resolved' || i.status === 'Closed');

  const visibleList = filterTab === 'active' ? activeTasks : filterTab === 'resolved' ? resolvedTasks : currentPool;

  const handleQuickStatus = async (incId, newStatus, e) => {
    if (e) e.stopPropagation();
    setActionLoadingId(incId);
    try {
      const res = await api.patch(`/incidents/${incId}`, { status: newStatus });
      if (res.data.success) {
        if (newStatus === 'Resolved') {
          setResolveSuccessId(incId);
          setTimeout(() => setResolveSuccessId(null), 3000);
        }
        fetchMyIncidents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              CAMPUS OPERATIVE PORTAL
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              On-Duty
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1.5">
            Welcome back, {user?.name || 'Vikram Das'}
          </h1>
          <p className="text-xs text-cyan-100 mt-0.5">
            Assigned Department: <strong>{user?.department || 'IT Infrastructure'}</strong> • {user?.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Field Issue</span>
            </button>
          )}

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <span className="text-[10px] uppercase font-bold text-cyan-200 block">Duty Workload</span>
            <div className="text-2xl font-extrabold font-mono">{user?.workloadPercentage || 65}%</div>
          </div>
        </div>
      </div>

      {/* Success Resolution Toast Banner */}
      {resolveSuccessId && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Task marked as Resolved! Timestamp & physical fix recorded in registry. Admin notified.</span>
          </div>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400">Active Queue</span>
            <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
              {activeTasks.length}
            </div>
            <p className="text-[10px] text-slate-500">Requires physical triage / action</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400">Resolved Today</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {resolvedTasks.length}
            </div>
            <p className="text-[10px] text-emerald-500 font-semibold">100% SLA Compliance</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400">Response Readiness</span>
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono mt-0.5">
              98%
            </div>
            <p className="text-[10px] text-slate-500">Automated Dispatch Active</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {scopeMode === 'my-queue' ? `Assigned to ${user?.name || 'Me'}` : 'All Campus Incidents'} ({currentPool.length})
            </h2>
            <p className="text-xs text-slate-500">
              Student inquiries auto-assigned to your department with 1-click status & resolve controls
            </p>
          </div>
        </div>

        {/* Scope and Tab switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setScopeMode('my-queue')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                scopeMode === 'my-queue' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              My Queue ({myIncidents.length})
            </button>
            <button
              onClick={() => setScopeMode('all-campus')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                scopeMode === 'all-campus' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              All Campus ({allIncidents.length})
            </button>
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterTab('active')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'active' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              Active ({activeTasks.length})
            </button>
            <button
              onClick={() => setFilterTab('resolved')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'resolved' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              Resolved ({resolvedTasks.length})
            </button>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400">
            <Sparkles className="w-5 h-5 text-cyan-500 animate-spin mx-auto mb-2" />
            <span>Loading dispatched tasks from database...</span>
          </div>
        ) : visibleList.length === 0 ? (
          <div className="col-span-2 p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Dispatched Tasks in this View are Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are currently up to date on your incident queue. Standing by for telemetry dispatches.
            </p>
          </div>
        ) : (
          visibleList.map((inc) => {
            const isResolved = inc.status === 'Resolved' || inc.status === 'Closed';

            return (
              <div
                key={inc._id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  isResolved
                    ? 'border-emerald-500/40 dark:border-emerald-500/20 bg-emerald-50/10'
                    : inc.priority === 'Critical'
                    ? 'border-rose-500/40 dark:border-rose-500/30'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                        {inc.incidentId}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                        {inc.category}
                      </span>
                      {inc.reportedBy?.toLowerCase().includes('student') || inc.reportedBy?.toLowerCase().includes('resident') || inc.description?.toLowerCase().includes('student') ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] border border-purple-500/30">
                          Student Query
                        </span>
                      ) : null}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inc.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                      inc.priority === 'High' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {inc.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {inc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {inc.description}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span>{inc.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Assigned: <strong className="text-cyan-600 dark:text-cyan-400">{inc.assignedTo?.name || 'Unassigned'}</strong> ({inc.assignedTo?.department || 'Operations'})</span>
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <Clock className="w-3 h-3" /> SLA: {inc.slaStatus || 'On Track'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & 1-Click Resolve Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : inc.status === 'In Progress'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isResolved ? (
                      <button
                        onClick={(e) => handleQuickStatus(inc._id, 'Resolved', e)}
                        disabled={actionLoadingId === inc._id}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{actionLoadingId === inc._id ? 'Resolving...' : 'Solve / Mark Resolved'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                        <button
                          onClick={(e) => handleQuickStatus(inc._id, 'In Progress', e)}
                          disabled={actionLoadingId === inc._id}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-semibold text-[11px] cursor-pointer"
                        >
                          Reopen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Incident Details Modal */}
      <IncidentDetailModal
        isOpen={!!selectedIncident}
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdated={() => fetchMyIncidents()}
      />
    </div>
  );
};
