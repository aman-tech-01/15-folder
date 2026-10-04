import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { AuditLog } from '../models/AuditLog.js';
import { CampusLocation } from '../models/CampusLocation.js';
import { Notification } from '../models/Notification.js';
import { calculateIncidentAIScore } from '../services/aiService.js';

export const getIncidents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      priority,
      status,
      slaStatus,
      location,
      assignedTo,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (slaStatus) query.slaStatus = slaStatus;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { incidentId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .populate('assignedTo', 'name email department avatar phone workloadPercentage')
        .populate('assignedTeam', 'name department')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Incident.countDocuments(query)
    ]);

    // Calculate live summary stats from database
    const [
      totalCount,
      criticalCount,
      highCount,
      activeCount,
      resolvedCount,
      slaBreachedCount
    ] = await Promise.all([
      Incident.countDocuments(),
      Incident.countDocuments({ priority: 'Critical', status: { $nin: ['Resolved', 'Closed'] } }),
      Incident.countDocuments({ priority: 'High', status: { $nin: ['Resolved', 'Closed'] } }),
      Incident.countDocuments({ status: { $in: ['New', 'Acknowledged', 'In Progress'] } }),
      Incident.countDocuments({ status: { $in: ['Resolved', 'Closed'] } }),
      Incident.countDocuments({ slaStatus: 'Breached', status: { $nin: ['Resolved', 'Closed'] } })
    ]);

    res.json({
      success: true,
      stats: {
        total: totalCount,
        critical: criticalCount,
        high: highCount,
        active: activeCount,
        resolved: resolvedCount,
        slaBreached: slaBreachedCount
      },
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      },
      incidents
    });
  } catch (err) {
    next(err);
  }
};

export const getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('assignedTo', 'name email department phone skills availability workloadPercentage')
      .populate('assignedTeam', 'name department members');

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    res.json({ success: true, incident });
  } catch (err) {
    next(err);
  }
};

