import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'STAFF'],
    default: 'STAFF'
  },
  department: {
    type: String,
    default: 'Operations',
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  phone: {
    type: String,
    default: '+91 98765 43210'
  },
  avatar: {
    type: String,
    default: ''
  },
  availability: {
    type: String,
    enum: ['AVAILABLE', 'BUSY', 'OFF_DUTY'],
    default: 'AVAILABLE'
  },
  workloadPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
