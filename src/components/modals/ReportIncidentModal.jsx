import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  X,
  AlertTriangle,
  Sparkles,
  MapPin,
  Users,
  Layers,
  FileText,
  Activity,
  Building,
  Wrench
} from 'lucide-react';

export const ReportIncidentModal = ({ isOpen, onClose, onIncidentCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Medical');
  const [location, setLocation] = useState('Main Admin Block');
  const [roomDetails, setRoomDetails] = useState('');
  const [equipmentFault, setEquipmentFault] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [affectedPeople, setAffectedPeople] = useState(1);
  const [notes, setNotes] = useState('');
  const [locationsList, setLocationsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Live estimated AI score
  const [previewScore, setPreviewScore] = useState(50);
  const [previewPriority, setPreviewPriority] = useState('Medium');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        if (res.data.success) {
          setLocationsList(res.data.locations || []);
        }
      } catch (e) {}
    };
    if (isOpen) {
      fetchLocations();
    }
  }, [isOpen]);

  // Compute live AI Score client-side preview
  useEffect(() => {
    let score = 0;
    if (severity === 'Critical') score += 35;
    else if (severity === 'High') score += 25;
    else if (severity === 'Medium') score += 15;
    else score += 5;

    if (['Medical', 'Fire', 'Security'].includes(category)) score += 30;
    else if (['Electrical', 'Infrastructure', 'Network'].includes(category)) score += 18;
    else score += 10;

    const count = Number(affectedPeople) || 1;
    if (count >= 100) score += 20;
    else if (count >= 50) score += 15;
    else if (count >= 20) score += 10;
    else if (count >= 5) score += 6;
    else score += 3;

    score = Math.min(99, Math.max(12, score));
    setPreviewScore(score);

    if (score >= 80) setPreviewPriority('Critical');
    else if (score >= 60) setPreviewPriority('High');
    else if (score >= 35) setPreviewPriority('Medium');
    else setPreviewPriority('Low');
  }, [category, severity, affectedPeople, location]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const fullLocationString = roomDetails ? `${location} - ${roomDetails}` : location;
    const fullDescription = equipmentFault ? `[Fault Component: ${equipmentFault}] ${description}` : description;

    try {
      const res = await api.post('/incidents', {
        title,
        description: fullDescription,
        category,
        location: fullLocationString,
        roomDetails: roomDetails || location,
        severity,
        affectedPeople: Number(affectedPeople),
        priority: previewPriority,
        notes
      });

      if (res.data.success) {
        if (onIncidentCreated) onIncidentCreated(res.data.incident);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setRoomDetails('');
        setEquipmentFault('');
        setNotes('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register incident.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Register Campus Incident</h2>
              <p className="text-xs text-slate-500">Autonomous AI classification & room-level hazard tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Scoring live badge */}
        <div className="mx-6 mt-4 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-indigo-950/20 to-purple-950/20 border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500 animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">AI Prioritization Engine</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Calculated dynamic risk based on severity & headcount</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              previewPriority === 'Critical' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' :
              previewPriority === 'High' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
              'bg-cyan-500/20 text-cyan-500 border border-cyan-500/30'
            }`}>
              {previewPriority} Priority
            </span>
            <div className="px-2 py-1 rounded-lg bg-slate-900 text-cyan-400 font-mono font-extrabold text-xs">
              ⚡ {previewScore}%
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Incident Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wi-Fi AP Controller Reboot Loop in Hostel B"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Building & Room Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Campus Facility / Building *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                {locationsList.length > 0 ? (
                  locationsList.map((loc) => (
                    <option key={loc._id || loc.name} value={loc.name}>{loc.name}</option>
                  ))
                ) : (
                  ['Main Admin Block', 'Computer Center', 'Hostel A', 'Hostel B', 'Medical Center', 'Main Ground', 'Library Hub', 'Academic Complex', 'Transport & Parking Hub'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Specific Room / Floor / Lab *
              </label>
              <input
                type="text"
                required
                value={roomDetails}
                onChange={(e) => setRoomDetails(e.target.value)}
                placeholder="e.g. Lab 302 (3rd Floor) / Room 114 / Server Rack 4B"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Equipment / Subsystem Fault */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                {['Medical', 'Security', 'Network', 'Electrical', 'Fire', 'Infrastructure', 'Transport', 'Hostel', 'Academic', 'Other'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Affected Equipment / Subsystem (Optional)
              </label>
              <input
                type="text"
                value={equipmentFault}
                onChange={(e) => setEquipmentFault(e.target.value)}
                placeholder="e.g. AC Chiller Compressor, Wi-Fi AP 302, Water Flange"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Critical">Critical (Immediate Hazard / Outage)</option>
                <option value="High">High (Major Disruption)</option>
                <option value="Medium">Medium (Moderate Impact)</option>
                <option value="Low">Low (Minor / Routine)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Estimated People Affected
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Incident Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe telemetry indicators, physical observations, equipment fault details, or emergency specifics..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Initial Operational Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paramedic van pre-alerted / HVAC contractor notified"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Registering & Scoring...' : 'Submit Incident & Trigger AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
