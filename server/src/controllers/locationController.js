import { CampusLocation } from '../models/CampusLocation.js';
import { Incident } from '../models/Incident.js';

export const getLocations = async (req, res, next) => {
  try {
    const locations = await CampusLocation.find().populate('assignedPersonnel', 'name email department phone');

    // Dynamic sync of active incident counts for accuracy
    const updatedLocations = await Promise.all(
      locations.map(async (loc) => {
        const activeIncidents = await Incident.find({
          location: { $regex: loc.name, $options: 'i' },
          status: { $nin: ['Resolved', 'Closed'] }
        });

        const activeCount = activeIncidents.length;
        const hasCritical = activeIncidents.some(i => i.priority === 'Critical');
        const hasHigh = activeIncidents.some(i => i.priority === 'High');

        let status = 'Operational';
        if (hasCritical) status = 'Critical';
        else if (hasHigh || activeCount > 0) status = 'Warning';

        loc.activeIncidentCount = activeCount;
        loc.status = status;
        if (activeIncidents.length > 0) {
          loc.activeIncidentSummary = `${activeIncidents[0].priority}: ${activeIncidents[0].title}`;
        } else {
          loc.activeIncidentSummary = 'All systems nominal';
        }

        return loc;
      })
    );

    res.json({ success: true, count: updatedLocations.length, locations: updatedLocations });
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, description, zone } = req.body;

    const location = await CampusLocation.findById(id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Campus location not found.' });
    }

    if (status) location.status = status;
    if (description) location.description = description;
    if (zone) location.zone = zone;

    await location.save();
    res.json({ success: true, location });
  } catch (err) {
    next(err);
  }
};
