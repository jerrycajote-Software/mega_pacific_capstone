// Service for computing collected amounts, pending 50% balances, and unified payment status labels

const CANCELLED_ORDER_STATUSES = ["cancelled", "rejected"];
const EXCLUDED_PAYMENT_STATUSES = ["refunded", "refund_pending", "unpaid"];

// Round a currency figure cleanly to two decimal places
const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

// Check whether an order is on the 50% downpayment plan and still awaiting the remaining 50%
const isPartial50Order = (order) => {
  if (!order) return false;
  const pStatus = String(order.paymentStatus || "").trim().toLowerCase();
  const pMode = String(order.paymentMode || "").trim().toLowerCase();

  if (pStatus === "paid" || pStatus === "refunded" || pStatus === "refund_pending") {
    return false;
  }

  return (
    pStatus.includes("50%") ||
    pStatus === "pending_50_payment" ||
    pMode.includes("50%")
  );
};

// Check whether an order has completed 100% payment
const isFullyPaidOrder = (order) => {
  if (!order) return false;
  return String(order.paymentStatus || "").trim().toLowerCase() === "paid";
};

// Calculate the actual cash collected so far for revenue reporting across Finance, Sales, and Owner
const getCollectedRevenueAmount = (order) => {
  if (!order) return 0;

  const orderStatus = String(order.status || "").trim().toLowerCase();
  const paymentStatus = String(order.paymentStatus || "").trim().toLowerCase();

  if (CANCELLED_ORDER_STATUSES.includes(orderStatus)) return 0;
  if (EXCLUDED_PAYMENT_STATUSES.includes(paymentStatus)) return 0;

  const total = Number(order.total) || 0;

  if (isFullyPaidOrder(order)) {
    return roundCurrency(total);
  }

  if (isPartial50Order(order)) {
    return roundCurrency(total * 0.5);
  }

  return 0;
};

// Calculate the remaining 50% balance waiting for Logistics confirmation
const getPendingBalanceAmount = (order) => {
  if (!order) return 0;

  const orderStatus = String(order.status || "").trim().toLowerCase();
  const paymentStatus = String(order.paymentStatus || "").trim().toLowerCase();

  if (CANCELLED_ORDER_STATUSES.includes(orderStatus)) return 0;
  if (paymentStatus === "refunded" || paymentStatus === "refund_pending") return 0;

  if (isPartial50Order(order)) {
    const total = Number(order.total) || 0;
    const collected = getCollectedRevenueAmount(order);
    return roundCurrency(Math.max(0, total - collected));
  }

  return 0;
};

// Build consistent payment breakdown and display labels for Customer, Finance, and Logistics views
const buildOrderPaymentSummary = (order) => {
  const totalAmount = roundCurrency(order?.total || 0);
  const collectedAmount = getCollectedRevenueAmount(order);
  const pendingBalanceAmount = getPendingBalanceAmount(order);
  const isPending50Payment = isPartial50Order(order);
  const isFullyPaid = isFullyPaidOrder(order);
  const pStatus = String(order?.paymentStatus || "").trim().toLowerCase();

  let statusKey = "pending";
  let shortLabel = "Pending Payment";
  let detailedLabel = "Pending payment verification";

  if (pStatus === "refunded") {
    statusKey = "refunded";
    shortLabel = "Refunded";
    detailedLabel = "Payment refunded to customer";
  } else if (pStatus === "refund_pending") {
    statusKey = "refund_pending";
    shortLabel = "Refund Pending";
    detailedLabel = "Waiting for Finance refund processing";
  } else if (isFullyPaid) {
    statusKey = "paid";
    shortLabel = "Paid (Full Payment)";
    detailedLabel = order?.balanceConfirmedAt
      ? "Full payment confirmed with Logistics proof"
      : "Full payment verified";
  } else if (isPending50Payment) {
    statusKey = "pending_50_payment";
    shortLabel = "Pending 50% Payment";
    detailedLabel = "50% downpayment paid — waiting for Logistics confirmation of remaining 50% payment";
  }

  return {
    statusKey,
    shortLabel,
    detailedLabel,
    totalAmount,
    collectedAmount,
    pendingBalanceAmount,
    isPending50Payment,
    isFullyPaid
  };
};

