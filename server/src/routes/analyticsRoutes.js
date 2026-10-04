import express from 'express';
import {
  getOverview,
  getIncidentTrends,
  getCategoryAndPriorityStats,
  getWorkloadStats
} from '../controllers/analyticsController.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/overview', requireStaffOrAdmin, getOverview);
router.get('/trends', requireStaffOrAdmin, getIncidentTrends);
router.get('/distribution', requireStaffOrAdmin, getCategoryAndPriorityStats);
router.get('/workload', requireStaffOrAdmin, getWorkloadStats);

export default router;
