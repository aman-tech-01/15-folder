import { Message } from '../models/Message.js';

export const getMessages = async (req, res, next) => {
  try {
    const { channel = 'Command Center', limit = 50 } = req.query;

    const messages = await Message.find({ channel })
      .populate('sender', 'name email role department avatar')
      .sort({ timestamp: 1 })
      .limit(Number(limit));

    // Get unread counts per channel
    const channels = ['Command Center', 'Security Team', 'Medical', 'Facilities', 'IT Support'];
    const channelCounts = await Promise.all(
      channels.map(async ch => ({
        channel: ch,
        count: await Message.countDocuments({ channel: ch })
      }))
    );

    res.json({
      success: true,
      channel,
      count: messages.length,
      channelCounts,
      messages
    });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { channel = 'Command Center', message, isAlert = false } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      channel,
      message: message.trim(),
      isAlert,
      timestamp: new Date()
    });

    const populated = await Message.findById(newMessage._id).populate('sender', 'name email role department avatar');

    const io = req.app.get('io');
    if (io) {
      io.emit(`chat:${channel}`, populated);
      io.emit('chat:message', populated);
    }

    res.status(201).json({
      success: true,
      message: populated
    });
  } catch (err) {
    next(err);
  }
};
