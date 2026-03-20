const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes");
const apiLimiter = require("./middleware/rateLimit.middleware");
const { notFoundHandler } = require("./middleware/notFound.middleware");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

// Allow frontend apps to call backend APIs.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// Add basic security headers.
app.use(helmet());

// Read JSON and form data from requests.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limit too many requests in short time.
app.use(apiLimiter);

// Simple route to check server status.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Women Safety Smart Travel backend is running",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

// All backend APIs start with /api
app.use("/api", routes);

// Handle wrong route and other errors
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
