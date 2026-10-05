import axios from 'axios';
import {
  demoLocations,
  demoSensors,
  demoIncidents,
  demoUsers,
  demoTeams,
  demoMessages,
  demoActivities,
  demoNotifications
} from './demoData';

// Storage Helper
const getStoredOr = (key, defaultVal) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const saveAndSync = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('smartcampus_sync', { detail: { key } }));
  } catch (e) {
    console.error('[Storage Sync Error]', e);
  }
};

// Initial stateful stores backed by LocalStorage
let storeIncidents = getStoredOr('smartcampus_incidents', demoIncidents);
let storeUsers = getStoredOr('smartcampus_users', demoUsers);
let storeTeams = getStoredOr('smartcampus_teams', demoTeams);
let storeSensors = getStoredOr('smartcampus_sensors', demoSensors);
let storeMessages = getStoredOr('smartcampus_messages', demoMessages);
let storeActivities = getStoredOr('smartcampus_activities', demoActivities);
let storeNotifications = getStoredOr('smartcampus_notifications', demoNotifications);
let storeLocations = getStoredOr('smartcampus_locations', demoLocations);
let storeSettings = getStoredOr('smartcampus_settings', {
  predictiveAnomalyDetection: true,
  aiAutomation: true,
  aiIncidentPrioritization: true,
  smartResourceAllocation: true,
  strictBiometricMode: false,
  notifications: true,
  emergencyMode: false,
  campusLockdown: false,
  sessionTimeout: 60,
  auditLogging: true
});

let storeAuditLogs = getStoredOr('smartcampus_audit_logs', [
  {
    _id: 'audit_1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    userName: 'Aman',
    userRole: 'ADMIN',
    action: 'SYSTEM_BOOT',
    target: 'CORE_ENGINE',
    details: 'SmartCampus OS Command Engine v2.6 Initialized',
    ipAddress: '192.168.1.100 (HQ Console)'
  },
  {
    _id: 'audit_2',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    userName: 'Aman',
    userRole: 'ADMIN',
    action: 'AI_DISPATCH',
    target: 'INC-AE53',
    details: 'Dispatched Dr. Ananya Roy to Sports Heatstroke Emergency',
    ipAddress: '192.168.1.100 (HQ Console)'
  },
  {
    _id: 'audit_3',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    userName: 'Vikram Das',
    userRole: 'STAFF',
    action: 'STATUS_UPDATE',
    target: 'INC-AE5C',
    details: 'Status changed to In Progress (Server Rack Chiller)',
    ipAddress: '192.168.2.45 (IT Mobile Operative)'
  },
  {
    _id: 'audit_4',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    userName: 'Priya Sharma',
    userRole: 'STAFF',
    action: 'RESOLUTION',
    target: 'INC-AE62',
    details: 'Marked Library Catalog Server database restored',
    ipAddress: '192.168.2.88 (Facilities Mobile)'
  }
]);

let simulationActive = true;

// Autonomous live telemetry simulation
setInterval(() => {
  if (!simulationActive) return;
  storeSensors = storeSensors.map(s => {
    let delta = (Math.random() - 0.48) * 0.8;
    if (s.unit === '°C') delta = (Math.random() - 0.5) * 0.4;
    else if (s.unit === '%') delta = (Math.random() - 0.5) * 1.5;
    else if (s.unit === 'kW') delta = (Math.random() - 0.5) * 4;
    else if (s.unit === 'AQI') delta = (Math.random() - 0.5) * 2;

    const newVal = Math.max(0.1, Number((s.value + delta).toFixed(1)));
    let status = 'Normal';
    if (newVal >= s.threshold) status = 'Warning';
    if (newVal >= s.threshold * 1.15) status = 'Critical';

    return { ...s, value: newVal, status };
  });
  saveAndSync('smartcampus_sensors', storeSensors);
}, 3500);

