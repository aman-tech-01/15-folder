import express from 'express';
import {
  getSettings,
  updateSettings,
  triggerEmergency,
  triggerLockdown
} from '../controllers/settingsController.js';
import { authenticateToken, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireStaffOrAdmin, getSettings);
router.put('/', requireAdmin, updateSettings);
router.post('/emergency', requireAdmin, triggerEmergency);
router.post('/lockdown', requireAdmin, triggerLockdown);

export default router;
