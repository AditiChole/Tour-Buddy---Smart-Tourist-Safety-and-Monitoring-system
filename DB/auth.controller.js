const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const authService = require("../services/auth.service");

// This controller handles auth requests and returns responses.
exports.register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return sendResponse(res, 201, true, "User registered successfully", result);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return sendResponse(res, 200, true, "Login successful", result);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.userId);
  return sendResponse(res, 200, true, "Current user fetched successfully", user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateCurrentUserProfile(req.user.userId, req.body);
  return sendResponse(res, 200, true, "Profile updated successfully", user);
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  const result = await authService.deleteCurrentUser(req.user.userId);
  return sendResponse(res, 200, true, "Account deleted successfully", result);
});
