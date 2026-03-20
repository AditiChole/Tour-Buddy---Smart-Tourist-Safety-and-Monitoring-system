const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const sosService = require("../services/sos.service");

// This controller handles SOS emergency APIs.
exports.triggerSOS = asyncHandler(async (req, res) => {
  const alert = await sosService.triggerSOS({
    ...req.body,
    userId: req.user.userId
  });
  return sendResponse(res, 201, true, "SOS alert triggered successfully", alert);
});

exports.shareLocation = asyncHandler(async (req, res) => {
  const result = await sosService.shareSOSLocation({
    ...req.body,
    userId: req.user.userId
  });
  return sendResponse(res, 200, true, "SOS location shared successfully", result);
});

exports.notifyVolunteers = asyncHandler(async (req, res) => {
  const assignments = await sosService.notifyVolunteers({
    ...req.body,
    userId: req.user.userId,
    assignedBy: req.user.userId
  });
  return sendResponse(res, 200, true, "Volunteers notified successfully", assignments);
});

exports.getAlerts = asyncHandler(async (req, res) => {
  const alerts = await sosService.getAlerts(req.query.userId ? { userId: req.query.userId } : {});
  return sendResponse(res, 200, true, "Alerts fetched successfully", alerts);
});

exports.getAlertById = asyncHandler(async (req, res) => {
  const alert = await sosService.getAlertById(req.params.id);
  return sendResponse(res, 200, true, "Alert fetched successfully", alert);
});

exports.updateAlertStatus = asyncHandler(async (req, res) => {
  const alert = await sosService.updateAlertStatus(req.params.id, req.body.status);
  return sendResponse(res, 200, true, "Alert status updated successfully", alert);
});
