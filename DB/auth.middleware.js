const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User } = require("../models/postgres");

// Check token and attach logged-in user data.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token user"
      });
    }

    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
      errors: [error.message]
    });
  }
};

module.exports = { protect };
