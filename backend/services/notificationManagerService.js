// Centralized Notification Manager for sending customer browser/socket alerts and Gmail emails

const {
  sendOrderReceiptEmail,
  sendReadyForPickupEmail,
  sendOutForDeliveryEmail,
  sendOrderDeliveredEmail,
  sendOrderRejectedEmail,
  sendRefundNotificationEmail,
  sendAccountDeletionRequestedEmail,
  sendAccountDeletionApprovedEmail,
  sendAccountDeletionRejectedEmail
} = require("../utils/emailService");
const { consumeEmailSpamQuota } = require("./emailSpamPolicyService");

// Format a numeric order ID into standard display format
const formatOrderNumber = (orderId) => `#ORD-${String(orderId || "").padStart(4, "0")}`;

// Emit a real-time browser notification payload to the customer's Socket.IO room
const emitCustomerSocketNotification = (io, userId, payload) => {
  if (!io || !userId) return;
  io.to(`user_${userId}`).emit("customer_notification", {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString()
  });
};

// Emit a real-time notification payload to one or more staff portal Socket.IO rooms
const emitPortalSocketNotification = (io, rooms, eventName, payload) => {
  if (!io || !eventName) return;
  const targetRooms = Array.isArray(rooms) ? rooms : [rooms];
  const enrichedPayload = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString()
  };

  let emitter = io;
  targetRooms.filter(Boolean).forEach((room) => {
    emitter = emitter.to(room);
  });
  emitter.emit(eventName, enrichedPayload);
};

// Resolve a customer display name safely from an order record
const resolveOrderCustomerName = (order) =>
  order?.customerName ||
  order?.shippingName ||
  order?.user?.customerProfile?.name ||
  order?.user?.name ||
  "Customer";

