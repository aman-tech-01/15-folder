import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'INCIDENT_CREATED',
      'ASSIGNED',
      'STATUS_CHANGED',
      'PRIORITY_CHANGED',
      'SENSOR_ALERT',
      'EMERGENCY_TRIGGERED',
      'SYSTEM_AUDIT',
      'MESSAGE_SENT',
      'NOTE_ADDED',
      'LOCKDOWN_TRIGGERED'
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    default: 'System'
  },
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    default: null
  },
  incidentId: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['Normal', 'Warning', 'Critical', 'Info'],
    default: 'Info'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Activity = mongoose.model('Activity', activitySchema);
