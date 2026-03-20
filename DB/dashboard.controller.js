const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const dashboardService = require("../services/dashboard.service");

// This controller handles dashboard APIs.
exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary(req.user.userId);
  return sendResponse(res, 200, true, "Dashboard summary fetched successfully", summary);
});

exports.getRecentAlerts = asyncHandler(async (req, res) => {
  const alerts = await dashboardService.getRecentAlerts(req.user.userId);
  return sendResponse(res, 200, true, "Recent alerts fetched successfully", alerts);
});

exports.startTrip = asyncHandler(async (req, res) => {
  const trip = await dashboardService.startTripFromDashboard(req.user.userId, req.body.tripId);
  return sendResponse(res, 200, true, "Trip started successfully", trip);
});

exports.shareLocation = asyncHandler(async (req, res) => {
  const result = await dashboardService.shareLocationFromDashboard({
    userId: req.user.userId,
    ...req.body
  });
  return sendResponse(res, 200, true, "Location shared successfully", result);
});
