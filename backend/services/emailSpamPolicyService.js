// Enforces a per-customer email request rate limit (max 10 requests per 5 minutes)
// and applies a temporary 10-minute spam cooldown block when exceeded.

const EMAIL_SPAM_WINDOW_MS = 5 * 60 * 1000;
const MAX_EMAIL_REQUESTS_PER_WINDOW = 15;
const SPAM_COOLDOWN_DURATION_MS = 10 * 60 * 1000;

// In-memory store keyed by normalized email address
const customerEmailActivity = new Map();

/**
 * Normalize a customer email address for consistent rate-limit tracking.
 */
const normalizeSpamKey = (email) => String(email || "").trim().toLowerCase();

/**
 * Format a remaining cooldown duration in seconds into plain, readable text.
 */
const formatCooldownDuration = (remainingSeconds) => {
  const safeSeconds = Math.max(1, Math.ceil(remainingSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  if (minutes > 0 && seconds > 0) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} and ${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
};

/**
 * Build a user-friendly spam cooldown message for blocked requests.
 */
const buildCooldownMessage = (remainingSeconds) => {
  const waitText = formatCooldownDuration(remainingSeconds);
  return `You have exceeded the limit of ${MAX_EMAIL_REQUESTS_PER_WINDOW} email requests in 5 minutes and are temporarily flagged as a spam user. Please wait ${waitText} before requesting another email.`;
};

/**
 * Remove expired entries periodically so unused keys do not grow in memory.
 */
const pruneStaleEntries = (now) => {
  if (customerEmailActivity.size < 500) return;

  for (const [key, record] of customerEmailActivity.entries()) {
    const activeTimestamps = record.timestamps.filter((ts) => now - ts < EMAIL_SPAM_WINDOW_MS);
    const isBlocked = Boolean(record.blockedUntil && now < record.blockedUntil);

    if (!isBlocked && activeTimestamps.length === 0) {
      customerEmailActivity.delete(key);
    } else {
      record.timestamps = activeTimestamps;
    }
  }
};

/**
 * Retrieve or initialize a customer's email request tracking record and clear expired windows.
 */
const getActiveRecord = (key, now) => {
  let record = customerEmailActivity.get(key);
  if (!record) {
    record = { timestamps: [], blockedUntil: null, lastAction: null };
    customerEmailActivity.set(key, record);
    return record;
  }

  // Clear expired cooldown blocks and start a fresh 5-minute window
  if (record.blockedUntil && now >= record.blockedUntil) {
    record.blockedUntil = null;
    record.timestamps = [];
  } else {
    record.timestamps = record.timestamps.filter((ts) => now - ts < EMAIL_SPAM_WINDOW_MS);
  }

  return record;
};

/**
 * Check whether a customer is currently in a 10-minute spam cooldown block without recording a new request.
 */
const checkEmailSpamPolicy = (email, now = Date.now()) => {
  const key = normalizeSpamKey(email);
  if (!key) {
    return {
      allowed: true,
      isSpamUser: false,
      remainingRequestsInWindow: MAX_EMAIL_REQUESTS_PER_WINDOW
    };
  }

  pruneStaleEntries(now);
  const record = getActiveRecord(key, now);

  if (record.blockedUntil && now < record.blockedUntil) {
    const remainingSeconds = Math.max(1, Math.ceil((record.blockedUntil - now) / 1000));
    return {
      allowed: false,
      isSpamUser: true,
      remainingSeconds,
      blockedUntil: record.blockedUntil,
      requestCountInWindow: record.timestamps.length,
      message: buildCooldownMessage(remainingSeconds)
    };
  }

  return {
    allowed: true,
    isSpamUser: false,
    requestCountInWindow: record.timestamps.length,
    remainingRequestsInWindow: Math.max(0, MAX_EMAIL_REQUESTS_PER_WINDOW - record.timestamps.length)
  };
};

/**
 * Record a customer-triggered email request and trigger a 10-minute spam cooldown if the 5-minute limit of 10 is exceeded.
 */
const consumeEmailSpamQuota = (email, action = "email_request", now = Date.now()) => {
  const key = normalizeSpamKey(email);
  if (!key) {
    return {
      allowed: true,
      isSpamUser: false,
      requestCountInWindow: 0,
      remainingRequestsInWindow: MAX_EMAIL_REQUESTS_PER_WINDOW
    };
  }

  const currentStatus = checkEmailSpamPolicy(key, now);
  if (!currentStatus.allowed) {
    return currentStatus;
  }

  const record = getActiveRecord(key, now);

  // If 10 requests were already made in the active 5-minute window, this 11th request triggers the 10-minute spam cooldown
  if (record.timestamps.length >= MAX_EMAIL_REQUESTS_PER_WINDOW) {
    record.blockedUntil = now + SPAM_COOLDOWN_DURATION_MS;
    record.lastAction = action;
    const remainingSeconds = Math.ceil(SPAM_COOLDOWN_DURATION_MS / 1000);

    console.warn(
      `[EMAIL SPAM POLICY] Flagged "${key}" as a temporary spam user for 10 minutes after exceeding ${MAX_EMAIL_REQUESTS_PER_WINDOW} email requests in 5 minutes (trigger: ${action}).`
    );

    return {
      allowed: false,
      isSpamUser: true,
      remainingSeconds,
      blockedUntil: record.blockedUntil,
      requestCountInWindow: record.timestamps.length,
      message: buildCooldownMessage(remainingSeconds)
    };
  }

  record.timestamps.push(now);
  record.lastAction = action;

  return {
    allowed: true,
    isSpamUser: false,
    requestCountInWindow: record.timestamps.length,
    remainingRequestsInWindow: Math.max(0, MAX_EMAIL_REQUESTS_PER_WINDOW - record.timestamps.length)
  };
};

/**
 * Build a consistent HTTP 429 response payload for blocked spam users.
 */
const buildSpamPolicyErrorResponse = (policyResult) => ({
  success: false,
  error: policyResult.message,
  message: policyResult.message,
  code: "EMAIL_SPAM_COOLDOWN",
  isSpamUser: true,
  cooldownRemaining: policyResult.remainingSeconds,
  retryAfterSeconds: policyResult.remainingSeconds,
  blockedUntil: policyResult.blockedUntil ? new Date(policyResult.blockedUntil).toISOString() : null
});

module.exports = {
  EMAIL_SPAM_WINDOW_MS,
  MAX_EMAIL_REQUESTS_PER_WINDOW,
  SPAM_COOLDOWN_DURATION_MS,
  checkEmailSpamPolicy,
  consumeEmailSpamQuota,
  buildSpamPolicyErrorResponse
};
