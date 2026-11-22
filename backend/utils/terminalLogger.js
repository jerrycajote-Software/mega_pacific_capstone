const crypto = require("crypto");
const {
  analyzeBackendError,
  readSourceCodeContext
} = require("./errorSolutionAdvisor");

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bgRed: "\x1b[41m",
  bgMagenta: "\x1b[45m",
  bgYellow: "\x1b[43m",
  white: "\x1b[37m",
  black: "\x1b[30m"
};

const SENSITIVE_KEYS = new Set([
  "password",
  "newpassword",
  "currentpassword",
  "confirmpassword",
  "token",
  "authorization",
  "sessiontoken",
  "cardnumber",
  "cardcvv",
  "cvv",
  "otp",
  "otpcode",
  "resetotpcode",
  "secret",
  "secretkey",
  "apikey"
]);

// Format local timestamp in readable Philippines time for terminal monitoring logs
const formatTimestamp = () => {
  const now = new Date();
  return now.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
};

// Generate a short, human-readable trace ID for correlating logs and user reports
const generateTraceId = (prefix = "ERR") => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
};

// Recursively redact passwords, tokens, OTPs, and card fields before printing to terminal
const sanitizeForLog = (value, depth = 0) => {
  if (value === null || value === undefined) return value;
  if (depth > 3) return "[Nested Object]";

  if (typeof value === "string") {
    return value.length > 350 ? `${value.slice(0, 350)}... [truncated]` : value;
  }

  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    const preview = value.slice(0, 8).map((item) => sanitizeForLog(item, depth + 1));
    if (value.length > 8) {
      preview.push(`... (${value.length - 8} more items)`);
    }
    return preview;
  }

  const output = {};
  const entries = Object.entries(value).slice(0, 25);
  for (const [key, val] of entries) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (SENSITIVE_KEYS.has(normalizedKey)) {
      output[key] = "[REDACTED]";
    } else {
      output[key] = sanitizeForLog(val, depth + 1);
    }
  }
  return output;
};

const formatUserLabel = (user) => {
  if (!user) return "guest";
  const role = user.role || "user";
  const id = user.userId || user.id || "?";
  return `${role}#${id}`;
};

const formatCompactJson = (obj) => {
  if (!obj || (typeof obj === "object" && Object.keys(obj).length === 0)) {
    return null;
  }
  try {
    return JSON.stringify(sanitizeForLog(obj));
  } catch {
    return "[Unserializable Payload]";
  }
};

