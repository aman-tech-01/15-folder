export const demoLocations = [
  {
    _id: 'loc_1',
    name: 'Main Admin Block',
    buildingType: 'Administrative Hub',
    zone: 'Zone Alpha',
    coordinates: { x: 50, y: 30, lat: 28.6139, lng: 77.2090 },
    status: 'Operational',
    activeIncidentCount: 0,
    activeIncidentSummary: 'All systems nominal',
    description: 'Central administrative building housing Chancellor Office, Command Room, Server Hub B, and Registrar.'
  },
  {
    _id: 'loc_2',
    name: 'Computer Center',
    buildingType: 'Computing & Server Facility',
    zone: 'Zone Beta',
    coordinates: { x: 42, y: 55, lat: 28.6145, lng: 77.2095 },
    status: 'Critical',
    activeIncidentCount: 2,
    activeIncidentSummary: 'High temperature alert in Server Rack 4B & Fiber line fault',
    description: 'Central data center, HPC cluster, AI compute cluster, Lab 301-304, and fiber distribution switchboards.'
  },
  {
    _id: 'loc_3',
    name: 'Hostel A',
    buildingType: 'Residential Block',
    zone: 'Zone Gamma',
    coordinates: { x: 20, y: 25, lat: 28.6150, lng: 77.2080 },
    status: 'Warning',
    activeIncidentCount: 1,
    activeIncidentSummary: 'Water line valve pressure fluctuation on 2nd Floor',
    description: 'Undergraduate student residence with 600 rooms, dining hall, and internal mess facilities.'
  },
  {
    _id: 'loc_4',
    name: 'Hostel B',
    buildingType: 'Residential Block',
    zone: 'Zone Gamma',
    coordinates: { x: 22, y: 68, lat: 28.6130, lng: 77.2082 },
    status: 'Warning',
    activeIncidentCount: 1,
    activeIncidentSummary: 'Wi-Fi mesh bridge offline on Room 302 / 3rd Floor',
    description: 'International students and postgraduate residential apartments.'
  },
  {
    _id: 'loc_5',
    name: 'Medical Center',
    buildingType: 'Healthcare & Emergency',
    zone: 'Zone Alpha',
    coordinates: { x: 80, y: 35, lat: 28.6155, lng: 77.2110 },
    status: 'Operational',
    activeIncidentCount: 0,
    activeIncidentSummary: 'Triage readiness 100% • 2 Ambulances Stationed',
    description: '24/7 campus emergency hospital with ICU beds, trauma unit, and dedicated ambulance dispatch.'
  },
  {
    _id: 'loc_6',
    name: 'Main Ground',
    buildingType: 'Sports & Athletic Arena',
    zone: 'Zone Delta',
    coordinates: { x: 75, y: 72, lat: 28.6125, lng: 77.2115 },
    status: 'Critical',
    activeIncidentCount: 1,
    activeIncidentSummary: 'Medical Emergency: Student dehydration & trauma during tournament',
    description: 'University sports stadium, running tracks, Pavilion 2, and open event grounds.'
  },
  {
    _id: 'loc_7',
    name: 'Library Hub',
    buildingType: 'Knowledge Hub & Study Center',
    zone: 'Zone Alpha',
    coordinates: { x: 65, y: 22, lat: 28.6160, lng: 77.2098 },
    status: 'Operational',
    activeIncidentCount: 0,
    activeIncidentSummary: 'All reading rooms nominal',
    description: 'Multi-level library with digital repository, silent study spaces, and Digital Archives.'
  },
  {
    _id: 'loc_8',
    name: 'Academic Complex',
    buildingType: 'Lecture Halls & Auditoriums',
    zone: 'Zone Beta',
    coordinates: { x: 55, y: 82, lat: 28.6120, lng: 77.2095 },
    status: 'Warning',
    activeIncidentCount: 1,
    activeIncidentSummary: 'Projector fault in Auditorium 3 (2nd Floor)',
    description: 'Auditoriums 1-6, Chemistry Lab 2, modern lecture halls, and collaborative project rooms.'
  },
  {
    _id: 'loc_9',
    name: 'Transport & Parking Hub',
    buildingType: 'Fleet Logistics & Security Gate',
    zone: 'Zone Delta',
    coordinates: { x: 15, y: 88, lat: 28.6115, lng: 77.2075 },
    status: 'Operational',
    activeIncidentCount: 0,
    activeIncidentSummary: 'Bus fleet tracking nominal • ANPR Gate 1 Active',
    description: 'University bus fleet depot, EV fast charging bays, and main visitor security gate.'
  }
];

