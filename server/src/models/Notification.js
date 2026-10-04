import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null means broadcast to all
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['alert', 'assignment', 'status', 'system', 'emergency'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);
