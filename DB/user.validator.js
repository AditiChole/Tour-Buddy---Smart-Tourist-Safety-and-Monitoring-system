const { body, param } = require("express-validator");

// Validation for admin role update.
exports.updateRoleValidator = [
  param("id").isUUID().withMessage("Valid user ID is required"),
  body("role").isIn(["user", "volunteer", "admin"]).withMessage("Invalid role")
];