export const demoSensors = [
  {
    _id: 'sens_1',
    sensorName: 'Server Rack 4B Temperature',
    sensorType: 'Temperature',
    location: 'Computer Center - Server Rack 4B',
    value: 43.8,
    unit: '°C',
    threshold: 45.0,
    status: 'Warning',
    maxThreshold: 60
  },
  {
    _id: 'sens_2',
    sensorName: 'Core Optical Switch Load',
    sensorType: 'Network',
    location: 'Computer Center - Lab 302 Switchboard',
    value: 82,
    unit: '%',
    threshold: 85,
    status: 'Normal',
    maxThreshold: 100
  },
  {
    _id: 'sens_3',
    sensorName: 'Campus Substation Power Draw',
    sensorType: 'Power',
    location: 'Main Admin Block - Substation Sub-1',
    value: 368,
    unit: 'kW',
    threshold: 450,
    status: 'Normal',
    maxThreshold: 600
  },
  {
    _id: 'sens_4',
    sensorName: 'Main Gate Access ANPR Camera Health',
    sensorType: 'CCTV',
    location: 'Transport & Parking Hub - Gate 1',
    value: 99,
    unit: '% Health',
    threshold: 70,
    status: 'Normal',
    maxThreshold: 100
  },
  {
    _id: 'sens_5',
    sensorName: 'Hostel B Wi-Fi Backbone Signal',
    sensorType: 'WiFi',
    location: 'Hostel B - 3rd Floor Wing A',
    value: 52,
    unit: '% Signal',
    threshold: 65,
    status: 'Warning',
    maxThreshold: 100
  },
  {
    _id: 'sens_6',
    sensorName: 'Central Library Air Quality Index',
    sensorType: 'AirQuality',
    location: 'Library Hub - Reading Hall 1',
    value: 46,
    unit: 'AQI',
    threshold: 120,
    status: 'Normal',
    maxThreshold: 300
  },
  {
    _id: 'sens_7',
    sensorName: 'Hostel A Hydro Pressure Sensor',
    sensorType: 'Pressure',
    location: 'Hostel A - Utility Riser 2',
    value: 4.8,
    unit: 'Bar',
    threshold: 6.0,
    status: 'Normal',
    maxThreshold: 10
  },
  {
    _id: 'sens_8',
    sensorName: 'Chemlab Organic Fume Negative Pressure',
    sensorType: 'Airflow',
    location: 'Academic Complex - Chemistry Lab 2',
    value: 18.5,
    unit: 'Pa',
    threshold: 25.0,
    status: 'Critical',
    maxThreshold: 50
  },
  {
    _id: 'sens_9',
    sensorName: 'Solar Grid Inverter 03 Efficiency',
    sensorType: 'Power',
    location: 'Main Admin Block - Rooftop Array',
    value: 94.2,
    unit: '% Eff',
    threshold: 75.0,
    status: 'Normal',
    maxThreshold: 100
  },
  {
    _id: 'sens_10',
    sensorName: 'Sports Arena Pavilion Smoke Detector',
    sensorType: 'FireSafety',
    location: 'Main Ground - Pavilion 2',
    value: 0.02,
    unit: '% Obs',
    threshold: 0.15,
    status: 'Normal',
    maxThreshold: 1
  }
];

