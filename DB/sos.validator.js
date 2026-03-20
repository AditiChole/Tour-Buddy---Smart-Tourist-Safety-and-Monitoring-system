const { body, param } = require("express-validator");

// Validation for SOS requests.
exports.triggerSOSValidator = [
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid"),
  body("alertType").optional().isIn(["SOS", "GEO_FENCE", "MANUAL", "EMERGENCY"]).withMessage("Invalid alert type"),
  body("message").optional().isString().withMessage("Message must be a string"),
  body("latitude").isFloat().withMessage("Valid latitude is required"),
  body("longitude").isFloat().withMessage("Valid longitude is required"),
  body("severity").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).withMessage("Invalid severity")
];

exports.notifyVolunteerValidator = [
  body("alertId").notEmpty().withMessage("Alert ID is required"),
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid")
];

exports.alertIdValidator = [param("id").notEmpty().withMessage("Alert ID is required")];

exports.alertStatusValidator = [
  param("id").notEmpty().withMessage("Alert ID is required"),
  body("status").isIn(["OPEN", "IN_PROGRESS", "RESOLVED"]).withMessage("Invalid alert status")
];
