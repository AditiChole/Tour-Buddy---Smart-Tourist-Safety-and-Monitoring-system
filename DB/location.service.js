const { v4: uuidv4 } = require("uuid");

const LocationLog = require("../models/mongo/locationLog.model");
const { resolveZoneStatus } = require("./geofence.service");

const createLocationUpdate = async (payload) => {
  // Save location and check zone at the same time.
  const zoneResult = await resolveZoneStatus({
    latitude: payload.latitude,
    longitude: payload.longitude,
    userId: payload.userId,
    tripId: payload.tripId || null,
    createUnsafeAlert: true
  });

  const locationLog = await LocationLog.create({
    logId: uuidv4(),
    userId: payload.userId,
    latitude: payload.latitude,
    longitude: payload.longitude,
    timestamp: payload.timestamp || new Date(),
    zoneStatus: zoneResult.zoneStatus,
    tripId: payload.tripId || null
  });

  return { locationLog, zoneResult };
};

const getCurrentLocation = async (userId) => {
  // The newest location log is the current location.
  const currentLocation = await LocationLog.findOne({ userId }).sort({ timestamp: -1 });

  if (!currentLocation) {
    const error = new Error("Current location not found");
    error.statusCode = 404;
    throw error;
  }

  return currentLocation;
};

const getLocationHistory = async (userId) =>
  LocationLog.find({ userId }).sort({ timestamp: -1 }).limit(100);

const checkLocationZone = async (payload) =>
  // Check zone without saving a new location log.
  resolveZoneStatus({
    latitude: payload.latitude,
    longitude: payload.longitude,
    userId: payload.userId,
    tripId: payload.tripId || null,
    createUnsafeAlert: true
  });

const getZoneStatusForUser = async (userId) => {
  // Get zone status from the latest saved location.
  const latestLog = await getCurrentLocation(userId);
  return {
    userId,
    zoneStatus: latestLog.zoneStatus,
    latitude: latestLog.latitude,
    longitude: latestLog.longitude,
    timestamp: latestLog.timestamp
  };
};

module.exports = {
  createLocationUpdate,
  getCurrentLocation,
  getLocationHistory,
  checkLocationZone,
  getZoneStatusForUser
};
