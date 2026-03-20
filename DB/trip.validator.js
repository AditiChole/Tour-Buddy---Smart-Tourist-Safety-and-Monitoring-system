const { body, param } = require("express-validator");

// Validation for creating a trip.
exports.createTripValidator = [
  body("title").trim().notEmpty().withMessage("Trip title is required"),
  body("source").trim().notEmpty().withMessage("Source is required"),
  body("destination").trim().notEmpty().withMessage("Destination is required"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").isISO8601().withMessage("Valid end date is required"),
  body("stops").optional().isArray().withMessage("Stops must be an array")
];

exports.updateTripValidator = [
  // Validation for updating some trip fields.
  body("title").optional().trim().notEmpty().withMessage("Trip title cannot be empty"),
  body("source").optional().trim().notEmpty().withMessage("Source cannot be empty"),
  body("destination").optional().trim().notEmpty().withMessage("Destination cannot be empty"),
  body("startDate").optional().isISO8601().withMessage("Valid start date is required"),
  body("endDate").optional().isISO8601().withMessage("Valid end date is required"),
  body("geoFenceEnabled").optional().isBoolean().withMessage("geoFenceEnabled must be boolean"),
  body("currentStatus")
    .optional()
    .isIn(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid trip status"),
  body("stops").optional().isArray().withMessage("Stops must be an array")
];

exports.tripIdValidator = [param("id").isUUID().withMessage("Valid trip ID is required")];
