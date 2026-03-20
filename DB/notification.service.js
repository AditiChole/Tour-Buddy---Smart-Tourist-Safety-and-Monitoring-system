const { v4: uuidv4 } = require("uuid");
const NotificationLog = require("../models/mongo/notificationLog.model");

// This function saves notification logs in one common way.
const createNotificationLog = async ({ type, recipientType, recipientId, message, metadata = {} }) => {
  return NotificationLog.create({
    notificationId: uuidv4(),
    type,
    recipientType,
    recipientId,
    message,
    metadata
  });
};

module.exports = { createNotificationLog };
