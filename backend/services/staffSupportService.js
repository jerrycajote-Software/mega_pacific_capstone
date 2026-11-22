const prisma = require("../config/db");
const storageService = require("./storageService");

const STAFF_SENDER_ROLES = ["logistic", "finance", "sales", "owner"];
const ADMIN_REVIEWER_ROLES = ["admin", "superadmin", "super_admin"];
const VALID_CATEGORIES = ["system_problem", "feature_request", "general_help"];
const VALID_PRIORITIES = ["normal", "urgent"];
const VALID_STATUSES = ["open", "in_progress", "resolved"];

const createServiceError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const isAdminRole = (role) => ADMIN_REVIEWER_ROLES.includes(String(role || "").toLowerCase());
const isStaffSenderRole = (role) => STAFF_SENDER_ROLES.includes(String(role || "").toLowerCase());

// Resolve a readable display name across all staff and admin profile tables
const resolveUserDisplayName = (user) => {
  if (!user) return "Staff Member";
  return (
    user.logisticProfile?.name ||
    user.financeProfile?.name ||
    user.salesProfile?.name ||
    user.ownerProfile?.name ||
    user.adminProfile?.name ||
    user.superAdminProfile?.name ||
    (user.email ? user.email.split("@")[0] : "Staff Member")
  );
};

// Build a short one-line preview shown in the conversation sidebar
const buildMessagePreview = (content, imageUrl) => {
  const trimmed = String(content || "").trim();
  if (trimmed) {
    return trimmed.length > 110 ? `${trimmed.slice(0, 107)}...` : trimmed;
  }
  if (imageUrl) {
    return "Sent a screenshot attachment";
  }
  return "";
};

const userProfileSelect = {
  id: true,
  email: true,
  role: true,
  logisticProfile: { select: { name: true } },
  financeProfile: { select: { name: true } },
  salesProfile: { select: { name: true } },
  ownerProfile: { select: { name: true } },
  adminProfile: { select: { name: true } },
  superAdminProfile: { select: { name: true } }
};

// Format a thread record consistently for both Staff and Admin portals
const formatThreadSummary = (thread) => {
  if (!thread) return null;
  return {
    id: thread.id,
    staffId: thread.staffId,
    staffRole: thread.staffRole,
    staffName: thread.staffName || resolveUserDisplayName(thread.staff),
    staffEmail: thread.staffEmail || thread.staff?.email || "",
    category: thread.category,
    priority: thread.priority,
    subject: thread.subject,
    status: thread.status,
    lastMessageAt: thread.lastMessageAt,
    lastMessagePreview: thread.lastMessagePreview || "",
    staffUnreadCount: thread.staffUnreadCount || 0,
    adminUnreadCount: thread.adminUnreadCount || 0,
    resolvedByName: thread.resolvedBy ? resolveUserDisplayName(thread.resolvedBy) : null,
    resolvedAt: thread.resolvedAt,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    ...(Array.isArray(thread.messages)
      ? {
          messages: thread.messages.map((msg) => ({
            id: msg.id,
            threadId: msg.threadId,
            senderId: msg.senderId,
            senderRole: msg.senderRole,
            senderName: msg.senderName || resolveUserDisplayName(msg.sender),
            content: msg.content,
            imageUrl: msg.imageUrl || null,
            createdAt: msg.createdAt
          }))
        }
      : {})
  };
};

