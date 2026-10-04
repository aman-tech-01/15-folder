import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    default: 'STAFF'
  },
  channel: {
    type: String,
    enum: ['Command Center', 'Security Team', 'Medical', 'Facilities', 'IT Support'],
    default: 'Command Center'
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  isAlert: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Message = mongoose.model('Message', messageSchema);
