import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  specialization: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'DISPATCHED', 'STANDBY'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

export const Team = mongoose.model('Team', teamSchema);
