const Alert = require("../models/mongo/alert.model");
const { getCurrentUser } = require("./auth.service");
const { getActiveTrip, startTrip } = require("./trip.service");
const { getZoneStatusForUser, createLocationUpdate } = require("./location.service");

// Get recent alerts for the dashboard.
const getRecentAlerts = async (userId) => Alert.find({ userId }).sort({ createdAt: -1 }).limit(5);

const getDashboardSummary = async (userId) => {
  // This combines user, trip, zone, and alert data for the home screen.
  const currentUser = await getCurrentUser(userId);
  const activeTrip = await getActiveTrip(userId);

  let zoneStatus = { zoneStatus: "OUTSIDE" };
  try {
    zoneStatus = await getZoneStatusForUser(userId);
  } catch (error) {
    zoneStatus = { zoneStatus: "OUTSIDE" };
  }

  const recentAlerts = await getRecentAlerts(userId);

  return {
    currentUser,
    activeTrip,
    zoneStatus,
    recentAlerts,
    quickActions: [
      { key: "start_trip", label: "Start Trip", endpoint: "/api/dashboard/start-trip" },
      { key: "share_location", label: "Share Location", endpoint: "/api/dashboard/share-location" },
      { key: "trigger_sos", label: "SOS", endpoint: "/api/sos/trigger" }
    ]
  };
};

const startTripFromDashboard = async (userId, tripId) => startTrip(tripId, userId);

const shareLocationFromDashboard = async (payload) =>
  // This is used when the dashboard share location button is clicked.
  createLocationUpdate({
    userId: payload.userId,
    latitude: payload.latitude,
    longitude: payload.longitude,
    tripId: payload.tripId || null
  });

module.exports = {
  getDashboardSummary,
  getRecentAlerts,
  startTripFromDashboard,
  shareLocationFromDashboard
};
