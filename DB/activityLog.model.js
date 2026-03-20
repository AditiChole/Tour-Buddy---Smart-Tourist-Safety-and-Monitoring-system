const mongoose = require("mongoose");

// This collection stores user activity logs.
const activityLogSchema = new mongoose.Schema(
  {
    activityId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    collection: "activity_logs",
    timestamps: true
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
