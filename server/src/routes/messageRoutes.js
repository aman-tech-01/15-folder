import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireStaffOrAdmin, getMessages);
router.post('/', requireStaffOrAdmin, sendMessage);

export default router;
