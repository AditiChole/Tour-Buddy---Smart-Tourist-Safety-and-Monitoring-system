const { body, param } = require("express-validator");

// Validation for volunteer and assignment data.
exports.createVolunteerValidator = [
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("availabilityStatus")
    .optional()
    .isIn(["AVAILABLE", "BUSY", "OFFLINE"])
    .withMessage("Invalid availability status")
];

exports.updateVolunteerValidator = [
  body("userId").optional().isUUID().withMessage("User ID must be valid"),
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  body("availabilityStatus")
    .optional()
    .isIn(["AVAILABLE", "BUSY", "OFFLINE"])
    .withMessage("Invalid availability status"),
  body("assignedZone").optional().isString().withMessage("Assigned zone must be a string"),
  body("currentLatitude").optional().isFloat().withMessage("Current latitude must be valid"),
  body("currentLongitude").optional().isFloat().withMessage("Current longitude must be valid")
];

exports.volunteerIdValidator = [param("id").isUUID().withMessage("Valid volunteer ID is required")];

exports.assignVolunteerValidator = [
  body("volunteerId").isUUID().withMessage("Valid volunteer ID is required"),
  body("userId").isUUID().withMessage("Valid user ID is required"),
  body("tripId").optional().isUUID().withMessage("Trip ID must be valid"),
  body("status")
    .optional()
    .isIn(["ASSIGNED", "ACCEPTED", "REJECTED", "RESOLVED"])
    .withMessage("Invalid assignment status")
];

exports.assignmentStatusValidator = [
  param("id").isUUID().withMessage("Valid assignment ID is required"),
  body("status")
    .isIn(["ASSIGNED", "ACCEPTED", "REJECTED", "RESOLVED"])
    .withMessage("Invalid assignment status")
];
