const rateLimit = require("express-rate-limit");

// This limits too many requests in a short time.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
});

module.exports = apiLimiter;
