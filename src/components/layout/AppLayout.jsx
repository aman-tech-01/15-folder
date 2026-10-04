import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ReportIncidentModal } from '../modals/ReportIncidentModal';
import { EmergencyModal } from '../modals/EmergencyModal';
import { useSocket } from '../../context/SocketContext';
import { AlertOctagon, ShieldAlert, X } from 'lucide-react';

export const AppLayout = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const { emergencyAlert, lockdownAlert, clearEmergencyAlert, clearLockdownAlert } = useSocket();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* High-priority Emergency Broadcast Banner */}
      {emergencyAlert && (
        <div className="bg-rose-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold animate-pulse shadow-md z-50">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <span>🚨 CAMPUS TACTICAL EMERGENCY BROADCAST: {emergencyAlert.reason} (Triggered by {emergencyAlert.triggeredBy})</span>
          </div>
          <button onClick={clearEmergencyAlert} className="text-white/80 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lockdown Protocol Banner */}
      {lockdownAlert && (
        <div className="bg-amber-600 text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-bold shadow-md z-50">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>⚠️ CAMPUS LOCKDOWN PROTOCOL INITIATED (DEMO MODE). ACCESS PERIMETERS SECURED.</span>
          </div>
          <button onClick={clearLockdownAlert} className="text-white/80 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 dark:bg-slate-950/60">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ onOpenReportModal: () => setIsReportModalOpen(true) }} />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        currentEmergencyState={!!emergencyAlert}
      />
    </div>
  );
};
