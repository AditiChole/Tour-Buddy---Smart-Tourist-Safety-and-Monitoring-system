const { User, Trip, DigitalTouristId, TripStop } = require("../models/postgres");

// This service handles profile screen data.
const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
    include: [{ model: DigitalTouristId, as: "digitalId" }]
  });

  if (!user) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateProfile = async (userId, payload) => {
  // Update profile and digital ID verification status together.
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  ["fullName", "phone", "emergencyContact", "profilePhoto", "isVerified"].forEach((field) => {
    if (payload[field] !== undefined) {
      user[field] = payload[field];
    }
  });

  await user.save();

  const digitalId = await DigitalTouristId.findOne({ where: { userId } });
  if (digitalId) {
    digitalId.verifiedStatus = user.isVerified;
    await digitalId.save();
  }

  return getProfile(userId);
};

const getDigitalId = async (userId) => {
  // Get digital ID data for the profile screen.
  const digitalId = await DigitalTouristId.findOne({ where: { userId } });

  if (!digitalId) {
    const error = new Error("Digital tourist ID not found");
    error.statusCode = 404;
    throw error;
  }

  return digitalId;
};

const getTripHistory = async (userId) => {
  // Get trip history with all trip stops.
  return Trip.findAll({
    where: { userId },
    include: [{ model: TripStop, as: "stops" }],
    order: [["createdAt", "DESC"]]
  });
};

const getPersonalDetails = async (userId) => {
  // Get personal details without password data.
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["password", "createdAt", "updatedAt"]
    }
  });

  if (!user) {
    const error = new Error("Personal details not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  getProfile,
  updateProfile,
  getDigitalId,
  getTripHistory,
  getPersonalDetails
};
