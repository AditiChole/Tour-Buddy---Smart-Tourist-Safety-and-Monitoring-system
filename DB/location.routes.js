const express = require("express");

const locationController = require("../controllers/location.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  locationUpdateValidator,
  checkZoneValidator,
  userIdParamValidator
} = require("../validators/location.validator");

const router = express.Router();

// Routes for live tracking and location history.
router.post("/update", protect, locationUpdateValidator, validate, locationController.updateLocation);
router.get("/current/:userId", protect, userIdParamValidator, validate, locationController.getCurrentLocation);
router.get("/history/:userId", protect, userIdParamValidator, validate, locationController.getLocationHistory);
router.post("/check-zone", protect, checkZoneValidator, validate, locationController.checkZone);
router.get("/zone-status/:userId", protect, userIdParamValidator, validate, locationController.getZoneStatus);

module.exports = router;
