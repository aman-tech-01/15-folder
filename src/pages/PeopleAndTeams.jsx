import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  X,
  Search,
  Zap,
  Sparkles,
  Shield
} from 'lucide-react';

export const PeopleAndTeams = () => {
  const { isAdmin } = useAuth();
  const { socket } = useSocket();

  const [staffList, setStaffList] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'teams'
  const [search, setSearch] = useState('');

  // Add / Edit Staff Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'IT Infrastructure',
    skills: '',
    phone: '',
    availability: 'AVAILABLE'
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, teamsRes] = await Promise.all([
        api.get('/users?role=STAFF'),
        api.get('/teams')
      ]);
      if (usersRes.data.success) {
        setStaffList(usersRes.data.users || []);
      }
      if (teamsRes.data.success) {
        setTeams(teamsRes.data.teams || []);
      }
    } catch (e) {
      console.error('[PeopleAndTeams fetch error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('user:updated', () => fetchData());
      socket.on('user:created', () => fetchData());
      socket.on('user:deleted', () => fetchData());
    }
  }, [socket]);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      password: 'Staff@123',
      department: 'IT Infrastructure',
      skills: 'Network Routing, Server Hardware, Fiber Optics',
      phone: '+91 98765 00000',
      availability: 'AVAILABLE'
    });
    setModalError('');
    setIsStaffModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '',
      department: staff.department,
      skills: staff.skills?.join(', ') || '',
      phone: staff.phone || '',
      availability: staff.availability || 'AVAILABLE'
    });
    setModalError('');
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name || 'this staff personnel'} from active roster?`)) return;
    try {
      const res = await api.delete(`/users/${id}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleStaffFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      if (editingStaff) {
        await api.put(`/users/${editingStaff._id || editingStaff.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setIsStaffModalOpen(false);
      fetchData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            People & Response Teams
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Active roster, skill profiler, real-time workload gauges and team allocation.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Operative</span>
          </button>
        )}
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Personnel</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{staffList.length}</div>
          <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">Active in Roster</p>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Available Standby</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {staffList.filter(s => s.availability === 'AVAILABLE').length}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">Ready for Dispatch</p>
        </div>

        <div className="p-4 rounded-3xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">On Duty (Busy)</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {staffList.filter(s => s.availability === 'BUSY').length}
          </div>
          <p className="text-[10px] text-amber-600 font-semibold">Active Field Triage</p>
        </div>

        <div className="p-4 rounded-3xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Response Teams</span>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono mt-0.5">{teams.length}</div>
          <p className="text-[10px] text-purple-600 font-semibold">Specialized Units</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active Roster ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Response Teams ({teams.length})
          </button>
        </div>

        {activeTab === 'staff' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, department, skill..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        )}
      </div>

      {/* Staff Grid View */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff._id || staff.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {staff.name ? staff.name.slice(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {staff.name}
                      </h3>
                      <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                        {staff.department}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    staff.availability === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                    staff.availability === 'BUSY' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {staff.availability}
                  </span>
                </div>

                {/* Contact */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{staff.phone || '+91 98765 43210'}</span>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="mt-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Skills & Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {staff.skills?.map((sk, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workload Progress Gauge */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Live Duty Workload</span>
                  <span className={staff.workloadPercentage >= 80 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                    {staff.workloadPercentage || 40}% {staff.workloadPercentage >= 80 ? '(Overloaded)' : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      staff.workloadPercentage >= 80 ? 'bg-rose-500' :
                      staff.workloadPercentage >= 50 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${staff.workloadPercentage || 40}%` }}
                  ></div>
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(staff)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Operative Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff._id || staff.id, staff.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove from Roster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teams Tab View */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div
              key={t._id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h3>
                    <p className="text-xs text-slate-500">{t.department}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
                  {t.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Assigned Team Members ({t.members?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2">
                  {t.members?.map((m, idx) => (
                    <span key={m._id || idx} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {m.name || m}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Specializations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {t.specialization?.map((spec, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-semibold">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingStaff ? 'Edit Staff Operative' : 'Add Staff Operative'}
              </h2>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleStaffFormSubmit} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul@campus.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 11003"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="IT Infrastructure">IT Infrastructure</option>
                    <option value="Medical Services">Medical Services</option>
                    <option value="Campus Security">Campus Security</option>
                    <option value="Facilities & Safety">Facilities & Safety</option>
                    <option value="Electrical & Power">Electrical & Power</option>
                    <option value="Transport & Logistics">Transport & Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BUSY">BUSY</option>
                    <option value="OFF_DUTY">OFF_DUTY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Substation Maintenance, High Voltage, UPS Power"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingStaff ? 'Save Changes' : 'Create Staff User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
