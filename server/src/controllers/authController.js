import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { Activity } from '../models/Activity.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'smart_campus_command_center_jwt_secret_key_2026_super_secure';
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    secret,
    { expiresIn: '7d' }
  );
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email/User ID and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact System Administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user);

    // Create Audit Log
    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      target: user.email,
      details: `Successful authenticated session started for [${user.role}] role.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        skills: user.skills,
        phone: user.phone,
        avatar: user.avatar,
        availability: user.availability,
        workloadPercentage: user.workloadPercentage
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'USER_LOGOUT',
        target: req.user.email,
        details: 'User logged out successfully.',
        ipAddress: req.ip || '127.0.0.1'
      });
    }
    res.json({ success: true, message: 'Session terminated successfully.' });
  } catch (err) {
    next(err);
  }
};