export const createIncident = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      location,
      severity = 'Medium',
      affectedPeople = 1,
      priority,
      notes
    } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ success: false, message: 'Title, description, category, and location are required.' });
    }

    // Generate unique ID
    const count = await Incident.countDocuments();
    const incidentId = `INC-${String(count + 101).padStart(4, '0')}`;

    // AI Scoring Calculation
    const aiResult = calculateIncidentAIScore({
      category,
      severity,
      affectedPeople,
      location,
      slaStatus: 'On Track'
    });

    const finalPriority = priority || aiResult.suggestedPriority;

    // Set SLA deadline based on priority
    const slaHours = finalPriority === 'Critical' ? 2 : finalPriority === 'High' ? 6 : finalPriority === 'Medium' ? 24 : 48;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const initialNotes = [];
    if (notes) {
      initialNotes.push({
        author: req.user ? req.user.name : (req.body.reportedBy || 'Student / Visitor'),
        authorRole: req.user ? req.user.role : 'GUEST',
        text: notes,
        timestamp: new Date()
      });
    }

    // Determine best staff operative if unassigned
    let assignedUserId = req.body.assignedTo || null;
    let assignedStaffObj = null;
    if (!assignedUserId) {
      const textCorpus = `${title || ''} ${description || ''} ${category || ''} ${location || ''}`.toLowerCase();
      // 1. Check explicit category first
      if (category === 'Medical') {
        staffMatch = await User.findOne({ name: { $regex: 'Ananya', $options: 'i' } }) || await User.findOne({ department: { $regex: 'Medical', $options: 'i' } });
      } else if (category === 'Network' || category === 'IT') {
        staffMatch = await User.findOne({ name: 'Vikram Das' }) || await User.findOne({ department: { $regex: 'IT', $options: 'i' } });
      } else if (category === 'Electrical') {
        staffMatch = await User.findOne({ name: 'Rahul Verma' }) || await User.findOne({ department: { $regex: 'Electrical', $options: 'i' } });
      } else if (category === 'Security') {
        staffMatch = await User.findOne({ name: { $regex: 'Suresh', $options: 'i' } }) || await User.findOne({ department: { $regex: 'Security', $options: 'i' } });
      } else if (category === 'Transport') {
        staffMatch = await User.findOne({ name: { $regex: 'Rajesh', $options: 'i' } }) || await User.findOne({ department: { $regex: 'Transport', $options: 'i' } });
      } else if (category === 'Hostel' || category === 'Infrastructure' || category === 'Facilities') {
        staffMatch = await User.findOne({ name: 'Priya Sharma' }) || await User.findOne({ department: { $regex: 'Facilities', $options: 'i' } });
      }

      // 2. Keyword fallback if not matched by category
      if (!staffMatch) {
        if (textCorpus.includes('wifi') || textCorpus.includes('wi-fi') || textCorpus.includes('internet') || textCorpus.includes('router') || textCorpus.includes('switch') || textCorpus.includes('server')) {
          staffMatch = await User.findOne({ name: 'Vikram Das' }) || await User.findOne({ department: { $regex: 'IT', $options: 'i' } });
        } else if (textCorpus.includes('electric') || textCorpus.includes('power') || textCorpus.includes('light') || textCorpus.includes('socket') || textCorpus.includes('substation')) {
          staffMatch = await User.findOne({ name: 'Rahul Verma' }) || await User.findOne({ department: { $regex: 'Electrical', $options: 'i' } });
        } else if (textCorpus.includes('medic') || textCorpus.includes('doctor') || textCorpus.includes('ambulance') || textCorpus.includes('injury') || textCorpus.includes('fever')) {
          staffMatch = await User.findOne({ name: { $regex: 'Ananya', $options: 'i' } }) || await User.findOne({ department: { $regex: 'Medical', $options: 'i' } });
        } else if (textCorpus.includes('security') || textCorpus.includes('lock') || textCorpus.includes('gate') || textCorpus.includes('theft')) {
          staffMatch = await User.findOne({ name: { $regex: 'Suresh', $options: 'i' } }) || await User.findOne({ department: { $regex: 'Security', $options: 'i' } });
        } else if (textCorpus.includes('geyser') || textCorpus.includes('water') || textCorpus.includes('plumbing') || textCorpus.includes('tap') || textCorpus.includes('pipe') || textCorpus.includes('leak') || textCorpus.includes('hostel')) {
          staffMatch = await User.findOne({ name: 'Priya Sharma' }) || await User.findOne({ department: { $regex: 'Facilities', $options: 'i' } });
        }
      }

      if (!staffMatch) {
        staffMatch = await User.findOne({ role: 'STAFF' });
      }

      if (staffMatch) {
        assignedUserId = staffMatch._id;
        assignedStaffObj = staffMatch;
        // Increase workload
        staffMatch.workloadPercentage = Math.min(100, (staffMatch.workloadPercentage || 40) + 15);
        await staffMatch.save();
      }
    }

    const newIncident = await Incident.create({
      incidentId,
      title: title.trim(),
      description: description.trim(),
      category,
      priority: finalPriority,
      aiScore: aiResult.aiScore,
      aiReasoning: aiResult.reasoning,
      severity,
      location: location.trim(),
      reportedBy: req.user ? req.user.name : (req.body.reportedBy || 'Student / Campus Portal'),
      slaStatus: 'On Track',
      slaDeadline,
      notes: initialNotes,
      affectedPeople: Number(affectedPeople) || 1,
      assignedTo: assignedUserId,
      status: assignedUserId ? 'In Progress' : 'New'
    });

    // Update Campus Location status
    const campusLoc = await CampusLocation.findOne({ name: { $regex: location.trim(), $options: 'i' } });
    if (campusLoc) {
      campusLoc.activeIncidentCount += 1;
      campusLoc.activeIncidentSummary = `${finalPriority} alert: ${title.trim()}`;
      if (finalPriority === 'Critical') campusLoc.status = 'Critical';
      else if (finalPriority === 'High' && campusLoc.status !== 'Critical') campusLoc.status = 'Warning';
      await campusLoc.save();
    }

    // Create Activity Log
    const activity = await Activity.create({
      type: 'INCIDENT_CREATED',
      message: `[${incidentId}] New ${finalPriority} incident reported: "${title}" at ${location}. Auto-assigned to ${assignedStaffObj ? assignedStaffObj.name : 'Staff Operative'}.`,
      user: req.user ? req.user._id : assignedUserId,
      userName: req.user ? req.user.name : (req.body.reportedBy || 'Student Portal'),
      incident: newIncident._id,
      incidentId: newIncident.incidentId,
      location,
      severity: finalPriority === 'Critical' ? 'Critical' : finalPriority === 'High' ? 'Warning' : 'Info',
      timestamp: new Date()
    });

    // Populate assignedTo for API response
    const populatedIncident = await Incident.findById(newIncident._id)
      .populate('assignedTo', 'name email department phone workloadPercentage availability');

    // Notify all staff/admins
    await Notification.create({
      title: `New Incident: ${incidentId}`,
      message: `${title} at ${location} (${finalPriority} Priority)`,
      type: finalPriority === 'Critical' ? 'emergency' : 'alert',
      link: `/incidents?id=${newIncident._id}`
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:new', newIncident);
      io.emit('activity:new', activity);
    }

    res.status(201).json({
      success: true,
      message: 'Incident registered and AI prioritized successfully.',
      incident: populatedIncident || newIncident
    });
  } catch (err) {
    next(err);
  }
};

