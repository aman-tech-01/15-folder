import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  Layers,
  Users,
  MapPin,
  Activity,
  BarChart3,
  MessageSquare,
  Settings,
  ShieldCheck,
  FileText,
  UserCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const navGroups = [
    {
      label: 'OPERATIONS',
      items: [
        { name: 'Command Center', path: '/command-center', icon: LayoutDashboard },
        { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
        { name: 'Priority Queue', path: '/priority-queue', icon: Layers },
      ]
    },
    {
      label: 'RESOURCES',
      items: [
        { name: 'People & Teams', path: '/people-teams', icon: Users },
        { name: 'Campus Map', path: '/campus-map', icon: MapPin },
        { name: 'Live Activity', path: '/live-activity', icon: Activity },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Communications', path: '/communications', icon: MessageSquare },
        ...(isAdmin
          ? [
              { name: 'Global Settings', path: '/settings', icon: Settings },
              { name: 'Audit Logs', path: '/audit-logs', icon: FileText }
            ]
          : [
              { name: 'My Staff Portal', path: '/staff-dashboard', icon: UserCheck }
            ])
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between py-5 px-3 select-none transition-colors shrink-0">
      <div className="space-y-6">
        {/* Role badge */}
        <div className="px-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-purple-500 ring-4 ring-purple-500/20' : 'bg-cyan-500 ring-4 ring-cyan-500/20'}`}></span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
              {isAdmin ? 'ADMIN PANEL ACTIVE' : 'STAFF DUTY ACTIVE'}
            </span>
          </div>
        </div>

        {/* Nav list */}
        <div className="space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {group.label}
              </div>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800/50 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom info footer */}
      <div className="px-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Core Version</span>
            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">v2.6-AI</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>Node Cluster</span>
            <span className="text-emerald-500 font-semibold">Healthy</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
