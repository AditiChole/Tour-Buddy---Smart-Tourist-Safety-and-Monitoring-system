// This handles all errors in one place.
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    errors: process.env.NODE_ENV === "development" ? [err.stack] : null
  });
};

module.exports = { errorHandler };
