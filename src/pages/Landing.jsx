import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ReportIncidentModal } from '../components/modals/ReportIncidentModal';
import api from '../services/api';
import {
  Shield,
  Users,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  MapPin,
  Lock,
  Radio,
  FileText,
  Mail,
  Phone,
  Building,
  Search,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  AlertOctagon,
  Cpu,
  Eye,
  PlusCircle,
  Ticket
} from 'lucide-react';

export const Landing = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Working search state for main page
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Student Report Issue Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Quick contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    facility: 'Hostel B',
    room: '',
    category: 'Hostel',
    severity: 'Medium',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [submittingContact, setSubmittingContact] = useState(false);

  // Live Ticket Status Tracker state
  const [trackTicketId, setTrackTicketId] = useState('');
  const [trackedIncident, setTrackedIncident] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  const searchableItems = [
    { title: 'Hostel A & Hostel B Residences (Geyser, Water & Wi-Fi)', category: 'Hostel', desc: 'Report residential plumbing, electricity, or Wi-Fi faults', link: '#contact' },
    { title: 'Computer Center - Server Rack 4B', category: 'Location', desc: 'Central data center, HPC compute cluster & fiber switchboards', link: '/staff-login' },
    { title: 'Medical Center & Ambulance Unit', category: 'Healthcare', desc: '24/7 campus emergency hospital, ICU beds & trauma dispatch', link: '/staff-login' },
    { title: 'Main Ground & Sports Pavilion', category: 'Sports', desc: 'Athletic tracks, stadiums & outdoor event grounds', link: '/staff-login' },
    { title: 'Library Hub & Digital Archives', category: 'Academic', desc: 'Central university library & digital repository center', link: '/staff-login' },
    { title: 'Academic Complex & Auditoriums 1-6', category: 'Academic', desc: 'Main lecture theaters, Chemlab 2 & seminar auditoriums', link: '/staff-login' },
    { title: 'Transport & Parking Hub (ANPR Gate 1)', category: 'Security', desc: 'Fleet depot, EV fast chargers & main access control gate', link: '/staff-login' },
    { title: 'Emergency Dispatch Hotline: +91 1800 123 4567', category: 'Emergency', desc: '24/7 campus SOS security, ambulance & fire incident line', link: '#contact' },
    { title: 'AI Prioritization Kanban System', category: 'Module', desc: 'Automated hazard risk assessment & drag-drop triage queue', link: '/staff-login' },
    { title: 'Live IoT Sensor Telemetry & CCTV', category: 'Telemetry', desc: 'Real-time thermal, power draw, AQI & optical feed monitor', link: '/staff-login' }
  ];

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filtered = searchableItems.filter(item =>
      item.title.toLowerCase().includes(q.toLowerCase()) ||
      item.desc.toLowerCase().includes(q.toLowerCase()) ||
      item.category.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setSubmittingContact(true);

    try {
      const fullLocation = contactForm.room ? `${contactForm.facility} - ${contactForm.room}` : contactForm.facility;
      const res = await api.post('/incidents', {
        title: `${contactForm.category}: ${contactForm.message.slice(0, 45)}...`,
        description: `Reported by Student/Resident: ${contactForm.name} (${contactForm.email})\nFault Details: ${contactForm.message}`,
        category: contactForm.category,
        location: fullLocation,
        roomDetails: contactForm.room || contactForm.facility,
        severity: contactForm.severity,
        affectedPeople: contactForm.severity === 'Critical' ? 45 : contactForm.severity === 'High' ? 20 : 5,
        priority: contactForm.severity,
        reportedBy: `${contactForm.name} (Student/Resident)`
      });

      const incData = res.data?.incident;
      setGeneratedTicket(incData || {
        incidentId: 'INC-S' + Math.floor(1000 + Math.random() * 9000),
        status: 'In Progress',
        assignedTo: { name: 'Priya Sharma', department: 'Facilities & Safety' }
      });
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', facility: 'Hostel B', room: '', category: 'Hostel', severity: 'Medium', message: '' });
    } catch (err) {
      alert('Failed to register query. Please try again.');
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleTrackTicket = async (e) => {
    e.preventDefault();
    if (!trackTicketId.trim()) return;
    setTrackingLoading(true);
    setTrackError('');
    setTrackedIncident(null);

    try {
      const res = await api.get(`/incidents?search=${encodeURIComponent(trackTicketId.trim())}`);
      const found = res.data?.incidents?.find(
        i => i.incidentId?.toLowerCase() === trackTicketId.trim().toLowerCase() ||
             i._id === trackTicketId.trim()
      );

      if (found) {
        setTrackedIncident(found);
      } else {
        setTrackError(`No incident found with ID "${trackTicketId}". Please check the ID and try again.`);
      }
    } catch (err) {
      setTrackError('Could not connect to incident tracking core.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors scroll-smooth">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            SmartCampus <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">OS</span>
          </span>
        </div>

        {/* Center working links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#modules"
            onClick={(e) => scrollToSection(e, 'modules')}
            className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Modules
          </a>
          <a
            href="#security"
            onClick={(e) => scrollToSection(e, 'security')}
            className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Security
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact')}
            className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Student Grievance / Helpdesk
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <Link
            to="/staff-login"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Login
          </Link>

          <Link
            to="/staff-login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </Link>
        </div>
      </header>

      {/* Main Hero & Portal Selection */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full text-center">
        {/* System Online Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-400 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          <span>System Online • Version 2.4 Command Core</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-3xl">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400">SmartCampus OS</span>
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          Next-Generation Autonomous Incident Command, IoT Telemetry & AI Resource Dispatch Platform.
        </p>

        {/* Working Search Bar on Main Page */}
        <div className="mt-8 w-full max-w-2xl relative text-left">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && setShowResults(true)}
              placeholder="Search campus buildings, hostels, geysers, server rooms, emergency helpline..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white shadow-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {showResults && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 max-h-72 overflow-y-auto animate-in fade-in duration-200">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching facilities or records found.
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setShowResults(false);
                      if (res.link.startsWith('#')) {
                        scrollToSection({ preventDefault: () => {} }, res.link.slice(1));
                      } else {
                        navigate(res.link);
                      }
                    }}
                    className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/50 last:border-none"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{res.title}</span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 font-mono text-[10px] font-bold">
                          {res.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{res.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Dual Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 w-full text-left">
          {/* Faculty & Staff Card (Teal) */}
          <div
            onClick={() => navigate('/staff-login')}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-cyan-400/60 dark:hover:border-cyan-600/60 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Faculty & Staff
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Login to the Command Center to monitor live incidents, access the campus map, resolve assigned tasks, and manage active operations.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:gap-2.5 transition-all">
              <span>Access Staff Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* System Administrator Card (Purple) */}
          <div
            onClick={() => navigate('/admin-login')}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-purple-400/60 dark:hover:border-purple-600/60 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                System Administrator
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Lead: <strong>Aman (Super Admin)</strong>. Manage core infrastructure, configure AI parameters, control security lockdowns, and manage user roles.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:gap-2.5 transition-all">
              <span>Access Super Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Bottom Quick Action Bar with Direct Complaint button */}
        <div className="mt-10 w-full p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Have a hostel, classroom or medical issue?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit an instant grievance ticket without logging in. AI will dispatch the on-duty staff.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Issue Online</span>
            </button>
            <button
              onClick={() => navigate('/admin-login')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </main>

      {/* SECTION 1: KEY FEATURES (#features) */}
      <section id="features" className="py-16 px-6 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              Engineered for Instant Triage & Zero Operational Downtime
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Replacing fragmented WhatsApp groups and paper registers with an autonomous, high-availability university command OS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Multi-Factor AI Risk Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Computes dynamic 0–100% priority scores factoring hazard category, affected headcount, SLA urgency, and building vulnerability.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Smart Operative Matching</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Weighted algorithms evaluate certification tags, live staff duty load percentage, and availability to suggest optimal dispatch candidates.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Autonomous IoT Telemetry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Continuous background monitoring of server rack thermals, substation loads, hostel Wi-Fi health, and library AQI levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SYSTEM MODULES (#modules) */}
      <section id="modules" className="py-16 px-6 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
              Functional Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              Unified Operational Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Explore the dedicated toolsets built for campus administrators, technicians, medical staff, and security personnel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Command Center', icon: Activity, desc: 'Single-pane executive KPI dashboard, 7-day trend analysis and campus uptime meters.', link: '/staff-login' },
              { title: 'AI Prioritization Kanban', icon: Layers, desc: 'HTML5 drag-and-drop board with real-time priority sync across 4 triage columns.', link: '/staff-login' },
              { title: 'Interactive Campus Map', icon: MapPin, desc: '2D topological geospatial map tracking 9 university facilities and hazard health.', link: '/staff-login' },
              { title: 'Incident Registry', icon: FileText, desc: 'Comprehensive searchable database with room-level locations, SLA meters & instant resolution.', link: '/staff-login' },
              { title: 'People & Response Teams', icon: Users, desc: 'Active personnel profiler, workload balancing gauges, and specialized response units.', link: '/staff-login' },
              { title: 'Tactical Communications', icon: Radio, desc: 'Department-wise encrypted chat channels, siren alarms and campus broadcast console.', link: '/staff-login' }
            ].map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(mod.link)}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{mod.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{mod.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: SECURITY & RELIABILITY (#security) */}
      <section id="security" className="py-16 px-6 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
              Security Protocol
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              High-Reliability Architecture with Cryptographic Audit Integrity
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Designed to meet strict educational data compliance standards with immutable audit trails, granular role isolation, and real-time lockdown controls.
            </p>

            <div className="mt-6 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Role-Based Access Control (RBAC):</strong> Strict boundary between Super Admin permissions and Operative field responsibilities.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Immutable Audit Logging:</strong> Every ticket creation, status change, and dispatch event is logged with IP timestamps.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Zero-Fail Edge Resilience:</strong> Embedded in-memory MongoDB fallback ensures 100% uptime even if external databases disconnect.
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">SECURITY GATEWAY STATUS</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">ENCRYPTED</span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>AUTH_CIPHER:</span>
                <span className="text-white">AES-256-GCM / SHA-256</span>
              </div>
              <div className="flex justify-between">
                <span>GATEWAY_ANPR:</span>
                <span className="text-emerald-400">EAST GATE ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span>AI_AUDIT_STREAM:</span>
                <span className="text-cyan-400">RECORDING (1480 SESSIONS)</span>
              </div>
              <div className="flex justify-between">
                <span>CAMPUS_LOCKDOWN:</span>
                <span className="text-emerald-400">PERIMETER STANDBY</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              System Admin (Aman) holds master cryptographic authority for campus-wide emergency broadcast & lockdown trigger.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: STUDENT GRIEVANCE & EMERGENCY HELPDESK (#contact) */}
      <section id="contact" className="py-16 px-6 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              Student Grievance & Operations Helpdesk
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              Direct Campus Complaint & Query Submission
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Report hostel geysers, water leaks, Wi-Fi issues, or classroom equipment problems. Your ticket generates an instant tracking ID.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Direct Numbers */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Emergency Hotlines
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-600 text-white">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 block">SOS Medical & Ambulance</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">+91 (1800) 123-4567</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-600 text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Campus Security Command</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">+91 98765 00001</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-600 text-white">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">IT Server Room & Infrastructure</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">Block A, Server Room B</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Query & Live Status Tracker */}
            <div className="lg:col-span-2 space-y-6">
              {/* Submission Form / Success Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Student Helpdesk & Grievance Registration
                    </h3>
                    <p className="text-xs text-slate-500">
                      Instantly registers into Admin Command Center and auto-dispatches to the assigned staff specialist.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 text-[10px] font-bold font-mono uppercase tracking-wider w-fit">
                    AI Auto-Dispatch Active
                  </span>
                </div>

                {contactSubmitted && generatedTicket ? (
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/30 text-left space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                            Ticket Generated & Operative Dispatched!
                          </h4>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Synced live with Super Admin & Staff Task Queue
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-mono font-extrabold text-sm shadow-sm">
                        {generatedTicket.incidentId}
                      </div>
                    </div>

                    {/* Auto-Assignment Details Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Auto-Assigned Specialist</span>
                        <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                          {generatedTicket.assignedTo?.name || 'Priya Sharma'}
                        </div>
                        <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                          {generatedTicket.assignedTo?.department || 'Facilities & Safety'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Live Dispatch Status</span>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                            {generatedTicket.status || 'In Progress'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">Pending physical on-site fix</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Location & SLA</span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          {generatedTicket.location}
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> SLA: {generatedTicket.slaStatus || 'On Track (2h)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        The assigned operative has received an automated alert and will resolve this on-site.
                      </p>
                      <button
                        onClick={() => setContactSubmitted(false)}
                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Submit Another Query
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                          Student / Resident Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="e.g. Aman Sharma / Rohit Roy"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                          Email / Phone Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="e.g. student@campus.edu / +91 98765..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                          Category / Problem Area *
                        </label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 font-semibold"
                        >
                          <option value="Hostel">Hostel (Geyser, Water, Plumbing)</option>
                          <option value="Electrical">Electrical (Light, Socket, Power, AC)</option>
                          <option value="Network">Wi-Fi, Internet & IT Systems</option>
                          <option value="Medical">Medical Emergency & First Aid</option>
                          <option value="Security">Campus Security & Lock Issue</option>
                          <option value="Transport">Transport & Campus Vehicle</option>
                          <option value="Infrastructure">Civil & Infrastructure Maintenance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                          Campus Facility *
                        </label>
                        <select
                          value={contactForm.facility}
                          onChange={(e) => setContactForm({ ...contactForm, facility: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="Hostel B">Hostel B (PG / International)</option>
                          <option value="Hostel A">Hostel A (Undergraduate Block)</option>
                          <option value="Computer Center">Computer Center (Labs 301-304)</option>
                          <option value="Academic Complex">Academic Complex (Auditoriums 1-6)</option>
                          <option value="Library Hub">Library Hub & Digital Archives</option>
                          <option value="Main Ground">Main Ground & Sports Arena</option>
                          <option value="Main Admin Block">Main Admin Block</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                          Room / Floor Details *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.room}
                          onChange={(e) => setContactForm({ ...contactForm, room: e.target.value })}
                          placeholder="e.g. Room 204 (2nd Flr) / Lab 3"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                          Problem Description & Symptoms *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          placeholder="Describe the issue (e.g. Geyser not heating water in 2nd floor bathroom, or Wi-Fi router red light blinking in room 204)..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                          Severity Level
                        </label>
                        <select
                          value={contactForm.severity}
                          onChange={(e) => setContactForm({ ...contactForm, severity: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 font-bold"
                        >
                          <option value="Medium">Medium Priority (Standard)</option>
                          <option value="High">High Priority (Urgent)</option>
                          <option value="Critical">Critical (Immediate Emergency)</option>
                          <option value="Low">Low Priority (Routine)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">AI triage engine will verify urgency.</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingContact}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 active:scale-98 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingContact ? 'Auto-Assigning Operative & Dispatching...' : 'Submit Grievance & Auto-Assign to Staff'}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Live Ticket Status Tracker */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-cyan-500" />
                      Live Ticket Status Tracker
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Enter any ticket ID (e.g. <strong className="font-mono text-cyan-600 dark:text-cyan-400">INC-AE64</strong>, <strong className="font-mono text-cyan-600 dark:text-cyan-400">INC-AE53</strong>) to check live progress & assigned staff.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleTrackTicket} className="flex gap-2">
                  <input
                    type="text"
                    value={trackTicketId}
                    onChange={(e) => setTrackTicketId(e.target.value)}
                    placeholder="Enter Ticket ID (e.g. INC-AE64 or INC-S...)"
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={trackingLoading || !trackTicketId.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    {trackingLoading ? 'Checking...' : 'Check Status'}
                  </button>
                </form>

                {trackError && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs">
                    {trackError}
                  </div>
                )}

                {trackedIncident && (
                  <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">
                          {trackedIncident.incidentId}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          trackedIncident.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          Status: {trackedIncident.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Priority: <strong>{trackedIncident.priority}</strong>
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 dark:text-white">
                      {trackedIncident.title}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {trackedIncident.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="text-slate-600 dark:text-slate-300">
                        Assigned Operative: <strong className="text-cyan-600 dark:text-cyan-400">{trackedIncident.assignedTo?.name || 'In Triage'}</strong> ({trackedIncident.assignedTo?.department || 'Operations'})
                      </div>
                      <div className="text-slate-500">
                        Location: <strong>{trackedIncident.location}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-10 px-6 transition-colors">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                SmartCampus <span className="text-cyan-600 dark:text-cyan-400">OS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Next-generation incident management and operational command center for modern educational institutions.
            </p>
            <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-3">
              Lead & Super Admin: <strong>Aman</strong>
            </p>
          </div>

          {/* Modules */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              MODULES
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/staff-login" className="hover:text-cyan-600 dark:hover:text-cyan-400">› Command Center</Link></li>
              <li><Link to="/staff-login" className="hover:text-cyan-600 dark:hover:text-cyan-400">› Live Incidents</Link></li>
              <li><Link to="/staff-login" className="hover:text-cyan-600 dark:hover:text-cyan-400">› Campus Map</Link></li>
              <li><Link to="/staff-login" className="hover:text-cyan-600 dark:hover:text-cyan-400">› Analytics</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              RESOURCES
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-cyan-600 dark:hover:text-cyan-400">› System Features</a></li>
              <li><a href="#security" onClick={(e) => scrollToSection(e, 'security')} className="hover:text-cyan-600 dark:hover:text-cyan-400">› Security Protocols</a></li>
              <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="hover:text-cyan-600 dark:hover:text-cyan-400">› Emergency Guidelines</a></li>
            </ul>
          </div>

          {/* Contact Helpdesk */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              CONTACT HELPDESK
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>admin@campus.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>+91 (1800) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>Block A, Server Room B, Main Campus</span>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Direct Report Incident Modal for Public / Students */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onIncidentCreated={(newInc) => {
          setGeneratedTicket(newInc);
          setContactSubmitted(true);
          const el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
};
