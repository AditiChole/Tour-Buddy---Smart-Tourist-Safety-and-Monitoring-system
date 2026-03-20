const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const locationService = require("../services/location.service");

// This controller handles live tracking APIs.
exports.updateLocation = asyncHandler(async (req, res) => {
  const result = await locationService.createLocationUpdate({
    ...req.body,
    userId: req.user.userId
  });
  return sendResponse(res, 201, true, "Location updated successfully", result);
});

exports.getCurrentLocation = asyncHandler(async (req, res) => {
  const location = await locationService.getCurrentLocation(req.params.userId);
  return sendResponse(res, 200, true, "Current location fetched successfully", location);
});

exports.getLocationHistory = asyncHandler(async (req, res) => {
  const history = await locationService.getLocationHistory(req.params.userId);
  return sendResponse(res, 200, true, "Location history fetched successfully", history);
});

exports.checkZone = asyncHandler(async (req, res) => {
  const zoneResult = await locationService.checkLocationZone({
    ...req.body,
    userId: req.body.userId || req.user.userId
  });
  return sendResponse(res, 200, true, "Zone status checked successfully", zoneResult);
});

exports.getZoneStatus = asyncHandler(async (req, res) => {
  const zoneStatus = await locationService.getZoneStatusForUser(req.params.userId);
  return sendResponse(res, 200, true, "Zone status fetched successfully", zoneStatus);
});
