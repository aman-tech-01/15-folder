import express from 'express';
import { getActivities, createActivity } from '../controllers/activityController.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireStaffOrAdmin, getActivities);
router.post('/', requireStaffOrAdmin, createActivity);

export default router;
