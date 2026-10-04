import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import {
  MapPin,
  Building,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  Thermometer,
  Wifi,
  Shield,
  Zap,
  Radio,
  X,
  Users,
  Search,
  Check
} from 'lucide-react';

export const CampusMap = () => {
  const { socket } = useSocket();
  const [locations, setLocations] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationIncidents, setLocationIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchMapData = async () => {
    try {
      const [locsRes, sensorsRes] = await Promise.all([
        api.get('/locations'),
        api.get('/sensors')
      ]);
      if (locsRes.data.success) {
        setLocations(locsRes.data.locations || []);
        // default select first location with an active incident or first building
        if (!selectedLocation && locsRes.data.locations?.length > 0) {
          const defaultLoc = locsRes.data.locations.find(l => l.activeIncidentCount > 0) || locsRes.data.locations[0];
          handleSelectLocation(defaultLoc);
        }
      }
      if (sensorsRes.data.success) {
        setSensors(sensorsRes.data.sensors || []);
      }
    } catch (e) {
      console.error('[CampusMap fetch error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    if (socket) {
      socket.on('incident:new', () => fetchMapData());
      socket.on('incident:statusUpdated', () => fetchMapData());
      socket.on('sensor:update', () => fetchMapData());
    }
  }, [socket]);

  const handleSelectLocation = async (loc) => {
    setSelectedLocation(loc);
    try {
      const res = await api.get(`/incidents?location=${encodeURIComponent(loc.name)}`);
      if (res.data.success) {
        setLocationIncidents(res.data.incidents || []);
      }
    } catch (e) {}
  };

  const getBuildingSensors = (locName) => {
    return sensors.filter(s => s.location.toLowerCase().includes(locName.toLowerCase()));
  };

  const filteredLocations = locations.filter(l => {
    if (filterStatus === 'ALL') return true;
    return l.status?.toUpperCase() === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Interactive Campus Topology
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time geospatial layout of facilities, sensor telemetry nodes, and active hazard alerts.
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {['ALL', 'CRITICAL', 'WARNING', 'OPERATIONAL'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas & Sidebar Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Interactive Map Surface */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative min-h-[580px] overflow-hidden flex flex-col justify-between select-none">
          {/* Subtle Grid Lines Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

          {/* Top Map Overlay details */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 backdrop-blur-md border border-slate-700 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>GEO-TELEMETRY: LIVE TOPOLOGICAL BUS</span>
            </div>
            <span className="text-xs font-mono text-slate-400">COORDINATES: 28.6139° N, 77.2090° E</span>
          </div>

          {/* Topological Building Nodes */}
          <div className="relative z-10 my-auto h-[460px] w-full">
            {filteredLocations.map((loc) => {
              const hasCritical = loc.status === 'Critical';
              const hasWarning = loc.status === 'Warning';
              const isSelected = selectedLocation?.name === loc.name;

              return (
                <div
                  key={loc._id || loc.name}
                  onClick={() => handleSelectLocation(loc)}
                  style={{
                    left: `${loc.coordinates?.x || 50}%`,
                    top: `${loc.coordinates?.y || 50}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className={`absolute group cursor-pointer transition-all duration-300 z-20 ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                  }`}
                >
                  {/* Ping animation if Critical */}
                  {hasCritical && (
                    <div className="absolute -inset-2 rounded-2xl bg-rose-500/40 animate-ping pointer-events-none"></div>
                  )}

                  <div
                    className={`p-3 rounded-2xl border backdrop-blur-md transition-all shadow-lg flex items-center gap-2.5 min-w-36 ${
                      hasCritical
                        ? 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-950/50'
                        : hasWarning
                        ? 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-amber-950/50'
                        : isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-cyan-950/50'
                        : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        hasCritical
                          ? 'bg-rose-500 text-white'
                          : hasWarning
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-cyan-600 text-white'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="text-xs font-bold truncate leading-tight">
                        {loc.name}
                      </div>
                      <div className="text-[10px] opacity-80 truncate">
                        {loc.buildingType}
                      </div>
                    </div>

                    {/* Active Incident Badge count */}
                    {loc.activeIncidentCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 animate-pulse">
                        {loc.activeIncidentCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom map status bar */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Click any university facility node to inspect telemetry, room faults, and assigned staff.</span>
            <span className="font-mono text-cyan-400 font-bold">{locations.length} Facilities Active</span>
          </div>
        </div>

        {/* Right Side: Building Details Drawer */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs min-h-[580px]">
          {selectedLocation ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">
                    {selectedLocation.zone || 'Zone Alpha'}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedLocation.name}
                  </h2>
                  <p className="text-xs text-slate-500">{selectedLocation.buildingType}</p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Pill */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Facility Health</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedLocation.status === 'Critical' ? 'bg-rose-500/20 text-rose-500' :
                  selectedLocation.status === 'Warning' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-emerald-500/20 text-emerald-500'
                }`}>
                  {selectedLocation.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedLocation.description || 'Facility operational nodes nominal.'}
              </p>

              {/* IoT Sensors in this location */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Building IoT Sensors ({getBuildingSensors(selectedLocation.name).length})
                </span>
                <div className="space-y-2">
                  {getBuildingSensors(selectedLocation.name).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No telemetry sensors assigned to this node.</p>
                  ) : (
                    getBuildingSensors(selectedLocation.name).map((s) => (
                      <div key={s._id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="font-semibold text-slate-900 dark:text-white">{s.sensorName}</span>
                        </div>
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {s.value} {s.unit}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Active Incidents at this location */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Facility Incidents & Room Faults ({locationIncidents.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {locationIncidents.length === 0 ? (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Zero active hazard alerts. Systems nominal.</span>
                    </div>
                  ) : (
                    locationIncidents.map((inc) => (
                      <div key={inc._id} className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                          <span className="font-mono text-cyan-600 dark:text-cyan-400">{inc.incidentId}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            inc.priority === 'Critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
                          }`}>{inc.priority}</span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">{inc.title}</p>
                        {inc.roomDetails && (
                          <p className="text-[11px] text-slate-500">Room: {inc.roomDetails}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-bounce" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Select a Location</h3>
              <p className="text-xs max-w-xs">
                Click any building on the interactive campus grid to inspect telemetry readings, active security alerts, and personnel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
