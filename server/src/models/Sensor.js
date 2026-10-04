import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
  sensorName: {
    type: String,
    required: true,
    trim: true
  },
  sensorType: {
    type: String,
    enum: ['Temperature', 'Network', 'Power', 'CCTV', 'WiFi', 'AirQuality', 'AccessControl'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Normal', 'Warning', 'Critical'],
    default: 'Normal'
  },
  threshold: {
    type: Number,
    default: 80
  },
  minThreshold: {
    type: Number,
    default: 0
  },
  maxThreshold: {
    type: Number,
    default: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isSimulated: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Sensor = mongoose.model('Sensor', sensorSchema);
