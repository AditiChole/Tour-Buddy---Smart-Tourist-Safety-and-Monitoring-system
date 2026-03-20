const { Volunteer, VolunteerAssignment } = require("../models/postgres");

// This service handles volunteer data and assignment data.
const createVolunteer = async (payload) => Volunteer.create(payload);

const getVolunteers = async () => Volunteer.findAll({ order: [["createdAt", "DESC"]] });

const getVolunteerById = async (volunteerId) => {
  const volunteer = await Volunteer.findByPk(volunteerId);

  if (!volunteer) {
    const error = new Error("Volunteer not found");
    error.statusCode = 404;
    throw error;
  }

  return volunteer;
};

const updateVolunteer = async (volunteerId, payload) => {
  // Update only the fields that are sent.
  const volunteer = await getVolunteerById(volunteerId);
  Object.keys(payload).forEach((key) => {
    if (payload[key] !== undefined) {
      volunteer[key] = payload[key];
    }
  });
  await volunteer.save();
  return volunteer;
};

const assignVolunteer = async (payload) =>
  // Assign a volunteer to a user, trip, or alert.
  VolunteerAssignment.create({
    volunteerId: payload.volunteerId,
    userId: payload.userId,
    tripId: payload.tripId || null,
    alertId: payload.alertId || null,
    assignedBy: payload.assignedBy || null,
    status: payload.status || "ASSIGNED"
  });

const getAssignments = async () =>
  // Get assignments with volunteer details.
  VolunteerAssignment.findAll({
    include: [{ model: Volunteer, as: "volunteer" }],
    order: [["assignedAt", "DESC"]]
  });

const updateAssignmentStatus = async (assignmentId, status) => {
  const assignment = await VolunteerAssignment.findByPk(assignmentId);

  if (!assignment) {
    const error = new Error("Assignment not found");
    error.statusCode = 404;
    throw error;
  }

  assignment.status = status;
  await assignment.save();
  return assignment;
};

module.exports = {
  createVolunteer,
  getVolunteers,
  getVolunteerById,
  updateVolunteer,
  assignVolunteer,
  getAssignments,
  updateAssignmentStatus
};
