const { body, param } = require("express-validator");

// Validation for location and zone check data.
exports.locationUpdateValidator = [
  body("latitude").isFloat().withMessage("Valid latitude is required"),
  body("longitude").isFloat().withMessage("Valid longitude is required"),
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid")
];

exports.checkZoneValidator = [
  body("latitude").isFloat().withMessage("Valid latitude is required"),
  body("longitude").isFloat().withMessage("Valid longitude is required"),
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid")
];

exports.userIdParamValidator = [param("userId").isUUID().withMessage("Valid user ID is required")];
