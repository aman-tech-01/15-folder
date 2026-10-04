import { Team } from '../models/Team.js';
import { AuditLog } from '../models/AuditLog.js';

export const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().populate('members', 'name email department phone availability workloadPercentage');
    res.json({ success: true, count: teams.length, teams });
  } catch (err) {
    next(err);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const { name, department, members, specialization, status = 'ACTIVE' } = req.body;

    if (!name || !department) {
      return res.status(400).json({ success: false, message: 'Team name and department are required.' });
    }

    const newTeam = await Team.create({
      name: name.trim(),
      department: department.trim(),
      members: members || [],
      specialization: Array.isArray(specialization) ? specialization : (specialization ? specialization.split(',').map(s => s.trim()) : []),
      status
    });

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TEAM_CREATED',
      target: newTeam.name,
      details: `Created new response team [${newTeam.name}] in [${newTeam.department}].`,
      ipAddress: req.ip || '127.0.0.1'
    });

    const populated = await Team.findById(newTeam._id).populate('members', 'name email department');
    res.status(201).json({ success: true, message: 'Team created successfully.', team: populated });
  } catch (err) {
    next(err);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, department, members, specialization, status } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    if (name) team.name = name.trim();
    if (department) team.department = department.trim();
    if (members) team.members = members;
    if (specialization) {
      team.specialization = Array.isArray(specialization) ? specialization : specialization.split(',').map(s => s.trim());
    }
    if (status) team.status = status;

    await team.save();

    const populated = await Team.findById(team._id).populate('members', 'name email department');
    res.json({ success: true, message: 'Team updated successfully.', team: populated });
  } catch (err) {
    next(err);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    await Team.findByIdAndDelete(id);

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TEAM_DELETED',
      target: team.name,
      details: `Disbanded team [${team.name}].`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Team deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
