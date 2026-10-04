import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignmentScore: {
    type: Number,
    default: 80
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'REASSIGNED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

export const Assignment = mongoose.model('Assignment', assignmentSchema);
