const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const geofenceService = require("../services/geofence.service");

// This controller handles zone create, update, and check APIs.
exports.createZone = asyncHandler(async (req, res) => {
  const zone = await geofenceService.createZone(req.body);
  return sendResponse(res, 201, true, "Zone created successfully", zone);
});

exports.getZones = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.tripId) filters.tripId = req.query.tripId;
  const zones = await geofenceService.getZones(filters);
  return sendResponse(res, 200, true, "Zones fetched successfully", zones);
});

exports.getZoneById = asyncHandler(async (req, res) => {
  const zone = await geofenceService.getZoneById(req.params.id);
  return sendResponse(res, 200, true, "Zone fetched successfully", zone);
});

exports.updateZone = asyncHandler(async (req, res) => {
  const zone = await geofenceService.updateZone(req.params.id, req.body);
  return sendResponse(res, 200, true, "Zone updated successfully", zone);
});

exports.deleteZone = asyncHandler(async (req, res) => {
  const result = await geofenceService.deleteZone(req.params.id);
  return sendResponse(res, 200, true, "Zone deleted successfully", result);
});

exports.checkZone = asyncHandler(async (req, res) => {
  const result = await geofenceService.resolveZoneStatus({
    ...req.body,
    userId: req.body.userId || req.user.userId,
    createUnsafeAlert: true
  });
  return sendResponse(res, 200, true, "Geofence check completed successfully", result);
});
