const {
  generateTraceId,
  extractBackendSourceFile,
  logHttpRequest
} = require("../utils/terminalLogger");

const SILENT_MONITOR_PATHS = [
  "/api/monitoring/client-error"
];

// Attach a Trace ID to every request and log response status, duration, and error details
const requestMonitorMiddleware = (req, res, next) => {
  const incomingTrace = req.headers["x-trace-id"];
  const traceId =
    typeof incomingTrace === "string" && incomingTrace.trim().length > 0 && incomingTrace.trim().length <= 64
      ? incomingTrace.trim()
      : generateTraceId("REQ");

  req.traceId = traceId;
  res.setHeader("X-Trace-Id", traceId);
  res.setHeader("Access-Control-Expose-Headers", "X-Trace-Id");

  const startedAt = Date.now();
  let capturedErrorMessage = null;
  let capturedSourceFile = null;

  // Capture error messages and exact backend file location when a controller sends an error JSON response
  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    if (res.statusCode >= 400 && payload && typeof payload === "object" && !Array.isArray(payload)) {
      capturedErrorMessage = payload.message || payload.error || capturedErrorMessage;
      if (res.statusCode >= 500 && !capturedSourceFile) {
        capturedSourceFile = extractBackendSourceFile(new Error("Controller Error Origin").stack);
      }
      if (!payload.traceId) {
        payload = { ...payload, traceId };
      }
    }
    return originalJson(payload);
  };

  res.on("finish", () => {
    const pathOnly = (req.originalUrl || req.url || "").split("?")[0];
    if (SILENT_MONITOR_PATHS.includes(pathOnly) && res.statusCode < 500) {
      return;
    }

    const durationMs = Date.now() - startedAt;
    logHttpRequest({
      traceId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      user: req.user,
      ip: req.ip,
      query: req.query,
      body: res.statusCode >= 500 ? req.body : null,
      errorMessage: capturedErrorMessage,
      sourceFile: capturedSourceFile
    });
  });

  next();
};

module.exports = requestMonitorMiddleware;
