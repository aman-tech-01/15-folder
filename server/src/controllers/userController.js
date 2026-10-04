import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Incident } from '../models/Incident.js';
import { AuditLog } from '../models/AuditLog.js';
import { calculateStaffSuitability } from '../services/aiService.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, department, status, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'STAFF', department, skills, phone, availability } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      department: department || 'Operations',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      phone: phone || '+91 98765 43210',
      availability: availability || 'AVAILABLE',
      workloadPercentage: 0,
      status: 'ACTIVE'
    });

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_CREATED',
      target: newUser.email,
      details: `Created new user [${newUser.name}] with role [${newUser.role}] in [${newUser.department}].`,
      ipAddress: req.ip || '127.0.0.1'
    });

    const userObj = newUser.toObject();
    delete userObj.passwordHash;

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: userObj
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, department, skills, phone, availability, workloadPercentage, status, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Role check: Only ADMIN can change role or edit other users
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this user account.' });
    }

    if (name) user.name = name.trim();
    if (department) user.department = department;
    if (phone) user.phone = phone;
    if (availability) user.availability = availability;
    if (status && req.user.role === 'ADMIN') user.status = status;
    if (role && req.user.role === 'ADMIN') user.role = role;
    if (workloadPercentage !== undefined) user.workloadPercentage = Number(workloadPercentage);
    if (skills) {
      user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_UPDATED',
      target: user.email,
      details: `Updated user profile/settings for [${user.name}].`,
      ipAddress: req.ip || '127.0.0.1'
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({
      success: true,
      message: 'User updated successfully.',
      user: userObj
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'ADMIN' && user.email === 'admin@campus.com') {
      return res.status(400).json({ success: false, message: 'Primary Administrator account cannot be deleted.' });
    }

    await User.findByIdAndDelete(id);

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_DELETED',
      target: user.email,
      details: `Deleted user record [${user.name}].`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'User removed successfully.' });
  } catch (err) {
    next(err);
  }
};

export const getStaffSuggestions = async (req, res, next) => {
  try {
    const { incidentId } = req.params;
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    const staffList = await User.find({ role: 'STAFF', status: 'ACTIVE' }).select('-passwordHash');
    const suggestions = calculateStaffSuitability(incident, staffList);

    if (suggestions.length > 0) {
      suggestions[0].isRecommended = true;
    }

    res.json({
      success: true,
      incident: {
        id: incident._id,
        incidentId: incident.incidentId,
        title: incident.title,
        category: incident.category,
        priority: incident.priority
      },
      suggestions
    });
  } catch (err) {
    next(err);
  }
};
