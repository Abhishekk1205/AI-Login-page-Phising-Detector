/**
 * middleware/errorHandler.js
 * Global Express error handler.
 */

function errorHandler(err, req, res, _next) {
  console.error("❌ Unhandled error:", err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error:   err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = errorHandler;
