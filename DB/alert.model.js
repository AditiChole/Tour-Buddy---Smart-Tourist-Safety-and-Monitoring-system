const mongoose = require("mongoose");

// This collection stores emergency and geo-fence alerts.
const alertSchema = new mongoose.Schema(
  {
    alertId: {
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
    alertType: {
      type: String,
      enum: ["SOS", "GEO_FENCE", "MANUAL", "EMERGENCY"],
      required: true
    },
    message: {
      type: String,
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
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "HIGH"
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN"
    },
    volunteersNotified: {
      type: Boolean,
      default: false
    }
  },
  {
    collection: "alerts",
    timestamps: true
  }
);

module.exports = mongoose.model("Alert", alertSchema);
