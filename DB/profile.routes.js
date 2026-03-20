const express = require("express");

const profileController = require("../controllers/profile.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { profileUpdateValidator } = require("../validators/profile.validator");

const router = express.Router();

// Routes for profile screen data.
router.get("/", protect, profileController.getProfile);
router.put("/", protect, profileUpdateValidator, validate, profileController.updateProfile);
router.get("/digital-id", protect, profileController.getDigitalId);
router.get("/trip-history", protect, profileController.getTripHistory);
router.get("/personal-details", protect, profileController.getPersonalDetails);

module.exports = router;
