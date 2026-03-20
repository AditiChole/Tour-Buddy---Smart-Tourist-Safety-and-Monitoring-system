const { body } = require("express-validator");

// Validation for profile update.
exports.profileUpdateValidator = [
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  body("emergencyContact").optional().trim().notEmpty().withMessage("Emergency contact cannot be empty"),
  body("profilePhoto").optional().isString().withMessage("Profile photo must be a string"),
  body("isVerified").optional().isBoolean().withMessage("isVerified must be boolean")
];
