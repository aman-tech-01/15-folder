import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { Incident } from '../models/Incident.js';
import { CampusLocation } from '../models/CampusLocation.js';
import { Sensor } from '../models/Sensor.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { AuditLog } from '../models/AuditLog.js';
import { Activity } from '../models/Activity.js';
import { seedLocations, seedSensors } from './seedData.js';
import { calculateIncidentAIScore } from '../services/aiService.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Resetting database collections...');

    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Incident.deleteMany({}),
      CampusLocation.deleteMany({}),
      Sensor.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      SystemSettings.deleteMany({}),
      AuditLog.deleteMany({}),
      Activity.deleteMany({})
    ]);

    console.log('[Seeder] Creating Demo Users...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const staffPasswordHash = await bcrypt.hash('Staff@123', 10);

    const admin = await User.create({
      name: 'Aman',
      email: 'admin@campus.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      department: 'Executive Operations',
      skills: ['Incident Command', 'Campus Security', 'AI Systems', 'Disaster Management'],
      phone: '+91 98765 00001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      availability: 'AVAILABLE',
      workloadPercentage: 25,
      status: 'ACTIVE'
    });

    const staffList = await User.create([
      {
        name: 'Vikram Das',
        email: 'staff@campus.com',
        passwordHash: staffPasswordHash,
        role: 'STAFF',
        department: 'IT Infrastructure',
        skills: ['Network Routing', 'Server Hardware', 'Fiber Optics', 'Firewall'],
        phone: '+91 98765 11001',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        availability: 'BUSY',
        workloadPercentage: 95,
        status: 'ACTIVE'
      },
      {
        name: 'Dr. Ananya Roy',
        email: 'ananya@campus.com',
        passwordHash: staffPasswordHash,
        role: 'STAFF',
        department: 'Medical Services',
        skills: ['Emergency Medicine', 'Trauma Care', 'Triage', 'First Aid'],
        phone: '+91 98765 11002',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        availability: 'AVAILABLE',
        workloadPercentage: 40,
        status: 'ACTIVE'
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@campus.com',
        passwordHash: staffPasswordHash,
        role: 'STAFF',
        department: 'Electrical & Power',
        skills: ['Substation Maintenance', 'High Voltage', 'UPS Power', 'Diesel Generators'],
        phone: '+91 98765 11003',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        availability: 'BUSY',
        workloadPercentage: 85,
        status: 'ACTIVE'
      },
      {
        name: 'Neha Gupta',
        email: 'neha@campus.com',
        passwordHash: staffPasswordHash,
        role: 'STAFF',
        department: 'Network & Comms',
        skills: ['Wi-Fi 6', 'Cisco Switching', 'VoIP Systems', 'DNS/DHCP'],
        phone: '+91 98765 11004',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        availability: 'AVAILABLE',
        workloadPercentage: 20,
        status: 'ACTIVE'
      },
      {
        name: 'Capt. Suresh Patil',
        email: 'suresh@campus.com',
        passwordHash: staffPasswordHash,
        role: 'STAFF',
        department: 'Campus Security',
        skills: ['Perimeter Security', 'CCTV Monitoring', 'Crowd Protocol', 'Lockdown Execution'],
        phone: '+91 98765 11005',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        availability: 'AVAILABLE',
        workloadPercentage: 50,
        status: 'ACTIVE'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@campus.com',
        passwordHash: staffPasswordHash,
        role: 'STAFF',
        department: 'Facilities & Safety',
        skills: ['HVAC Management', 'Fire Suppression', 'Water Plumbing', 'Structural Safety'],
        phone: '+91 98765 11006',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        availability: 'AVAILABLE',
        workloadPercentage: 30,
        status: 'ACTIVE'
      },
      {
        name: 'Rajesh Nair',
        email: 'rajesh@campus.com',
        passwordHash: staffPasswordHash,
        role: 'STAFF',
        department: 'Transport & Logistics',
        skills: ['EV Infrastructure', 'Fleet Dispatch', 'Traffic Control'],
        phone: '+91 98765 11007',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        availability: 'AVAILABLE',
        workloadPercentage: 15,
        status: 'ACTIVE'
      }
    ]);

    console.log('[Seeder] Creating Teams...');
    const itTeam = await Team.create({
      name: 'IT Rapid Response Team',
      department: 'IT Infrastructure',
      members: [staffList[0]._id, staffList[3]._id],
      specialization: ['Fiber Break', 'Server Failure', 'Network Blackout'],
      status: 'ACTIVE'
    });

    const medTeam = await Team.create({
      name: 'Campus Medical Unit',
      department: 'Medical Services',
      members: [staffList[1]._id],
      specialization: ['Triage', 'Ambulance Dispatch', 'First Aid'],
      status: 'ACTIVE'
    });

    const secTeam = await Team.create({
      name: 'Tactical Security Unit',
      department: 'Campus Security',
      members: [staffList[4]._id],
      specialization: ['Perimeter Breach', 'Access Lockdown', 'Crowd Incident'],
      status: 'ACTIVE'
    });

    const facTeam = await Team.create({
      name: 'Facility Operations Team',
      department: 'Facilities & Safety',
      members: [staffList[2]._id, staffList[5]._id],
      specialization: ['Power Substation', 'HVAC', 'Water Supply', 'Fire Alarm'],
      status: 'ACTIVE'
    });

    console.log('[Seeder] Creating Campus Locations...');
    await CampusLocation.create(seedLocations);

    console.log('[Seeder] Creating IoT Sensors...');
    await Sensor.create(seedSensors);

    console.log('[Seeder] Creating Realistic Incident Data...');
    const rawIncidents = [
      {
        incidentId: 'INC-AE53',
        title: 'Sports Day Heatstroke & Ankle Trauma',
        description: 'Two athletes collapsed during the 1500m final due to dehydration, accompanied by ankle injury requiring immediate stretcher triage.',
        category: 'Medical',
        severity: 'Critical',
        location: 'Main Ground',
        affectedPeople: 167,
        priority: 'Critical',
        status: 'In Progress',
        assignedTo: staffList[1]._id,
        assignedTeam: medTeam._id,
        slaStatus: 'On Track',
        reportedBy: 'Sports Officer J. Singh',
        notes: [{ author: 'Dr. Ananya Roy', authorRole: 'STAFF', text: 'Paramedic team dispatched with IV fluids and oxygen.' }]
      },
      {
        incidentId: 'INC-AE5B',
        title: 'Projector & Smart Screen Audio Fault',
        description: 'Auditorium 3 smart projector lamp failure and buzzing audio feedback right before keynote lecture.',
        category: 'Academic',
        severity: 'Low',
        location: 'Academic Complex',
        affectedPeople: 36,
        priority: 'Low',
        status: 'In Progress',
        assignedTo: staffList[0]._id,
        assignedTeam: itTeam._id,
        slaStatus: 'On Track',
        reportedBy: 'Prof. S. Sen'
      },
      {
        incidentId: 'INC-AE5A',
        title: 'Hostel B 3rd Floor Wi-Fi Down',
        description: 'Mesh AP controller reboot loop causing total wireless blackout for student study rooms.',
        category: 'Network',
        severity: 'Medium',
        location: 'Hostel B',
        affectedPeople: 65,
        priority: 'Medium',
        status: 'In Progress',
        assignedTo: staffList[3]._id,
        assignedTeam: itTeam._id,
        slaStatus: 'On Track',
        reportedBy: 'Hostel Warden K. Rao'
      },
      {
        incidentId: 'INC-AE5C',
        title: 'Main Server Rack 4B High Temperature Alarm',
        description: 'Chiller compressor fault causing thermal buildup in core compute rack exceeding 42°C threshold.',
        category: 'Electrical',
        severity: 'High',
        location: 'Computer Center',
        affectedPeople: 58,
        priority: 'High',
        status: 'Acknowledged',
        assignedTo: staffList[2]._id,
        assignedTeam: facTeam._id,
        slaStatus: 'On Track',
        reportedBy: 'IoT Thermal Telemetry'
      },
      {
        incidentId: 'INC-AE5D',
        title: 'Main Admin Gate ANPR Camera Sensor Lag',
        description: 'License plate optical recognition feed dropping frames during peak morning vehicular entry.',
        category: 'Security',
        severity: 'Medium',
        location: 'Transport & Parking Hub',
        affectedPeople: 45,
        priority: 'Medium',
        status: 'New',
        slaStatus: 'On Track',
        reportedBy: 'Security Guard Booth 1'
      },
      {
        incidentId: 'INC-AE5E',
        title: 'Hostel A Drinking Water Filtration Line Leak',
        description: 'High pressure inlet pipe leak causing minor flooding in ground floor utility corridor.',
        category: 'Infrastructure',
        severity: 'Medium',
        location: 'Hostel A',
        affectedPeople: 85,
        priority: 'Medium',
        status: 'New',
        slaStatus: 'On Track',
        reportedBy: 'Hostel Maintenance'
      },
      {
        incidentId: 'INC-AE5F',
        title: 'Library 2nd Floor Emergency Exit Door Sensor Glitch',
        description: 'Magnetic lock reporting open status intermittently on south wing fire escape.',
        category: 'Security',
        severity: 'High',
        location: 'Library Hub',
        affectedPeople: 22,
        priority: 'High',
        status: 'New',
        slaStatus: 'At Risk',
        reportedBy: 'Building Management System'
      },
      {
        incidentId: 'INC-AE60',
        title: 'EV Shuttle Bus 04 Battery Inverter Trip',
        description: 'Morning campus route shuttle stalled near East Gate with BMS fault code 409.',
        category: 'Transport',
        severity: 'Low',
        location: 'Transport & Parking Hub',
        affectedPeople: 18,
        priority: 'Low',
        status: 'In Progress',
        assignedTo: staffList[6]._id,
        slaStatus: 'On Track',
        reportedBy: 'Driver M. Khan'
      },
      {
        incidentId: 'INC-AE61',
        title: 'Chemlab Fume Hood Airflow Drop',
        description: 'Exhaust fan belt slippage causing reduced negative pressure in Organic Chemistry Lab 2.',
        category: 'Infrastructure',
        severity: 'Critical',
        location: 'Academic Complex',
        affectedPeople: 40,
        priority: 'Critical',
        status: 'New',
        slaStatus: 'On Track',
        reportedBy: 'Lab Technician R. Gupta'
      },
      {
        incidentId: 'INC-AE62',
        title: 'Library Digital Catalog Server Outage',
        description: 'PostgreSQL database replica synchronization deadlock causing catalog search errors.',
        category: 'Network',
        severity: 'High',
        location: 'Library Hub',
        affectedPeople: 120,
        priority: 'High',
        status: 'Resolved',
        resolvedAt: new Date(Date.now() - 3600000 * 4),
        assignedTo: staffList[0]._id,
        slaStatus: 'On Track',
        reportedBy: 'Chief Librarian'
      },
      {
        incidentId: 'INC-AE63',
        title: 'Auditorium 1 Stage Lighting Dimmer Short',
        description: 'Phase 3 breaker tripped on stage lighting truss during rehearsal.',
        category: 'Electrical',
        severity: 'Medium',
        location: 'Academic Complex',
        affectedPeople: 15,
        priority: 'Medium',
        status: 'Resolved',
        resolvedAt: new Date(Date.now() - 3600000 * 8),
        assignedTo: staffList[2]._id,
        slaStatus: 'On Track',
        reportedBy: 'Cultural Committee'
      },
      {
        incidentId: 'INC-AE64',
        title: 'Hostel B Hot Water Geyser Thermostat Failure',
        description: 'Thermostat stuck closed causing steam release valve trigger on Block 2 rooftop.',
        category: 'Hostel',
        severity: 'High',
        location: 'Hostel B',
        affectedPeople: 90,
        priority: 'High',
        status: 'Resolved',
        resolvedAt: new Date(Date.now() - 3600000 * 12),
        assignedTo: staffList[5]._id,
        slaStatus: 'On Track',
        reportedBy: 'Hostel Caretaker'
      }
    ];

    for (const inc of rawIncidents) {
      const aiScoreResult = calculateIncidentAIScore({
        category: inc.category,
        severity: inc.severity,
        affectedPeople: inc.affectedPeople,
        location: inc.location,
        slaStatus: inc.slaStatus
      });

      const slaHours = inc.priority === 'Critical' ? 2 : inc.priority === 'High' ? 6 : inc.priority === 'Medium' ? 24 : 48;

      await Incident.create({
        ...inc,
        aiScore: aiScoreResult.aiScore,
        aiReasoning: aiScoreResult.reasoning,
        slaDeadline: new Date(Date.now() + slaHours * 3600000)
      });
    }

    console.log('[Seeder] Creating Tactical Chat Messages...');
    await Message.create([
      {
        sender: admin._id,
        senderName: 'Aman',
        senderRole: 'ADMIN',
        channel: 'Command Center',
        message: 'Tactical Command Center online. All sensor streams and emergency telemetry channels active.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        sender: staffList[1]._id,
        senderName: 'Dr. Ananya Roy',
        senderRole: 'STAFF',
        channel: 'Medical',
        message: 'Ambulance Unit 1 is stationed at Main Ground for athletic championship coverage.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45)
      },
      {
        sender: staffList[0]._id,
        senderName: 'Vikram Das',
        senderRole: 'STAFF',
        channel: 'IT Support',
        message: 'Server Rack 4B thermal fan was inspected. Secondary cooling unit brought online.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        sender: staffList[3]._id,
        senderName: 'Neha Gupta',
        senderRole: 'STAFF',
        channel: 'Command Center',
        message: 'Hostel B Wi-Fi AP 302 firmware re-flashed; latency returned to 12ms.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15)
      },
      {
        sender: staffList[4]._id,
        senderName: 'Capt. Suresh Patil',
        senderRole: 'STAFF',
        channel: 'Security Team',
        message: 'Perimeter radar & ANPR camera check completed. 0 unauthorized vehicles flagged.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10)
      }
    ]);

    console.log('[Seeder] Creating Initial Notifications...');
    await Notification.create([
      {
        recipient: admin._id,
        title: 'High Priority Alert: Main Ground',
        message: 'Medical emergency dispatched to Main Ground (Athletics heatstroke).',
        type: 'emergency'
      },
      {
        recipient: staffList[0]._id,
        title: 'Incident Assignment: INC-AE5B',
        message: 'You were assigned to Academic Complex Projector Fault.',
        type: 'assignment'
      },
      {
        recipient: null,
        title: 'System Nominal',
        message: 'Smart Campus OS Core Services and AI Prioritization operational.',
        type: 'system'
      }
    ]);

    console.log('[Seeder] Creating System Settings & Audit Logs...');
    await SystemSettings.create({
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

    await AuditLog.create([
      {
        user: admin._id,
        userName: 'Aman',
        userRole: 'ADMIN',
        action: 'SYSTEM_BOOTSTRAP',
        target: 'SmartCampus OS Command Core',
        details: 'Initial system boot and security protocol initialization.',
        ipAddress: '127.0.0.1'
      },
      {
        user: admin._id,
        userName: 'Aman',
        userRole: 'ADMIN',
        action: 'SECURITY_AUDIT',
        target: 'All Gateway Controllers',
        details: 'Routine integrity scan passed with zero anomalies.',
        ipAddress: '127.0.0.1'
      }
    ]);

    await Activity.create([
      {
        type: 'INCIDENT_CREATED',
        message: '[INC-AE53] Critical Medical Emergency reported at Main Ground. AI Risk: 92%',
        userName: 'Command System',
        location: 'Main Ground',
        severity: 'Critical',
        timestamp: new Date(Date.now() - 1000 * 60 * 40)
      },
      {
        type: 'ASSIGNED',
        message: 'Dispatched Dr. Ananya Roy to INC-AE53 (Main Ground)',
        userName: 'Aman',
        location: 'Main Ground',
        severity: 'Info',
        timestamp: new Date(Date.now() - 1000 * 60 * 35)
      },
      {
        type: 'SENSOR_ALERT',
        message: 'Telemetry Warning: Server Rack 4B reached 42.4°C threshold.',
        userName: 'IoT Telemetry',
        location: 'Computer Center',
        severity: 'Warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 20)
      }
    ]);

    console.log('[Seeder] Database successfully populated with realistic demo dataset!');
  } catch (err) {
    console.error('[Seeder Error]', err);
    throw err;
  }
};

// If run directly via node seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartcampus';
  mongoose.connect(mongoUri)
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
