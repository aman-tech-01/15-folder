import { Notification } from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        { recipient: null }
      ]
    }).sort({ timestamp: -1 }).limit(30);

    const unreadCount = await Notification.countDocuments({
      $or: [
        { recipient: userId },
        { recipient: null }
      ],
      read: false
    });

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    await Notification.updateMany(
      {
        $or: [
          { recipient: userId },
          { recipient: null }
        ]
      },
      { read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};