export const updateIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, priority, severity, affectedPeople } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    if (title) incident.title = title;
    if (description) incident.description = description;
    if (category) incident.category = category;
    if (location) incident.location = location;
    if (priority) incident.priority = priority;
    if (severity) incident.severity = severity;
    if (affectedPeople !== undefined) incident.affectedPeople = Number(affectedPeople);

    // Recalculate AI score
    const aiResult = calculateIncidentAIScore({
      category: incident.category,
      severity: incident.severity,
      affectedPeople: incident.affectedPeople,
      location: incident.location,
      slaStatus: incident.slaStatus
    });
    incident.aiScore = aiResult.aiScore;
    incident.aiReasoning = aiResult.reasoning;

    await incident.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:updated', incident);
    }

    res.json({
      success: true,
      message: 'Incident updated successfully.',
      incident
    });
  } catch (err) {
    next(err);
  }
};

export const updateIncidentPriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!['Critical', 'High', 'Medium', 'Low'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority level.' });
    }

    const incident = await Incident.findById(id).populate('assignedTo');
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    const oldPriority = incident.priority;
    incident.priority = priority;
    await incident.save();

    const activity = await Activity.create({
      type: 'PRIORITY_CHANGED',
      message: `[${incident.incidentId}] Priority updated from ${oldPriority} to ${priority} by ${req.user.name}.`,
      user: req.user._id,
      userName: req.user.name,
      incident: incident._id,
      incidentId: incident.incidentId,
      location: incident.location,
      severity: priority === 'Critical' ? 'Critical' : 'Info'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:priorityUpdated', { id: incident._id, priority, incident });
      io.emit('activity:new', activity);
    }

    res.json({
      success: true,
      message: `Priority updated to ${priority}.`,
      incident
    });
  } catch (err) {
    next(err);
  }
};

export const updateIncidentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['New', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const incident = await Incident.findById(id).populate('assignedTo');
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    // Role check: If staff, can update assigned incidents or general progress
    const prevStatus = incident.status;
    incident.status = status;

    if (note) {
      incident.notes.push({
        author: req.user.name,
        authorRole: req.user.role,
        text: note,
        timestamp: new Date()
      });
    }

    if (status === 'Resolved' || status === 'Closed') {
      incident.resolvedAt = new Date();
      incident.slaStatus = 'On Track';

      // Decrement workload of assigned staff
      if (incident.assignedTo) {
        const staff = await User.findById(incident.assignedTo._id);
        if (staff) {
          staff.workloadPercentage = Math.max(0, staff.workloadPercentage - 25);
          if (staff.workloadPercentage === 0) staff.availability = 'AVAILABLE';
          await staff.save();
        }
      }

      // Update location active count
      const loc = await CampusLocation.findOne({ name: { $regex: incident.location, $options: 'i' } });
      if (loc) {
        loc.activeIncidentCount = Math.max(0, loc.activeIncidentCount - 1);
        if (loc.activeIncidentCount === 0) {
          loc.status = 'Operational';
          loc.activeIncidentSummary = 'All systems nominal';
        }
        await loc.save();
      }
    }

    await incident.save();

    const activity = await Activity.create({
      type: 'STATUS_CHANGED',
      message: `[${incident.incidentId}] Status moved from ${prevStatus} → ${status} by ${req.user.name}.`,
      user: req.user._id,
      userName: req.user.name,
      incident: incident._id,
      incidentId: incident.incidentId,
      location: incident.location,
      severity: status === 'Resolved' ? 'Normal' : 'Info'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:statusUpdated', { id: incident._id, status, incident });
      io.emit('activity:new', activity);
    }

    res.json({
      success: true,
      message: `Incident status updated to ${status}.`,
      incident
    });
  } catch (err) {
    next(err);
  }
};

export const addIncidentNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    const newNote = {
      author: req.user.name,
      authorRole: req.user.role,
      text: text.trim(),
      timestamp: new Date()
    };

    incident.notes.push(newNote);
    await incident.save();

    const activity = await Activity.create({
      type: 'NOTE_ADDED',
      message: `[${incident.incidentId}] Note added by ${req.user.name}: "${text.substring(0, 40)}..."`,
      user: req.user._id,
      userName: req.user.name,
      incident: incident._id,
      incidentId: incident.incidentId,
      location: incident.location
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:noteAdded', { id: incident._id, note: newNote });
      io.emit('activity:new', activity);
    }

    res.json({
      success: true,
      message: 'Note added successfully.',
      notes: incident.notes
    });
  } catch (err) {
    next(err);
  }
};

export const deleteIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    await Incident.findByIdAndDelete(id);

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'INCIDENT_DELETED',
      target: incident.incidentId,
      details: `Deleted incident [${incident.title}] at [${incident.location}].`,
      ipAddress: req.ip || '127.0.0.1'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:deleted', { id });
    }

    res.json({ success: true, message: 'Incident deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