// Normalize raw checkout paymentMode descriptions into clean collection channel names
const classifyPaymentChannel = (paymentMode) => {
  const raw = String(paymentMode || "").trim();
  const normalized = raw.toLowerCase();

  if (!normalized) return "Cash on Delivery";
  if (normalized.includes("gcash")) return "GCash";
  if (normalized.includes("maya")) return "Maya";
  if (
    normalized.includes("bank card") ||
    normalized.includes("card ending") ||
    normalized.includes("visa") ||
    normalized.includes("mastercard") ||
    normalized.includes("credit card") ||
    normalized.includes("debit card")
  ) {
    return "Bank Card";
  }
  if (
    normalized.includes("bank transfer") ||
    normalized.includes("bank tranfer") ||
    normalized.includes("bank deposit") ||
    normalized.includes("instapay") ||
    normalized.includes("pesonet") ||
    normalized.includes("bank")
  ) {
    return "Bank Transfer";
  }
  if (normalized.includes("paymongo")) return "PayMongo";
  if (normalized.includes("cash on delivery") || normalized.includes("cod")) {
    return "Cash on Delivery";
  }

  return "Other Payment";
};

// Build a short plain-English description of payment terms seen inside a channel bucket
const buildChannelSubtitle = (bucket) => {
  if (bucket.name === "Cash on Delivery") {
    return "100% payment on delivery";
  }
  const hasFull = bucket.fullPaymentCount > 0;
  const hasDownpayment = bucket.downpaymentCount > 0;
  const hasQr = bucket.hasQr;

  if (bucket.name === "GCash" && hasQr && hasFull && hasDownpayment) {
    return "Direct & PayMongo QR (Full + 50% downpayment)";
  }
  if (bucket.name === "GCash" && hasQr) {
    return "Direct & PayMongo QR";
  }
  if (hasFull && hasDownpayment) {
    return "Full payment & 50% downpayment";
  }
  if (hasDownpayment) {
    return "50% downpayment + COD";
  }
  return "Full payment";
};

// Aggregate collected revenue across orders into clean, sorted collection channels
const buildPaymentChannelBreakdown = (orders = []) => {
  const channelMap = {};

  orders.forEach((order) => {
    const collected = getCollectedRevenueAmount(order);
    if (collected <= 0) return;

    const rawMode = String(order?.paymentMode || "");
    const lowerMode = rawMode.toLowerCase();
    const channelName = classifyPaymentChannel(rawMode);

    if (!channelMap[channelName]) {
      channelMap[channelName] = {
        name: channelName,
        value: 0,
        count: 0,
        fullPaymentValue: 0,
        downpaymentValue: 0,
        fullPaymentCount: 0,
        downpaymentCount: 0,
        hasQr: false
      };
    }

    const bucket = channelMap[channelName];
    bucket.value = roundCurrency(bucket.value + collected);
    bucket.count += 1;

    const isDownpaymentMode = lowerMode.includes("50%") || isPartial50Order(order);
    if (isDownpaymentMode) {
      bucket.downpaymentValue = roundCurrency(bucket.downpaymentValue + collected);
      bucket.downpaymentCount += 1;
    } else {
      bucket.fullPaymentValue = roundCurrency(bucket.fullPaymentValue + collected);
      bucket.fullPaymentCount += 1;
    }

    if (lowerMode.includes("qr") || lowerMode.includes("paymongo")) {
      bucket.hasQr = true;
    }
  });

  return Object.values(channelMap)
    .map((bucket) => ({
      name: bucket.name,
      value: bucket.value,
      count: bucket.count,
      fullPaymentValue: bucket.fullPaymentValue,
      downpaymentValue: bucket.downpaymentValue,
      subtitle: buildChannelSubtitle(bucket)
    }))
    .sort((a, b) => b.value - a.value);
};

module.exports = {
  roundCurrency,
  isPartial50Order,
  isFullyPaidOrder,
  getCollectedRevenueAmount,
  getPendingBalanceAmount,
  buildOrderPaymentSummary,
  classifyPaymentChannel,
  buildPaymentChannelBreakdown
};
