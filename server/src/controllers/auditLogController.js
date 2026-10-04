import { AuditLog } from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 50, action, userRole } = req.query;
    const query = {};

    if (action) query.action = { $regex: action, $options: 'i' };
    if (userRole) query.userRole = userRole;

    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};
