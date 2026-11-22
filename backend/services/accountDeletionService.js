const bcrypt = require("bcryptjs");
const prisma = require("../config/db");

const TERMINAL_ORDER_STATUSES = ["completed", "delivered", "cancelled", "rejected"];

// Convert internal order statuses into plain, easy-to-understand labels
const ORDER_STATUS_LABELS = {
  pending: "Waiting for Sales Approval",
  sales_approved: "Waiting for Payment Verification",
  finance_verified: "Approved for Delivery Preparation",
  processing: "Being Prepared",
  shipped: "Loaded for Delivery",
  out_for_delivery: "Out for Delivery",
  ready_for_pickup: "Ready for Store Pick-up"
};

// Format numeric order and refund IDs consistently across Customer and Admin views
const formatOrderNumber = (orderId) => `#ORD-${String(orderId || "").padStart(4, "0")}`;
const formatRefundNumber = (refundId) => `#REF-${String(refundId || "").padStart(4, "0")}`;

// Strip the internal archival prefix from soft-deleted emails for clean display
const stripDeletedEmailPrefix = (email) => {
  if (!email) return "";
  return String(email).replace(/^deleted_\d+_\d+_/, "");
};

// Build a structured error object with an HTTP status code and optional details
const createServiceError = (statusCode, message, details = null) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (details) err.details = details;
  return err;
};

// Resolve the customer display name from profile or email fallback
const resolveCustomerDisplayName = (user, fallbackEmail = "") => {
  return (
    user?.customerProfile?.name ||
    user?.adminProfile?.name ||
    user?.superAdminProfile?.name ||
    (fallbackEmail ? fallbackEmail.split("@")[0] : "Customer")
  );
};

