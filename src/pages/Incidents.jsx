import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { IncidentDetailModal } from '../components/modals/IncidentDetailModal';
import { AssignStaffModal } from '../components/modals/AssignStaffModal';
import {
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  Clock,
  MapPin,
  Users,
  Shield,
  Trash2,
  Eye,
  UserCheck,
  Zap,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  Check,
  RotateCcw
} from 'lucide-react';

export const Incidents = () => {
  const { onOpenReportModal } = useOutletContext();
  const { isAdmin } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    active: 0,
    resolved: 0,
    slaBreached: 0
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [slaStatus, setSlaStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [resolvingId, setResolvingId] = useState(null);

  // Modals
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [assignIncident, setAssignIncident] = useState(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        sortBy,
        order
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (priority) params.append('priority', priority);
      if (status) params.append('status', status);
      if (slaStatus) params.append('slaStatus', slaStatus);

      const res = await api.get(`/incidents?${params.toString()}`);
      if (res.data.success) {
        setIncidents(res.data.incidents || []);
        setStats(res.data.stats || {});
        setTotalPages(res.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('[Fetch Incidents Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, category, priority, status, slaStatus, sortBy, order]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchIncidents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Real-time updates
  useEffect(() => {
    const handleSync = () => fetchIncidents();
    window.addEventListener('smartcampus_sync', handleSync);
    window.addEventListener('storage', handleSync);

    if (socket) {
      socket.on('incident:new', handleSync);
      socket.on('incident:updated', handleSync);
      socket.on('incident:priorityUpdated', handleSync);
      socket.on('incident:statusUpdated', handleSync);
      socket.on('incident:deleted', handleSync);
    }

    return () => {
      window.removeEventListener('smartcampus_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [socket]);

  const handleQuickResolve = async (id, currentStatus, e) => {
    e.stopPropagation();
    setResolvingId(id);
    const targetStatus = currentStatus === 'Resolved' ? 'In Progress' : 'Resolved';
    try {
      const res = await api.patch(`/incidents/${id}/status`, { status: targetStatus });
      if (res.data.success) {
        fetchIncidents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setResolvingId(null);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this incident record from the database?')) return;
    try {
      const res = await api.delete(`/incidents/${id}`);
      if (res.data.success) {
        fetchIncidents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete incident.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Incident Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Central database of all operational, safety, and infrastructure alerts with room-level tracking.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Top Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Records</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{stats.total || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Critical</span>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">{stats.critical || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">High Priority</span>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">{stats.high || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">Active Queue</span>
          <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">{stats.active || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Resolved</span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{stats.resolved || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">SLA Breached</span>
          <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300 font-mono mt-0.5">{stats.slaBreached || 0}</div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, title, room, location, keywords..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Categories</option>
              {['Medical', 'Security', 'Network', 'Electrical', 'Fire', 'Infrastructure', 'Transport', 'Hostel', 'Academic', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* SLA */}
          <div>
            <select
              value={slaStatus}
              onChange={(e) => { setSlaStatus(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All SLAs</option>
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Breached">Breached</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Location & Room</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">AI Risk</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">SLA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-500 animate-spin" />
                      <span>Loading incidents from database...</span>
                    </div>
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No incidents found matching query parameters.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => {
                  const isResolved = inc.status === 'Resolved' || inc.status === 'Closed';

                  return (
                    <tr
                      key={inc._id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        isResolved ? 'opacity-85' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                        {inc.incidentId}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {inc.title}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 block truncate">
                          {inc.category} • {inc.affectedPeople || 1} people affected
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[200px]">
                        <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white truncate">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span className="truncate">{inc.location}</span>
                        </div>
                        {inc.roomDetails && inc.roomDetails !== inc.location && (
                          <span className="text-[10px] text-slate-400 block truncate ml-4">
                            Room: {inc.roomDetails}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inc.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                          inc.priority === 'High' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                          'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {inc.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono font-bold text-purple-600 dark:text-purple-400">
                          <Zap className="w-3 h-3" />
                          <span>{inc.aiScore || 70}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {inc.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-cyan-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {inc.assignedTo.name?.slice(0, 1)}
                            </div>
                            <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-28">
                              {inc.assignedTo.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold ${
                          inc.slaStatus === 'Breached' ? 'text-rose-500 font-bold' :
                          inc.slaStatus === 'At Risk' ? 'text-amber-500 font-bold' :
                          'text-emerald-500'
                        }`}>
                          {inc.slaStatus || 'On Track'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {inc.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* 1-Click Resolve Button */}
                          {!isResolved ? (
                            <button
                              onClick={(e) => handleQuickResolve(inc._id, inc.status, e)}
                              disabled={resolvingId === inc._id}
                              title="Mark as Resolved"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              <span>Resolve</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleQuickResolve(inc._id, inc.status, e)}
                              disabled={resolvingId === inc._id}
                              title="Reopen Incident"
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-semibold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Reopen</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedIncident(inc)}
                            title="View Full Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => setAssignIncident(inc)}
                              title="AI Smart Dispatch"
                              className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={(e) => handleDelete(inc._id, e)}
                              title="Delete Incident Record"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Total Incidents: {incidents.length} records</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
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