// Extract the first backend project file and line number from a Node.js error stack
const extractBackendSourceFile = (stackText) => {
  if (!stackText) return null;
  const lines = String(stackText).split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (
      !line ||
      line.includes("node_modules") ||
      line.includes("node:internal") ||
      line.includes("terminalLogger.js") ||
      line.includes("requestMonitorMiddleware.js") ||
      line.includes("globalErrorMiddleware.js")
    ) {
      continue;
    }

    const normalized = line.replace(/\\/g, "/");
    const match = normalized.match(/(backend\/[^():\s]+:\d+(?::\d+)?)/i);
    if (match) {
      const fnMatch = line.match(/^at\s+([^\s(]+)\s+\(/);
      return fnMatch ? `${match[1]} (${fnMatch[1]})` : match[1];
    }
  }
  return null;
};

// Print exact source code lines around an error plus plain-English possible solutions
const printCodeContextAndSolutions = ({ sourceFile, diagnosis, includeCodeContext = true, writeError = console.error }) => {
  const snippet = includeCodeContext ? readSourceCodeContext(sourceFile) : null;
  if (snippet && snippet.lines.length > 0) {
    writeError(`${ANSI.yellow}  Code Context (${snippet.relativePath}:${snippet.targetLine}):${ANSI.reset}`);
    for (const row of snippet.lines) {
      const lineNumStr = String(row.lineNumber).padStart(4, " ");
      if (row.isTarget) {
        writeError(`${ANSI.red}${ANSI.bold}  >> ${lineNumStr} | ${row.content}${ANSI.reset}`);
        if (snippet.targetColumn && snippet.targetColumn > 0) {
          const caretOffset = " ".repeat(Math.min(snippet.targetColumn - 1, 120));
          writeError(`${ANSI.yellow}${ANSI.bold}          | ${caretOffset}^${ANSI.reset}`);
        }
      } else {
        writeError(`${ANSI.dim}     ${lineNumStr} | ${row.content}${ANSI.reset}`);
      }
    }
  }

  if (diagnosis) {
    if (diagnosis.category) {
      writeError(`${ANSI.cyan}${ANSI.bold}  Category   :${ANSI.reset} ${ANSI.cyan}${diagnosis.category}${ANSI.reset}`);
    }
    if (diagnosis.summary) {
      writeError(`${ANSI.cyan}  Likely Fix :${ANSI.reset} ${diagnosis.summary}`);
    }
    if (Array.isArray(diagnosis.possibleSolutions) && diagnosis.possibleSolutions.length > 0) {
      writeError(`${ANSI.green}${ANSI.bold}  Possible Solutions:${ANSI.reset}`);
      diagnosis.possibleSolutions.forEach((step, idx) => {
        writeError(`${ANSI.green}    ${idx + 1}. ${step}${ANSI.reset}`);
      });
    }
  }
};

// Print a concise one-line request summary and expand full trace details for 5xx responses
const logHttpRequest = ({
  traceId,
  method,
  url,
  statusCode,
  durationMs,
  user,
  ip,
  query,
  body,
  errorMessage,
  sourceFile
}) => {
  const time = `${ANSI.gray}[${formatTimestamp()}]${ANSI.reset}`;
  const traceTag = `${ANSI.cyan}[${traceId}]${ANSI.reset}`;
  const userTag = `${ANSI.dim}User: ${formatUserLabel(user)}${ANSI.reset}`;

  let statusColor = ANSI.green;
  let levelTag = `${ANSI.blue}[REQ]${ANSI.reset}`;
  if (statusCode >= 500) {
    statusColor = ANSI.red;
    levelTag = `${ANSI.bgRed}${ANSI.white}${ANSI.bold} BACKEND ERROR ${ANSI.reset}`;
  } else if (statusCode >= 400) {
    statusColor = ANSI.yellow;
    levelTag = `${ANSI.yellow}${ANSI.bold}[WARN]${ANSI.reset}`;
  }

  const statusText = `${statusColor}${ANSI.bold}${statusCode}${ANSI.reset}`;
  console.log(
    `${time} ${levelTag} ${traceTag} ${ANSI.bold}${method}${ANSI.reset} ${url} -> ${statusText} (${durationMs}ms) | ${userTag}`
  );

  if (statusCode >= 500) {
    const queryStr = formatCompactJson(query);
    const bodyStr = formatCompactJson(body);
    const diagnosis = analyzeBackendError({
      errorMessage,
      httpStatus: statusCode,
      route: `${method} ${url}`,
      sourceFile
    });
    console.error(`${ANSI.red}  Trace ID   :${ANSI.reset} ${traceId}`);
    if (sourceFile) {
      console.error(`${ANSI.yellow}${ANSI.bold}  File       :${ANSI.reset} ${ANSI.yellow}${ANSI.bold}${sourceFile}${ANSI.reset}`);
    }
    console.error(`${ANSI.red}  Route      :${ANSI.reset} ${method} ${url} (IP: ${ip || "unknown"})`);
    console.error(`${ANSI.red}  Actor      :${ANSI.reset} ${formatUserLabel(user)}`);
    if (errorMessage) {
      console.error(`${ANSI.red}  Message    :${ANSI.reset} ${errorMessage}`);
    }
    if (queryStr) {
      console.error(`${ANSI.red}  Query      :${ANSI.reset} ${queryStr}`);
    }
    if (bodyStr) {
      console.error(`${ANSI.red}  Body       :${ANSI.reset} ${bodyStr}`);
    }
    printCodeContextAndSolutions({ sourceFile, diagnosis });
  } else if (statusCode >= 400 && errorMessage) {
    console.warn(`${ANSI.yellow}  Reason     :${ANSI.reset} ${errorMessage}`);
  }
};

// Print a complete backend exception trace including exact file, code snippet, and possible solutions
const logBackendErrorTrace = ({ traceId, req, error, contextLabel = "UNHANDLED ROUTE ERROR" }) => {
  const time = formatTimestamp();
  const method = req?.method || "INTERNAL";
  const url = req?.originalUrl || req?.url || "unknown";
  const queryStr = formatCompactJson(req?.query);
  const bodyStr = formatCompactJson(req?.body);
  const sourceFile = extractBackendSourceFile(error?.stack);
  const diagnosis = analyzeBackendError({
    error,
    httpStatus: error?.statusCode || error?.status || 500,
    route: `${method} ${url}`,
    sourceFile
  });

  console.error("");
  console.error(
    `${ANSI.bgRed}${ANSI.white}${ANSI.bold} ${contextLabel} ${ANSI.reset} ${ANSI.gray}[${time}]${ANSI.reset} ${ANSI.cyan}[${traceId}]${ANSI.reset}`
  );
  if (sourceFile) {
    console.error(`${ANSI.yellow}${ANSI.bold}  File       :${ANSI.reset} ${ANSI.yellow}${ANSI.bold}${sourceFile}${ANSI.reset}`);
  }
  console.error(`${ANSI.red}  Route      :${ANSI.reset} ${method} ${url}`);
  console.error(`${ANSI.red}  Actor      :${ANSI.reset} ${formatUserLabel(req?.user)}`);
  console.error(`${ANSI.red}  Message    :${ANSI.reset} ${error?.message || String(error)}`);
  if (error?.code) {
    console.error(`${ANSI.red}  Error Code :${ANSI.reset} ${error.code}`);
  }
  if (queryStr) {
    console.error(`${ANSI.red}  Query      :${ANSI.reset} ${queryStr}`);
  }
  if (bodyStr) {
    console.error(`${ANSI.red}  Body       :${ANSI.reset} ${bodyStr}`);
  }
  printCodeContextAndSolutions({ sourceFile, diagnosis });
  if (error?.stack) {
    console.error(`${ANSI.red}  Stack Trace:${ANSI.reset}`);
    const stackLines = String(error.stack).split("\n").slice(0, 14);
    for (const line of stackLines) {
      console.error(`    ${ANSI.dim}${line}${ANSI.reset}`);
    }
  }
  console.error("");
};

// Print a forwarded frontend error in the backend terminal with code context and suggested solutions
const logFrontendErrorTrace = ({
  traceId,
  source,
  portal,
  reporterRole,
  reporterEmail,
  pageUrl,
  sourceFile,
  sourceFiles,
  diagnosisCategory,
  diagnosisHint,
  possibleSolutions,
  apiEndpoint,
  httpStatus,
  errorMessage,
  stackTrace,
  componentStack
}) => {
  const time = formatTimestamp();
  const fallbackDiagnosis =
    !diagnosisHint && (!Array.isArray(possibleSolutions) || possibleSolutions.length === 0)
      ? analyzeBackendError({
          errorMessage,
          stackTrace,
          httpStatus,
          route: apiEndpoint || pageUrl,
          sourceFile
        })
      : null;

  const resolvedDiagnosis = {
    category: diagnosisCategory || fallbackDiagnosis?.category || null,
    summary: diagnosisHint || fallbackDiagnosis?.summary || null,
    possibleSolutions:
      Array.isArray(possibleSolutions) && possibleSolutions.length > 0
        ? possibleSolutions
        : fallbackDiagnosis?.possibleSolutions || []
  };

  console.error("");
  console.error(
    `${ANSI.bgMagenta}${ANSI.white}${ANSI.bold} FRONTEND ERROR TRACE ${ANSI.reset} ${ANSI.gray}[${time}]${ANSI.reset} ${ANSI.cyan}[${traceId}]${ANSI.reset}`
  );
  console.error(
    `${ANSI.magenta}  Portal     :${ANSI.reset} ${portal || "unknown"} | Role: ${reporterRole || "guest"}${reporterEmail ? ` (${reporterEmail})` : ""}`
  );
  console.error(`${ANSI.magenta}  Source     :${ANSI.reset} ${source || "frontend_runtime"}`);
  if (sourceFile) {
    console.error(`${ANSI.yellow}${ANSI.bold}  File       :${ANSI.reset} ${ANSI.yellow}${ANSI.bold}${sourceFile}${ANSI.reset}`);
  }
  if (Array.isArray(sourceFiles) && sourceFiles.length > 1) {
    console.error(`${ANSI.yellow}  Call Chain :${ANSI.reset} ${sourceFiles.slice(1).join("  <-  ")}`);
  }
  console.error(`${ANSI.magenta}  Page URL   :${ANSI.reset} ${pageUrl || "unknown"}`);
  if (apiEndpoint) {
    console.error(
      `${ANSI.magenta}  API Failed :${ANSI.reset} ${apiEndpoint}${httpStatus ? ` (HTTP ${httpStatus})` : ""}`
    );
  }
  console.error(`${ANSI.magenta}  Message    :${ANSI.reset} ${errorMessage || "Unknown frontend error"}`);
  printCodeContextAndSolutions({
    sourceFile,
    diagnosis: resolvedDiagnosis,
    includeCodeContext: source !== "api_error"
  });
  if (stackTrace) {
    console.error(`${ANSI.magenta}  Stack Trace:${ANSI.reset}`);
    const lines = String(stackTrace).split("\n").slice(0, 10);
    for (const line of lines) {
      console.error(`    ${ANSI.dim}${line}${ANSI.reset}`);
    }
  }
  if (componentStack) {
    console.error(`${ANSI.magenta}  React Tree :${ANSI.reset}`);
    const lines = String(componentStack).split("\n").filter(Boolean).slice(0, 6);
    for (const line of lines) {
      console.error(`    ${ANSI.dim}${line.trim()}${ANSI.reset}`);
    }
  }
  console.error("");
};

// Highlight user-submitted error reports sent to Admin in the backend terminal
const logUserErrorReportSubmitted = (report) => {
  const time = formatTimestamp();
  console.log("");
  console.log(
    `${ANSI.bgYellow}${ANSI.black}${ANSI.bold} USER ERROR REPORT #${report.id} ${ANSI.reset} ${ANSI.gray}[${time}]${ANSI.reset} ${ANSI.cyan}[${report.traceId}]${ANSI.reset}`
  );
  console.log(
    `${ANSI.yellow}  Reporter   :${ANSI.reset} ${report.reporterName || "Unknown"} (${report.reporterRole}${report.reporterEmail ? ` - ${report.reporterEmail}` : ""})`
  );
  console.log(`${ANSI.yellow}  Portal/URL :${ANSI.reset} ${report.portal} -> ${report.pageUrl}`);
  console.log(`${ANSI.yellow}  Error      :${ANSI.reset} ${report.errorMessage}`);
  if (report.userDescription) {
    console.log(`${ANSI.yellow}  User Note  :${ANSI.reset} ${report.userDescription}`);
  }
  console.log("");
};

// Trace unhandled promise rejections or uncaught exceptions at the Node process level
const logProcessFatalError = (eventName, error) => {
  const traceId = generateTraceId("FATAL");
  logBackendErrorTrace({
    traceId,
    req: null,
    error: error instanceof Error ? error : new Error(String(error)),
    contextLabel: `NODE ${eventName.toUpperCase()}`
  });
};

let isConsoleErrorAdvisorInstalled = false;

// Automatically diagnose Error objects logged inside controller catch blocks via console.error
const installConsoleErrorAdvisor = () => {
  if (isConsoleErrorAdvisorInstalled) return;
  isConsoleErrorAdvisorInstalled = true;

  const rawConsoleError = console.error.bind(console);
  let isDiagnosing = false;

  console.error = (...args) => {
    rawConsoleError(...args);
    if (isDiagnosing) return;

    const foundError = args.find((item) => item instanceof Error && item.stack);
    if (!foundError) return;

    const sourceFile = extractBackendSourceFile(foundError.stack);
    const diagnosis = analyzeBackendError({
      error: foundError,
      sourceFile
    });
    if (!sourceFile && !diagnosis) return;

    isDiagnosing = true;
    try {
      rawConsoleError(
        `${ANSI.bgRed}${ANSI.white}${ANSI.bold} BACKEND ERROR DIAGNOSIS ${ANSI.reset} ${ANSI.gray}[${formatTimestamp()}]${ANSI.reset}`
      );
      if (sourceFile) {
        rawConsoleError(`${ANSI.yellow}${ANSI.bold}  File       :${ANSI.reset} ${ANSI.yellow}${ANSI.bold}${sourceFile}${ANSI.reset}`);
      }
      printCodeContextAndSolutions({
        sourceFile,
        diagnosis,
        includeCodeContext: true,
        writeError: rawConsoleError
      });
      rawConsoleError("");
    } finally {
      isDiagnosing = false;
    }
  };
};

module.exports = {
  generateTraceId,
  sanitizeForLog,
  extractBackendSourceFile,
  logHttpRequest,
  logBackendErrorTrace,
  logFrontendErrorTrace,
  logUserErrorReportSubmitted,
  logProcessFatalError,
  installConsoleErrorAdvisor
};