// Create a new Staff-to-Admin support thread with its initial message and optional screenshot
const createStaffSupportThread = async ({
  userId,
  userRole,
  category = "system_problem",
  priority = "normal",
  subject,
  message,
  image
}) => {
  const normalizedRole = String(userRole || "").toLowerCase();
  if (!isStaffSenderRole(normalizedRole)) {
    throw createServiceError(403, "Only Logistics, Finance, Sales, and Owner staff can start an Admin support conversation.");
  }

  const cleanSubject = String(subject || "").trim().slice(0, 140);
  const cleanMessage = String(message || "").trim().slice(0, 2000);
  const cleanCategory = VALID_CATEGORIES.includes(category) ? category : "system_problem";
  const cleanPriority = VALID_PRIORITIES.includes(priority) ? priority : "normal";

  if (!cleanSubject) {
    throw createServiceError(400, "Please enter a short subject describing your concern or feature idea.");
  }

  if (!cleanMessage && !image) {
    throw createServiceError(400, "Please enter a message or attach a screenshot before sending.");
  }

  const staffUser = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) },
    select: userProfileSelect
  });

  if (!staffUser) {
    throw createServiceError(404, "Staff user account could not be found.");
  }

  let uploadedImageUrl = null;
  if (image) {
    uploadedImageUrl = await storageService.uploadBase64Image(image, "staff-support");
  }

  const staffName = resolveUserDisplayName(staffUser);
  const now = new Date();
  const preview = buildMessagePreview(cleanMessage, uploadedImageUrl);

  const createdThread = await prisma.staffSupportThread.create({
    data: {
      staffId: staffUser.id,
      staffRole: normalizedRole,
      staffName,
      staffEmail: staffUser.email,
      category: cleanCategory,
      priority: cleanPriority,
      subject: cleanSubject,
      status: "open",
      lastMessageAt: now,
      lastMessagePreview: preview,
      staffUnreadCount: 0,
      adminUnreadCount: 1,
      messages: {
        create: {
          senderId: staffUser.id,
          senderRole: normalizedRole,
          senderName: staffName,
          content: cleanMessage,
          imageUrl: uploadedImageUrl
        }
      }
    },
    include: {
      staff: { select: userProfileSelect },
      resolvedBy: { select: userProfileSelect },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: userProfileSelect } }
      }
    }
  });

  return formatThreadSummary(createdThread);
};

// List conversations for the signed-in staff user or all staff conversations for Admin
const listStaffSupportThreads = async ({
  requesterId,
  requesterRole,
  status = "all",
  category = "all",
  department = "all",
  search = ""
}) => {
  const roleLower = String(requesterRole || "").toLowerCase();
  const adminAccess = isAdminRole(roleLower);

  if (!adminAccess && !isStaffSenderRole(roleLower)) {
    throw createServiceError(403, "You do not have permission to view Staff-to-Admin conversations.");
  }

  const baseWhere = adminAccess ? {} : { staffId: parseInt(requesterId, 10) };
  const filterWhere = { ...baseWhere };

  if (status && status !== "all" && VALID_STATUSES.includes(status)) {
    filterWhere.status = status;
  }
  if (category && category !== "all" && VALID_CATEGORIES.includes(category)) {
    filterWhere.category = category;
  }
  if (adminAccess && department && department !== "all" && STAFF_SENDER_ROLES.includes(department)) {
    filterWhere.staffRole = department;
  }

  const [threads, allScopedThreads] = await Promise.all([
    prisma.staffSupportThread.findMany({
      where: filterWhere,
      include: {
        staff: { select: userProfileSelect },
        resolvedBy: { select: userProfileSelect }
      },
      orderBy: [{ lastMessageAt: "desc" }]
    }),
    prisma.staffSupportThread.findMany({
      where: baseWhere,
      select: {
        status: true,
        category: true,
        adminUnreadCount: true,
        staffUnreadCount: true
      }
    })
  ]);

  const summary = {
    total: allScopedThreads.length,
    open: 0,
    inProgress: 0,
    resolved: 0,
    systemProblems: 0,
    featureRequests: 0,
    unreadThreads: 0,
    unreadMessages: 0
  };

  allScopedThreads.forEach((item) => {
    if (item.status === "open") summary.open += 1;
    else if (item.status === "in_progress") summary.inProgress += 1;
    else if (item.status === "resolved") summary.resolved += 1;

    if (item.category === "system_problem" && item.status !== "resolved") summary.systemProblems += 1;
    if (item.category === "feature_request" && item.status !== "resolved") summary.featureRequests += 1;

    const unreadCount = adminAccess ? (item.adminUnreadCount || 0) : (item.staffUnreadCount || 0);
    if (unreadCount > 0) {
      summary.unreadThreads += 1;
      summary.unreadMessages += unreadCount;
    }
  });

  const searchLower = String(search || "").trim().toLowerCase();
  const formatted = threads
    .map(formatThreadSummary)
    .filter((item) => {
      if (!searchLower) return true;
      return (
        item.subject.toLowerCase().includes(searchLower) ||
        item.staffName.toLowerCase().includes(searchLower) ||
        item.staffEmail.toLowerCase().includes(searchLower) ||
        item.lastMessagePreview.toLowerCase().includes(searchLower)
      );
    });

  return {
    threads: formatted,
    summary
  };
};