export const demoUsers = [
  {
    _id: 'u1',
    id: 'usr_staff_001',
    name: 'Vikram Das',
    email: 'staff@campus.com',
    role: 'STAFF',
    department: 'IT Infrastructure',
    skills: ['Network Routing', 'Server Hardware', 'Fiber Optics', 'Firewall Admin'],
    phone: '+91 98765 11001',
    availability: 'BUSY',
    workloadPercentage: 80,
    status: 'ACTIVE'
  },
  {
    _id: 'u2',
    id: 'usr_staff_002',
    name: 'Dr. Ananya Roy',
    email: 'ananya@campus.com',
    role: 'STAFF',
    department: 'Medical Services',
    skills: ['Emergency Medicine', 'Trauma Care', 'Triage', 'First Aid Response'],
    phone: '+91 98765 11002',
    availability: 'AVAILABLE',
    workloadPercentage: 40,
    status: 'ACTIVE'
  },
  {
    _id: 'u3',
    id: 'usr_staff_003',
    name: 'Rahul Verma',
    email: 'rahul@campus.com',
    role: 'STAFF',
    department: 'Electrical & Power',
    skills: ['Substation Maintenance', 'High Voltage', 'UPS Power', 'Diesel Generators'],
    phone: '+91 98765 11003',
    availability: 'BUSY',
    workloadPercentage: 85,
    status: 'ACTIVE'
  },
  {
    _id: 'u4',
    id: 'usr_staff_004',
    name: 'Neha Gupta',
    email: 'neha@campus.com',
    role: 'STAFF',
    department: 'Network & Comms',
    skills: ['Wi-Fi 6', 'Cisco Switching', 'VoIP Systems', 'DNS/DHCP'],
    phone: '+91 98765 11004',
    availability: 'AVAILABLE',
    workloadPercentage: 25,
    status: 'ACTIVE'
  },
  {
    _id: 'u5',
    id: 'usr_staff_005',
    name: 'Capt. Suresh Patil',
    email: 'suresh@campus.com',
    role: 'STAFF',
    department: 'Campus Security',
    skills: ['Perimeter Security', 'CCTV Monitoring', 'Crowd Protocol', 'Lockdown Execution'],
    phone: '+91 98765 11005',
    availability: 'AVAILABLE',
    workloadPercentage: 50,
    status: 'ACTIVE'
  },
  {
    _id: 'u6',
    id: 'usr_staff_006',
    name: 'Priya Sharma',
    email: 'priya@campus.com',
    role: 'STAFF',
    department: 'Facilities & Safety',
    skills: ['HVAC Management', 'Fire Suppression', 'Water Plumbing', 'Structural Safety'],
    phone: '+91 98765 11006',
    availability: 'AVAILABLE',
    workloadPercentage: 35,
    status: 'ACTIVE'
  },
  {
    _id: 'u7',
    id: 'usr_staff_007',
    name: 'Rajesh Nair',
    email: 'rajesh@campus.com',
    role: 'STAFF',
    department: 'Transport & Logistics',
    skills: ['EV Infrastructure', 'Fleet Dispatch', 'Traffic Control', 'Battery BMS'],
    phone: '+91 98765 11007',
    availability: 'AVAILABLE',
    workloadPercentage: 20,
    status: 'ACTIVE'
  },
  {
    _id: 'u_admin',
    id: 'usr_admin_001',
    name: 'Aman',
    email: 'admin@campus.com',
    role: 'ADMIN',
    department: 'Executive Operations',
    skills: ['Incident Command', 'Campus Security', 'AI Systems', 'Disaster Management'],
    phone: '+91 98765 00001',
    availability: 'AVAILABLE',
    workloadPercentage: 25,
    status: 'ACTIVE'
  }
];

