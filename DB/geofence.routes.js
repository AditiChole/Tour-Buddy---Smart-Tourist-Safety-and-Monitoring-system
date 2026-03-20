const express = require("express");

const geofenceController = require("../controllers/geofence.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createZoneValidator,
  updateZoneValidator,
  zoneIdValidator
} = require("../validators/geofence.validator");
const { checkZoneValidator } = require("../validators/location.validator");

const router = express.Router();

// Routes for zone create, update, delete, and check.
router.post("/zones", protect, authorize("admin", "volunteer"), createZoneValidator, validate, geofenceController.createZone);
router.get("/zones", protect, geofenceController.getZones);
router.get("/zones/:id", protect, zoneIdValidator, validate, geofenceController.getZoneById);
router.put("/zones/:id", protect, authorize("admin", "volunteer"), zoneIdValidator, updateZoneValidator, validate, geofenceController.updateZone);
router.delete("/zones/:id", protect, authorize("admin"), zoneIdValidator, validate, geofenceController.deleteZone);
router.post("/check", protect, checkZoneValidator, validate, geofenceController.checkZone);

module.exports = router;
