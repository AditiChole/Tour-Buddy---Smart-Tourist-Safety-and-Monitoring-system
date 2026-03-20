const { v4: uuidv4 } = require("uuid");

const { GeofenceZone } = require("../models/postgres");
const GeofenceEvent = require("../models/mongo/geofenceEvent.model");
const Alert = require("../models/mongo/alert.model");
const { haversineDistance } = require("../utils/haversine");

// Bigger number means higher danger priority.
const zonePriority = {
  UNSAFE: 3,
  CAUTION: 2,
  SAFE: 1
};

const createZone = async (payload) => GeofenceZone.create(payload);

const getZones = async (filters = {}) => GeofenceZone.findAll({ where: filters, order: [["createdAt", "DESC"]] });

const getZoneById = async (zoneId) => {
  const zone = await GeofenceZone.findByPk(zoneId);
  if (!zone) {
    const error = new Error("Zone not found");
    error.statusCode = 404;
    throw error;
  }
  return zone;
};

const updateZone = async (zoneId, payload) => {
  const zone = await getZoneById(zoneId);
  Object.keys(payload).forEach((key) => {
    if (payload[key] !== undefined) {
      zone[key] = payload[key];
    }
  });
  await zone.save();
  return zone;
};

const deleteZone = async (zoneId) => {
  const zone = await getZoneById(zoneId);
  await zone.destroy();
  return { deleted: true };
};

const resolveZoneStatus = async ({ latitude, longitude, userId, tripId = null, createUnsafeAlert = true }) => {
  // If tripId is given, check only that trip's zones.
  const where = { isActive: true };
  if (tripId) {
    where.tripId = tripId;
  }

  const zones = await GeofenceZone.findAll({ where });
  const matchingZones = zones
    .map((zone) => {
      // Check if the location is inside the zone circle.
      const distance = haversineDistance(
        latitude,
        longitude,
        zone.centerLatitude,
        zone.centerLongitude
      );

      return {
        zone,
        distance,
        isInside: distance <= zone.radiusInMeters
      };
    })
    .filter((item) => item.isInside);

  let result = {
    zoneStatus: "OUTSIDE",
    matchedZone: null,
    distanceInMeters: null,
    alertTriggered: false
  };

  if (matchingZones.length) {
    // If many zones match, choose the most dangerous one.
    const highestPriority = matchingZones.sort(
      (a, b) => zonePriority[b.zone.zoneType] - zonePriority[a.zone.zoneType]
    )[0];

    result = {
      zoneStatus: highestPriority.zone.zoneType,
      matchedZone: highestPriority.zone,
      distanceInMeters: Number(highestPriority.distance.toFixed(2)),
      alertTriggered: false
    };

    await GeofenceEvent.create({
      eventId: uuidv4(),
      userId,
      tripId,
      zoneId: highestPriority.zone.zoneId,
      zoneType: highestPriority.zone.zoneType,
      latitude,
      longitude,
      message: `User entered ${highestPriority.zone.zoneType} zone`
    });

    if (highestPriority.zone.zoneType === "UNSAFE" && createUnsafeAlert) {
      // If the user enters an unsafe zone, create an alert automatically.
      await Alert.create({
        alertId: uuidv4(),
        userId,
        tripId,
        alertType: "GEO_FENCE",
        message: "Automatic unsafe zone alert triggered",
        latitude,
        longitude,
        severity: "HIGH",
        status: "OPEN",
        volunteersNotified: false
      });
      result.alertTriggered = true;
    }
  }

  return result;
};

module.exports = {
  createZone,
  getZones,
  getZoneById,
  updateZone,
  deleteZone,
  resolveZoneStatus
};
