import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getAuditLogs);

export default router;