export const demoTeams = [
  {
    _id: 't1',
    name: 'IT Rapid Response Team',
    department: 'IT Infrastructure',
    status: 'ACTIVE',
    members: [
      { _id: 'u1', name: 'Vikram Das', email: 'staff@campus.com' },
      { _id: 'u4', name: 'Neha Gupta', email: 'neha@campus.com' }
    ],
    specialization: ['Fiber Break', 'Server Failure', 'Network Blackout', 'DNS Crash']
  },
  {
    _id: 't2',
    name: 'Campus Medical Unit',
    department: 'Medical Services',
    status: 'ACTIVE',
    members: [
      { _id: 'u2', name: 'Dr. Ananya Roy', email: 'ananya@campus.com' }
    ],
    specialization: ['Triage', 'Ambulance Dispatch', 'First Aid', 'Heatstroke Care']
  },
  {
    _id: 't3',
    name: 'Tactical Security Unit',
    department: 'Campus Security',
    status: 'ACTIVE',
    members: [
      { _id: 'u5', name: 'Capt. Suresh Patil', email: 'suresh@campus.com' }
    ],
    specialization: ['Perimeter Breach', 'Access Lockdown', 'Crowd Incident', 'ANPR Tracking']
  },
  {
    _id: 't4',
    name: 'Facility Operations Team',
    department: 'Facilities & Safety',
    status: 'ACTIVE',
    members: [
      { _id: 'u3', name: 'Rahul Verma', email: 'rahul@campus.com' },
      { _id: 'u6', name: 'Priya Sharma', email: 'priya@campus.com' }
    ],
    specialization: ['Power Substation', 'HVAC Failure', 'Water Supply Leak', 'Elevator Fault']
  },
  {
    _id: 't5',
    name: 'Green Campus Transit Ops',
    department: 'Transport & Logistics',
    status: 'ACTIVE',
    members: [
      { _id: 'u7', name: 'Rajesh Nair', email: 'rajesh@campus.com' }
    ],
    specialization: ['EV Charging Stations', 'Bus Route Optimization', 'Fleet Battery Health']
  },
  {
    _id: 't6',
    name: 'Fire & Hazardous Safety Taskforce',
    department: 'Facilities & Safety',
    status: 'ACTIVE',
    members: [
      { _id: 'u6', name: 'Priya Sharma', email: 'priya@campus.com' },
      { _id: 'u3', name: 'Rahul Verma', email: 'rahul@campus.com' }
    ],
    specialization: ['Chemical Fume Spills', 'Gas Sensor Alarms', 'Fire Suppression Lines']
  }
];

