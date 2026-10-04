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

// Stateful in-memory fallback stores
let storeIncidents = [...demoIncidents];
let storeUsers = [...demoUsers];
let storeTeams = [...demoTeams];
let storeSensors = [...demoSensors];
let storeMessages = [...demoMessages];
let storeActivities = [...demoActivities];
let storeNotifications = [...demoNotifications];
let storeLocations = [...demoLocations];
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
}, 3000);

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 4000
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
        resolvedToday: resolved + 8,
        resolvedIncidents: resolved,
        totalStaff: storeUsers.filter(u => u.role === 'STAFF').length,
        overloadedStaff: storeUsers.filter(u => (u.workloadPercentage || 0) >= 80).length,
        availableTeams: storeTeams.length,
        totalTeams: storeTeams.length,
        responseCapacity: 88,
        safetyReadiness: Math.max(70, 100 - (critical * 5 + high * 2)),
        serverLoad: 72,
        totalTraffic: '2.4 TB',
        computeClusterLoad: 89,
        totalVisitorsTracked: 1480,
        todayActiveLogins: 42
      };
    };

    // 1. INCIDENTS API
    if (url.includes('/incidents')) {
      const urlObj = new URL(url, 'http://localhost');
      const search = (urlObj.searchParams.get('search') || '').toLowerCase();
      const category = urlObj.searchParams.get('category') || '';
      const priority = urlObj.searchParams.get('priority') || '';
      const status = urlObj.searchParams.get('status') || '';
      const slaStatus = urlObj.searchParams.get('slaStatus') || '';
      const assignedTo = urlObj.searchParams.get('assignedTo') || '';
      const location = (urlObj.searchParams.get('location') || '').toLowerCase();

      // POST: Create Incident
      if (method === 'post' && !url.includes('/notes')) {
        const newId = 'inc_' + Date.now();
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
            assignedUser = storeUsers.find(u => u.name === 'Vikram Das') || storeUsers.find(u => u.name === 'Neha Gupta') || storeUsers.find(u => u.department?.includes('IT'));
          } else if (cat === 'Electrical') {
            assignedUser = storeUsers.find(u => u.name === 'Rahul Verma') || storeUsers.find(u => u.department?.includes('Electrical'));
          } else if (cat === 'Security') {
            assignedUser = storeUsers.find(u => u.name?.includes('Suresh')) || storeUsers.find(u => u.department?.includes('Security'));
          } else if (cat === 'Transport') {
            assignedUser = storeUsers.find(u => u.name?.includes('Rajesh')) || storeUsers.find(u => u.department?.includes('Transport'));
          } else if (cat === 'Hostel' || cat === 'Infrastructure' || cat === 'Facilities') {
            assignedUser = storeUsers.find(u => u.name === 'Priya Sharma') || storeUsers.find(u => u.department?.includes('Facilities'));
          }

          // 2. Keyword fallback if not matched
          if (!assignedUser) {
            if (textCorpus.includes('wifi') || textCorpus.includes('wi-fi') || textCorpus.includes('internet') || textCorpus.includes('router') || textCorpus.includes('switch') || textCorpus.includes('server') || textCorpus.includes('fiber')) {
              assignedUser = storeUsers.find(u => u.name === 'Vikram Das') || storeUsers.find(u => u.department?.includes('IT'));
            } else if (textCorpus.includes('electric') || textCorpus.includes('power') || textCorpus.includes('light') || textCorpus.includes('socket') || textCorpus.includes('substation')) {
              assignedUser = storeUsers.find(u => u.name === 'Rahul Verma') || storeUsers.find(u => u.department?.includes('Electrical'));
            } else if (textCorpus.includes('medic') || textCorpus.includes('doctor') || textCorpus.includes('ambulance') || textCorpus.includes('injury') || textCorpus.includes('fever')) {
              assignedUser = storeUsers.find(u => u.name?.includes('Ananya')) || storeUsers.find(u => u.department?.includes('Medical'));
            } else if (textCorpus.includes('security') || textCorpus.includes('guard') || textCorpus.includes('lock') || textCorpus.includes('gate')) {
              assignedUser = storeUsers.find(u => u.name?.includes('Suresh')) || storeUsers.find(u => u.department?.includes('Security'));
            } else if (textCorpus.includes('geyser') || textCorpus.includes('water') || textCorpus.includes('plumbing') || textCorpus.includes('pipe') || textCorpus.includes('hostel')) {
              assignedUser = storeUsers.find(u => u.name === 'Priya Sharma') || storeUsers.find(u => u.department?.includes('Facilities'));
            }
          }

          // Fallback if no specific match
          if (!assignedUser) {
            assignedUser = storeUsers.find(u => u.role === 'STAFF') || storeUsers[0];
          }
        }

        const assignedObj = assignedUser ? {
          _id: assignedUser._id,
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email,
          department: assignedUser.department,
          phone: assignedUser.phone
        } : null;

        const newInc = {
          _id: newId,
          incidentId,
          title: data.title || 'Reported Campus Incident',
          description: data.description || '',
          category: data.category || 'Hostel',
          location: data.location || 'Campus Core',
          roomDetails: data.roomDetails || data.location,
          severity: data.severity || 'Medium',
          affectedPeople: Number(data.affectedPeople) || 1,
          priority: data.priority || 'Medium',
          status: assignedObj ? 'In Progress' : 'New',
          aiScore: data.priority === 'Critical' ? 92 : data.priority === 'High' ? 78 : data.priority === 'Medium' ? 55 : 34,
          assignedTo: assignedObj,
          slaStatus: 'On Track',
          reportedBy: data.reportedBy || 'Student / Campus Portal',
          createdAt: new Date().toISOString(),
          notes: data.notes ? [{ author: assignedObj ? assignedObj.name : 'System Dispatch', authorRole: 'STAFF', text: data.notes, timestamp: new Date().toISOString() }] : []
        };

        storeIncidents.unshift(newInc);

        // Update workload of assigned staff
        if (assignedUser) {
          const uIdx = storeUsers.findIndex(u => u._id === assignedUser._id || u.id === assignedUser.id);
          if (uIdx !== -1) {
            storeUsers[uIdx].workloadPercentage = Math.min(100, (storeUsers[uIdx].workloadPercentage || 40) + 15);
            storeUsers[uIdx].availability = storeUsers[uIdx].workloadPercentage > 80 ? 'BUSY' : 'AVAILABLE';
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

        // Add notification for Admin & Assigned Staff
        storeNotifications.unshift({
          _id: 'notif_' + Date.now(),
          title: `New Query Auto-Assigned: ${incidentId}`,
          message: `"${newInc.title}" at ${newInc.location} assigned to ${assignedObj ? assignedObj.name : 'Staff'}.`,
          type: newInc.priority === 'Critical' ? 'emergency' : 'alert',
          read: false,
          timestamp: new Date().toISOString()
        });

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
        const idMatch = url.match(/\/incidents\/([^/?]+)/);
        const incId = idMatch ? idMatch[1] : null;
        const incIndex = storeIncidents.findIndex(i => i._id === incId || i.incidentId === incId);

        if (incIndex !== -1) {
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
            }
          }
          if (data.priority) storeIncidents[incIndex].priority = data.priority;
          if (data.assignedTo) {
            const foundUser = storeUsers.find(u => u._id === data.assignedTo || u.id === data.assignedTo || u.name === data.assignedTo);
            if (foundUser) {
              storeIncidents[incIndex].assignedTo = {
                _id: foundUser._id,
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                department: foundUser.department
              };
              storeIncidents[incIndex].status = storeIncidents[incIndex].status === 'New' ? 'In Progress' : storeIncidents[incIndex].status;
            }
          }

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
        const idMatch = url.match(/\/incidents\/([^/?]+)\/notes/);
        const incId = idMatch ? idMatch[1] : null;
        const inc = storeIncidents.find(i => i._id === incId || i.incidentId === incId);
        if (inc) {
          if (!inc.notes) inc.notes = [];
          const noteObj = {
            author: 'Vikram Das',
            authorRole: 'STAFF',
            text: data.text || 'Action note appended.',
            timestamp: new Date().toISOString()
          };
          inc.notes.push(noteObj);
          return Promise.resolve({
            data: {
              success: true,
              notes: inc.notes
            }
          });
        }
      }

      // DELETE: Delete Incident
      if (method === 'delete') {
        const idMatch = url.match(/\/incidents\/([^/?]+)/);
        const incId = idMatch ? idMatch[1] : null;
        storeIncidents = storeIncidents.filter(i => i._id !== incId && i.incidentId !== incId);
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
          return i.assignedTo._id === assignedTo || i.assignedTo.id === assignedTo || i.assignedTo.name === 'Vikram Das';
        });
      }

      if (search) {
        filtered = filtered.filter(i =>
          i.title?.toLowerCase().includes(search) ||
          i.description?.toLowerCase().includes(search) ||
          i.location?.toLowerCase().includes(search) ||
          i.incidentId?.toLowerCase().includes(search) ||
          i.roomDetails?.toLowerCase().includes(search)
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

    // 2. LOCATIONS
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

    // 3. SENSORS
    if (url.includes('/sensors/toggle-simulation')) {
      simulationActive = !simulationActive;
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

    // 4. USERS API (Add, Edit, Delete, List)
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
          return Promise.resolve({
            data: { success: true, message: 'User updated.', user: storeUsers[uIdx] }
          });
        }
      }

      if (method === 'delete') {
        const idMatch = url.match(/\/users\/([^/?]+)/);
        const userId = idMatch ? idMatch[1] : null;
        storeUsers = storeUsers.filter(u => u._id !== userId && u.id !== userId);
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

    // 5. TEAMS API
    if (url.includes('/teams')) {
      return Promise.resolve({
        data: {
          success: true,
          teams: storeTeams
        }
      });
    }

    // 6. MESSAGES API (Channel specific + posting)
    if (url.includes('/messages')) {
      const urlObj = new URL(url, 'http://localhost');
      const channel = urlObj.searchParams.get('channel') || 'Command Center';

      if (method === 'post') {
        const newMsg = {
          _id: 'm_' + Date.now(),
          senderName: data.senderName || 'Aman (Admin)',
          senderRole: 'ADMIN',
          channel: data.channel || channel,
          message: data.message,
          isAlert: !!data.isAlert,
          timestamp: new Date().toISOString()
        };
        storeMessages.push(newMsg);
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

    // 7. ACTIVITIES API
    if (url.includes('/activities')) {
      return Promise.resolve({
        data: {
          success: true,
          activities: storeActivities
        }
      });
    }

    // 8. NOTIFICATIONS API
    if (url.includes('/notifications/read-all')) {
      storeNotifications = storeNotifications.map(n => ({ ...n, read: true }));
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

    // 9. ANALYTICS OVERVIEW, TRENDS & DISTRIBUTION
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
            { name: 'Mon', reported: 5, resolved: 4 },
            { name: 'Tue', reported: 8, resolved: 7 },
            { name: 'Wed', reported: 6, resolved: 6 },
            { name: 'Thu', reported: 11, resolved: 9 },
            { name: 'Fri', reported: 9, resolved: 8 },
            { name: 'Sat', reported: 3, resolved: 3 },
            { name: 'Sun', reported: 10, resolved: 8 }
          ]
        }
      });
    }

    if (url.includes('/analytics/distribution')) {
      return Promise.resolve({
        data: {
          success: true,
          categories: [
            { name: 'Medical', value: 3 },
            { name: 'Security', value: 2 },
            { name: 'Network', value: 3 },
            { name: 'Electrical', value: 3 },
            { name: 'Infrastructure', value: 2 }
          ],
          subsystemIntegrity: [
            { subject: 'Network', A: 94, fullMark: 100 },
            { subject: 'Security', A: 90, fullMark: 100 },
            { subject: 'Infrastructure', A: 96, fullMark: 100 },
            { subject: 'Medical', A: 98, fullMark: 100 },
            { subject: 'Power', A: 88, fullMark: 100 },
            { subject: 'Computing', A: 92, fullMark: 100 }
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

    if (url.includes('/settings')) {
      return Promise.resolve({
        data: {
          success: true,
          settings: {
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
          }
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
