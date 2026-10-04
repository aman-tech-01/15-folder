import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Activity,
  Radio,
  Thermometer,
  Wifi,
  Zap,
  Video,
  Wind,
  Shield,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Gauge
} from 'lucide-react';

export const LiveActivity = () => {
  const { isAdmin } = useAuth();
  const { socket } = useSocket();

  const [activities, setActivities] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);

  // Digital feed time
  const [feedTime, setFeedTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setFeedTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [actRes, sensRes] = await Promise.all([
        api.get('/activities?limit=40'),
        api.get('/sensors')
      ]);

      if (actRes.data.success) {
        setActivities(actRes.data.activities || []);
      }
      if (sensRes.data.success) {
        setSensors(sensRes.data.sensors || []);
        setSimulationRunning(sensRes.data.simulationRunning);
      }
    } catch (e) {
      console.error('[LiveActivity fetch error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const pollInterval = setInterval(() => {
      fetchData();
    }, 3000);

    if (socket) {
      socket.on('activity:new', (newAct) => {
        setActivities(prev => [newAct, ...prev.slice(0, 39)]);
      });

      socket.on('sensor:update', (updatedSensor) => {
        setSensors(prev =>
          prev.map(s => (s._id === updatedSensor._id ? updatedSensor : s))
        );
      });
    }

    return () => clearInterval(pollInterval);
  }, [socket]);

  const handleToggleSimulation = async () => {
    setToggling(true);
    try {
      const res = await api.post('/sensors/toggle-simulation');
      if (res.data.success) {
        setSimulationRunning(res.data.simulationRunning);
      }
    } catch (e) {
      alert('Failed to toggle simulation.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Live Activity & IoT Telemetry</span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time event stream, IoT facility sensor readings, and simulated CCTV node feeds.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleToggleSimulation}
            disabled={toggling}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              simulationRunning
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {simulationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{simulationRunning ? 'Pause Telemetry Simulation' : 'Resume Telemetry Simulation'}</span>
          </button>
        )}
      </div>

      {/* IoT Sensor Gauges Panel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span>Campus IoT Sensors ({sensors.length})</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">AUTONOMOUS TELEMETRY ENGINE • 3s SAMPLING</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {sensors.map((sensor) => {
            const isCritical = sensor.status === 'Critical';
            const isWarning = sensor.status === 'Warning';

            return (
              <div
                key={sensor._id}
                className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-2xs ${
                  isCritical
                    ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
                    : isWarning
                    ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-32">
                    {sensor.location}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isCritical ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40' :
                    isWarning ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {sensor.status}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {sensor.value} <span className="text-xs font-normal text-slate-400">{sensor.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    Limit: {sensor.threshold} {sensor.unit}
                  </div>
                </div>

                <div className="mt-1">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {sensor.sensorName}
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(10, (sensor.value / (sensor.maxThreshold || 100)) * 100))}%`
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CCTV Simulated Feeds */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-500" />
            <span>Campus Optical Feeds — Demo Simulation</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">DEMO PROTOCOL ONLY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'CAM-01 • Main Admin Gate', loc: 'Transport & Parking Hub - Gate 1' },
            { name: 'CAM-02 • Server Facility 4B', loc: 'Computer Center - Rack Corridor' },
            { name: 'CAM-03 • Hostel B Quadrangle', loc: 'Hostel B - 3rd Floor Wing A' },
            { name: 'CAM-04 • Sports Arena Pavilion', loc: 'Main Ground - Pavilion 2' }
          ].map((cam, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md flex flex-col justify-between h-44 relative radar-scan select-none"
            >
              {/* Top Overlay */}
              <div className="p-3 bg-slate-900/80 backdrop-blur-xs flex items-center justify-between text-[11px] font-mono text-white z-10">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  {cam.name}
                </span>
                <span className="text-[10px] text-cyan-400 font-extrabold">LIVE</span>
              </div>

              {/* Center Wireframe / Radar Scan visual */}
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-xs font-mono">
                <Video className="w-8 h-8 text-slate-700 mb-1" />
                <span className="text-[10px] text-slate-500">Optical Node Active</span>
              </div>

              {/* Bottom Timestamp */}
              <div className="p-2.5 bg-slate-900/90 flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
                <span className="truncate max-w-40">{cam.loc}</span>
                <span>{feedTime.toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chronological Event Activity Stream */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Chronological Tactical Event Stream
            </h2>
            <p className="text-xs text-slate-500">Real-time audit log of all system state changes</p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {activities.length} Recorded Events
          </span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No recent activity recorded.
            </div>
          ) : (
            activities.map((act) => (
              <div key={act._id} className="pt-3 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-xl ${
                    act.severity === 'Critical' ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-500' :
                    act.severity === 'Warning' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-500' :
                    'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400'
                  }`}>
                    {act.severity === 'Critical' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                      {act.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>Source: <strong>{act.userName || 'System Core'}</strong></span>
                      {act.location && <span>• Location: {act.location}</span>}
                      {act.incidentId && <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">• {act.incidentId}</span>}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
