import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
    }

    const secret = process.env.JWT_SECRET || 'smart_campus_command_center_jwt_secret_key_2026_super_secure';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token. User no longer exists.' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'User account is deactivated. Contact Administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication session.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      const secret = process.env.JWT_SECRET || 'smart_campus_command_center_jwt_secret_key_2026_super_secure';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user && user.status !== 'INACTIVE') {
        req.user = user;
      }
    }
  } catch (err) {
    // optional, proceed
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access Forbidden: This operation requires SYSTEM ADMINISTRATOR privileges.' 
    });
  }
  next();
};

export const requireStaffOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF')) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access Forbidden: Authorized campus personnel only.' 
    });
  }
  next();
};
