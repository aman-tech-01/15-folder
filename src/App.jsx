import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Landing } from './pages/Landing';
import { AdminLogin } from './pages/AdminLogin';
import { StaffLogin } from './pages/StaffLogin';
import { CommandCenter } from './pages/CommandCenter';
import { Incidents } from './pages/Incidents';
import { PriorityQueue } from './pages/PriorityQueue';
import { PeopleAndTeams } from './pages/PeopleAndTeams';
import { CampusMap } from './pages/CampusMap';
import { LiveActivity } from './pages/LiveActivity';
import { Analytics } from './pages/Analytics';
import { Communications } from './pages/Communications';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';
import { StaffDashboard } from './pages/StaffDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdminRole = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs">
        Initializing SmartCampus Command Engine...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdminRole && !isAdmin) {
    return <Navigate to="/staff-dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public Portal and Authentication Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* Authenticated Application Routes wrapped in Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/command-center" element={<CommandCenter />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/priority-queue" element={<PriorityQueue />} />
        <Route path="/people-teams" element={<PeopleAndTeams />} />
        <Route path="/campus-map" element={<CampusMap />} />
        <Route path="/live-activity" element={<LiveActivity />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/communications" element={<Communications />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />

        {/* Admin-only Routes */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute requireAdminRole={true}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute requireAdminRole={true}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
