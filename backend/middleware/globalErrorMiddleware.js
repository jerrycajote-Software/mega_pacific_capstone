const {
  generateTraceId,
  logBackendErrorTrace,
  logProcessFatalError,
  installConsoleErrorAdvisor
} = require("../utils/terminalLogger");

// Catch unhandled Express errors, log a full backend terminal trace, and return a safe JSON payload
const globalErrorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const traceId = req?.traceId || generateTraceId("ERR");
  const statusCode = err?.statusCode || err?.status || 500;

  logBackendErrorTrace({
    traceId,
    req,
    error: err,
    contextLabel: statusCode >= 500 ? "BACKEND SERVER ERROR" : "BACKEND REQUEST ERROR"
  });

  const safeMessage =
    statusCode >= 500
      ? `Something went wrong on our server. Please try again or report Reference Code ${traceId} to Admin.`
      : err?.message || "Your request could not be completed. Please review your input and try again.";

  return res.status(statusCode).json({
    success: false,
    message: safeMessage,
    error: safeMessage,
    traceId
  });
};

// Register process-level listeners and controller console.error diagnostics once on server startup
const registerProcessErrorTracers = () => {
  installConsoleErrorAdvisor();

  process.on("unhandledRejection", (reason) => {
    logProcessFatalError("unhandledRejection", reason);
  });

  process.on("uncaughtException", (error) => {
    logProcessFatalError("uncaughtException", error);
  });
};

module.exports = {
  globalErrorMiddleware,
  registerProcessErrorTracers
};
