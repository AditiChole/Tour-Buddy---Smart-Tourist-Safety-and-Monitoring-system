const jwt = require("jsonwebtoken");
const env = require("../config/env");

// This creates the login token used for protected routes.
const generateToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

module.exports = { generateToken };