// Check whether a customer has any ongoing orders or incomplete refunds blocking account deletion
const checkCustomerDeletionEligibility = async (userId, dbClient = prisma) => {
  const parsedUserId = parseInt(userId, 10);

  const [activeOrders, incompleteRefunds, refundPendingOrders] = await Promise.all([
    dbClient.order.findMany({
      where: {
        userId: parsedUserId,
        status: { notIn: TERMINAL_ORDER_STATUSES }
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        fulfillmentType: true,
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    }),
    dbClient.refund.findMany({
      where: {
        userId: parsedUserId,
        status: { not: "completed" },
        amount: { gt: 0 }
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            total: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    dbClient.order.findMany({
      where: {
        userId: parsedUserId,
        paymentStatus: { equals: "refund_pending", mode: "insensitive" }
      },
      select: {
        id: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        refund: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const ongoingOrders = activeOrders.map((order) => {
    const normalizedStatus = String(order.status || "").trim().toLowerCase();
    return {
      orderId: order.id,
      orderNumber: formatOrderNumber(order.id),
      status: normalizedStatus,
      statusLabel: ORDER_STATUS_LABELS[normalizedStatus] || "In Progress",
      paymentStatus: order.paymentStatus,
      fulfillmentType: order.fulfillmentType,
      total: Number(order.total || 0),
      createdAt: order.createdAt
    };
  });

  // Merge incomplete Refund records and any orders marked refund_pending without duplicating the same order
  const refundByOrderId = new Map();

  incompleteRefunds.forEach((refund) => {
    const normalizedStatus = String(refund.status || "pending").trim().toLowerCase();
    refundByOrderId.set(refund.orderId, {
      refundId: refund.id,
      refundNumber: formatRefundNumber(refund.id),
      orderId: refund.orderId,
      orderNumber: formatOrderNumber(refund.orderId),
      amount: Number(refund.amount || 0),
      paymentMethod: refund.paymentMethod,
      status: normalizedStatus,
      statusLabel: normalizedStatus === "failed" ? "Refund Processing Retry Needed" : "Refund Not Yet Returned",
      createdAt: refund.createdAt
    });
  });

  refundPendingOrders.forEach((order) => {
    if (!refundByOrderId.has(order.id)) {
      refundByOrderId.set(order.id, {
        refundId: order.refund?.id || null,
        refundNumber: order.refund?.id ? formatRefundNumber(order.refund.id) : null,
        orderId: order.id,
        orderNumber: formatOrderNumber(order.id),
        amount: Number(order.refund?.amount ?? order.total ?? 0),
        paymentMethod: order.refund?.paymentMethod || "Original Payment Method",
        status: order.refund?.status || "pending",
        statusLabel: "Refund Not Yet Returned",
        createdAt: order.refund?.createdAt || order.createdAt
      });
    }
  });

  const pendingRefunds = Array.from(refundByOrderId.values());
  const eligible = ongoingOrders.length === 0 && pendingRefunds.length === 0;

  let blockerMessage = null;
  if (!eligible) {
    const reasons = [];
    if (ongoingOrders.length > 0) {
      reasons.push(
        `${ongoingOrders.length} ongoing ${ongoingOrders.length === 1 ? "order" : "orders"}`
      );
    }
    if (pendingRefunds.length > 0) {
      reasons.push(
        `${pendingRefunds.length} ongoing ${pendingRefunds.length === 1 ? "refund" : "refunds"} not yet completely returned`
      );
    }
    blockerMessage = `Account deletion cannot proceed while there ${
      ongoingOrders.length + pendingRefunds.length === 1 ? "is" : "are"
    } ${reasons.join(" and ")}.`;
  }

  return {
    eligible,
    ongoingOrdersCount: ongoingOrders.length,
    pendingRefundsCount: pendingRefunds.length,
    ongoingOrders,
    pendingRefunds,
    blockerMessage
  };
};

// Format an AccountDeletionRequest record cleanly for both Customer and Admin responses
const formatDeletionRequest = (record, eligibility = null) => {
  if (!record) return null;

  const reviewerName =
    record.reviewedBy?.adminProfile?.name ||
    record.reviewedBy?.superAdminProfile?.name ||
    record.reviewedBy?.email ||
    null;

  return {
    id: record.id,
    userId: record.userId,
    customerName: record.customerName || resolveCustomerDisplayName(record.user, record.customerEmail),
    customerEmail: record.customerEmail || stripDeletedEmailPrefix(record.user?.email),
    customerContactNumber: record.user?.customerProfile?.contactNumber || null,
    customerLocation: [record.user?.customerProfile?.city, record.user?.customerProfile?.province]
      .filter(Boolean)
      .join(", ") || null,
    accountStatus: record.user?.status || null,
    reason: record.reason || "",
    status: record.status,
    adminNotes: record.adminNotes || "",
    reviewedByName: reviewerName,
    reviewedAt: record.reviewedAt,
    cancelledAt: record.cancelledAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    ...(eligibility ? { eligibility } : {})
  };
};

// Return live eligibility and the customer's active or latest deletion request
const getCustomerDeletionStatus = async (userId) => {
  const parsedUserId = parseInt(userId, 10);

  const [eligibility, activeRequest, latestRequest] = await Promise.all([
    checkCustomerDeletionEligibility(parsedUserId),
    prisma.accountDeletionRequest.findFirst({
      where: { userId: parsedUserId, status: "pending" },
      include: {
        user: { include: { customerProfile: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.accountDeletionRequest.findFirst({
      where: { userId: parsedUserId },
      include: {
        user: { include: { customerProfile: true } },
        reviewedBy: {
          select: {
            email: true,
            adminProfile: { select: { name: true } },
            superAdminProfile: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return {
    eligibility,
    activeRequest: formatDeletionRequest(activeRequest),
    latestRequest: formatDeletionRequest(latestRequest)
  };
};

// Validate password and eligibility before creating a new customer account deletion request
const createCustomerDeletionRequest = async ({ userId, password, reason }) => {
  const parsedUserId = parseInt(userId, 10);

  if (!password || !String(password).trim()) {
    throw createServiceError(400, "Please enter your current password to confirm your account deletion request.");
  }

  const user = await prisma.user.findUnique({
    where: { id: parsedUserId },
    include: { customerProfile: true }
  });

  if (!user || user.status === "deleted") {
    throw createServiceError(404, "Customer account could not be found.");
  }

  if (user.role !== "customer") {
    throw createServiceError(403, "Only customer accounts can submit an account deletion request.");
  }

  const passwordMatches = await bcrypt.compare(String(password), user.password);
  if (!passwordMatches) {
    throw createServiceError(401, "The password you entered is incorrect. Please check your password and try again.");
  }

  const existingPending = await prisma.accountDeletionRequest.findFirst({
    where: { userId: parsedUserId, status: "pending" }
  });

  if (existingPending) {
    throw createServiceError(
      409,
      "You already have an active account deletion request waiting for Admin review."
    );
  }

  const eligibility = await checkCustomerDeletionEligibility(parsedUserId);
  if (!eligibility.eligible) {
    throw createServiceError(
      409,
      eligibility.blockerMessage || "Your account cannot be deleted while you have ongoing orders or pending refunds.",
      eligibility
    );
  }

  const cleanReason = reason ? String(reason).trim().slice(0, 500) : null;
  const customerName = resolveCustomerDisplayName(user, user.email);

  const created = await prisma.accountDeletionRequest.create({
    data: {
      userId: parsedUserId,
      customerName,
      customerEmail: user.email,
      reason: cleanReason || null,
      status: "pending"
    },
    include: {
      user: { include: { customerProfile: true } }
    }
  });

  return {
    request: formatDeletionRequest(created, eligibility),
    eligibility
  };
};

// Allow a customer to cancel their own pending account deletion request
const cancelCustomerDeletionRequest = async ({ userId }) => {
  const parsedUserId = parseInt(userId, 10);

  const pendingRequest = await prisma.accountDeletionRequest.findFirst({
    where: { userId: parsedUserId, status: "pending" },
    orderBy: { createdAt: "desc" }
  });

  if (!pendingRequest) {
    throw createServiceError(404, "No pending account deletion request was found to cancel.");
  }

  const updated = await prisma.accountDeletionRequest.update({
    where: { id: pendingRequest.id },
    data: {
      status: "cancelled",
      cancelledAt: new Date()
    },
    include: {
      user: { include: { customerProfile: true } }
    }
  });

  return formatDeletionRequest(updated);
};

// Return filtered account deletion requests with live eligibility and KPI summary counts for Admin
const listAdminDeletionRequests = async ({ status = "all", search = "" } = {}) => {
  const normalizedStatus = String(status || "all").trim().toLowerCase();
  const where = {};
  if (normalizedStatus && normalizedStatus !== "all") {
    where.status = normalizedStatus;
  }

  const [requests, groupedCounts] = await Promise.all([
    prisma.accountDeletionRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            deletedAt: true,
            customerProfile: {
              select: { name: true, contactNumber: true, city: true, province: true }
            }
          }
        },
        reviewedBy: {
          select: {
            email: true,
            adminProfile: { select: { name: true } },
            superAdminProfile: { select: { name: true } }
          }
        }
      },
      orderBy: [{ createdAt: "desc" }]
    }),
    prisma.accountDeletionRequest.groupBy({
      by: ["status"],
      _count: { status: true }
    })
  ]);

  const summary = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    total: 0
  };

  groupedCounts.forEach((row) => {
    const key = String(row.status || "").toLowerCase();
    const count = row._count?.status || 0;
    if (Object.prototype.hasOwnProperty.call(summary, key)) {
      summary[key] = count;
    }
    summary.total += count;
  });

  const searchLower = String(search || "").trim().toLowerCase();
  const filteredRecords = requests.filter((reqItem) => {
    if (!searchLower) return true;
    const name = String(reqItem.customerName || reqItem.user?.customerProfile?.name || "").toLowerCase();
    const email = String(reqItem.customerEmail || stripDeletedEmailPrefix(reqItem.user?.email) || "").toLowerCase();
    const reason = String(reqItem.reason || "").toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower) || reason.includes(searchLower);
  });

  // Compute live eligibility for every pending request so Admin can see blockers immediately
  const formattedRequests = await Promise.all(
    filteredRecords.map(async (item) => {
      const eligibility = item.status === "pending"
        ? await checkCustomerDeletionEligibility(item.userId)
        : null;
      return formatDeletionRequest(item, eligibility);
    })
  );

  return {
    requests: formattedRequests,
    summary
  };
};

// Return full details and live eligibility breakdown for a single account deletion request
const getAdminDeletionRequestById = async (requestId) => {
  const parsedId = parseInt(requestId, 10);
  if (Number.isNaN(parsedId)) {
    throw createServiceError(400, "Invalid account deletion request ID.");
  }

  const record = await prisma.accountDeletionRequest.findUnique({
    where: { id: parsedId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          deletedAt: true,
          createdAt: true,
          customerProfile: {
            select: { name: true, contactNumber: true, city: true, province: true }
          }
        }
      },
      reviewedBy: {
        select: {
          email: true,
          adminProfile: { select: { name: true } },
          superAdminProfile: { select: { name: true } }
        }
      }
    }
  });

  if (!record) {
    throw createServiceError(404, "Account deletion request could not be found.");
  }

  const eligibility = await checkCustomerDeletionEligibility(record.userId);
  return formatDeletionRequest(record, eligibility);
};

// Approve a pending request atomically after re-checking that no ongoing orders or unreturned refunds exist
const approveCustomerDeletionRequest = async ({ requestId, adminUserId, adminNotes = "" }) => {
  const parsedId = parseInt(requestId, 10);
  if (Number.isNaN(parsedId)) {
    throw createServiceError(400, "Invalid account deletion request ID.");
  }

  const cleanNotes = adminNotes ? String(adminNotes).trim().slice(0, 500) : null;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.accountDeletionRequest.findUnique({
      where: { id: parsedId },
      include: {
        user: {
          include: { customerProfile: true }
        }
      }
    });

    if (!existing) {
      throw createServiceError(404, "Account deletion request could not be found.");
    }

    if (existing.status !== "pending") {
      throw createServiceError(
        400,
        `This deletion request has already been ${existing.status} and cannot be approved again.`
      );
    }

    if (!existing.user || existing.user.status === "deleted") {
      throw createServiceError(400, "This customer account has already been deleted.");
    }

    // Re-check orders and refunds inside the transaction to prevent race conditions
    const eligibility = await checkCustomerDeletionEligibility(existing.userId, tx);
    if (!eligibility.eligible) {
      throw createServiceError(
        409,
        eligibility.blockerMessage || "Cannot approve account deletion while ongoing orders or pending refunds exist.",
        eligibility
      );
    }

    const now = new Date();
    const originalEmail = existing.customerEmail || existing.user.email;
    const customerName = existing.customerName || resolveCustomerDisplayName(existing.user, originalEmail);
    const archivedEmail = `deleted_${existing.user.id}_${now.getTime()}_${existing.user.email}`;

    // Soft-delete the customer account and archive its email so the Gmail can register fresh later
    await tx.user.update({
      where: { id: existing.userId },
      data: {
        status: "deleted",
        deletedAt: now,
        email: archivedEmail,
        isEmailVerified: false,
        otpCode: null,
        otpExpiresAt: null,
        resetOtpCode: null,
        resetOtpExpiresAt: null
      }
    });

    // End any active session records tied to this user
    await tx.userSession.updateMany({
      where: { userId: existing.userId, isActive: true },
      data: { isActive: false, loggedOutAt: now }
    });

    const updatedRequest = await tx.accountDeletionRequest.update({
      where: { id: parsedId },
      data: {
        status: "approved",
        reviewedById: adminUserId ? parseInt(adminUserId, 10) : null,
        reviewedAt: now,
        adminNotes: cleanNotes
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            deletedAt: true,
            customerProfile: { select: { name: true, contactNumber: true, city: true, province: true } }
          }
        },
        reviewedBy: {
          select: {
            email: true,
            adminProfile: { select: { name: true } },
            superAdminProfile: { select: { name: true } }
          }
        }
      }
    });

    return {
      request: formatDeletionRequest(updatedRequest, eligibility),
      originalEmail,
      customerName,
      reviewedAt: now
    };
  });
};

// Reject a pending customer account deletion request with an Admin explanation
const rejectCustomerDeletionRequest = async ({ requestId, adminUserId, adminNotes }) => {
  const parsedId = parseInt(requestId, 10);
  if (Number.isNaN(parsedId)) {
    throw createServiceError(400, "Invalid account deletion request ID.");
  }

  const cleanNotes = String(adminNotes || "").trim().slice(0, 500);
  if (!cleanNotes) {
    throw createServiceError(400, "Please provide a clear reason before rejecting this account deletion request.");
  }

  const existing = await prisma.accountDeletionRequest.findUnique({
    where: { id: parsedId },
    include: {
      user: { include: { customerProfile: true } }
    }
  });

  if (!existing) {
    throw createServiceError(404, "Account deletion request could not be found.");
  }

  if (existing.status !== "pending") {
    throw createServiceError(
      400,
      `This deletion request has already been ${existing.status} and cannot be rejected.`
    );
  }

  const now = new Date();
  const updatedRequest = await prisma.accountDeletionRequest.update({
    where: { id: parsedId },
    data: {
      status: "rejected",
      reviewedById: adminUserId ? parseInt(adminUserId, 10) : null,
      reviewedAt: now,
      adminNotes: cleanNotes
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          deletedAt: true,
          customerProfile: { select: { name: true, contactNumber: true, city: true, province: true } }
        }
      },
      reviewedBy: {
        select: {
          email: true,
          adminProfile: { select: { name: true } },
          superAdminProfile: { select: { name: true } }
        }
      }
    }
  });

  const originalEmail = existing.customerEmail || stripDeletedEmailPrefix(existing.user?.email);
  const customerName = existing.customerName || resolveCustomerDisplayName(existing.user, originalEmail);

  return {
    request: formatDeletionRequest(updatedRequest),
    originalEmail,
    customerName,
    reviewedAt: now
  };
};

module.exports = {
  TERMINAL_ORDER_STATUSES,
  checkCustomerDeletionEligibility,
  getCustomerDeletionStatus,
  createCustomerDeletionRequest,
  cancelCustomerDeletionRequest,
  listAdminDeletionRequests,
  getAdminDeletionRequestById,
  approveCustomerDeletionRequest,
  rejectCustomerDeletionRequest
};