const addAudit = (userName, userRole, action, target, details) => {
  const newAudit = {
    _id: 'audit_' + Date.now() + Math.random().toString(36).substring(2, 5),
    timestamp: new Date().toISOString(),
    userName: userName || 'Aman',
    userRole: userRole || 'ADMIN',
    action,
    target,
    details,
    ipAddress: '192.168.1.' + Math.floor(100 + Math.random() * 150) + ' (Command Node)'
  };
  storeAuditLogs.unshift(newAudit);
  if (storeAuditLogs.length > 100) storeAuditLogs.pop();
  saveAndSync('smartcampus_audit_logs', storeAuditLogs);
};

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 3000
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartcampus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: graceful offline/Netlify fallback with full state manipulation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const method = (error.config?.method || 'get').toLowerCase();
    const data = error.config?.data ? (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : {};

    // Helper: live stats calculator
    const getComputedStats = () => {
      const total = storeIncidents.length;
      const critical = storeIncidents.filter(i => i.priority === 'Critical' && i.status !== 'Resolved' && i.status !== 'Closed').length;
      const high = storeIncidents.filter(i => i.priority === 'High' && i.status !== 'Resolved' && i.status !== 'Closed').length;
      const active = storeIncidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;
      const resolved = storeIncidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;
      const slaBreached = storeIncidents.filter(i => i.slaStatus === 'Breached').length;

      return {
        total,
        critical,
        high,
        active,
        resolved,
        slaBreached,
        activeIncidents: active,
        incidentLoad: active,
        criticalAlerts: critical,
        highPriorityAlerts: high,
        resolvedToday: resolved + 11,
        resolvedIncidents: resolved,
        totalStaff: storeUsers.filter(u => u.role === 'STAFF').length,
        overloadedStaff: storeUsers.filter(u => (u.workloadPercentage || 0) >= 80).length,
        availableTeams: storeTeams.length,
        totalTeams: storeTeams.length,
        responseCapacity: 88,
        safetyReadiness: Math.max(70, Math.min(100, 100 - (critical * 5 + high * 2))),
        serverLoad: 72,
        totalTraffic: '2.4 TB',
        computeClusterLoad: 89,
        totalVisitorsTracked: 1480,
        todayActiveLogins: 42
      };
    };

    // 0. AUTH API
    if (url.includes('/auth/me')) {
      const savedUser = localStorage.getItem('smartcampus_user');
      if (savedUser) {
        return Promise.resolve({
          data: { success: true, user: JSON.parse(savedUser) }
        });
      }
      return Promise.resolve({
        data: {
          success: true,
          user: storeUsers.find(u => u.role === 'ADMIN') || storeUsers[0]
        }
      });
    }

    if (url.includes('/auth/login')) {
      const normalizedEmail = (data.email || '').toLowerCase().trim();
      const isAdmin = normalizedEmail === 'admin@campus.com' || normalizedEmail.includes('admin') || normalizedEmail.includes('aman');
      let foundUser = storeUsers.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!foundUser) {
        if (isAdmin) {
          foundUser = storeUsers.find(u => u.role === 'ADMIN') || {
            _id: 'u_admin',
            id: 'usr_admin_001',
            name: 'Aman',
            email: 'admin@campus.com',
            role: 'ADMIN',
            department: 'Executive Operations',
            skills: ['Incident Command', 'Campus Security', 'AI Systems'],
            availability: 'AVAILABLE',
            workloadPercentage: 25
          };
        } else {
          foundUser = storeUsers.find(u => u.role === 'STAFF') || storeUsers[0];
        }
      }

      addAudit(foundUser.name, foundUser.role, 'USER_LOGIN', 'AUTH_PORTAL', `Successful sign-in to ${foundUser.role} portal.`);

      return Promise.resolve({
        data: {
          success: true,
          token: 'mock_jwt_token_' + Date.now(),
          user: foundUser
        }
      });
    }

    if (url.includes('/auth/logout')) {
      addAudit('User', 'STAFF', 'USER_LOGOUT', 'AUTH_PORTAL', 'Session terminated by user.');
      return Promise.resolve({ data: { success: true, message: 'Logged out successfully.' } });
    }

    // 1. INCIDENTS API
    if (url.includes('/incidents')) {
      const urlObj = new URL(url, 'http://localhost');
      const search = (urlObj.searchParams.get('search') || '').toLowerCase().trim();
      const category = urlObj.searchParams.get('category') || '';
      const priority = urlObj.searchParams.get('priority') || '';
      const status = urlObj.searchParams.get('status') || '';
      const slaStatus = urlObj.searchParams.get('slaStatus') || '';
      const assignedTo = urlObj.searchParams.get('assignedTo') || '';
      const location = (urlObj.searchParams.get('location') || '').toLowerCase();

      // POST: Create Incident / Student Query
      if (method === 'post' && !url.includes('/notes')) {
        const newId = 'inc_' + Date.now() + Math.random().toString(36).substring(2, 5);
        const randHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
        const incidentId = 'INC-' + randHex;

        // Intelligent Auto-Assignment Helper
        let assignedUser = null;
        if (data.assignedTo) {
          assignedUser = storeUsers.find(u => u._id === data.assignedTo || u.id === data.assignedTo || u.name === data.assignedTo);
        }

        if (!assignedUser) {
          const cat = data.category || '';
          const textCorpus = `${data.title || ''} ${data.description || ''} ${data.category || ''} ${data.location || ''}`.toLowerCase();

          // 1. Explicit Category
          if (cat === 'Medical') {
            assignedUser = storeUsers.find(u => u.name?.includes('Ananya')) || storeUsers.find(u => u.department?.includes('Medical'));
          } else if (cat === 'Network' || cat === 'IT') {
            assignedUser = storeUsers.find(u => u.name === 'Vikram Das') || storeUsers.find(u => u.name === 'Neha Gupta') || storeUsers.find(u => u.department?.includes('Network') || u.department?.includes('IT'));
          } else if (cat === 'Electrical') {
            assignedUser = storeUsers.find(u => u.name === 'Rahul Verma') || storeUsers.find(u => u.department?.includes('Electrical'));
          } else if (cat === 'Security') {
            assignedUser = storeUsers.find(u => u.name?.includes('Suresh')) || storeUsers.find(u => u.department?.includes('Security'));
          } else if (cat === 'Transport') {
            assignedUser = storeUsers.find(u => u.name?.includes('Rajesh')) || storeUsers.find(u => u.department?.includes('Transport'));
          } else if (cat === 'Hostel' || cat === 'Infrastructure' || cat === 'Facilities') {
            assignedUser = storeUsers.find(u => u.name === 'Priya Sharma') || storeUsers.find(u => u.department?.includes('Facilities'));
          }

          // 2. Keyword fallback
          if (!assignedUser) {
            if (textCorpus.includes('wifi') || textCorpus.includes('wi-fi') || textCorpus.includes('internet') || textCorpus.includes('router') || textCorpus.includes('switch') || textCorpus.includes('server')) {
              assignedUser = storeUsers.find(u => u.name === 'Vikram Das') || storeUsers.find(u => u.department?.includes('IT'));
            } else if (textCorpus.includes('electric') || textCorpus.includes('power') || textCorpus.includes('light') || textCorpus.includes('socket') || textCorpus.includes('ac ') || textCorpus.includes('geyser')) {
              assignedUser = storeUsers.find(u => u.name === 'Rahul Verma') || storeUsers.find(u => u.name === 'Priya Sharma');
            } else if (textCorpus.includes('medic') || textCorpus.includes('doctor') || textCorpus.includes('ambulance') || textCorpus.includes('injury') || textCorpus.includes('fever') || textCorpus.includes('sick')) {
              assignedUser = storeUsers.find(u => u.name?.includes('Ananya')) || storeUsers.find(u => u.department?.includes('Medical'));
            } else if (textCorpus.includes('security') || textCorpus.includes('guard') || textCorpus.includes('lock') || textCorpus.includes('gate') || textCorpus.includes('theft')) {
              assignedUser = storeUsers.find(u => u.name?.includes('Suresh')) || storeUsers.find(u => u.department?.includes('Security'));
            } else if (textCorpus.includes('water') || textCorpus.includes('plumbing') || textCorpus.includes('pipe') || textCorpus.includes('hostel') || textCorpus.includes('bathroom') || textCorpus.includes('washroom')) {
              assignedUser = storeUsers.find(u => u.name === 'Priya Sharma') || storeUsers.find(u => u.department?.includes('Facilities'));
            }
          }

          // Fallback if no match
          if (!assignedUser) {
            assignedUser = storeUsers.find(u => u.role === 'STAFF') || storeUsers[0];
          }
        }

        const assignedObj = assignedUser ? {
          _id: assignedUser._id || assignedUser.id,
          id: assignedUser.id || assignedUser._id,
          name: assignedUser.name,
          email: assignedUser.email,
          department: assignedUser.department,
          phone: assignedUser.phone
        } : null;

        const newInc = {
          _id: newId,
          incidentId,
          title: data.title || 'Campus Grievance / Operational Alert',
          description: data.description || 'Reported via student grievance & campus helpdesk portal.',
          category: data.category || 'Hostel',
          location: data.location || 'Main Campus Core',
          roomDetails: data.roomDetails || data.location || 'Ground Floor',
          severity: data.severity || data.priority || 'Medium',
          affectedPeople: Number(data.affectedPeople) || (data.severity === 'Critical' ? 45 : data.severity === 'High' ? 20 : 5),
          priority: data.priority || data.severity || 'Medium',
          status: 'In Progress',
          aiScore: data.priority === 'Critical' ? 92 : data.priority === 'High' ? 78 : data.priority === 'Medium' ? 55 : 34,
          assignedTo: assignedObj,
          slaStatus: 'On Track',
          reportedBy: data.reportedBy || 'Student / Campus Helpdesk',
          createdAt: new Date().toISOString(),
          notes: data.notes ? [{ author: assignedObj ? assignedObj.name : 'System Dispatch', authorRole: 'STAFF', text: data.notes, timestamp: new Date().toISOString() }] : [
            {
              author: 'AI Smart Dispatch',
              authorRole: 'SYSTEM',
              text: `Auto-routed to ${assignedObj ? assignedObj.name : 'Department Specialist'} (${assignedObj ? assignedObj.department : 'Operations'}). SLA timer activated (2 Hours).`,
              timestamp: new Date().toISOString()
            }
          ]
        };

        storeIncidents.unshift(newInc);
        saveAndSync('smartcampus_incidents', storeIncidents);

        // Update workload of assigned staff
        if (assignedUser) {
          const uIdx = storeUsers.findIndex(u => u._id === assignedUser._id || u.id === assignedUser.id);
          if (uIdx !== -1) {
            storeUsers[uIdx].workloadPercentage = Math.min(100, (storeUsers[uIdx].workloadPercentage || 40) + 15);
            storeUsers[uIdx].availability = storeUsers[uIdx].workloadPercentage >= 80 ? 'BUSY' : 'AVAILABLE';
            saveAndSync('smartcampus_users', storeUsers);
          }
        }

        // Append to activity stream
        storeActivities.unshift({
          _id: 'act_' + Date.now(),
          message: `[${incidentId}] New ${newInc.severity} ${newInc.category} reported at ${newInc.location}. Auto-assigned to ${assignedObj ? assignedObj.name : 'Unassigned'} for swift resolution.`,
          userName: 'Command Center AI',
          location: newInc.location,
          severity: newInc.severity,
          incidentId,
          timestamp: new Date().toISOString()
        });
        saveAndSync('smartcampus_activities', storeActivities);

        // Add notification for Admin & Assigned Staff
        storeNotifications.unshift({
          _id: 'notif_' + Date.now(),
          title: `Student Query Auto-Assigned: ${incidentId}`,
          message: `"${newInc.title}" at ${newInc.location} assigned to ${assignedObj ? assignedObj.name : 'Staff'}.`,
          type: newInc.priority === 'Critical' ? 'emergency' : 'assignment',
          read: false,
          timestamp: new Date().toISOString()
        });
        saveAndSync('smartcampus_notifications', storeNotifications);

        addAudit(newInc.reportedBy, 'STUDENT', 'TICKET_CREATE', incidentId, `Registered "${newInc.title}" at ${newInc.location} - auto-assigned to ${assignedObj?.name || 'Staff'}`);

        return Promise.resolve({
          data: {
            success: true,
            message: `Incident registered successfully & auto-dispatched to ${assignedObj ? assignedObj.name : 'Staff Operative'}.`,
            incident: newInc
          }
        });
      }

      // PATCH: Status update or Priority update or Assign
      if (method === 'patch') {
        const cleanUrl = url.split('?')[0];
        const match = cleanUrl.match(/\/incidents\/([^/]+)/);
        const incId = match ? match[1] : null;
        const incIndex = storeIncidents.findIndex(i => i._id === incId || i.incidentId === incId);

        if (incIndex !== -1) {
          const prev = { ...storeIncidents[incIndex] };

          if (data.status) {
            storeIncidents[incIndex].status = data.status;
            if (data.status === 'Resolved' || data.status === 'Closed') {
              storeIncidents[incIndex].resolvedAt = new Date().toISOString();
              storeIncidents[incIndex].slaStatus = 'Met';
              if (!storeIncidents[incIndex].notes) storeIncidents[incIndex].notes = [];
              storeIncidents[incIndex].notes.push({
                author: storeIncidents[incIndex].assignedTo?.name || 'Staff Operative',
                authorRole: 'STAFF',
                text: 'Marked resolved on-site by assigned operative. Physical inspection verified and operational status restored.',
                timestamp: new Date().toISOString()
              });

              // Reduce workload
              if (storeIncidents[incIndex].assignedTo) {
                const uIdx = storeUsers.findIndex(u => u._id === storeIncidents[incIndex].assignedTo._id || u.name === storeIncidents[incIndex].assignedTo.name);
                if (uIdx !== -1) {
                  storeUsers[uIdx].workloadPercentage = Math.max(15, (storeUsers[uIdx].workloadPercentage || 50) - 15);
                  storeUsers[uIdx].availability = 'AVAILABLE';
                  saveAndSync('smartcampus_users', storeUsers);
                }
              }
            }
          }

          if (data.priority) {
            storeIncidents[incIndex].priority = data.priority;
            storeIncidents[incIndex].aiScore = data.priority === 'Critical' ? 95 : data.priority === 'High' ? 80 : data.priority === 'Medium' ? 55 : 30;
          }

          if (data.assignedTo) {
            const foundUser = storeUsers.find(u => u._id === data.assignedTo || u.id === data.assignedTo || u.name === data.assignedTo);
            if (foundUser) {
              storeIncidents[incIndex].assignedTo = {
                _id: foundUser._id || foundUser.id,
                id: foundUser.id || foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                department: foundUser.department,
                phone: foundUser.phone
              };
              storeIncidents[incIndex].status = storeIncidents[incIndex].status === 'New' ? 'In Progress' : storeIncidents[incIndex].status;
            }
          }

          saveAndSync('smartcampus_incidents', storeIncidents);

          // Add activity
          storeActivities.unshift({
            _id: 'act_' + Date.now(),
            message: `[${storeIncidents[incIndex].incidentId}] Status updated to '${storeIncidents[incIndex].status}' by ${storeIncidents[incIndex].assignedTo?.name || 'Operative'}.`,
            userName: 'System Dispatch',
            location: storeIncidents[incIndex].location,
            severity: storeIncidents[incIndex].status === 'Resolved' ? 'Success' : 'Info',
            incidentId: storeIncidents[incIndex].incidentId,
            timestamp: new Date().toISOString()
          });
          saveAndSync('smartcampus_activities', storeActivities);

          addAudit(storeIncidents[incIndex].assignedTo?.name || 'Staff', 'STAFF', 'INCIDENT_UPDATE', storeIncidents[incIndex].incidentId, `Updated status to "${storeIncidents[incIndex].status}" priority to "${storeIncidents[incIndex].priority}"`);

          return Promise.resolve({
            data: {
              success: true,
              message: 'Incident updated successfully.',
              incident: storeIncidents[incIndex]
            }
          });
        }
      }

      // POST /notes: Append Note
      if (method === 'post' && url.includes('/notes')) {
        const cleanUrl = url.split('?')[0];
        const match = cleanUrl.match(/\/incidents\/([^/]+)\/notes/);
        const incId = match ? match[1] : null;
        const inc = storeIncidents.find(i => i._id === incId || i.incidentId === incId);
        if (inc) {
          if (!inc.notes) inc.notes = [];
          const noteObj = {
            author: data.author || inc.assignedTo?.name || 'Vikram Das',
            authorRole: 'STAFF',
            text: data.text || 'Action note appended.',
            timestamp: new Date().toISOString()
          };
          inc.notes.push(noteObj);
          saveAndSync('smartcampus_incidents', storeIncidents);

          addAudit(noteObj.author, 'STAFF', 'NOTE_ADDED', inc.incidentId, noteObj.text);

          return Promise.resolve({
            data: {
              success: true,
              notes: inc.notes,
              incident: inc
            }
          });
        }
      }

      // DELETE: Delete Incident
      if (method === 'delete') {
        const cleanUrl = url.split('?')[0];
        const match = cleanUrl.match(/\/incidents\/([^/]+)/);
        const incId = match ? match[1] : null;
        const target = storeIncidents.find(i => i._id === incId || i.incidentId === incId);
        storeIncidents = storeIncidents.filter(i => i._id !== incId && i.incidentId !== incId);
        saveAndSync('smartcampus_incidents', storeIncidents);

        addAudit('Aman', 'ADMIN', 'INCIDENT_DELETE', target?.incidentId || incId, 'Deleted incident record from registry');

        return Promise.resolve({
          data: {
            success: true,
            message: 'Incident record removed from database.'
          }
        });
      }

      // GET: Filtered incidents list
      let filtered = [...storeIncidents];

      if (assignedTo) {
        filtered = filtered.filter(i => {
          if (!i.assignedTo) return false;
          return i.assignedTo._id === assignedTo || i.assignedTo.id === assignedTo || i.assignedTo.name === assignedTo;
        });
      }

      if (search) {
        filtered = filtered.filter(i =>
          i.title?.toLowerCase().includes(search) ||
          i.description?.toLowerCase().includes(search) ||
          i.location?.toLowerCase().includes(search) ||
          i.incidentId?.toLowerCase().includes(search) ||
          i.roomDetails?.toLowerCase().includes(search) ||
          i.category?.toLowerCase().includes(search) ||
          i.reportedBy?.toLowerCase().includes(search) ||
          i.assignedTo?.name?.toLowerCase().includes(search)
        );
      }

      if (category) filtered = filtered.filter(i => i.category === category);
      if (priority) filtered = filtered.filter(i => i.priority === priority);
      if (status) filtered = filtered.filter(i => i.status === status);
      if (slaStatus) filtered = filtered.filter(i => i.slaStatus === slaStatus);
      if (location) filtered = filtered.filter(i => i.location.toLowerCase().includes(location));

      return Promise.resolve({
        data: {
          success: true,
          incidents: filtered,
          stats: getComputedStats(),
          pagination: { total: filtered.length, page: 1, limit: 50, pages: 1 }
        }
      });
    }

    // 2. SMART SUGGESTIONS & ASSIGNMENTS API
    if (url.includes('/users/suggestions')) {
      const match = url.match(/\/users\/suggestions\/([^/?]+)/);
      const incId = match ? match[1] : null;
      const targetInc = storeIncidents.find(i => i._id === incId || i.incidentId === incId);

      const staffUsers = storeUsers.filter(u => u.role === 'STAFF');
      const suggestions = staffUsers.map(st => {
        let score = 65;
        const incCategory = (targetInc?.category || '').toLowerCase();
        const dept = (st.department || '').toLowerCase();

        if (incCategory === 'medical' && dept.includes('medical')) score += 30;
        else if (incCategory === 'network' && (dept.includes('network') || dept.includes('it'))) score += 30;
        else if (incCategory === 'electrical' && dept.includes('electrical')) score += 30;
        else if (incCategory === 'security' && dept.includes('security')) score += 30;
        else if (incCategory === 'transport' && dept.includes('transport')) score += 30;
        else if ((incCategory === 'hostel' || incCategory === 'infrastructure') && dept.includes('facilities')) score += 30;

        if (st.availability === 'AVAILABLE') score += 10;
        else score -= 15;

        score = Math.max(20, Math.min(99, score - Math.floor((st.workloadPercentage || 40) / 4)));

        return {
          staffId: st._id || st.id,
          name: st.name,
          email: st.email,
          department: st.department,
          skills: st.skills || ['General Maintenance'],
          workloadPercentage: st.workloadPercentage || 40,
          overallSuitability: score
        };
      }).sort((a, b) => b.overallSuitability - a.overallSuitability);

      return Promise.resolve({
        data: {
          success: true,
          suggestions
        }
      });
    }

    if (url.includes('/assignments')) {
      if (method === 'post') {
        const { incidentId, staffId } = data;
        const inc = storeIncidents.find(i => i._id === incidentId || i.incidentId === incidentId);
        const staff = storeUsers.find(u => u._id === staffId || u.id === staffId);

        if (inc && staff) {
          inc.assignedTo = {
            _id: staff._id || staff.id,
            id: staff.id || staff._id,
            name: staff.name,
            email: staff.email,
            department: staff.department,
            phone: staff.phone
          };
          inc.status = inc.status === 'New' ? 'In Progress' : inc.status;
          saveAndSync('smartcampus_incidents', storeIncidents);

          staff.workloadPercentage = Math.min(100, (staff.workloadPercentage || 40) + 15);
          staff.availability = staff.workloadPercentage >= 80 ? 'BUSY' : 'AVAILABLE';
          saveAndSync('smartcampus_users', storeUsers);

          storeActivities.unshift({
            _id: 'act_' + Date.now(),
            message: `AI Smart Dispatch: Dispatched ${staff.name} to ${inc.incidentId} (${inc.location}).`,
            userName: 'Aman (Super Admin)',
            location: inc.location,
            severity: 'Info',
            incidentId: inc.incidentId,
            timestamp: new Date().toISOString()
          });
          saveAndSync('smartcampus_activities', storeActivities);

          addAudit('Aman', 'ADMIN', 'AI_DISPATCH', inc.incidentId, `Dispatched ${staff.name} (${staff.department}) to ticket`);

          return Promise.resolve({
            data: {
              success: true,
              message: `Operative ${staff.name} dispatched successfully.`,
              assignment: { incident: inc, staff }
            }
          });
        }
      }
    }

    // 3. AUDIT LOGS API
    if (url.includes('/audit-logs')) {
      const urlObj = new URL(url, 'http://localhost');
      const search = (urlObj.searchParams.get('search') || '').toLowerCase();
      let filtered = [...storeAuditLogs];
      if (search) {
        filtered = filtered.filter(l =>
          l.action.toLowerCase().includes(search) ||
          l.userName.toLowerCase().includes(search) ||
          l.target.toLowerCase().includes(search) ||
          l.details.toLowerCase().includes(search)
        );
      }
      return Promise.resolve({
        data: {
          success: true,
          logs: filtered
        }
      });
    }

    // 4. LOCATIONS API
    if (url.includes('/locations')) {
      const computedLocations = storeLocations.map(loc => {
        const activeInLoc = storeIncidents.filter(i =>
          i.location.toLowerCase().includes(loc.name.toLowerCase()) &&
          i.status !== 'Resolved' && i.status !== 'Closed'
        );
        const isCrit = activeInLoc.some(i => i.priority === 'Critical');
        const isWarn = activeInLoc.some(i => i.priority === 'High' || i.priority === 'Medium');

        return {
          ...loc,
          activeIncidentCount: activeInLoc.length,
          status: isCrit ? 'Critical' : isWarn ? 'Warning' : 'Operational',
          activeIncidentSummary: activeInLoc.length > 0 ? activeInLoc[0].title : 'All systems nominal'
        };
      });

      return Promise.resolve({
        data: {
          success: true,
          locations: computedLocations
        }
      });
    }

    // 5. SENSORS API
    if (url.includes('/sensors/toggle-simulation')) {
      simulationActive = !simulationActive;
      addAudit('Aman', 'ADMIN', 'TELEMETRY_TOGGLE', 'IOT_BUS', `Telemetry simulation set to ${simulationActive ? 'RESUMED' : 'PAUSED'}`);
      return Promise.resolve({
        data: { success: true, simulationRunning: simulationActive }
      });
    }

    if (url.includes('/sensors')) {
      return Promise.resolve({
        data: {
          success: true,
          simulationRunning: simulationActive,
          sensors: storeSensors
        }
      });
    }

    // 6. USERS API (Add, Edit, Delete, List)
    if (url.includes('/users')) {
      if (method === 'post') {
        const newUser = {
          _id: 'u_' + Date.now(),
          id: 'usr_staff_' + Date.now(),
          name: data.name || 'New Staff',
          email: data.email || 'staff@campus.com',
          role: data.role || 'STAFF',
          department: data.department || 'IT Infrastructure',
          skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',').map(s => s.trim()) : ['General Ops']),
          phone: data.phone || '+91 98765 00000',
          availability: data.availability || 'AVAILABLE',
          workloadPercentage: 20,
          status: 'ACTIVE'
        };
        storeUsers.push(newUser);
        saveAndSync('smartcampus_users', storeUsers);

        addAudit('Aman', 'ADMIN', 'USER_CREATE', newUser.name, `Added ${newUser.name} to ${newUser.department} roster`);

        return Promise.resolve({
          data: {
            success: true,
            message: 'User operative added successfully.',
            user: newUser
          }
        });
      }

      if (method === 'put') {
        const idMatch = url.match(/\/users\/([^/?]+)/);
        const userId = idMatch ? idMatch[1] : null;
        const uIdx = storeUsers.findIndex(u => u._id === userId || u.id === userId);
        if (uIdx !== -1) {
          storeUsers[uIdx] = { ...storeUsers[uIdx], ...data };
          if (typeof data.skills === 'string') {
            storeUsers[uIdx].skills = data.skills.split(',').map(s => s.trim());
          }
          saveAndSync('smartcampus_users', storeUsers);
          addAudit('Aman', 'ADMIN', 'USER_UPDATE', storeUsers[uIdx].name, `Updated details for ${storeUsers[uIdx].name}`);
          return Promise.resolve({
            data: { success: true, message: 'User updated.', user: storeUsers[uIdx] }
          });
        }
      }

      if (method === 'delete') {
        const idMatch = url.match(/\/users\/([^/?]+)/);
        const userId = idMatch ? idMatch[1] : null;
        const target = storeUsers.find(u => u._id === userId || u.id === userId);
        storeUsers = storeUsers.filter(u => u._id !== userId && u.id !== userId);
        saveAndSync('smartcampus_users', storeUsers);
        addAudit('Aman', 'ADMIN', 'USER_DELETE', target?.name || userId, 'Removed operative from roster');
        return Promise.resolve({
          data: { success: true, message: 'User removed from roster.' }
        });
      }

      return Promise.resolve({
        data: {
          success: true,
          users: storeUsers
        }
      });
    }

    // 7. TEAMS API
    if (url.includes('/teams')) {
      return Promise.resolve({
        data: {
          success: true,
          teams: storeTeams
        }
      });
    }

    // 8. MESSAGES API
    if (url.includes('/messages')) {
      const urlObj = new URL(url, 'http://localhost');
      const channel = urlObj.searchParams.get('channel') || 'Command Center';

      if (method === 'post') {
        const newMsg = {
          _id: 'm_' + Date.now(),
          senderName: data.senderName || 'Aman (Admin)',
          senderRole: data.senderRole || 'ADMIN',
          channel: data.channel || channel,
          message: data.message,
          isAlert: !!data.isAlert,
          timestamp: new Date().toISOString()
        };
        storeMessages.push(newMsg);
        saveAndSync('smartcampus_messages', storeMessages);
        return Promise.resolve({
          data: { success: true, message: newMsg }
        });
      }

      const channelMessages = storeMessages.filter(m => m.channel === channel);
      return Promise.resolve({
        data: {
          success: true,
          channel,
          messages: channelMessages
        }
      });
    }

    // 9. ACTIVITIES API
    if (url.includes('/activities')) {
      return Promise.resolve({
        data: {
          success: true,
          activities: storeActivities
        }
      });
    }

    // 10. NOTIFICATIONS API
    if (url.includes('/notifications/read-all')) {
      storeNotifications = storeNotifications.map(n => ({ ...n, read: true }));
      saveAndSync('smartcampus_notifications', storeNotifications);
      return Promise.resolve({ data: { success: true } });
    }

    if (url.includes('/notifications')) {
      const unreadCount = storeNotifications.filter(n => !n.read).length;
      return Promise.resolve({
        data: {
          success: true,
          notifications: storeNotifications,
          unreadCount
        }
      });
    }

    // 11. ANALYTICS
    if (url.includes('/analytics/overview')) {
      return Promise.resolve({
        data: {
          success: true,
          stats: getComputedStats()
        }
      });
    }

    if (url.includes('/analytics/trends')) {
      return Promise.resolve({
        data: {
          success: true,
          timeline: [
            { name: 'Mon', reported: 6, resolved: 5 },
            { name: 'Tue', reported: 8, resolved: 7 },
            { name: 'Wed', reported: 7, resolved: 7 },
            { name: 'Thu', reported: 11, resolved: 10 },
            { name: 'Fri', reported: 9, resolved: 8 },
            { name: 'Sat', reported: 4, resolved: 4 },
            { name: 'Sun', reported: 10, resolved: 9 }
          ]
        }
      });
    }

    if (url.includes('/analytics/distribution')) {
      return Promise.resolve({
        data: {
          success: true,
          categories: [
            { name: 'Medical', value: 4 },
            { name: 'Security', value: 3 },
            { name: 'Network', value: 4 },
            { name: 'Electrical', value: 4 },
            { name: 'Hostel', value: 5 },
            { name: 'Infrastructure', value: 3 }
          ],
          subsystemIntegrity: [
            { subject: 'Network', A: 96, fullMark: 100 },
            { subject: 'Security', A: 92, fullMark: 100 },
            { subject: 'Infrastructure', A: 95, fullMark: 100 },
            { subject: 'Medical', A: 98, fullMark: 100 },
            { subject: 'Power', A: 90, fullMark: 100 },
            { subject: 'Computing', A: 94, fullMark: 100 }
          ]
        }
      });
    }

    if (url.includes('/analytics/workload')) {
      return Promise.resolve({
        data: {
          success: true,
          staff: storeUsers.filter(u => u.role === 'STAFF').map(u => ({
            name: u.name,
            workload: u.workloadPercentage || 40
          }))
        }
      });
    }

    // 12. SETTINGS, LOCKDOWN & EMERGENCY
    if (url.includes('/settings/lockdown')) {
      storeSettings.campusLockdown = !storeSettings.campusLockdown;
      saveAndSync('smartcampus_settings', storeSettings);

      const statusStr = storeSettings.campusLockdown ? 'TRIGGERED PERIMETER LOCKDOWN' : 'LIFTED LOCKDOWN';
      addAudit('Aman', 'ADMIN', 'CAMPUS_LOCKDOWN', 'SECURITY_PERIMETER', statusStr);

      storeActivities.unshift({
        _id: 'act_' + Date.now(),
        message: `PERIMETER SECURITY ALERT: Campus Lockdown ${storeSettings.campusLockdown ? 'ACTIVATED' : 'DEACTIVATED'} by Super Admin.`,
        userName: 'Aman (Super Admin)',
        location: 'All Perimeter Gates',
        severity: 'Critical',
        timestamp: new Date().toISOString()
      });
      saveAndSync('smartcampus_activities', storeActivities);

      return Promise.resolve({
        data: { success: true, lockdown: storeSettings.campusLockdown }
      });
    }

    if (url.includes('/settings/emergency')) {
      storeSettings.emergencyMode = !storeSettings.emergencyMode;
      saveAndSync('smartcampus_settings', storeSettings);

      const alertMsg = data.reason || 'Campus-wide tactical emergency response protocol';
      addAudit('Aman', 'ADMIN', 'EMERGENCY_BROADCAST', 'CAMPUS_WIDE', alertMsg);

      storeNotifications.unshift({
        _id: 'notif_' + Date.now(),
        title: storeSettings.emergencyMode ? '🚨 CAMPUS EMERGENCY BROADCAST' : 'Emergency Stand Down',
        message: alertMsg,
        type: 'emergency',
        read: false,
        timestamp: new Date().toISOString()
      });
      saveAndSync('smartcampus_notifications', storeNotifications);

      return Promise.resolve({
        data: { success: true, emergencyMode: storeSettings.emergencyMode }
      });
    }

    if (url.includes('/settings')) {
      if (method === 'put') {
        storeSettings = { ...storeSettings, ...data };
        saveAndSync('smartcampus_settings', storeSettings);
        addAudit('Aman', 'ADMIN', 'SETTINGS_UPDATE', 'GLOBAL_CONFIG', 'Updated AI and biometric system settings');
        return Promise.resolve({
          data: { success: true, message: 'Settings saved.', settings: storeSettings }
        });
      }

      return Promise.resolve({
        data: {
          success: true,
          settings: storeSettings
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
