const { v4: uuidv4 } = require("uuid");

const Alert = require("../models/mongo/alert.model");
const { Volunteer, VolunteerAssignment } = require("../models/postgres");
const { createNotificationLog } = require("./notification.service");

const triggerSOS = async (payload) => {
  // Create the main SOS alert record.
  const alert = await Alert.create({
    alertId: uuidv4(),
    userId: payload.userId,
    tripId: payload.tripId || null,
    alertType: payload.alertType || "SOS",
    message: payload.message || "Emergency help needed",
    latitude: payload.latitude,
    longitude: payload.longitude,
    severity: payload.severity || "CRITICAL",
    status: "OPEN",
    volunteersNotified: false
  });

  await createNotificationLog({
    type: "SOS",
    recipientType: "EMERGENCY_CONTACT",
    recipientId: payload.userId,
    message: "Emergency SOS alert triggered",
    metadata: { alertId: alert.alertId }
  });

  return alert;
};

const shareSOSLocation = async (payload) =>
  // Save emergency location sharing as a notification log.
  createNotificationLog({
    type: "LOCATION_SHARE",
    recipientType: "EMERGENCY_CONTACT",
    recipientId: payload.userId,
    message: "Live emergency location shared",
    metadata: payload
  });

const notifyVolunteers = async ({ userId, alertId, tripId = null, assignedBy = null }) => {
  // First check that the alert exists.
  const alert = await Alert.findOne({ alertId });

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  const volunteers = await Volunteer.findAll({
    where: { availabilityStatus: "AVAILABLE" },
    limit: 5
  });

  const assignments = [];
  for (const volunteer of volunteers) {
    // Save volunteer assignment and notification together.
    const assignment = await VolunteerAssignment.create({
      volunteerId: volunteer.volunteerId,
      userId: alert.userId || userId,
      tripId: alert.tripId || tripId,
      alertId,
      assignedBy,
      status: "ASSIGNED"
    });

    await createNotificationLog({
      type: "VOLUNTEER",
      recipientType: "VOLUNTEER",
      recipientId: volunteer.volunteerId,
      message: "You have been notified for an SOS emergency",
      metadata: { alertId, assignmentId: assignment.assignmentId }
    });

    assignments.push(assignment);
  }

  await Alert.findOneAndUpdate({ alertId }, { volunteersNotified: true });
  return assignments;
};

const getAlerts = async (filters = {}) => Alert.find(filters).sort({ createdAt: -1 });

const getAlertById = async (id) => {
  // Find alert using alertId instead of MongoDB _id.
  const alert = await Alert.findOne({ alertId: id });

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  return alert;
};

const updateAlertStatus = async (id, status) => {
  const alert = await Alert.findOneAndUpdate({ alertId: id }, { status }, { new: true });

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  return alert;
};

module.exports = {
  triggerSOS,
  shareSOSLocation,
  notifyVolunteers,
  getAlerts,
  getAlertById,
  updateAlertStatus
};