export const demoIncidents = [
  // 1. Critical
  {
    _id: 'inc_1',
    incidentId: 'INC-AE53',
    title: 'Sports Day Heatstroke & Ankle Trauma',
    description: 'Two athletes collapsed near Pavilion 2 track during 1500m sprint due to severe dehydration. Requires immediate stretcher & IV infusion.',
    category: 'Medical',
    severity: 'Critical',
    location: 'Main Ground - Pavilion 2, Track South',
    roomDetails: 'Track South Pavilion 2',
    affectedPeople: 167,
    priority: 'Critical',
    status: 'In Progress',
    aiScore: 94,
    assignedTo: { _id: 'u2', id: 'usr_staff_002', name: 'Dr. Ananya Roy', department: 'Medical Services' },
    slaStatus: 'On Track',
    reportedBy: 'Sports Officer J. Singh',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: [
      { author: 'Dr. Ananya Roy', authorRole: 'STAFF', text: 'Paramedic van stationed at South Gate. IV fluids initiated.', timestamp: new Date(Date.now() - 3600000 * 1).toISOString() }
    ]
  },
  {
    _id: 'inc_2',
    incidentId: 'INC-AE61',
    title: 'Chemlab Organic Fume Hood Negative Pressure Drop',
    description: 'Exhaust fan belt slippage in Organic Chemistry Lab 2 causing toxic solvent vapor accumulation. Alarm activated.',
    category: 'Infrastructure',
    severity: 'Critical',
    location: 'Academic Complex - Chemistry Lab 2, 2nd Floor',
    roomDetails: 'Chemistry Lab 2, Room 204',
    affectedPeople: 42,
    priority: 'Critical',
    status: 'Acknowledged',
    aiScore: 91,
    assignedTo: { _id: 'u6', id: 'usr_staff_006', name: 'Priya Sharma', department: 'Facilities & Safety' },
    slaStatus: 'On Track',
    reportedBy: 'Lab Incharge Dr. Gupta',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    notes: [
      { author: 'Priya Sharma', authorRole: 'STAFF', text: 'Auxiliary roof exhaust fan turned on manually. Isolating gas valves.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
    ]
  },

  // 2. High Priority
  {
    _id: 'inc_3',
    incidentId: 'INC-AE5C',
    title: 'Main Server Rack 4B Chiller High Temperature Alarm',
    description: 'Core compute cluster AC cooling compressor tripped. Thermal telemetry exceeded 43.8°C critical threshold.',
    category: 'Electrical',
    severity: 'High',
    location: 'Computer Center - Server Rack 4B, 1st Floor',
    roomDetails: 'Server Room 102, Rack 4B',
    affectedPeople: 58,
    priority: 'High',
    status: 'In Progress',
    aiScore: 84,
    assignedTo: { _id: 'u1', id: 'usr_staff_001', name: 'Vikram Das', department: 'IT Infrastructure' },
    slaStatus: 'On Track',
    reportedBy: 'IoT Thermal Telemetry Sensor sens_1',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: [
      { author: 'Vikram Das', authorRole: 'STAFF', text: 'Secondary backup split AC enabled. Thermal load reducing gradually.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }
    ]
  },
  {
    _id: 'inc_4',
    incidentId: 'INC-AE5F',
    title: 'Library South Wing Emergency Fire Door Magnetic Lock Open',
    description: 'South fire escape exit sensor in Digital Archives reporting intermittent open state. Security perimeter alert.',
    category: 'Security',
    severity: 'High',
    location: 'Library Hub - Digital Archives, 2nd Floor',
    roomDetails: '2nd Floor South Wing Fire Escape',
    affectedPeople: 30,
    priority: 'High',
    status: 'New',
    aiScore: 79,
    assignedTo: { _id: 'u5', id: 'usr_staff_005', name: 'Capt. Suresh Patil', department: 'Campus Security' },
    slaStatus: 'At Risk',
    reportedBy: 'BMS Access Gateway',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    _id: 'inc_5',
    incidentId: 'INC-AE64',
    title: 'Hostel B Hot Water Geyser Thermostat Sensor Lock',
    description: 'Thermostat locked on 4th floor rooftop boiler tank causing pressure release valve discharge.',
    category: 'Hostel',
    severity: 'High',
    location: 'Hostel B - Rooftop Boiler Unit, Block 2',
    roomDetails: 'Rooftop Utility Block 2',
    affectedPeople: 85,
    priority: 'High',
    status: 'Acknowledged',
    aiScore: 76,
    assignedTo: { _id: 'u3', id: 'usr_staff_003', name: 'Rahul Verma', department: 'Electrical & Power' },
    slaStatus: 'On Track',
    reportedBy: 'Hostel Caretaker',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },

  // 3. Medium Priority
  {
    _id: 'inc_6',
    incidentId: 'INC-AE5A',
    title: 'Hostel B 3rd Floor Wi-Fi AP Controller Offline',
    description: 'Mesh AP-302 reboot loop causing total wireless blackout for study cubicles and rooms 301 to 320.',
    category: 'Network',
    severity: 'Medium',
    location: 'Hostel B - Room 302 / 3rd Floor Wing A',
    roomDetails: 'Room 302 Corridors',
    affectedPeople: 65,
    priority: 'Medium',
    status: 'In Progress',
    aiScore: 64,
    assignedTo: { _id: 'u1', id: 'usr_staff_001', name: 'Vikram Das', department: 'IT Infrastructure' },
    slaStatus: 'On Track',
    reportedBy: 'Hostel Warden K. Rao',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    notes: [
      { author: 'Vikram Das', authorRole: 'STAFF', text: 'PoE injector power cycled. Flashing new firmware build v4.2.', timestamp: new Date(Date.now() - 3600000 * 9).toISOString() }
    ]
  },
  {
    _id: 'inc_7',
    incidentId: 'INC-AE5E',
    title: 'Hostel A Ground Floor Drinking Water Riser Pipe Seepage',
    description: 'High pressure inlet flange showing minor drip near Common Room water cooler.',
    category: 'Infrastructure',
    severity: 'Medium',
    location: 'Hostel A - Common Room Area, Ground Floor',
    roomDetails: 'Ground Floor Room G-12 Riser',
    affectedPeople: 90,
    priority: 'Medium',
    status: 'New',
    aiScore: 58,
    assignedTo: { _id: 'u6', id: 'usr_staff_006', name: 'Priya Sharma', department: 'Facilities & Safety' },
    slaStatus: 'On Track',
    reportedBy: 'Hostel Supervisor',
    createdAt: new Date(Date.now() - 3600000 * 11).toISOString()
  },
  {
    _id: 'inc_8',
    incidentId: 'INC-AE5D',
    title: 'East Gate ANPR Camera License Recognition Frame Drop',
    description: 'Optical feed buffer full during morning peak student bus convoy entry.',
    category: 'Security',
    severity: 'Medium',
    location: 'Transport & Parking Hub - Security Booth 1',
    roomDetails: 'Main Barrier 1 Gate',
    affectedPeople: 45,
    priority: 'Medium',
    status: 'Acknowledged',
    aiScore: 54,
    assignedTo: { _id: 'u4', id: 'usr_staff_004', name: 'Neha Gupta', department: 'Network & Comms' },
    slaStatus: 'On Track',
    reportedBy: 'Security Guard Booth 1',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },

  // 4. Low Priority
  {
    _id: 'inc_9',
    incidentId: 'INC-AE5B',
    title: 'Auditorium 3 Smart Projector Lamp & HDMI Audio Fault',
    description: 'Smart ceiling projector HDMI handshake dropping audio signal during keynote presentations.',
    category: 'Academic',
    severity: 'Low',
    location: 'Academic Complex - Auditorium 3, 2nd Floor',
    roomDetails: 'Auditorium 3 Podiums',
    affectedPeople: 36,
    priority: 'Low',
    status: 'In Progress',
    aiScore: 38,
    assignedTo: { _id: 'u1', id: 'usr_staff_001', name: 'Vikram Das', department: 'IT Infrastructure' },
    slaStatus: 'On Track',
    reportedBy: 'Prof. S. Sen',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    notes: [
      { author: 'Vikram Das', authorRole: 'STAFF', text: 'Replaced fiber optical HDMI extender. Testing 4K audio output.', timestamp: new Date(Date.now() - 3600000 * 13).toISOString() }
    ]
  },
  {
    _id: 'inc_10',
    incidentId: 'INC-AE60',
    title: 'EV Shuttle Bus 04 Battery BMS Inverter Trip',
    description: 'Morning shuttle route bus showed BMS warning code 409 at East Gate bus shelter.',
    category: 'Transport',
    severity: 'Low',
    location: 'Transport & Parking Hub - Bay 4 Fast Charger',
    roomDetails: 'EV Bay 4 Shelter',
    affectedPeople: 18,
    priority: 'Low',
    status: 'New',
    aiScore: 32,
    assignedTo: { _id: 'u7', id: 'usr_staff_007', name: 'Rajesh Nair', department: 'Transport & Logistics' },
    slaStatus: 'On Track',
    reportedBy: 'Driver M. Khan',
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString()
  },

  // 5. Resolved Incidents (For history, reports & full metrics)
  {
    _id: 'inc_11',
    incidentId: 'INC-AE62',
    title: 'Library Digital Catalog Server Database Lockup',
    description: 'PostgreSQL database replica synchronization deadlock causing catalog search errors in silent study halls.',
    category: 'Network',
    severity: 'High',
    location: 'Library Hub - Server Room B, Basement',
    roomDetails: 'Basement Server Node 12',
    affectedPeople: 120,
    priority: 'High',
    status: 'Resolved',
    aiScore: 82,
    assignedTo: { _id: 'u1', id: 'usr_staff_001', name: 'Vikram Das', department: 'IT Infrastructure' },
    slaStatus: 'On Track',
    reportedBy: 'Chief Librarian',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: [
      { author: 'Vikram Das', authorRole: 'STAFF', text: 'Flushed stuck transaction buffers and restarted read replica. Verified catalog query latency at 8ms.', timestamp: new Date(Date.now() - 3600000 * 20).toISOString() }
    ]
  },
  {
    _id: 'inc_12',
    incidentId: 'INC-AE63',
    title: 'Auditorium 1 Stage Lighting Dimmer Breaker Trip',
    description: 'Phase 3 breaker tripped on stage lighting truss during annual cultural dress rehearsal.',
    category: 'Electrical',
    severity: 'Medium',
    location: 'Academic Complex - Auditorium 1, Main Stage',
    roomDetails: 'Main Stage Dimmer Rack',
    affectedPeople: 50,
    priority: 'Medium',
    status: 'Resolved',
    aiScore: 62,
    assignedTo: { _id: 'u3', id: 'usr_staff_003', name: 'Rahul Verma', department: 'Electrical & Power' },
    slaStatus: 'On Track',
    reportedBy: 'Cultural Committee Head',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    notes: [
      { author: 'Rahul Verma', authorRole: 'STAFF', text: 'Re-balanced phase load across sub-panels. All 32 DMX spotlights operating normally.', timestamp: new Date(Date.now() - 3600000 * 28).toISOString() }
    ]
  },
  {
    _id: 'inc_13',
    incidentId: 'INC-AE65',
    title: 'Admin Block Ground Floor Cafeteria Smoke Sensor False Trigger',
    description: 'Steam exhaust from dish sterilizer unit triggered optical smoke sensor above kitchen corridor.',
    category: 'Fire',
    severity: 'Low',
    location: 'Main Admin Block - Cafeteria Kitchen, Ground Floor',
    roomDetails: 'Kitchen Corridor G-04',
    affectedPeople: 25,
    priority: 'Low',
    status: 'Resolved',
    aiScore: 28,
    assignedTo: { _id: 'u6', id: 'usr_staff_006', name: 'Priya Sharma', department: 'Facilities & Safety' },
    slaStatus: 'On Track',
    reportedBy: 'Kitchen Supervisor',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    notes: [
      { author: 'Priya Sharma', authorRole: 'STAFF', text: 'Cleaned optical chamber and adjusted threshold sensitivity.', timestamp: new Date(Date.now() - 3600000 * 35).toISOString() }
    ]
  }
];

export const demoMessages = [
  {
    _id: 'm1',
    senderName: 'Aman',
    senderRole: 'ADMIN',
    channel: 'Command Center',
    message: 'Tactical Command Center online. All sensor telemetry streams and emergency radio channels active.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    _id: 'm2',
    senderName: 'Dr. Ananya Roy',
    senderRole: 'STAFF',
    channel: 'Command Center',
    message: 'Ambulance Unit 1 is stationed at Main Ground for athletic meet coverage. Paramedic squad standing by.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'm3',
    senderName: 'Vikram Das',
    senderRole: 'STAFF',
    channel: 'Command Center',
    message: 'Investigating Server Rack 4B chiller temperature rise in Computer Center. Secondary cooling enabled.',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    _id: 'm4',
    senderName: 'Capt. Suresh Patil',
    senderRole: 'STAFF',
    channel: 'Security Team',
    message: 'Perimeter radar scan & ANPR camera check completed at East Gate. Zero unauthorized vehicles flagged.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'm5',
    senderName: 'Capt. Suresh Patil',
    senderRole: 'STAFF',
    channel: 'Security Team',
    message: 'Patrol squad dispatched to Library South Wing for magnetic fire escape sensor verification.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'm6',
    senderName: 'Dr. Ananya Roy',
    senderRole: 'STAFF',
    channel: 'Medical',
    message: 'Two athletes receiving IV fluids in Medical Triage Bay 1 for sports heatstroke. Condition stable.',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    _id: 'm7',
    senderName: 'Rahul Verma',
    senderRole: 'STAFF',
    channel: 'Facilities',
    message: 'Substation Transformer 2 oil level checked. Rooftop Solar Inverters generating 94.2% output.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    _id: 'm8',
    senderName: 'Priya Sharma',
    senderRole: 'STAFF',
    channel: 'Facilities',
    message: 'Organic chemistry fume hood damper replacement in progress at Academic Complex Room 204.',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    _id: 'm9',
    senderName: 'Vikram Das',
    senderRole: 'STAFF',
    channel: 'IT Support',
    message: 'Replaced fiber transceiver on core aggregation switch. Hostel B Wi-Fi AP 302 brought back online.',
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString()
  },
  {
    _id: 'm10',
    senderName: 'Neha Gupta',
    senderRole: 'STAFF',
    channel: 'IT Support',
    message: 'Optical backbone packet jitter stabilized at 1.4ms across all hostel residential rings.',
    timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString()
  }
];

export const demoActivities = [
  {
    _id: 'act_1',
    message: '[INC-AE53] Critical Medical Emergency reported at Main Ground (Athletics heatstroke). AI Risk: 94%',
    userName: 'Command System',
    location: 'Main Ground',
    severity: 'Critical',
    incidentId: 'INC-AE53',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    _id: 'act_2',
    message: 'AI Smart Dispatch: Dispatched Dr. Ananya Roy to INC-AE53 (Main Ground)',
    userName: 'Aman (Super Admin)',
    location: 'Main Ground',
    severity: 'Info',
    incidentId: 'INC-AE53',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString()
  },
  {
    _id: 'act_3',
    message: 'Telemetry Alert: Server Rack 4B reached 43.8°C threshold in Computer Center.',
    userName: 'IoT Thermal Telemetry',
    location: 'Computer Center',
    severity: 'Warning',
    incidentId: 'INC-AE5C',
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString()
  },
  {
    _id: 'act_4',
    message: 'Staff Operative Vikram Das acknowledged INC-AE5C (Server Rack Chiller Failure).',
    userName: 'Vikram Das',
    location: 'Computer Center',
    severity: 'Info',
    incidentId: 'INC-AE5C',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString()
  },
  {
    _id: 'act_5',
    message: 'Resolved [INC-AE62] Library Digital Catalog Server Database Lockup.',
    userName: 'Vikram Das',
    location: 'Library Hub',
    severity: 'Info',
    incidentId: 'INC-AE62',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  }
];

export const demoNotifications = [
  {
    _id: 'notif_1',
    title: 'Critical Hazard: Main Ground',
    message: 'Sports heatstroke emergency requires ambulance triage at Pavilion 2.',
    type: 'emergency',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    _id: 'notif_2',
    title: 'Dispatched Ticket: INC-AE5C',
    message: 'Server Rack 4B thermal overload assigned to Vikram Das.',
    type: 'assignment',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString()
  },
  {
    _id: 'notif_3',
    title: 'Telemetry Warning: Organic Chemistry Lab 2',
    message: 'Fume hood negative pressure drop detected (18.5 Pa).',
    type: 'emergency',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString()
  },
  {
    _id: 'notif_4',
    title: 'System Online & Nominal',
    message: 'Smart Campus OS Core Services and AI Risk Prioritization operational.',
    type: 'system',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  }
];
