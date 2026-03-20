const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const authService = require("../services/auth.service");

// This controller is for admin user management.
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await authService.getAllUsers();
  return sendResponse(res, 200, true, "Users fetched successfully", users);
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  const user = await authService.updateUserRole(req.params.id, req.body.role);
  return sendResponse(res, 200, true, "User role updated successfully", user);
});
