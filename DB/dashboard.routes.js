const express = require("express");
const { body } = require("express-validator");

const dashboardController = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { locationUpdateValidator } = require("../validators/location.validator");

const router = express.Router();

// Routes for dashboard data and quick actions.
router.get("/summary", protect, dashboardController.getSummary);
router.get("/recent-alerts", protect, dashboardController.getRecentAlerts);
router.post(
  "/start-trip",
  protect,
  body("tripId").isUUID().withMessage("Valid trip ID is required"),
  validate,
  dashboardController.startTrip
);
router.post("/share-location", protect, locationUpdateValidator, validate, dashboardController.shareLocation);

module.exports = router;
