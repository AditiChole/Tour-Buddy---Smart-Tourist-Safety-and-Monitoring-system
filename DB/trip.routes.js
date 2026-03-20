const express = require("express");

const tripController = require("../controllers/trip.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createTripValidator,
  updateTripValidator,
  tripIdValidator
} = require("../validators/trip.validator");

const router = express.Router();

// Routes for trip and itinerary features.
router.post("/", protect, createTripValidator, validate, tripController.createTrip);
router.get("/", protect, tripController.getTrips);
router.get("/:id", protect, tripIdValidator, validate, tripController.getTripById);
router.put("/:id", protect, tripIdValidator, updateTripValidator, validate, tripController.updateTrip);
router.delete("/:id", protect, tripIdValidator, validate, tripController.deleteTrip);
router.patch("/:id/start", protect, tripIdValidator, validate, tripController.startTrip);
router.patch("/:id/complete", protect, tripIdValidator, validate, tripController.completeTrip);

module.exports = router;
