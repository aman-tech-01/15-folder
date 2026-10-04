import { SystemSettings } from '../models/SystemSettings.js';
import { AuditLog } from '../models/AuditLog.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    const {
      predictiveAnomalyDetection,
      aiAutomation,
      aiIncidentPrioritization,
      smartResourceAllocation,
      strictBiometricMode,
      notifications,
      sessionTimeout,
      auditLogging
    } = req.body;

    if (predictiveAnomalyDetection !== undefined) settings.predictiveAnomalyDetection = predictiveAnomalyDetection;
    if (aiAutomation !== undefined) settings.aiAutomation = aiAutomation;
    if (aiIncidentPrioritization !== undefined) settings.aiIncidentPrioritization = aiIncidentPrioritization;
    if (smartResourceAllocation !== undefined) settings.smartResourceAllocation = smartResourceAllocation;
    if (strictBiometricMode !== undefined) settings.strictBiometricMode = strictBiometricMode;
    if (notifications !== undefined) settings.notifications = notifications;
    if (sessionTimeout !== undefined) settings.sessionTimeout = Number(sessionTimeout);
    if (auditLogging !== undefined) settings.auditLogging = auditLogging;

    await settings.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SYSTEM_SETTINGS_UPDATED',
      target: 'Global System Configuration',
      details: 'Modified AI, Security, and Core Automation parameters.',
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Settings updated successfully.', settings });
  } catch (err) {
    next(err);
  }
};

export const triggerEmergency = async (req, res, next) => {
  try {
    const { reason = 'Emergency Alarm broadcast by Command Center Administrator' } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    const newMode = !settings.emergencyMode;
    settings.emergencyMode = newMode;
    settings.emergencyDeclaredAt = newMode ? new Date() : null;
    settings.emergencyReason = newMode ? reason : '';
    await settings.save();

    const activity = await Activity.create({
      type: 'EMERGENCY_TRIGGERED',
      message: newMode 
        ? `🚨 EMERGENCY BROADCAST ACTIVATED: "${reason}" by ${req.user.name}. (Software Demonstration Mode)`
        : `✅ Emergency state stood down by ${req.user.name}.`,
      user: req.user._id,
      userName: req.user.name,
      severity: newMode ? 'Critical' : 'Normal'
    });

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: newMode ? 'EMERGENCY_ALARM_TRIGGERED' : 'EMERGENCY_ALARM_CLEARED',
      target: 'Campus-wide Tactical Broadcast',
      details: reason,
      ipAddress: req.ip || '127.0.0.1'
    });

    await Notification.create({
      title: newMode ? 'EMERGENCY ALARM ACTIVATED' : 'Emergency Stood Down',
      message: newMode ? `CAMPUS EMERGENCY: ${reason}` : 'Campus emergency condition returned to normal status.',
      type: newMode ? 'emergency' : 'system'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('system:emergency', { emergencyMode: newMode, reason, triggeredBy: req.user.name });
      io.emit('activity:new', activity);
    }

    res.json({
      success: true,
      emergencyMode: newMode,
      message: newMode ? 'Emergency broadcast activated.' : 'Emergency state cleared.',
      settings
    });
  } catch (err) {
    next(err);
  }
};

export const triggerLockdown = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    const newLockdownState = !settings.campusLockdown;
    settings.campusLockdown = newLockdownState;
    await settings.save();

    const activity = await Activity.create({
      type: 'LOCKDOWN_TRIGGERED',
      message: newLockdownState
        ? `⚠️ CAMPUS LOCKDOWN PROTOCOL INITIATED by ${req.user.name}. Safe demonstration simulation.`
        : `Campus Lockdown Protocol lifted by ${req.user.name}.`,
      user: req.user._id,
      userName: req.user.name,
      severity: newLockdownState ? 'Critical' : 'Normal'
    });

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: newLockdownState ? 'LOCKDOWN_INITIATED' : 'LOCKDOWN_LIFTED',
      target: 'All Gates & Access Perimeter',
      details: 'Demonstration protocol state change.',
      ipAddress: req.ip || '127.0.0.1'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('system:lockdown', { lockdown: newLockdownState, user: req.user.name });
      io.emit('activity:new', activity);
    }

    res.json({
      success: true,
      lockdown: newLockdownState,
      message: newLockdownState ? 'Campus Lockdown Protocol active (Demo Mode).' : 'Lockdown Protocol ended.',
      settings
    });
  } catch (err) {
    next(err);
  }
};
