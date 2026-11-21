const jwt = require("jsonwebtoken");
const {
  generateTraceId,
  logFrontendErrorTrace,
  logUserErrorReportSubmitted
} = require("../utils/terminalLogger");
const {
  shouldLogClientTelemetry,
  createErrorReport
} = require("../services/errorReportService");

// Safely extract user identity from an optional Bearer token without blocking guest error reports
const extractOptionalUserFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1]?.trim();
  if (!token || token === "null" || token === "undefined" || !process.env.JWT_SECRET) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Receive automatic frontend error traces and print them cleanly to the backend terminal
const logClientMonitoringError = async (req, res) => {
  try {
    const payload = req.body || {};
    const authUser = extractOptionalUserFromRequest(req);
    const traceId = payload.traceId || req.traceId || generateTraceId("FE");
    const errorMessage = String(payload.errorMessage || "Unknown frontend error").slice(0, 600);
    const pageUrl = String(payload.pageUrl || "unknown").slice(0, 300);

    const dedupeKey = `${payload.source || "runtime"}|${pageUrl}|${errorMessage}|${payload.httpStatus || ""}`;
    if (shouldLogClientTelemetry(dedupeKey)) {
      logFrontendErrorTrace({
        traceId,
        source: payload.source || "frontend_runtime",
        portal: payload.portal || authUser?.role || "guest",
        reporterRole: authUser?.role || payload.reporterRole || "guest",
        reporterEmail: payload.reporterEmail || null,
        pageUrl,
        sourceFile: payload.sourceFile || null,
        sourceFiles: Array.isArray(payload.sourceFiles) ? payload.sourceFiles : [],
        diagnosisHint: payload.diagnosisHint || null,
        apiEndpoint: payload.apiEndpoint || null,
        httpStatus: payload.httpStatus || null,
        errorMessage,
        stackTrace: payload.stackTrace || null,
        componentStack: payload.componentStack || null
      });
    }

    return res.status(200).json({
      success: true,
      message: "Frontend error trace recorded in server monitoring logs.",
      traceId
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Unable to record client monitoring trace."
    });
  }
};

// Save an end-user error report and immediately alert the Admin portal in real time
const submitUserErrorReport = async (req, res, next) => {
  try {
    const payload = req.body || {};
    if (!payload.errorMessage && !payload.userDescription) {
      return res.status(400).json({
        success: false,
        message: "Please provide error details or a short description before sending your report."
      });
    }

    const authUser = extractOptionalUserFromRequest(req);
    const createdReport = await createErrorReport(payload, authUser);

    logUserErrorReportSubmitted(createdReport);

    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("admin_error_report_created", {
        report: createdReport
      });
    }

    return res.status(201).json({
      success: true,
      message: `Your error report has been sent to Admin (Reference: ${createdReport.traceId}).`,
      data: createdReport
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  logClientMonitoringError,
  submitUserErrorReport
};
