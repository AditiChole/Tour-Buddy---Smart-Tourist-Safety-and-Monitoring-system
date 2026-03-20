const express = require("express");

const sosController = require("../controllers/sos.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
  triggerSOSValidator,
  notifyVolunteerValidator,
  alertIdValidator,
  alertStatusValidator
} = require("../validators/sos.validator");

const router = express.Router();

// Routes for SOS emergency features.
router.post("/trigger", protect, triggerSOSValidator, validate, sosController.triggerSOS);
router.post("/share-location", protect, triggerSOSValidator, validate, sosController.shareLocation);
router.post("/notify-volunteers", protect, authorize("admin", "volunteer", "user"), notifyVolunteerValidator, validate, sosController.notifyVolunteers);
router.get("/alerts", protect, sosController.getAlerts);
router.get("/alerts/:id", protect, alertIdValidator, validate, sosController.getAlertById);
router.put("/alerts/:id/status", protect, alertStatusValidator, validate, sosController.updateAlertStatus);

module.exports = router;
