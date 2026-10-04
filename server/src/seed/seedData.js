export const seedLocations = [
  {
    name: 'Main Admin Block',
    buildingType: 'Administrative Hub',
    zone: 'Zone Alpha',
    coordinates: { x: 50, y: 30, lat: 28.6139, lng: 77.2090 },
    status: 'Operational',
    activeIncidentCount: 0,
    activeIncidentSummary: 'All systems nominal',
    description: 'Central administrative building housing Chancellor Office, Command Room, and Registrar.'
  },
  {
    name: 'Computer Center',
    buildingType: 'Computing & Server Facility',
    zone: 'Zone Beta',
    coordinates: { x: 42, y: 55, lat: 28.6145, lng: 77.2095 },
    status: 'Warning',
    activeIncidentCount: 1,
    activeIncidentSummary: 'High temperature alert in Server Rack 4B',
    description: 'Central data center, HPC cluster, AI compute cluster, and fiber distribution switchboards.'
  },
  {
    name: 'Hostel A',
    buildingType: 'Residential Block',
    zone: 'Zone Gamma',
    coordinates: { x: 20, y: 25, lat: 28.6150, lng: 77.2080 },
    status: 'Operational',
    activeIncidentCount: 0,
    activeIncidentSummary: 'All systems nominal',
    description: 'Undergraduate student residence with 600 rooms and internal mess facilities.'
  },
  {
    name: 'Hostel B',
    buildingType: 'Residential Block',
    zone: 'Zone Gamma',
    coordinates: { x: 22, y: 68, lat: 28.6130, lng: 77.2082 },
    status: 'Warning',
    activeIncidentCount: 1,
    activeIncidentSummary: 'Wi-Fi mesh bridge offline on 3rd floor',
    description: 'International students and postgraduate residential apartments.'
  },
  {
    name: 'Medical Center',
    buildingType: 'Healthcare & Emergency',
    zone: 'Zone Alpha',
    coordinates: { x: 80, y: 35, lat: 28.6155, lng: 77.2110 },
    status: 'Operational',
    activeIncidentCount: 0,
    activeIncidentSummary: 'Triage readiness 100%',
    description: '24/7 campus emergency hospital with ICU beds and dedicated ambulance dispatch.'
  },
  {
    name: 'Main Ground',
    buildingType: 'Sports & Athletic Arena',
    zone: 'Zone Delta',
    coordinates: { x: 75, y: 72, lat: 28.6125, lng: 77.2115 },
    status: 'Critical',
    activeIncidentCount: 1,
    activeIncidentSummary: 'Medical Emergency: Student dehydration & trauma during tournament',
    description: 'University sports stadium, running tracks, and open event grounds.'
  },
  {
    name: 'Library Hub',
    buildingType: 'Knowledge Hub & Study Center',
    zone: 'Zone Alpha',
    coordinates: { x: 65, y: 22, lat: 28.6160, lng: 77.2098 },
    status: 'Operational',
    activeIncidentCount: 0,
    activeIncidentSummary: 'All reading rooms nominal',
    description: 'Multi-level library with digital repository and silent study spaces.'
  },
  {
    name: 'Academic Complex',
    buildingType: 'Lecture Halls & Auditoriums',
    zone: 'Zone Beta',
    coordinates: { x: 55, y: 82, lat: 28.6120, lng: 77.2095 },
    status: 'Warning',
    activeIncidentCount: 1,
    activeIncidentSummary: 'Projector fault in Auditorium 3',
    description: 'Auditoriums 1-6, modern lecture halls, and collaborative project rooms.'
  },
  {
    name: 'Transport & Parking Hub',
    buildingType: 'Fleet Logistics & Security Gate',
    zone: 'Zone Delta',
    coordinates: { x: 15, y: 88, lat: 28.6115, lng: 77.2075 },
    status: 'Operational',
    activeIncidentCount: 0,
    activeIncidentSummary: 'Bus fleet tracking nominal',
    description: 'University bus fleet depot, EV fast chargers, and main visitor parking.'
  }
];

export const seedSensors = [
  {
    sensorName: 'Server Rack 4B Temperature',
    sensorType: 'Temperature',
    location: 'Computer Center',
    value: 42.4,
    unit: '°C',
    threshold: 45.0,
    status: 'Normal',
    minThreshold: 18,
    maxThreshold: 60
  },
  {
    sensorName: 'Core Optical Switch Load',
    sensorType: 'Network',
    location: 'Computer Center',
    value: 78,
    unit: '%',
    threshold: 85,
    status: 'Normal',
    minThreshold: 0,
    maxThreshold: 100
  },
  {
    sensorName: 'Campus Substation Load',
    sensorType: 'Power',
    location: 'Main Admin Block',
    value: 342,
    unit: 'kW',
    threshold: 450,
    status: 'Normal',
    minThreshold: 50,
    maxThreshold: 600
  },
  {
    sensorName: 'Main Gate Access & ANPR CCTV',
    sensorType: 'CCTV',
    location: 'Transport & Parking Hub',
    value: 99,
    unit: '% Health',
    threshold: 70,
    status: 'Normal',
    minThreshold: 0,
    maxThreshold: 100
  },
  {
    sensorName: 'Hostel B Wi-Fi Backbone',
    sensorType: 'WiFi',
    location: 'Hostel B',
    value: 54,
    unit: '% Signal',
    threshold: 65,
    status: 'Warning',
    minThreshold: 0,
    maxThreshold: 100
  },
  {
    sensorName: 'Library Air Quality Index',
    sensorType: 'AirQuality',
    location: 'Library Hub',
    value: 48,
    unit: 'AQI',
    threshold: 120,
    status: 'Normal',
    minThreshold: 0,
    maxThreshold: 300
  },
  {
    sensorName: 'Sports Complex Ambient Temp',
    sensorType: 'Temperature',
    location: 'Main Ground',
    value: 38.6,
    unit: '°C',
    threshold: 39.0,
    status: 'Warning',
    minThreshold: 15,
    maxThreshold: 50
  },
  {
    sensorName: 'Academic Complex Smart Power UPS',
    sensorType: 'Power',
    location: 'Academic Complex',
    value: 88,
    unit: '% Capacity',
    threshold: 90,
    status: 'Normal',
    minThreshold: 0,
    maxThreshold: 100
  }
];
