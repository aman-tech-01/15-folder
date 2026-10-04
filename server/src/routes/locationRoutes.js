import express from 'express';
import { getLocations, updateLocation } from '../controllers/locationController.js';
import { authenticateToken, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireStaffOrAdmin, getLocations);
router.put('/:id', requireAdmin, updateLocation);

export default router;
