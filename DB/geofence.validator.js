const { body, param } = require("express-validator");

// Validation for creating a new zone.
exports.createZoneValidator = [
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid"),
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("zoneType").isIn(["SAFE", "CAUTION", "UNSAFE"]).withMessage("Invalid zone type"),
  body("centerLatitude").isFloat().withMessage("Valid center latitude is required"),
  body("centerLongitude").isFloat().withMessage("Valid center longitude is required"),
  body("radiusInMeters").isFloat({ gt: 0 }).withMessage("Radius must be greater than 0"),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean")
];

exports.updateZoneValidator = [
  // Validation for updating zone data.
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid"),
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("zoneType").optional().isIn(["SAFE", "CAUTION", "UNSAFE"]).withMessage("Invalid zone type"),
  body("centerLatitude").optional().isFloat().withMessage("Valid center latitude is required"),
  body("centerLongitude").optional().isFloat().withMessage("Valid center longitude is required"),
  body("radiusInMeters").optional().isFloat({ gt: 0 }).withMessage("Radius must be greater than 0"),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean")
];

exports.zoneIdValidator = [param("id").isUUID().withMessage("Valid zone ID is required")];