// Load a single thread with full message history after verifying ownership or Admin privilege
const getStaffSupportThreadById = async ({ threadId, requesterId, requesterRole }) => {
  const parsedId = parseInt(threadId, 10);
  if (Number.isNaN(parsedId)) {
    throw createServiceError(400, "Invalid conversation ID.");
  }

  const thread = await prisma.staffSupportThread.findUnique({
    where: { id: parsedId },
    include: {
      staff: { select: userProfileSelect },
      resolvedBy: { select: userProfileSelect },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: userProfileSelect } }
      }
    }
  });

  if (!thread) {
    throw createServiceError(404, "Conversation could not be found.");
  }

  const adminAccess = isAdminRole(requesterRole);
  if (!adminAccess && thread.staffId !== parseInt(requesterId, 10)) {
    throw createServiceError(403, "You can only view your own Admin support conversations.");
  }

  return formatThreadSummary(thread);
};

// Append a new reply message to an existing thread and update unread counts atomically
const addStaffSupportMessage = async ({ threadId, senderId, senderRole, content, image }) => {
  const parsedThreadId = parseInt(threadId, 10);
  if (Number.isNaN(parsedThreadId)) {
    throw createServiceError(400, "Invalid conversation ID.");
  }

  const cleanContent = String(content || "").trim().slice(0, 2000);
  if (!cleanContent && !image) {
    throw createServiceError(400, "Please type a message or attach a screenshot before sending.");
  }

  const roleLower = String(senderRole || "").toLowerCase();
  const senderIsAdmin = isAdminRole(roleLower);
  if (!senderIsAdmin && !isStaffSenderRole(roleLower)) {
    throw createServiceError(403, "You do not have permission to reply to this conversation.");
  }

  const existingThread = await prisma.staffSupportThread.findUnique({
    where: { id: parsedThreadId }
  });

  if (!existingThread) {
    throw createServiceError(404, "Conversation could not be found.");
  }

  if (!senderIsAdmin && existingThread.staffId !== parseInt(senderId, 10)) {
    throw createServiceError(403, "You can only reply to your own conversations.");
  }

  const senderUser = await prisma.user.findUnique({
    where: { id: parseInt(senderId, 10) },
    select: userProfileSelect
  });

  if (!senderUser) {
    throw createServiceError(404, "Sender account could not be found.");
  }

  let uploadedImageUrl = null;
  if (image) {
    uploadedImageUrl = await storageService.uploadBase64Image(image, "staff-support");
  }

  const senderName = resolveUserDisplayName(senderUser);
  const now = new Date();
  const preview = buildMessagePreview(cleanContent, uploadedImageUrl);

  // Move Open threads to In Progress on first Admin reply; reopen Resolved threads if staff follows up
  let nextStatus = existingThread.status;
  let nextResolvedAt = existingThread.resolvedAt;
  let nextResolvedById = existingThread.resolvedById;
  if (senderIsAdmin && existingThread.status === "open") {
    nextStatus = "in_progress";
  } else if (!senderIsAdmin && existingThread.status === "resolved") {
    nextStatus = "open";
    nextResolvedAt = null;
    nextResolvedById = null;
  }

  const { createdMessage, updatedThread } = await prisma.$transaction(async (tx) => {
    const msg = await tx.staffSupportMessage.create({
      data: {
        threadId: parsedThreadId,
        senderId: senderUser.id,
        senderRole: roleLower,
        senderName,
        content: cleanContent,
        imageUrl: uploadedImageUrl
      },
      include: { sender: { select: userProfileSelect } }
    });

    const thr = await tx.staffSupportThread.update({
      where: { id: parsedThreadId },
      data: {
        status: nextStatus,
        resolvedAt: nextResolvedAt,
        resolvedById: nextResolvedById,
        lastMessageAt: now,
        lastMessagePreview: preview,
        ...(senderIsAdmin
          ? { staffUnreadCount: { increment: 1 }, adminUnreadCount: 0 }
          : { adminUnreadCount: { increment: 1 }, staffUnreadCount: 0 })
      },
      include: {
        staff: { select: userProfileSelect },
        resolvedBy: { select: userProfileSelect }
      }
    });

    return { createdMessage: msg, updatedThread: thr };
  });

  return {
    message: {
      id: createdMessage.id,
      threadId: createdMessage.threadId,
      senderId: createdMessage.senderId,
      senderRole: createdMessage.senderRole,
      senderName: createdMessage.senderName || senderName,
      content: createdMessage.content,
      imageUrl: createdMessage.imageUrl || null,
      createdAt: createdMessage.createdAt
    },
    thread: formatThreadSummary(updatedThread),
    senderIsAdmin
  };
};

