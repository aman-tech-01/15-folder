import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { AssignStaffModal } from '../components/modals/AssignStaffModal';
import { IncidentDetailModal } from '../components/modals/IncidentDetailModal';
import {
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  Radio,
  PlusCircle,
  Send,
  MapPin,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const CommandCenter = () => {
  const { onOpenReportModal } = useOutletContext();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    incidentLoad: 9,
    activeIncidents: 9,
    criticalAlerts: 2,
    highPriorityAlerts: 4,
    resolvedToday: 11,
    resolvedIncidents: 11,
    totalStaff: 7,
    overloadedStaff: 3,
    availableTeams: 7,
    totalTeams: 11,
    responseCapacity: 74,
    safetyReadiness: 92
  });

  const [recentIncidents, setRecentIncidents] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [liveActivities, setLiveActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected modals
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [assignModalIncident, setAssignModalIncident] = useState(null);

  // Digital campus time and uptime
  const [campusTime, setCampusTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCampusTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, incidentsRes, trendsRes, activitiesRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/incidents?limit=6&sortBy=createdAt&order=desc'),
        api.get('/analytics/trends?days=7'),
        api.get('/activities?limit=5')
      ]);

      if (overviewRes.data.success) {
        setStats(overviewRes.data.stats);
      }
      if (incidentsRes.data.success) {
        setRecentIncidents(incidentsRes.data.incidents || []);
      }
      if (trendsRes.data.success) {
        setTrendData(trendsRes.data.timeline || []);
      }
      if (activitiesRes.data.success) {
        setLiveActivities(activitiesRes.data.activities || []);
      }
    } catch (e) {
      console.error('[CommandCenter Fetch Error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleSync = () => fetchDashboardData();
    window.addEventListener('smartcampus_sync', handleSync);
    window.addEventListener('storage', handleSync);

    if (socket) {
      socket.on('incident:new', (newInc) => {
        setRecentIncidents(prev => [newInc, ...prev.slice(0, 5)]);
        fetchDashboardData();
      });
      socket.on('incident:updated', handleSync);
      socket.on('incident:priorityUpdated', handleSync);
      socket.on('incident:statusUpdated', handleSync);
      socket.on('activity:new', (act) => {
        setLiveActivities(prev => [act, ...prev.slice(0, 4)]);
      });
    }

    return () => {
      window.removeEventListener('smartcampus_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [socket]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time metrics, incident queues and campus subsystem telemetry.
          </p>
        </div>

        {/* Quick Actions Toolbar (Matches Image 5) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-semibold hover:bg-cyan-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Incident</span>
          </button>

          <button
            onClick={() => navigate('/people-teams')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Dispatch Team</span>
          </button>

          <button
            onClick={() => navigate('/campus-map')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>View Campus Map</span>
          </button>

          <button
            onClick={() => navigate('/priority-queue')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Priority Kanban</span>
          </button>
        </div>
      </div>

      {/* 4 Top Stat Cards (Matches Image 4 & 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Active Incidents / Incident Load */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Incidents
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.activeIncidents ?? 9}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>{stats.highPriorityAlerts ?? 4} high priority alerts</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">Queue Active</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.activeIncidents / 15) * 100)}%` }}></div>
          </div>
        </div>

        {/* Card 2: Critical Alerts / Response Capacity */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/40 dark:border-rose-500/30 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Critical Alerts
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {stats.criticalAlerts ?? 2}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>Response: {stats.responseCapacity}%</span>
              <span className="text-rose-500 font-bold">Action Required</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${stats.responseCapacity}%` }}></div>
          </div>
        </div>

        {/* Card 3: Resolved Today */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resolved Today
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.resolvedToday ?? 11}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>Operations nominal</span>
              <span className="text-emerald-500 font-bold">SLA: On Track</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Card 4: Current Campus Time & Total Staff */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Campus Time
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
              IST
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {campusTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>{campusTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">UPTIME 14d 06:42:18</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Staff Roster: {stats.totalStaff || 7} total</span>
            <span className="text-amber-500 font-bold">{stats.overloadedStaff || 3} overloaded</span>
          </div>
        </div>
      </div>

      {/* Operations Trend Chart (Matches Image 4) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              7-DAY INCIDENT TREND
            </span>
            <p className="text-xs text-slate-500">Autonomous telemetry & response velocity</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Reported</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2"></span>
              <span className="text-slate-600 dark:text-slate-400">Resolved</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              System Nominal
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="reported" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReported)" />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lower Section: Priority Queue Live Grid & Campus Safety Status (Matches Image 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Queue Live Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                PRIORITY QUEUE (LIVE)
              </h2>
              <p className="text-xs text-slate-500">Active incidents with autonomous AI severity scores</p>
            </div>
            <button
              onClick={() => navigate('/priority-queue')}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentIncidents.map((inc) => (
              <div
                key={inc._id}
                onClick={() => setSelectedIncident(inc)}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      inc.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                      inc.priority === 'High' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                    }`}>
                      {inc.priority}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-400">
                      {inc.incidentId}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {inc.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1 truncate max-w-32">
                      <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
                      {inc.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-500 shrink-0" />
                      {inc.affectedPeople || 1} People
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Status • SLA</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {inc.status} • {inc.slaStatus || 'In Queue'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 font-mono font-bold text-xs">
                    <Zap className="w-3 h-3 text-cyan-500" />
                    <span>{inc.aiScore || 85}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Campus Safety Status & System Array (Matches Image 5) */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Campus Safety Status
              </h2>
              <p className="text-xs text-slate-500">Autonomous readiness index</p>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Emergency Response', status: 'ACTIVE' },
                { name: 'Security Teams', status: 'ACTIVE' },
                { name: 'Medical Response', status: 'ACTIVE' },
                { name: 'Fire Safety', status: 'ACTIVE' },
                { name: 'Campus Comms', status: 'ACTIVE' }
              ].map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-none">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{sub.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] tracking-wider">
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">SAFETY READINESS</span>
                <span className="text-emerald-500 font-mono font-extrabold">{stats.safetyReadiness || 92}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.safetyReadiness || 92}%` }}></div>
              </div>
            </div>
          </div>

          {/* Live Activity Quick Feed */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Live Activity Log
              </span>
              <Radio className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {liveActivities.slice(0, 4).map((act, i) => (
                <div key={act._id || i} className="pt-2 text-xs">
                  <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight">
                    {act.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.location || 'Campus Core'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Incident Details & Assign Modals */}
      <IncidentDetailModal
        isOpen={!!selectedIncident}
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdated={(upd) => {
          setSelectedIncident(upd);
          fetchDashboardData();
        }}
        onOpenAssign={(inc) => {
          setSelectedIncident(null);
          setAssignModalIncident(inc);
        }}
      />

      <AssignStaffModal
        isOpen={!!assignModalIncident}
        incident={assignModalIncident}
        onClose={() => setAssignModalIncident(null)}
        onAssigned={() => {
          setAssignModalIncident(null);
          fetchDashboardData();
        }}
      />
    </div>
  );
};
