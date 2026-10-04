import express from 'express';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../controllers/teamController.js';
import { authenticateToken, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireStaffOrAdmin, getTeams);
router.post('/', requireAdmin, createTeam);
router.put('/:id', requireAdmin, updateTeam);
router.delete('/:id', requireAdmin, deleteTeam);

export default router;
