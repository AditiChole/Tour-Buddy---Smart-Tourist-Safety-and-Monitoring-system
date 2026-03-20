const mongoose = require("mongoose");

// This collection stores live location updates.
const locationLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    zoneStatus: {
      type: String,
      enum: ["SAFE", "CAUTION", "UNSAFE", "OUTSIDE"],
      default: "OUTSIDE"
    },
    tripId: {
      type: String,
      default: null
    }
  },
  {
    collection: "location_logs",
    timestamps: true
  }
);

module.exports = mongoose.model("LocationLog", locationLogSchema);
