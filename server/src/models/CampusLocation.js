import mongoose from 'mongoose';

const campusLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  buildingType: {
    type: String,
    required: true
  },
  zone: {
    type: String,
    default: 'Zone Alpha'
  },
  coordinates: {
    x: { type: Number, default: 50 }, // percentage for map grid
    y: { type: Number, default: 50 },
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 }
  },
  status: {
    type: String,
    enum: ['Operational', 'Warning', 'Critical'],
    default: 'Operational'
  },
  activeIncidentCount: {
    type: Number,
    default: 0
  },
  activeIncidentSummary: {
    type: String,
    default: 'All systems normal'
  },
  description: {
    type: String,
    default: ''
  },
  assignedPersonnel: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

export const CampusLocation = mongoose.model('CampusLocation', campusLocationSchema);
