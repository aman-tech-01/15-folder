import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileText,
  Shield,
  Search,
  Clock,
  UserCheck,
  AlertTriangle,
  Lock,
  Layers
} from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs?limit=50');
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (e) {
      console.error('[AuditLogs fetch error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Security Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Immutable timeline of system logins, policy adjustments, and emergency protocol state changes.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user, target..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operative</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {log.userName}
                      <span className="text-[10px] text-slate-400 block">{log.userRole}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[10px] text-cyan-600 dark:text-cyan-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {log.target}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
