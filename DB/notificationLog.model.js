const mongoose = require("mongoose");

// This collection stores notification history.
const notificationLogSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: ["SOS", "VOLUNTEER", "LOCATION_SHARE", "GEOFENCE"],
      required: true
    },
    recipientType: {
      type: String,
      enum: ["USER", "VOLUNTEER", "ADMIN", "EMERGENCY_CONTACT"],
      required: true
    },
    recipientId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    collection: "notification_logs",
    timestamps: true
  }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
