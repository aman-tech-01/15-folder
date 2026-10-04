import { Assignment } from '../models/Assignment.js';
import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';

export const getAssignments = async (req, res, next) => {
  try {
    const { staffId, incidentId, status } = req.query;
    const query = {};

    if (staffId) query.staff = staffId;
    if (incidentId) query.incident = incidentId;
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
      .populate('incident')
      .populate('staff', 'name email department phone avatar workloadPercentage availability')
      .populate('assignedBy', 'name role')
      .sort({ assignedAt: -1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (err) {
    next(err);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const { incidentId, staffId, teamId, assignmentScore = 85 } = req.body;

    if (!incidentId || !staffId) {
      return res.status(400).json({ success: false, message: 'Incident ID and Staff ID are required.' });
    }

    const [incident, staff] = await Promise.all([
      Incident.findById(incidentId),
      User.findById(staffId)
    ]);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    // Update incident
    incident.assignedTo = staff._id;
    if (teamId) incident.assignedTeam = teamId;
    if (incident.status === 'New') {
      incident.status = 'Acknowledged';
    }
    await incident.save();

    // Update staff workload
    staff.workloadPercentage = Math.min(100, (staff.workloadPercentage || 0) + 20);
    if (staff.workloadPercentage >= 80) {
      staff.availability = 'BUSY';
    }
    await staff.save();

    // Create Assignment
    const assignment = await Assignment.create({
      incident: incident._id,
      staff: staff._id,
      team: teamId || null,
      assignedBy: req.user ? req.user._id : null,
      assignmentScore: Number(assignmentScore) || 85,
      status: 'ACTIVE'
    });

    // Create Activity
    const activity = await Activity.create({
      type: 'ASSIGNED',
      message: `[${incident.incidentId}] Dispatched ${staff.name} (${staff.department}) to "${incident.title}" at ${incident.location}. AI Match: ${assignmentScore}%`,
      user: req.user._id,
      userName: req.user.name,
      incident: incident._id,
      incidentId: incident.incidentId,
      location: incident.location,
      severity: 'Info'
    });

    // Send targeted notification to staff
    const notification = await Notification.create({
      recipient: staff._id,
      title: `Assignment: ${incident.incidentId}`,
      message: `You have been dispatched to ${incident.title} at ${incident.location}. Priority: ${incident.priority}.`,
      type: 'assignment',
      link: `/incidents?id=${incident._id}`
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('assignment:new', assignment);
      io.emit('incident:updated', incident);
      io.emit('user:updated', staff);
      io.emit('activity:new', activity);
      io.emit(`notification:${staff._id}`, notification);
    }

    res.status(201).json({
      success: true,
      message: `Incident ${incident.incidentId} successfully assigned to ${staff.name}.`,
      assignment
    });
  } catch (err) {
    next(err);
  }
};
