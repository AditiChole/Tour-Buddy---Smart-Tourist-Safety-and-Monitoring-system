const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const profileService = require("../services/profile.service");

// This controller handles profile screen APIs.
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.userId);
  return sendResponse(res, 200, true, "Profile fetched successfully", profile);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user.userId, req.body);
  return sendResponse(res, 200, true, "Profile updated successfully", profile);
});

exports.getDigitalId = asyncHandler(async (req, res) => {
  const digitalId = await profileService.getDigitalId(req.user.userId);
  return sendResponse(res, 200, true, "Digital tourist ID fetched successfully", digitalId);
});

exports.getTripHistory = asyncHandler(async (req, res) => {
  const tripHistory = await profileService.getTripHistory(req.user.userId);
  return sendResponse(res, 200, true, "Trip history fetched successfully", tripHistory);
});

exports.getPersonalDetails = asyncHandler(async (req, res) => {
  const details = await profileService.getPersonalDetails(req.user.userId);
  return sendResponse(res, 200, true, "Personal details fetched successfully", details);
});
