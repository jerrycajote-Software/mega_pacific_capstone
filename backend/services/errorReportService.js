const prisma = require("../config/db");
const { generateTraceId } = require("../utils/terminalLogger");

const ALLOWED_PORTALS = new Set(["customer", "sales", "finance", "logistic", "owner", "admin", "superadmin", "guest"]);
const ALLOWED_SOURCES = new Set(["frontend_crash", "frontend_runtime", "api_error", "backend_error", "user_reported"]);
const ALLOWED_STATUSES = new Set(["open", "investigating", "resolved"]);

// Deduplicate identical automated frontend telemetry logs within 5 seconds to prevent terminal flooding
const recentClientTraceMap = new Map();
const DEDUPE_WINDOW_MS = 5000;

const shouldLogClientTelemetry = (dedupeKey) => {
  const now = Date.now();
  const lastSeen = recentClientTraceMap.get(dedupeKey);
  if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) {
    return false;
  }
  recentClientTraceMap.set(dedupeKey, now);

  if (recentClientTraceMap.size > 200) {
    for (const [key, timestamp] of recentClientTraceMap.entries()) {
      if (now - timestamp > DEDUPE_WINDOW_MS) {
        recentClientTraceMap.delete(key);
      }
    }
  }
  return true;
};

const clipText = (value, maxLength) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.length > maxLength ? text.slice(0, maxLength) : text;
};

const normalizePortal = (portal, pageUrl = "", role = "") => {
  const lowerPortal = String(portal || "").toLowerCase().trim();
  if (ALLOWED_PORTALS.has(lowerPortal)) return lowerPortal;

  const lowerUrl = String(pageUrl || "").toLowerCase();
  if (lowerUrl.includes("/sales")) return "sales";
  if (lowerUrl.includes("/finance")) return "finance";
  if (lowerUrl.includes("/logistic")) return "logistic";
  if (lowerUrl.includes("/owner")) return "owner";
  if (lowerUrl.includes("/admin")) return "admin";
  if (lowerUrl.includes("/superadmin")) return "superadmin";

  const lowerRole = String(role || "").toLowerCase().trim();
  if (ALLOWED_PORTALS.has(lowerRole)) return lowerRole;
  return "customer";
};

// Look up the user's profile name when submitting an authenticated error report
const resolveReporterProfile = async (userId) => {
  if (!userId) return null;
  const userRecord = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      email: true,
      role: true,
      customerProfile: { select: { name: true } },
      salesProfile: { select: { name: true } },
      financeProfile: { select: { name: true } },
      logisticProfile: { select: { name: true } },
      ownerProfile: { select: { name: true } },
      adminProfile: { select: { name: true } },
      superAdminProfile: { select: { name: true } }
    }
  });
  if (!userRecord) return null;

  const name =
    userRecord.customerProfile?.name ||
    userRecord.salesProfile?.name ||
    userRecord.financeProfile?.name ||
    userRecord.logisticProfile?.name ||
    userRecord.ownerProfile?.name ||
    userRecord.adminProfile?.name ||
    userRecord.superAdminProfile?.name ||
    null;

  return {
    id: userRecord.id,
    email: userRecord.email,
    role: userRecord.role,
    name
  };
};

