// Server-side verification for PayPal and legacy PayMongo checkout payments

const { getPaypalOrderDetails } = require("./paypalService");
const { fetchPaymentIntentStatus } = require("./paymongoService");
const { roundCurrency } = require("./paymentCalculationService");
const { findGatewayPaymentClaim } = require("./orderIdempotencyService");

// Allow a 2-centavo tolerance to avoid false mismatches from half-centavo 50% splits
const PAYMENT_AMOUNT_TOLERANCE_PHP = 0.02;

// Create a structured payment verification error with HTTP status and code
const createPaymentVerificationError = ({ statusCode = 400, code, message, details = null }) => {
  const err = new Error(message);
  err.type = "PAYMENT_VERIFICATION_ERROR";
  err.statusCode = statusCode;
  err.code = code || "PAYMENT_VERIFICATION_FAILED";
  if (details) {
    err.details = details;
  }
  return err;
};

// Format a Philippine Peso amount cleanly for error messages
const formatPhpAmount = (value) =>
  `₱${roundCurrency(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

// Determine whether the order uses 50% downpayment or 100% full payment
const resolveOrderPaymentPlan = (paymentPlan, paymentMode) => {
  if (paymentPlan === "COD_50" || paymentPlan === "FULL_PAYMENT") {
    return paymentPlan;
  }
  const normalizedMode = String(paymentMode || "").trim().toLowerCase();
  if (normalizedMode.includes("50%") || normalizedMode.includes("cash on delivery")) {
    return "COD_50";
  }
  return "FULL_PAYMENT";
};

// Compute the exact PHP amount that must have been captured upfront
const calculateRequiredPaymentNowPhp = ({ orderTotalPhp, paymentPlan, paymentMode }) => {
  const total = roundCurrency(orderTotalPhp);
  const plan = resolveOrderPaymentPlan(paymentPlan, paymentMode);
  return plan === "COD_50" ? roundCurrency(total * 0.5) : total;
};

// Collect all gateway idempotency keys associated with an incoming order request
const buildOrderGatewayIds = ({ paymentIntentId, paymongoReference, paypalOrderId, paypalCaptureId }) => {
  const ids = new Set();

  if (typeof paypalCaptureId === "string" && paypalCaptureId.trim()) {
    ids.add(`ppcap_${paypalCaptureId.trim()}`);
  }
  if (typeof paypalOrderId === "string" && paypalOrderId.trim()) {
    ids.add(`ppord_${paypalOrderId.trim()}`);
  }
  if (typeof paymentIntentId === "string" && paymentIntentId.trim()) {
    ids.add(paymentIntentId.trim());
  }
  if (typeof paymongoReference === "string" && paymongoReference.trim().startsWith("pi_")) {
    ids.add(paymongoReference.trim());
  }

  return Array.from(ids);
};

// Verify that a verified payment has not already been claimed by another user account
const assertPaymentNotClaimedByAnotherUser = async ({ userId, gatewayIntentIds, providerLabel }) => {
  const existingClaim = await findGatewayPaymentClaim({ paymentIntentIds: gatewayIntentIds });
  if (
    existingClaim &&
    existingClaim.userId !== null &&
    parseInt(existingClaim.userId, 10) !== parseInt(userId, 10)
  ) {
    throw createPaymentVerificationError({
      statusCode: 409,
      code: "PAYMENT_ALREADY_USED",
      message: `This ${providerLabel} payment has already been used for another order.`
    });
  }
};

// Verify that the captured amount meets the server-computed upfront payment requirement
const assertCapturedAmountMatchesOrder = ({
  verifiedAmountPhp,
  orderTotalPhp,
  paymentPlan,
  paymentMode,
  providerLabel
}) => {
  const expectedPayNowPhp = calculateRequiredPaymentNowPhp({
    orderTotalPhp,
    paymentPlan,
    paymentMode
  });
  const numericCaptured = Number(verifiedAmountPhp);

  if (!numericCaptured || Number.isNaN(numericCaptured) || numericCaptured <= 0) {
    throw createPaymentVerificationError({
      statusCode: 400,
      code: "PAYMENT_AMOUNT_INVALID",
      message: `${providerLabel} payment verification failed: Unable to confirm the captured payment amount.`
    });
  }

  if (numericCaptured + PAYMENT_AMOUNT_TOLERANCE_PHP < expectedPayNowPhp) {
    throw createPaymentVerificationError({
      statusCode: 400,
      code: "PAYMENT_AMOUNT_MISMATCH",
      message: `${providerLabel} payment verification failed: Captured amount (${formatPhpAmount(numericCaptured)}) is less than the required order payment (${formatPhpAmount(expectedPayNowPhp)}). Please refresh checkout or contact support with your transaction reference.`,
      details: {
        capturedAmountPhp: roundCurrency(numericCaptured),
        requiredAmountPhp: expectedPayNowPhp
      }
    });
  }

  return expectedPayNowPhp;
};

// Verify a PayPal or legacy PayMongo checkout payment directly with the gateway before saving an order
const verifyOrderGatewayPayment = async ({
  userId,
  orderTotalPhp,
  paymentPlan,
  paymentMode,
  paypalOrderId,
  paypalCaptureId,
  paymentIntentId,
  paymongoReference
}) => {
  const cleanPaypalOrderId = typeof paypalOrderId === "string" ? paypalOrderId.trim() : "";
  const cleanPaypalCaptureId = typeof paypalCaptureId === "string" ? paypalCaptureId.trim() : "";
  const cleanPaymongoIntentId = typeof paymentIntentId === "string" ? paymentIntentId.trim() : "";
  const cleanPaymongoRef = typeof paymongoReference === "string" ? paymongoReference.trim() : "";

  const isLegacyPaymongoRecovery =
    !cleanPaypalOrderId &&
    !cleanPaypalCaptureId &&
    (cleanPaymongoIntentId.startsWith("pi_") || cleanPaymongoRef.startsWith("pi_"));

  if (isLegacyPaymongoRecovery) {
    const targetIntentId = cleanPaymongoIntentId.startsWith("pi_") ? cleanPaymongoIntentId : cleanPaymongoRef;
    let paymongoStatus;
    try {
      paymongoStatus = await fetchPaymentIntentStatus(targetIntentId);
    } catch (apiErr) {
      throw createPaymentVerificationError({
        statusCode: 400,
        code: "PAYMONGO_VERIFICATION_FAILED",
        message: `PayMongo payment verification failed: ${apiErr.message || "Unable to verify payment status."}`
      });
    }

    if (!paymongoStatus?.isPaid) {
      throw createPaymentVerificationError({
        statusCode: 400,
        code: "PAYMONGO_NOT_COMPLETED",
        message: "GCash payment has not been confirmed yet. Please complete payment and try again."
      });
    }

    const expectedPayNowPhp = assertCapturedAmountMatchesOrder({
      verifiedAmountPhp: paymongoStatus.amountPhp,
      orderTotalPhp,
      paymentPlan,
      paymentMode,
      providerLabel: "PayMongo"
    });

    const gatewayIntentIds = buildOrderGatewayIds({
      paymentIntentId: paymongoStatus.paymentIntentId
    });

    await assertPaymentNotClaimedByAnotherUser({
      userId,
      gatewayIntentIds,
      providerLabel: "PayMongo"
    });

    return {
      provider: "PayMongo",
      verifiedPaypalOrderId: null,
      verifiedPaypalCaptureId: null,
      verifiedPaymongoReference: paymongoStatus.paymentRecordId || paymongoStatus.paymentIntentId,
      verifiedAmountPhp: roundCurrency(paymongoStatus.amountPhp),
      expectedPayNowPhp,
      currencyCode: "PHP",
      livemode: Boolean(paymongoStatus.livemode),
      gatewayIntentIds
    };
  }

  if (!cleanPaypalOrderId) {
    throw createPaymentVerificationError({
      statusCode: 400,
      code: "PAYMENT_VERIFICATION_REQUIRED",
      message: "A completed PayPal payment is required before placing an order. Please complete payment through the PayPal checkout window."
    });
  }

  let paypalDetails;
  try {
    paypalDetails = await getPaypalOrderDetails(cleanPaypalOrderId);
  } catch (apiErr) {
    throw createPaymentVerificationError({
      statusCode: 400,
      code: "PAYPAL_VERIFICATION_FAILED",
      message: `PayPal payment verification failed: ${apiErr.message || "Unable to confirm transaction with PayPal."}`
    });
  }

  if (!paypalDetails?.isPaid || !paypalDetails?.captureId) {
    throw createPaymentVerificationError({
      statusCode: 400,
      code: "PAYPAL_NOT_COMPLETED",
      message: "PayPal payment has not been completed yet. Please finish paying in the PayPal window and try again."
    });
  }

  if (cleanPaypalCaptureId && cleanPaypalCaptureId !== paypalDetails.captureId) {
    throw createPaymentVerificationError({
      statusCode: 400,
      code: "PAYPAL_CAPTURE_MISMATCH",
      message: "PayPal payment verification failed: The submitted PayPal Capture ID does not match the verified PayPal transaction."
    });
  }

  const currencyCode = String(paypalDetails.currencyCode || "").trim().toUpperCase();
  if (currencyCode !== "PHP") {
    throw createPaymentVerificationError({
      statusCode: 400,
      code: "PAYPAL_INVALID_CURRENCY",
      message: `PayPal payment verification failed: Expected PHP currency but received ${currencyCode || "an unsupported currency"}.`
    });
  }

  const expectedPayNowPhp = assertCapturedAmountMatchesOrder({
    verifiedAmountPhp: paypalDetails.amountPhp,
    orderTotalPhp,
    paymentPlan,
    paymentMode,
    providerLabel: "PayPal"
  });

  const gatewayIntentIds = buildOrderGatewayIds({
    paypalOrderId: paypalDetails.paypalOrderId,
    paypalCaptureId: paypalDetails.captureId
  });

  await assertPaymentNotClaimedByAnotherUser({
    userId,
    gatewayIntentIds,
    providerLabel: "PayPal"
  });

  return {
    provider: "PayPal",
    verifiedPaypalOrderId: paypalDetails.paypalOrderId,
    verifiedPaypalCaptureId: paypalDetails.captureId,
    verifiedPaymongoReference: null,
    verifiedAmountPhp: roundCurrency(paypalDetails.amountPhp),
    expectedPayNowPhp,
    currencyCode,
    livemode: Boolean(paypalDetails.livemode),
    gatewayIntentIds
  };
};

module.exports = {
  PAYMENT_AMOUNT_TOLERANCE_PHP,
  resolveOrderPaymentPlan,
  calculateRequiredPaymentNowPhp,
  buildOrderGatewayIds,
  assertCapturedAmountMatchesOrder,
  verifyOrderGatewayPayment
};
