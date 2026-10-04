import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    default: 'System Administrator'
  },
  userRole: {
    type: String,
    default: 'ADMIN'
  },
  action: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
