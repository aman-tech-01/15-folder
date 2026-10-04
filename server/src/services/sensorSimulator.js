import { Sensor } from '../models/Sensor.js';
import { Activity } from '../models/Activity.js';

let simulatorInterval = null;
let ioInstance = null;

export const initSensorSimulator = (io) => {
  ioInstance = io;
  startSimulation();
};

export const startSimulation = () => {
  if (simulatorInterval) return;

  simulatorInterval = setInterval(async () => {
    try {
      const sensors = await Sensor.find({ isSimulated: true });
      if (!sensors || sensors.length === 0) return;

      // Pick 1-2 random sensors to fluctuate slightly
      const count = Math.min(2, sensors.length);
      const shuffled = [...sensors].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);

      for (const sensor of selected) {
        let delta = 0;
        let newValue = sensor.value;

        if (sensor.sensorType === 'Temperature') {
          // Normal: 35-45 C, fluctuate +- 1.5
          delta = (Math.random() * 3 - 1.5);
          newValue = Math.max(25, Math.min(75, +(sensor.value + delta).toFixed(1)));
        } else if (sensor.sensorType === 'Network') {
          // Network load: 40-95%
          delta = Math.floor(Math.random() * 10 - 5);
          newValue = Math.max(10, Math.min(100, sensor.value + delta));
        } else if (sensor.sensorType === 'Power') {
          // Power: 200-450 kW
          delta = Math.floor(Math.random() * 15 - 7);
          newValue = Math.max(150, Math.min(600, sensor.value + delta));
        } else if (sensor.sensorType === 'WiFi') {
          // WiFi: 70-100%
          delta = Math.floor(Math.random() * 6 - 3);
          newValue = Math.max(40, Math.min(100, sensor.value + delta));
        } else if (sensor.sensorType === 'AirQuality') {
          // AQI: 30-180
          delta = Math.floor(Math.random() * 8 - 4);
          newValue = Math.max(20, Math.min(300, sensor.value + delta));
        }

        // Determine status based on threshold
        let newStatus = 'Normal';
        if (newValue >= sensor.threshold) {
          newStatus = newValue >= sensor.threshold * 1.25 ? 'Critical' : 'Warning';
        } else {
          newStatus = 'Normal';
        }

        const previousStatus = sensor.status;
        sensor.value = newValue;
        sensor.status = newStatus;
        sensor.lastUpdated = new Date();
        await sensor.save();

        if (ioInstance) {
          ioInstance.emit('sensor:update', sensor);
        }

        // If status escalated to Warning or Critical, log activity
        if (newStatus !== 'Normal' && previousStatus === 'Normal') {
          const activity = await Activity.create({
            type: 'SENSOR_ALERT',
            message: `Telemetry Alert: ${sensor.sensorName} (${sensor.location}) reached ${sensor.value} ${sensor.unit} [${newStatus} threshold].`,
            location: sensor.location,
            severity: newStatus === 'Critical' ? 'Critical' : 'Warning',
            timestamp: new Date()
          });

          if (ioInstance) {
            ioInstance.emit('activity:new', activity);
          }
        }
      }
    } catch (err) {
      console.error('[Sensor Simulator Error]', err.message);
    }
  }, 12000); // every 12 seconds
};

export const stopSimulation = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
};
