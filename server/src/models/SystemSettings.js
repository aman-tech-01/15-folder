import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  predictiveAnomalyDetection: {
    type: Boolean,
    default: true
  },
  aiAutomation: {
    type: Boolean,
    default: true
  },
  aiIncidentPrioritization: {
    type: Boolean,
    default: true
  },
  smartResourceAllocation: {
    type: Boolean,
    default: true
  },
  strictBiometricMode: {
    type: Boolean,
    default: false
  },
  notifications: {
    type: Boolean,
    default: true
  },
  emergencyMode: {
    type: Boolean,
    default: false
  },
  emergencyDeclaredAt: {
    type: Date,
    default: null
  },
  emergencyReason: {
    type: String,
    default: ''
  },
  campusLockdown: {
    type: Boolean,
    default: false
  },
  sessionTimeout: {
    type: Number,
    default: 60 // minutes
  },
  auditLogging: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
