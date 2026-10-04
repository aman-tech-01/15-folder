import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Medical',
      'Security',
      'Network',
      'Electrical',
      'Fire',
      'Infrastructure',
      'Transport',
      'Hostel',
      'Academic',
      'Other'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  aiScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  aiReasoning: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  location: {
    type: String,
    required: true
  },
  reportedBy: {
    type: String,
    default: 'Command System'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  status: {
    type: String,
    enum: ['New', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'],
    default: 'New'
  },
  slaStatus: {
    type: String,
    enum: ['On Track', 'At Risk', 'Breached'],
    default: 'On Track'
  },
  slaDeadline: {
    type: Date
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  notes: [{
    author: String,
    authorRole: String,
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  affectedPeople: {
    type: Number,
    default: 1,
    min: 0
  }
}, {
  timestamps: true
});

export const Incident = mongoose.model('Incident', incidentSchema);
