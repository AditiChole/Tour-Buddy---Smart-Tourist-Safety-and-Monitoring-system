const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const { User, DigitalTouristId } = require("../models/postgres");
const generateDigitalId = require("../utils/generateDigitalId");
const { generateToken } = require("../utils/jwt");

// This removes the password before sending user data.
const sanitizeUser = (user) => {
  const plain = user.get({ plain: true });
  delete plain.password;
  return plain;
};

const registerUser = async (payload) => {
  // Check if the user already exists.
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email: payload.email }, { phone: payload.phone }]
    }
  });

  if (existingUser) {
    const error = new Error("User with this email or phone already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // First create the user, then create the tourist ID.
  const user = await User.create({
    ...payload,
    password: hashedPassword
  });

  const digitalId = generateDigitalId({
    userId: user.userId,
    fullName: user.fullName,
    email: user.email
  });

  user.touristIdCode = digitalId.idCode;
  await user.save();

  await DigitalTouristId.create({
    userId: user.userId,
    idCode: digitalId.idCode,
    qrValue: digitalId.qrValue,
    verifiedStatus: user.isVerified
  });

  const token = generateToken({
    userId: user.userId,
    email: user.email,
    role: user.role
  });

  return { user: sanitizeUser(user), token };
};

const loginUser = async ({ email, password }) => {
  // Check email and password during login.
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    userId: user.userId,
    email: user.email,
    role: user.role
  });

  return { user: sanitizeUser(user), token };
};

const getCurrentUser = async (userId) => {
  // Also get digital ID details with the user data.
  const user = await User.findByPk(userId, {
    include: [{ model: DigitalTouristId, as: "digitalId" }]
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

const updateCurrentUserProfile = async (userId, payload) => {
  // Only selected profile fields can be updated here.
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  ["fullName", "phone", "emergencyContact", "profilePhoto"].forEach((field) => {
    if (payload[field] !== undefined) {
      user[field] = payload[field];
    }
  });

  await user.save();
  return sanitizeUser(user);
};

const deleteCurrentUser = async (userId) => {
  // Delete the user account.
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await user.destroy();
  return { deleted: true };
};

const getAllUsers = async () => {
  // Get all users for admin use.
  const users = await User.findAll({ order: [["createdAt", "DESC"]] });
  return users.map(sanitizeUser);
};

const updateUserRole = async (userId, role) => {
  // Admin can change the user's role.
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.role = role;
  await user.save();
  return sanitizeUser(user);
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUserProfile,
  deleteCurrentUser,
  getAllUsers,
  updateUserRole
};
