import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStaffSuggestions
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireStaffOrAdmin, getUsers);
router.get('/suggestions/:incidentId', requireStaffOrAdmin, getStaffSuggestions);
router.get('/:id', requireStaffOrAdmin, getUserById);

// Admin-only actions
router.post('/', requireAdmin, createUser);
router.put('/:id', requireStaffOrAdmin, updateUser); // controller has role-based field restrictions
router.delete('/:id', requireAdmin, deleteUser);

export default router;
