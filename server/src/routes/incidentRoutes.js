import express from 'express';
import {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  updateIncidentPriority,
  updateIncidentStatus,
  addIncidentNote,
  deleteIncident
} from '../controllers/incidentController.js';
import { authenticateToken, optionalAuth, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public / Student complaint registration & tracking
router.post('/', optionalAuth, createIncident);

// Protected Staff / Admin incident management endpoints
router.get('/', authenticateToken, requireStaffOrAdmin, getIncidents);
router.get('/:id', authenticateToken, requireStaffOrAdmin, getIncidentById);
router.put('/:id', authenticateToken, requireStaffOrAdmin, updateIncident);
router.patch('/:id', authenticateToken, requireStaffOrAdmin, updateIncidentStatus);
router.patch('/:id/priority', authenticateToken, requireStaffOrAdmin, updateIncidentPriority);
router.patch('/:id/status', authenticateToken, requireStaffOrAdmin, updateIncidentStatus);
router.post('/:id/notes', authenticateToken, requireStaffOrAdmin, addIncidentNote);
router.delete('/:id', authenticateToken, requireAdmin, deleteIncident);

export default router;