// Clear unread counter for the side currently viewing the thread
const markStaffSupportThreadRead = async ({ threadId, readerId, readerRole }) => {
  const parsedThreadId = parseInt(threadId, 10);
  if (Number.isNaN(parsedThreadId)) {
    throw createServiceError(400, "Invalid conversation ID.");
  }

  const existing = await prisma.staffSupportThread.findUnique({
    where: { id: parsedThreadId }
  });
  if (!existing) {
    throw createServiceError(404, "Conversation could not be found.");
  }

  const readerIsAdmin = isAdminRole(readerRole);
  if (!readerIsAdmin && existing.staffId !== parseInt(readerId, 10)) {
    throw createServiceError(403, "You can only mark your own conversations as read.");
  }

  const updated = await prisma.staffSupportThread.update({
    where: { id: parsedThreadId },
    data: readerIsAdmin ? { adminUnreadCount: 0 } : { staffUnreadCount: 0 }
  });

  return formatThreadSummary(updated);
};

// Update thread status (Open, In Progress, Resolved) from the Admin portal
const updateStaffSupportThreadStatus = async ({ threadId, adminUserId, status }) => {
  const parsedThreadId = parseInt(threadId, 10);
  if (Number.isNaN(parsedThreadId)) {
    throw createServiceError(400, "Invalid conversation ID.");
  }

  if (!VALID_STATUSES.includes(status)) {
    throw createServiceError(400, "Status must be open, in_progress, or resolved.");
  }

  const existing = await prisma.staffSupportThread.findUnique({
    where: { id: parsedThreadId }
  });
  if (!existing) {
    throw createServiceError(404, "Conversation could not be found.");
  }

  const isResolving = status === "resolved";
  const updated = await prisma.staffSupportThread.update({
    where: { id: parsedThreadId },
    data: {
      status,
      resolvedById: isResolving ? parseInt(adminUserId, 10) : null,
      resolvedAt: isResolving ? new Date() : null
    },
    include: {
      staff: { select: userProfileSelect },
      resolvedBy: { select: userProfileSelect }
    }
  });

  return formatThreadSummary(updated);
};

// Return lightweight unread count metrics for sidebar navigation badges
const getStaffSupportUnreadSummary = async ({ userId, role }) => {
  const roleLower = String(role || "").toLowerCase();
  const adminAccess = isAdminRole(roleLower);

  if (!adminAccess && !isStaffSenderRole(roleLower)) {
    return { unreadThreads: 0, unreadMessages: 0, openThreads: 0 };
  }

  const where = adminAccess ? {} : { staffId: parseInt(userId, 10) };
  const rows = await prisma.staffSupportThread.findMany({
    where,
    select: {
      status: true,
      adminUnreadCount: true,
      staffUnreadCount: true
    }
  });

  let unreadThreads = 0;
  let unreadMessages = 0;
  let openThreads = 0;

  rows.forEach((row) => {
    if (row.status === "open" || row.status === "in_progress") {
      openThreads += 1;
    }
    const count = adminAccess ? (row.adminUnreadCount || 0) : (row.staffUnreadCount || 0);
    if (count > 0) {
      unreadThreads += 1;
      unreadMessages += count;
    }
  });

  return { unreadThreads, unreadMessages, openThreads };
};

module.exports = {
  createStaffSupportThread,
  listStaffSupportThreads,
  getStaffSupportThreadById,
  addStaffSupportMessage,
  markStaffSupportThreadRead,
  updateStaffSupportThreadStatus,
  getStaffSupportUnreadSummary
};