// Save a new error report from any end user into PostgreSQL
const createErrorReport = async (payload, authUser = null) => {
  const resolvedUser = authUser?.userId ? await resolveReporterProfile(authUser.userId) : null;
  const role = clipText(resolvedUser?.role || payload.reporterRole || "guest", 40) || "guest";
  const pageUrl = clipText(payload.pageUrl || "/", 500) || "/";
  const portal = normalizePortal(payload.portal, pageUrl, role);
  const rawSource = String(payload.source || "frontend_runtime").toLowerCase().trim();
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : "frontend_runtime";
  const traceId = clipText(payload.traceId, 64) || generateTraceId("ERR");

  const parsedStatus =
    payload.httpStatus !== undefined && payload.httpStatus !== null && !Number.isNaN(Number(payload.httpStatus))
      ? Number(payload.httpStatus)
      : null;

  return prisma.errorReport.create({
    data: {
      traceId,
      userId: resolvedUser?.id || null,
      reporterName: clipText(resolvedUser?.name || payload.reporterName, 120),
      reporterEmail: clipText(resolvedUser?.email || payload.reporterEmail, 160),
      reporterRole: role,
      portal,
      source,
      pageUrl,
      apiEndpoint: clipText(payload.apiEndpoint, 300),
      httpStatus: parsedStatus,
      errorMessage: clipText(payload.errorMessage || "Unexpected application error", 1000) || "Unexpected application error",
      stackTrace: clipText(payload.stackTrace, 8000),
      componentStack: clipText(payload.componentStack, 4000),
      userDescription: clipText(payload.userDescription, 1500),
      browserInfo: clipText(payload.browserInfo, 400),
      status: "open"
    }
  });
};

// Fetch filtered error reports plus live summary KPI counts for the Admin portal
const listErrorReports = async ({ status, portal, source, search } = {}) => {
  const where = {};

  if (status && status !== "all" && ALLOWED_STATUSES.has(status.toLowerCase())) {
    where.status = status.toLowerCase();
  }
  if (portal && portal !== "all" && ALLOWED_PORTALS.has(portal.toLowerCase())) {
    where.portal = portal.toLowerCase();
  }
  if (source && source !== "all" && ALLOWED_SOURCES.has(source.toLowerCase())) {
    where.source = source.toLowerCase();
  }
  if (search && search.trim()) {
    const keyword = search.trim();
    where.OR = [
      { traceId: { contains: keyword, mode: "insensitive" } },
      { errorMessage: { contains: keyword, mode: "insensitive" } },
      { userDescription: { contains: keyword, mode: "insensitive" } },
      { reporterName: { contains: keyword, mode: "insensitive" } },
      { reporterEmail: { contains: keyword, mode: "insensitive" } },
      { pageUrl: { contains: keyword, mode: "insensitive" } },
      { apiEndpoint: { contains: keyword, mode: "insensitive" } }
    ];
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [reports, openCount, investigatingCount, resolvedCount, todayCount] = await Promise.all([
    prisma.errorReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200
    }),
    prisma.errorReport.count({ where: { status: "open" } }),
    prisma.errorReport.count({ where: { status: "investigating" } }),
    prisma.errorReport.count({ where: { status: "resolved" } }),
    prisma.errorReport.count({ where: { createdAt: { gte: startOfToday } } })
  ]);

  return {
    reports,
    summary: {
      total: openCount + investigatingCount + resolvedCount,
      open: openCount,
      investigating: investigatingCount,
      resolved: resolvedCount,
      todayCount
    }
  };
};

// Retrieve a single error report with full diagnostics for Admin inspection
const getErrorReportById = async (reportId) => {
  return prisma.errorReport.findUnique({
    where: { id: Number(reportId) }
  });
};

// Update an error report's investigation status and admin notes
const updateErrorReportStatus = async (reportId, { status, adminNotes, resolvedById }) => {
  const normalizedStatus = String(status || "").toLowerCase().trim();
  if (!ALLOWED_STATUSES.has(normalizedStatus)) {
    const error = new Error("Status must be open, investigating, or resolved.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.errorReport.findUnique({
    where: { id: Number(reportId) }
  });
  if (!existing) {
    const error = new Error("Error report not found.");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {
    status: normalizedStatus,
    adminNotes: adminNotes !== undefined ? clipText(adminNotes, 2000) : existing.adminNotes
  };

  if (normalizedStatus === "resolved") {
    updateData.resolvedById = resolvedById ? Number(resolvedById) : existing.resolvedById;
    updateData.resolvedAt = new Date();
  } else {
    updateData.resolvedAt = null;
  }

  return prisma.errorReport.update({
    where: { id: Number(reportId) },
    data: updateData
  });
};

module.exports = {
  shouldLogClientTelemetry,
  createErrorReport,
  listErrorReports,
  getErrorReportById,
  updateErrorReportStatus
};