// Notify Sales when a customer places a new order requiring review and approval
const notifySalesNewOrder = ({ io, order }) => {
  if (!io || !order) return;
  const orderNumber = formatOrderNumber(order.id);
  const customerName = resolveOrderCustomerName(order);
  const formattedTotal = Number(order.total || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  emitPortalSocketNotification(io, ["sales", "saless"], "sales_notification", {
    type: "new_order_pending",
    severity: "warning",
    title: `New Order Needs Approval: ${orderNumber}`,
    body: `${customerName} placed an order (₱${formattedTotal}). Please review and approve to forward to Finance.`,
    actionLabel: "Review Orders",
    orderId: order.id,
    orderNumber,
    url: "/sales/orders",
    tag: `sales-new-order-${order.id}`
  });
};

// Notify customer and Sales when a new order is placed
const notifyOrderPlaced = async ({ io, order, customerEmail }) => {
  if (!order) return;
  const orderNumber = formatOrderNumber(order.id);
  const targetEmail = customerEmail || order.customerEmail || order.user?.email;

  notifySalesNewOrder({ io, order });

  const spamCheck = targetEmail
    ? consumeEmailSpamQuota(targetEmail, "order_receipt")
    : { allowed: false, isSpamUser: false };

  emitCustomerSocketNotification(io, order.userId, {
    type: "order_placed",
    title: `Order Placed: ${orderNumber}`,
    body: spamCheck.allowed
      ? "Thank you for your order! Your official receipt has been sent to your email."
      : "Thank you for your order! Your order has been recorded.",
    orderId: order.id,
    orderNumber,
    url: `/order/${order.id}`,
    tag: `order-placed-${order.id}`
  });

  if (targetEmail) {
    if (!spamCheck.allowed) {
      console.warn(`[EMAIL SPAM POLICY] Skipped order receipt email for ${targetEmail}: ${spamCheck.message}`);
      return;
    }
    sendOrderReceiptEmail(targetEmail, order).catch((err) => {
      console.error("[NOTIFICATION MANAGER] Order receipt email failed:", err.message);
    });
  }
};

// Notify customer when an order is marked Out for Delivery (Browser alert + Gmail email)
const notifyOrderOutForDelivery = async ({ io, order }) => {
  if (!order) return;
  const orderNumber = formatOrderNumber(order.id);
  const targetEmail = order.customerEmail || order.user?.email;

  emitCustomerSocketNotification(io, order.userId, {
    type: "out_for_delivery",
    title: `Out for Delivery: ${orderNumber}`,
    body: "Your roofing order is loaded on the delivery truck and on its way to you!",
    orderId: order.id,
    orderNumber,
    url: `/order/${order.id}`,
    tag: `order-out-${order.id}`
  });

  if (targetEmail) {
    sendOutForDeliveryEmail(targetEmail, order).catch((err) => {
      console.error("[NOTIFICATION MANAGER] Out for delivery email failed:", err.message);
    });
  }
};

// Notify customer when a Pick-up order is Ready for Pick-up (Browser alert + Gmail email)
const notifyOrderReadyForPickup = async ({ io, order }) => {
  if (!order) return;
  const orderNumber = formatOrderNumber(order.id);
  const targetEmail = order.customerEmail || order.user?.email;

  emitCustomerSocketNotification(io, order.userId, {
    type: "ready_for_pickup",
    title: `Ready for Pick-up: ${orderNumber}`,
    body: "Your roofing materials are ready at Mega Pacific Plant & Store (Imus, Cavite).",
    orderId: order.id,
    orderNumber,
    url: `/order/${order.id}`,
    tag: `order-pickup-${order.id}`
  });

  if (targetEmail) {
    sendReadyForPickupEmail(targetEmail, order).catch((err) => {
      console.error("[NOTIFICATION MANAGER] Ready for pickup email failed:", err.message);
    });
  }
};

// Notify customer when an order is delivered or picked up and full payment is confirmed
const notifyOrderDeliveredOrCompleted = async ({ io, order }) => {
  if (!order) return;
  const orderNumber = formatOrderNumber(order.id);
  const isPickup = String(order.fulfillmentType || "").toLowerCase() === "pickup";
  const targetEmail = order.customerEmail || order.user?.email;

  emitCustomerSocketNotification(io, order.userId, {
    type: "order_delivered",
    title: isPickup ? `Picked Up & Completed: ${orderNumber}` : `Delivered & Completed: ${orderNumber}`,
    body: isPickup
      ? "Your order has been picked up and full payment is confirmed. Thank you!"
      : "Your order has been delivered and full payment is confirmed. Thank you!",
    orderId: order.id,
    orderNumber,
    url: `/order/${order.id}`,
    tag: `order-delivered-${order.id}`
  });

  if (targetEmail) {
    sendOrderDeliveredEmail(targetEmail, order).catch((err) => {
      console.error("[NOTIFICATION MANAGER] Order delivered email failed:", err.message);
    });
  }
};

// Notify customer when an order is rejected by Sales
const notifyOrderRejected = async ({ io, order, reason, refundableAmount }) => {
  if (!order) return;
  const orderNumber = formatOrderNumber(order.id);
  const targetEmail = order.customerEmail || order.user?.email;
  const refundNotice = Number(refundableAmount || 0) > 0
    ? " Your paid amount has been forwarded to Finance for refund."
    : "";

  emitCustomerSocketNotification(io, order.userId, {
    type: "order_rejected",
    title: `Order Rejected: ${orderNumber}`,
    body: `${reason ? `Reason: ${reason}.` : "Your order could not be processed."}${refundNotice}`,
    orderId: order.id,
    orderNumber,
    url: `/order/${order.id}`,
    tag: `order-rejected-${order.id}`
  });

  if (targetEmail) {
    sendOrderRejectedEmail(targetEmail, order, { reason, refundableAmount }).catch((err) => {
      console.error("[NOTIFICATION MANAGER] Order rejected email failed:", err.message);
    });
  }
};

// Notify customer when a refund is completed by Finance
const notifyPaymentRefunded = async ({ io, order, refund, transactionReference, notes, processedAt, customerName, customerEmail }) => {
  if (!order && !refund) return;
  const orderId = order?.id || refund?.orderId;
  const userId = order?.userId || refund?.userId;
  const orderNumber = formatOrderNumber(orderId);
  const targetEmail = customerEmail || order?.customerEmail || order?.user?.email;
  const formattedAmount = Number(refund?.amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  emitCustomerSocketNotification(io, userId, {
    type: "order_refunded",
    title: `Payment Refunded: ${orderNumber}`,
    body: `Your refund of ₱${formattedAmount} has been completed via ${refund?.paymentMethod || "your original payment method"}.`,
    orderId,
    orderNumber,
    url: `/order/${orderId}`,
    tag: `order-refunded-${orderId}`
  });

  if (targetEmail) {
    await sendRefundNotificationEmail(targetEmail, {
      order,
      refund,
      transactionReference,
      notes,
      processedAt,
      customerName
    });
  }
};

// Notify Finance when Sales approves an order that needs payment verification
const notifyFinancePaymentVerificationNeeded = ({ io, order }) => {
  if (!io || !order) return;
  const orderNumber = formatOrderNumber(order.id);
  const customerName = resolveOrderCustomerName(order);
  const formattedTotal = Number(order.total || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  emitPortalSocketNotification(io, "finance", "finance_notification", {
    type: "payment_verification_required",
    severity: "warning",
    title: `Payment Verification Required: ${orderNumber}`,
    body: `Sales approved order for ${customerName} (₱${formattedTotal}). Verify payment to forward it to Logistics.`,
    actionLabel: "Verify Payments",
    orderId: order.id,
    orderNumber,
    url: "/finance/payments",
    tag: `finance-verify-${order.id}`
  });
};

// Notify Finance, Logistics, and Sales when Finance verifies an order payment
const notifyPaymentVerifiedWorkflow = ({ io, order }) => {
  if (!io || !order) return;
  const orderNumber = formatOrderNumber(order.id);
  const customerName = resolveOrderCustomerName(order);
  const isPickup = String(order.fulfillmentType || "").toLowerCase() === "pickup";

  emitPortalSocketNotification(io, "finance", "finance_notification", {
    type: "payment_verified",
    severity: "success",
    title: `Payment Verified: ${orderNumber}`,
    body: `Payment for ${customerName} is verified and the order was forwarded to Logistics.`,
    actionLabel: "View Payments",
    orderId: order.id,
    orderNumber,
    url: "/finance/payments",
    tag: `finance-verified-${order.id}`
  });

  emitPortalSocketNotification(io, "logistic", "logistic_notification", {
    type: "order_approved_from_finance",
    severity: "info",
    title: isPickup
      ? `New Pick-up Order Ready: ${orderNumber}`
      : `New Delivery Order Approved: ${orderNumber}`,
    body: isPickup
      ? `Finance verified payment for ${customerName}. Prepare the materials for store pick-up.`
      : `Finance verified payment for ${customerName}. Prepare and schedule truck delivery.`,
    actionLabel: "View Deliveries",
    orderId: order.id,
    orderNumber,
    url: "/logistic/deliveries",
    tag: `logistic-order-verified-${order.id}`
  });

  emitPortalSocketNotification(io, ["sales", "saless"], "sales_notification", {
    type: "finance_verified_order",
    severity: "info",
    title: `Payment Verified by Finance: ${orderNumber}`,
    body: `Finance verified payment for ${customerName} and forwarded the order to Logistics.`,
    actionLabel: "View Orders",
    orderId: order.id,
    orderNumber,
    url: "/sales/orders",
    tag: `sales-finance-verified-${order.id}`
  });
};

// Notify Finance when Sales rejects a paid order that requires refund processing
const notifyFinanceRefundRequired = ({ io, order, refund }) => {
  if (!io || !order || !refund) return;
  const orderNumber = formatOrderNumber(order.id);
  const customerName = resolveOrderCustomerName(order);
  const formattedAmount = Number(refund.amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  emitPortalSocketNotification(io, "finance", "finance_notification", {
    type: "refund_required",
    severity: "warning",
    title: `Refund Action Required: ${orderNumber}`,
    body: `Order for ${customerName} (₱${formattedAmount}) was rejected by Sales and needs refund processing.`,
    actionLabel: "Process Refunds",
    orderId: order.id,
    orderNumber,
    url: "/finance/refunds",
    tag: `finance-refund-${order.id}`
  });
};

// Notify Finance when Logistics collects the remaining 50% cash balance and uploads proof
const notifyFinanceBalanceCollected = ({ io, order }) => {
  if (!io || !order) return;
  const orderNumber = formatOrderNumber(order.id);
  const customerName = resolveOrderCustomerName(order);

  emitPortalSocketNotification(io, "finance", "finance_notification", {
    type: "balance_collected",
    severity: "success",
    title: `Final 50% Payment Collected: ${orderNumber}`,
    body: `Logistics confirmed full cash payment from ${customerName} with photo proof attached.`,
    actionLabel: "View Receipt",
    orderId: order.id,
    orderNumber,
    url: "/finance/payments",
    tag: `finance-balance-${order.id}`
  });
};

// Notify Logistics and Sales whenever Logistics updates delivery or pick-up status
const notifyLogisticsStatusTransition = ({ io, order }) => {
  if (!io || !order) return;
  const orderNumber = formatOrderNumber(order.id);
  const customerName = resolveOrderCustomerName(order);
  const status = String(order.status || "").toLowerCase();

  const statusTextMap = {
    shipped: {
      title: `Order Shipped: ${orderNumber}`,
      body: `Order for ${customerName} is loaded on the delivery truck.`,
      severity: "info"
    },
    out_for_delivery: {
      title: `Out for Delivery: ${orderNumber}`,
      body: `Delivery for ${customerName} is now on the way to the customer.`,
      severity: "info"
    },
    ready_for_pickup: {
      title: `Ready for Pick-up: ${orderNumber}`,
      body: `Materials for ${customerName} are staged at the store pick-up counter.`,
      severity: "success"
    },
    delivered: {
      title: `Order Delivered: ${orderNumber}`,
      body: `Delivery for ${customerName} has been completed.`,
      severity: "success"
    },
    completed: {
      title: `Order Completed: ${orderNumber}`,
      body: `Order handover for ${customerName} has been completed.`,
      severity: "success"
    }
  };

  const statusInfo = statusTextMap[status];
  if (statusInfo) {
    emitPortalSocketNotification(io, "logistic", "logistic_notification", {
      type: `delivery_${status}`,
      severity: statusInfo.severity,
      title: statusInfo.title,
      body: statusInfo.body,
      actionLabel: "View Deliveries",
      orderId: order.id,
      orderNumber,
      url: "/logistic/deliveries",
      tag: `logistic-status-${order.id}-${status}`
    });
  }

  if (status === "completed" || status === "delivered") {
    emitPortalSocketNotification(io, ["sales", "saless"], "sales_notification", {
      type: "order_completed",
      severity: "success",
      title: `Order Completed: ${orderNumber}`,
      body: `Logistics completed the order for ${customerName}.`,
      actionLabel: "Recent Orders",
      orderId: order.id,
      orderNumber,
      url: "/sales/recent-orders",
      tag: `sales-completed-${order.id}`
    });
  }
};

// Notify Logistics when coil stock drops to Low Stock or Out of Stock
const notifyLogisticLowCoilStock = ({ io, coil, status }) => {
  if (!io || !coil) return;
  if (status !== "Low Stock" && status !== "Out of Stock") return;

  emitPortalSocketNotification(io, "logistic", "logistic_notification", {
    type: "coil_stock_alert",
    severity: status === "Out of Stock" ? "error" : "warning",
    title: `Coil ${status}: ${coil.thickness} ${coil.color}`,
    body: `${coil.coilCount} roll(s) remaining in inventory. Please restock soon.`,
    actionLabel: "View Inventory",
    url: "/logistic/products",
    tag: `logistic-coil-${coil.id}-${status}`
  });
};

// Notify Sales when a customer submits a new product review
const notifySalesNewReview = ({ io, review, productName, customerName }) => {
  if (!io || !review) return;
  emitPortalSocketNotification(io, ["sales", "saless"], "sales_notification", {
    type: "new_customer_review",
    severity: "info",
    title: `New Customer Review (${review.rating}★)`,
    body: `${customerName || "A customer"} posted a review on ${productName || "a product"}.`,
    actionLabel: "View Reviews",
    url: "/sales/reviews",
    tag: `sales-review-${review.id}`
  });
};

// Notify Admin in real time and email the customer when a new account deletion request is submitted
const notifyAdminNewDeletionRequest = async ({ io, request }) => {
  if (!request) return;

  if (io) {
    emitPortalSocketNotification(io, "admin", "admin_deletion_request_created", {
      request,
      title: "New Account Deletion Request",
      body: `${request.customerName || request.customerEmail} requested account deletion.`,
      url: "/admin/users?tab=deletion-requests"
    });
  }

  if (request.customerEmail) {
    sendAccountDeletionRequestedEmail(request.customerEmail, {
      customerName: request.customerName,
      reason: request.reason,
      submittedAt: request.createdAt
    }).catch((err) => {
      console.error("[NOTIFICATION MANAGER] Account deletion request email failed:", err.message);
    });
  }
};

// Force-logout the customer in real time and send approval confirmation email
const notifyCustomerDeletionApproved = async ({ io, userId, customerEmail, customerName, adminNotes, reviewedAt }) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit("account_deleted", {
      title: "Account Deleted",
      message: "Your account deletion request has been approved by an Administrator. You will now be signed out.",
      adminNotes: adminNotes || "",
      reviewedAt: reviewedAt || new Date().toISOString()
    });
  }

  if (customerEmail) {
    sendAccountDeletionApprovedEmail(customerEmail, {
      customerName,
      approvedAt: reviewedAt,
      adminNotes
    }).catch((err) => {
      console.error("[NOTIFICATION MANAGER] Account deletion approval email failed:", err.message);
    });
  }
};

// Notify the customer in real time and via email when Admin rejects their account deletion request
const notifyCustomerDeletionRejected = async ({ io, userId, customerEmail, customerName, adminNotes, reviewedAt }) => {
  if (io && userId) {
    emitCustomerSocketNotification(io, userId, {
      type: "account_deletion_rejected",
      eventType: "account_deletion_rejected",
      title: "Account Deletion Request Declined",
      body: adminNotes
        ? `Reason: ${adminNotes}`
        : "Your account deletion request could not be approved at this time. Your account remains active.",
      url: "/profile",
      actionLabel: "View Profile",
      tag: `account-deletion-rejected-${userId}`
    });
  }

  if (customerEmail) {
    sendAccountDeletionRejectedEmail(customerEmail, {
      customerName,
      rejectedAt: reviewedAt,
      adminNotes
    }).catch((err) => {
      console.error("[NOTIFICATION MANAGER] Account deletion rejection email failed:", err.message);
    });
  }
};

module.exports = {
  notifyOrderPlaced,
  notifyOrderOutForDelivery,
  notifyOrderReadyForPickup,
  notifyOrderDeliveredOrCompleted,
  notifyOrderRejected,
  notifyPaymentRefunded,
  notifySalesNewOrder,
  notifyFinancePaymentVerificationNeeded,
  notifyPaymentVerifiedWorkflow,
  notifyFinanceRefundRequired,
  notifyFinanceBalanceCollected,
  notifyLogisticsStatusTransition,
  notifyLogisticLowCoilStock,
  notifySalesNewReview,
  notifyAdminNewDeletionRequest,
  notifyCustomerDeletionApproved,
  notifyCustomerDeletionRejected
};
