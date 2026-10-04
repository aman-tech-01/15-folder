import express from 'express';
import { getAssignments, createAssignment } from '../controllers/assignmentController.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireStaffOrAdmin, getAssignments);
router.post('/', requireStaffOrAdmin, createAssignment);

export default router;
