import express from 'express';
import {
  getSensors,
  createSensor,
  updateSensor,
  toggleSimulation
} from '../controllers/sensorController.js';
import { authenticateToken, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireStaffOrAdmin, getSensors);
router.post('/toggle-simulation', requireAdmin, toggleSimulation);
router.post('/', requireAdmin, createSensor);
router.put('/:id', requireAdmin, updateSensor);

export default router;
