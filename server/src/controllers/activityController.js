import { Activity } from '../models/Activity.js';

export const getActivities = async (req, res, next) => {
  try {
    const { limit = 30, type, severity } = req.query;
    const query = {};

    if (type) query.type = type;
    if (severity) query.severity = severity;

    const activities = await Activity.find(query)
      .populate('user', 'name role email department')
      .populate('incident', 'incidentId title priority status')
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: activities.length, activities });
  } catch (err) {
    next(err);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const { type, message, location, severity = 'Info', incidentId } = req.body;

    const activity = await Activity.create({
      type,
      message,
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System',
      location: location || '',
      severity,
      incidentId: incidentId || '',
      timestamp: new Date()
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('activity:new', activity);
    }

    res.status(201).json({ success: true, activity });
  } catch (err) {
    next(err);
  }
};
