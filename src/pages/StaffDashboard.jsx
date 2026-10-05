import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
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
  Filter,
  Ticket,
  ArrowRight,
  Shield,
  RotateCcw
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user, login } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const onOpenReportModal = outletContext?.onOpenReportModal;

  const [allIncidents, setAllIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterTab, setFilterTab] = useState('all-unresolved'); // 'my-queue' | 'student-queries' | 'all-unresolved' | 'resolved'
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [resolveSuccessId, setResolveSuccessId] = useState(null);
  const [quickSimulating, setQuickSimulating] = useState(false);

  const staffRoster = [
    { name: 'Vikram Das', dept: 'IT Infrastructure', email: 'staff@campus.com', focus: 'Wi-Fi, Servers & Network' },
    { name: 'Priya Sharma', dept: 'Facilities & Safety', email: 'priya@campus.com', focus: 'Hostel, Geysers & Water' },
    { name: 'Rahul Verma', dept: 'Electrical & Power', email: 'rahul@campus.com', focus: 'Power, Substation & AC' },
    { name: 'Dr. Ananya Roy', dept: 'Medical Services', email: 'ananya@campus.com', focus: 'SOS Clinic & First Aid' },
    { name: 'Capt. Suresh', dept: 'Campus Security', email: 'suresh@campus.com', focus: 'Perimeter, Gates & Locks' }
  ];

  const fetchMyIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents?limit=100');
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

    // Listen to local sync events & socket events
    const handleSync = () => fetchMyIncidents();
    window.addEventListener('smartcampus_sync', handleSync);
    window.addEventListener('storage', handleSync);

    if (socket) {
      socket.on('incident:updated', handleSync);
      socket.on('incident:statusUpdated', handleSync);
      socket.on('incident:new', handleSync);
      socket.on('assignment:new', handleSync);
    }

    return () => {
      window.removeEventListener('smartcampus_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [socket]);

  // Robust Operative Task Filter
  const userEmail = (user?.email || '').toLowerCase().trim();
  const userName = (user?.name || '').toLowerCase().trim();
  const userId = user?._id || user?.id;

  const isAssignedToMe = (inc) => {
    if (!inc.assignedTo) return false;
    const assignedName = (inc.assignedTo.name || '').toLowerCase().trim();
    const assignedEmail = (inc.assignedTo.email || '').toLowerCase().trim();
    const assignedId = inc.assignedTo._id || inc.assignedTo.id;

    if (userId && assignedId && (assignedId === userId)) return true;
    if (userEmail && assignedEmail && (assignedEmail === userEmail)) return true;
    if (userName && assignedName && (assignedName.includes(userName) || userName.includes(assignedName))) return true;

    // Category affinity fallback
    const deptWord = (user?.department || '').toLowerCase().split(' ')[0];
    if (deptWord && inc.category?.toLowerCase().includes(deptWord)) return true;

    return false;
  };

  const myDirectIncidents = allIncidents.filter(isAssignedToMe);

  const studentQueries = allIncidents.filter(inc =>
    (inc.reportedBy?.toLowerCase().includes('student') ||
     inc.reportedBy?.toLowerCase().includes('resident') ||
     inc.reportedBy?.toLowerCase().includes('portal') ||
     inc.reportedBy?.toLowerCase().includes('helpdesk') ||
     inc.description?.toLowerCase().includes('student') ||
     inc.incidentId?.startsWith('INC-S') ||
     inc.category === 'Hostel') &&
    inc.status !== 'Resolved' && inc.status !== 'Closed'
  );

  const activeAll = allIncidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed');
  const resolvedAll = allIncidents.filter(i => i.status === 'Resolved' || i.status === 'Closed');

  // Compute displayed list based on active tab
  let displayedList = [];
  if (filterTab === 'my-queue') {
    displayedList = myDirectIncidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed');
    if (displayedList.length === 0) displayedList = myDirectIncidents;
  } else if (filterTab === 'student-queries') {
    displayedList = studentQueries;
  } else if (filterTab === 'resolved') {
    displayedList = resolvedAll;
  } else {
    // all-unresolved
    displayedList = activeAll;
  }

  const handleQuickStatus = async (incId, newStatus, e) => {
    if (e) e.stopPropagation();
    setActionLoadingId(incId);
    try {
      const res = await api.patch(`/incidents/${incId}`, { status: newStatus });
      if (res.data.success) {
        if (newStatus === 'Resolved') {
          setResolveSuccessId(incId);
          setTimeout(() => setResolveSuccessId(null), 4000);
        }
        fetchMyIncidents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickSwitchStaff = async (staffObj) => {
    try {
      await login(staffObj.email, 'Staff@123');
    } catch (e) {}
  };

  const handleCreateTestStudentQuery = async () => {
    setQuickSimulating(true);
    try {
      const sampleQueries = [
        { name: 'Rohit Sharma (Hostel B)', category: 'Hostel', facility: 'Hostel B - Room 304', msg: 'Bathroom water heater/geyser tripping circuit breaker repeatedly.', sev: 'High' },
        { name: 'Aarav Patel (Hostel A)', category: 'Network', facility: 'Hostel A - 2nd Floor', msg: 'Hostel Wi-Fi AP constantly disconnecting during online lab submission.', sev: 'Medium' },
        { name: 'Sneha Roy (Computer Center)', category: 'Electrical', facility: 'Computer Center - Lab 3', msg: 'AC cooling unit blowing warm air, server rack temperature rising.', sev: 'Critical' }
      ];
      const pick = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];

      await api.post('/incidents', {
        title: `${pick.category}: ${pick.msg.slice(0, 42)}...`,
        description: `Student Grievance submitted by ${pick.name}.\nIssue Details: ${pick.msg}`,
        category: pick.category,
        location: pick.facility,
        roomDetails: pick.facility,
        severity: pick.sev,
        priority: pick.sev,
        reportedBy: `${pick.name} (Student)`
      });

      fetchMyIncidents();
    } catch (e) {
      alert('Simulation error');
    } finally {
      setQuickSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              CAMPUS OPERATIVE COMMAND PORTAL
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              On-Duty Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1.5">
            Welcome back, {user?.name || 'Vikram Das'}
          </h1>
          <p className="text-xs text-cyan-100 mt-0.5">
            Department: <strong>{user?.department || 'IT Infrastructure'}</strong> • {user?.email}
          </p>
        </div>

        {/* Quick Presentation Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCreateTestStudentQuery}
            disabled={quickSimulating}
            className="px-3 py-2 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Simulate student submitting a grievance from landing page"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>{quickSimulating ? 'Simulating...' : '+ Simulate Student Grievance'}</span>
          </button>

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Field Issue</span>
            </button>
          )}

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-right min-w-24">
            <span className="text-[10px] uppercase font-bold text-cyan-200 block">Duty Load</span>
            <div className="text-xl font-extrabold font-mono">{user?.workloadPercentage || 45}%</div>
          </div>
        </div>
      </div>

      {/* Operative Identity Switcher Bar (For Live Project Presentation) */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Switch Operative Profile (Demo Presentation):
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {staffRoster.map((st) => {
            const isCurrent = (user?.email || '').toLowerCase() === st.email.toLowerCase();
            return (
              <button
                key={st.email}
                onClick={() => handleQuickSwitchStaff(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-cyan-600 text-white shadow-sm font-bold ring-2 ring-cyan-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{st.name}</span>
                <span className="text-[10px] opacity-80">({st.dept.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Resolution Toast Banner */}
      {resolveSuccessId && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Task marked as RESOLVED on-site! Timestamp and physical fix logged to audit trail.</span>
          </div>
          <span className="font-mono text-xs underline cursor-pointer" onClick={() => fetchMyIncidents()}>Refresh Data</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Student Helpdesk Queue */}
        <div
          onClick={() => setFilterTab('student-queries')}
          className={`p-4 rounded-3xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            filterTab === 'student-queries'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-purple-400'
          }`}
        >
          <div>
            <span className="text-[11px] uppercase font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5" />
              Student Grievances
            </span>
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono mt-0.5">
              {studentQueries.length}
            </div>
            <p className="text-[10px] text-slate-500">Submitted via campus portal</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Assigned to Current Operative */}
        <div
          onClick={() => setFilterTab('my-queue')}
          className={`p-4 rounded-3xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            filterTab === 'my-queue'
              ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-cyan-400'
          }`}
        >
          <div>
            <span className="text-[11px] uppercase font-bold text-cyan-600 dark:text-cyan-400">
              Assigned to {user?.name?.split(' ')[0] || 'Me'}
            </span>
            <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
              {myDirectIncidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length}
            </div>
            <p className="text-[10px] text-slate-500">Requires your on-site action</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* All Active Campus Incidents */}
        <div
          onClick={() => setFilterTab('all-unresolved')}
          className={`p-4 rounded-3xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            filterTab === 'all-unresolved'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div>
            <span className="text-[11px] uppercase font-bold text-amber-600 dark:text-amber-400">
              All Active Queue
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {activeAll.length}
            </div>
            <p className="text-[10px] text-slate-500">Across 9 campus facilities</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Resolved Today */}
        <div
          onClick={() => setFilterTab('resolved')}
          className={`p-4 rounded-3xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            filterTab === 'resolved'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div>
            <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
              Resolved Today
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {resolvedAll.length}
            </div>
            <p className="text-[10px] text-emerald-500 font-semibold">100% SLA turnaround</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>
              {filterTab === 'my-queue' ? `Direct Tasks for ${user?.name || 'Operative'}` :
               filterTab === 'student-queries' ? 'Live Student Grievance & Helpdesk Queue' :
               filterTab === 'resolved' ? 'Resolved & Closed Incident Records' :
               'All Campus Incident Operations'}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
              {displayedList.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Click any task to inspect details, add inspection notes, or 1-click solve on-site.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setFilterTab('student-queries')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'student-queries'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Student Queries ({studentQueries.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('my-queue')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'my-queue'
                ? 'bg-cyan-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            My Queue ({myDirectIncidents.length})
          </button>

          <button
            onClick={() => setFilterTab('all-unresolved')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all-unresolved'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            All Campus ({activeAll.length})
          </button>

          <button
            onClick={() => setFilterTab('resolved')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'resolved'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Resolved ({resolvedAll.length})
          </button>
        </div>
      </div>

      {/* Incidents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400">
            <Sparkles className="w-5 h-5 text-cyan-500 animate-spin mx-auto mb-2" />
            <span>Loading active task queue from database...</span>
          </div>
        ) : displayedList.length === 0 ? (
          <div className="col-span-2 p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Tasks in this Queue are Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No outstanding issues in this section. Standing by for telemetry dispatches and incoming student tickets.
            </p>
          </div>
        ) : (
          displayedList.map((inc) => {
            const isResolved = inc.status === 'Resolved' || inc.status === 'Closed';
            const isStudentQuery =
              inc.reportedBy?.toLowerCase().includes('student') ||
              inc.reportedBy?.toLowerCase().includes('resident') ||
              inc.reportedBy?.toLowerCase().includes('portal') ||
              inc.description?.toLowerCase().includes('student') ||
              inc.incidentId?.startsWith('INC-S');

            return (
              <div
                key={inc._id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  isResolved
                    ? 'border-emerald-500/40 dark:border-emerald-500/20 bg-emerald-50/10'
                    : isStudentQuery
                    ? 'border-purple-500/50 dark:border-purple-500/40 hover:border-purple-400 bg-purple-50/5'
                    : inc.priority === 'Critical'
                    ? 'border-rose-500/50 dark:border-rose-500/40 hover:border-rose-400'
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
                      {isStudentQuery && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-[10px] border border-purple-500/30 flex items-center gap-1">
                          <Ticket className="w-3 h-3" />
                          Student Grievance
                        </span>
                      )}
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
                      <span>
                        Assigned: <strong className="text-cyan-600 dark:text-cyan-400">{inc.assignedTo?.name || 'In Triage Queue'}</strong> ({inc.assignedTo?.department || 'Operations'})
                      </span>
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <Clock className="w-3 h-3" /> SLA: {inc.slaStatus || 'On Track (2h)'}
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
