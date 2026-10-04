import { Sensor } from '../models/Sensor.js';
import { startSimulation, stopSimulation } from '../services/sensorSimulator.js';

let simulationRunning = true;

export const getSensors = async (req, res, next) => {
  try {
    const sensors = await Sensor.find().sort({ location: 1, sensorName: 1 });
    res.json({
      success: true,
      simulationRunning,
      count: sensors.length,
      sensors
    });
  } catch (err) {
    next(err);
  }
};

export const createSensor = async (req, res, next) => {
  try {
    const { sensorName, sensorType, location, value, unit, threshold, minThreshold, maxThreshold } = req.body;

    const sensor = await Sensor.create({
      sensorName: sensorName.trim(),
      sensorType,
      location: location.trim(),
      value: Number(value) || 0,
      unit,
      threshold: Number(threshold) || 80,
      minThreshold: Number(minThreshold) || 0,
      maxThreshold: Number(maxThreshold) || 100,
      status: 'Normal',
      isSimulated: true
    });

    res.status(201).json({ success: true, message: 'Sensor registered successfully.', sensor });
  } catch (err) {
    next(err);
  }
};

export const updateSensor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, threshold, status } = req.body;

    const sensor = await Sensor.findById(id);
    if (!sensor) {
      return res.status(404).json({ success: false, message: 'Sensor not found.' });
    }

    if (value !== undefined) sensor.value = Number(value);
    if (threshold !== undefined) sensor.threshold = Number(threshold);
    if (status) sensor.status = status;
    sensor.lastUpdated = new Date();

    await sensor.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('sensor:update', sensor);
    }

    res.json({ success: true, message: 'Sensor updated.', sensor });
  } catch (err) {
    next(err);
  }
};

export const toggleSimulation = async (req, res, next) => {
  try {
    simulationRunning = !simulationRunning;
    if (simulationRunning) {
      startSimulation();
    } else {
      stopSimulation();
    }

    res.json({
      success: true,
      simulationRunning,
      message: `Sensor telemetry simulation ${simulationRunning ? 'ACTIVATED' : 'PAUSED'}.`
    });
  } catch (err) {
    next(err);
  }
};
