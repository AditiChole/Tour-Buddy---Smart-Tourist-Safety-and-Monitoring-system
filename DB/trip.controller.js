const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const tripService = require("../services/trip.service");

// This controller handles trip and itinerary APIs.
exports.createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.user.userId, req.body);
  return sendResponse(res, 201, true, "Trip created successfully", trip);
});

exports.getTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getTrips(req.user.userId);
  return sendResponse(res, 200, true, "Trips fetched successfully", trips);
});

exports.getTripById = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id, req.user.userId);
  return sendResponse(res, 200, true, "Trip details fetched successfully", trip);
});

exports.updateTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.updateTrip(req.params.id, req.user.userId, req.body);
  return sendResponse(res, 200, true, "Trip updated successfully", trip);
});

exports.deleteTrip = asyncHandler(async (req, res) => {
  const result = await tripService.deleteTrip(req.params.id, req.user.userId);
  return sendResponse(res, 200, true, "Trip deleted successfully", result);
});

exports.startTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.startTrip(req.params.id, req.user.userId);
  return sendResponse(res, 200, true, "Trip started successfully", trip);
});

exports.completeTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.completeTrip(req.params.id, req.user.userId);
  return sendResponse(res, 200, true, "Trip completed successfully", trip);
});
