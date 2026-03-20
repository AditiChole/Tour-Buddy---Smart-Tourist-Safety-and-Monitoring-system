const mongoose = require("mongoose");

// This collection stores zone entry events.
const geofenceEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true
    },
    tripId: {
      type: String,
      default: null
    },
    zoneId: {
      type: String,
      default: null
    },
    zoneType: {
      type: String,
      enum: ["SAFE", "CAUTION", "UNSAFE", "OUTSIDE"],
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  {
    collection: "geofence_events",
    timestamps: true
  }
);

module.exports = mongoose.model("GeofenceEvent", geofenceEventSchema);
