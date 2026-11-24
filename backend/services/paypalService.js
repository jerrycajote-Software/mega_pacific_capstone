const crypto = require("crypto");
const prisma = require("../config/db");
const { roundCurrency } = require("./paymentCalculationService");

const PAYPAL_SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
const PAYPAL_LIVE_BASE = "https://api-m.paypal.com";
const PAYPAL_REFUND_ROUNDING_TOLERANCE_PHP = 0.02;

// Determine the active PayPal REST API base URL from PAYPAL_MODE
const getPaypalApiBase = () => {
  const mode = (process.env.PAYPAL_MODE || "sandbox").trim().toLowerCase();
  return mode === "live" ? PAYPAL_LIVE_BASE : PAYPAL_SANDBOX_BASE;
};

// Inspect PayPal environment configuration without exposing the secret key
const getPaypalEnvironmentInfo = () => {
  const clientId = (process.env.PAYPAL_CLIENT_ID || "").trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || "").trim();
  const rawMode = (process.env.PAYPAL_MODE || "sandbox").trim().toLowerCase();
  const mode = rawMode === "live" ? "live" : "sandbox";
  const isConfigured = Boolean(clientId && clientSecret);

  return {
    isConfigured,
    mode,
    clientId,
    hasSecret: Boolean(clientSecret)
  };
};

// Check whether PayPal checkout is enabled in system settings
const isPaypalCheckoutEnabled = async () => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "paypal_checkout_enabled" }
    });
    if (!setting) {
      return true;
    }
    return setting.value === "true" || setting.value === "enabled" || setting.value === "1";
  } catch (err) {
    console.warn("Failed to read paypal_checkout_enabled setting, defaulting to enabled:", err.message);
    return true;
  }
};

// Request a short-lived OAuth 2.0 access token from PayPal
const getPaypalAccessToken = async () => {
  const { clientId, isConfigured } = getPaypalEnvironmentInfo();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || "").trim();

  if (!isConfigured) {
    throw new Error("PayPal API credentials are not configured on the server. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to backend .env.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPaypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: "grant_type=client_credentials"
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    const errDetail = payload?.error_description || payload?.error || "Failed to authenticate with PayPal API.";
    throw new Error(errDetail);
  }

  return payload.access_token;
};

// Create a PayPal Checkout order in PHP for either 50% downpayment or full payment
const createPaypalOrder = async ({
  amountPhp,
  description,
  customerName,
  paymentPlan,
  customId
}) => {
  const numericAmount = roundCurrency(amountPhp);
  if (!numericAmount || Number.isNaN(numericAmount) || numericAmount < 1) {
    throw new Error("Minimum payment amount for PayPal checkout is ₱1.00.");
  }

  const accessToken = await getPaypalAccessToken();
  const formattedValue = numericAmount.toFixed(2);
  const { mode } = getPaypalEnvironmentInfo();
  const planNote = paymentPlan === "COD_50" ? "50% Downpayment" : "100% Full Payment";

  const response = await fetch(`${getPaypalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: customId || `MP-${Date.now()}`,
          description: (description || `Mega Pacific Roofing Order (${planNote})`).slice(0, 127),
          custom_id: customId || customerName || "MegaPacificCustomer",
          amount: {
            currency_code: "PHP",
            value: formattedValue
          }
        }
      ],
      application_context: {
        brand_name: "Mega Pacific Metal and Steel Corp",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW"
      }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.id) {
    const detail = payload?.details?.[0]?.description || payload?.message || "Failed to initialize PayPal order.";
    throw new Error(detail);
  }

  return {
    paypalOrderId: payload.id,
    status: payload.status || "CREATED",
    amountPhp: Number(formattedValue),
    livemode: mode === "live"
  };
};

// Extract the primary capture object from a PayPal order payload
const extractCaptureDetails = (orderPayload) => {
  const purchaseUnit = Array.isArray(orderPayload?.purchase_units) ? orderPayload.purchase_units[0] : null;
  const capture = Array.isArray(purchaseUnit?.payments?.captures) ? purchaseUnit.payments.captures[0] : null;
  const payerEmail = orderPayload?.payer?.email_address || null;
  const givenName = orderPayload?.payer?.name?.given_name || "";
  const surname = orderPayload?.payer?.name?.surname || "";
  const payerName = `${givenName} ${surname}`.trim() || null;

  return {
    captureId: capture?.id || null,
    captureStatus: capture?.status || orderPayload?.status || null,
    amountPhp: capture?.amount?.value ? Number(capture.amount.value) : null,
    currencyCode: capture?.amount?.currency_code || purchaseUnit?.amount?.currency_code || null,
    payerEmail,
    payerName
  };
};

// Capture funds for an approved PayPal order
const capturePaypalOrder = async (paypalOrderId) => {
  if (!paypalOrderId || typeof paypalOrderId !== "string") {
    throw new Error("A valid PayPal Order ID is required to capture payment.");
  }

  const accessToken = await getPaypalAccessToken();
  const { mode } = getPaypalEnvironmentInfo();

  const response = await fetch(`${getPaypalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({})
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const issue = payload?.details?.[0]?.issue || "";
    if (issue === "ORDER_ALREADY_CAPTURED") {
      return getPaypalOrderDetails(paypalOrderId);
    }
    const detail = payload?.details?.[0]?.description || payload?.message || "PayPal could not capture this payment.";
    throw new Error(detail);
  }

  const details = extractCaptureDetails(payload);
  const isPaid = payload.status === "COMPLETED" || details.captureStatus === "COMPLETED";

  return {
    paypalOrderId: payload.id || paypalOrderId,
    captureId: details.captureId,
    status: details.captureStatus || payload.status,
    isPaid,
    livemode: mode === "live",
    amountPhp: details.amountPhp,
    currencyCode: details.currencyCode,
    payerEmail: details.payerEmail,
    payerName: details.payerName
  };
};

// Fetch an existing PayPal order and its capture state for verification or reconnect recovery
const getPaypalOrderDetails = async (paypalOrderId) => {
  if (!paypalOrderId || typeof paypalOrderId !== "string") {
    throw new Error("A valid PayPal Order ID is required.");
  }

  const accessToken = await getPaypalAccessToken();
  const { mode } = getPaypalEnvironmentInfo();

  const response = await fetch(`${getPaypalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.id) {
    const detail = payload?.details?.[0]?.description || payload?.message || "Unable to retrieve PayPal payment status.";
    throw new Error(detail);
  }

  const details = extractCaptureDetails(payload);
  const isPaid = details.captureStatus === "COMPLETED" || (payload.status === "COMPLETED" && Boolean(details.captureId));

  return {
    paypalOrderId: payload.id,
    captureId: details.captureId,
    status: details.captureStatus || payload.status,
    isPaid,
    livemode: mode === "live",
    amountPhp: details.amountPhp,
    currencyCode: details.currencyCode,
    payerEmail: details.payerEmail,
    payerName: details.payerName
  };
};

// Extract the stored PayPal Capture ID from an order or refund paymentMethod string
const extractPaypalCaptureIdFromPaymentMethod = (paymentMethodStr) => {
  if (!paymentMethodStr || typeof paymentMethodStr !== "string") return null;
  const captureMatch = paymentMethodStr.match(/Capture ID:\s*([A-Za-z0-9_-]+)/i);
  if (captureMatch) {
    return captureMatch[1];
  }
  const legacyMatch = paymentMethodStr.match(/ppcap_([A-Za-z0-9_-]+)/i);
  if (legacyMatch) {
    return legacyMatch[1];
  }
  return null;
};

// Fetch a PayPal capture record to verify its captured PHP amount and refund status
const getPaypalCaptureDetails = async (captureId, existingAccessToken = null) => {
  if (!captureId || typeof captureId !== "string") {
    throw new Error("A valid PayPal Capture ID is required.");
  }

  const accessToken = existingAccessToken || (await getPaypalAccessToken());
  const response = await fetch(`${getPaypalApiBase()}/v2/payments/captures/${encodeURIComponent(captureId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.id) {
    const detail = payload?.details?.[0]?.description || payload?.message || "Unable to retrieve PayPal capture details.";
    throw new Error(detail);
  }

  return {
    captureId: payload.id,
    status: payload.status || null,
    capturedAmountPhp: payload?.amount?.value ? roundCurrency(payload.amount.value) : null,
    currencyCode: payload?.amount?.currency_code || null
  };
};

// Issue a live or sandbox refund through PayPal Captures Refund API
const createPaypalRefund = async ({
  paymentMethodStr,
  amountPhp,
  noteToPayer = "",
  requestId = null
}) => {
  const captureId = extractPaypalCaptureIdFromPaymentMethod(paymentMethodStr);
  if (!captureId) {
    return {
      attempted: false,
      refundId: null,
      captureId: null,
      refundedAmountPhp: null,
      adjustedForRounding: false
    };
  }

  let refundAmountPhp = roundCurrency(amountPhp);
  if (!refundAmountPhp || Number.isNaN(refundAmountPhp) || refundAmountPhp <= 0) {
    throw new Error("Refund amount must be greater than ₱0.00.");
  }

  const accessToken = await getPaypalAccessToken();
  let adjustedForRounding = false;

  // Verify the actual captured amount on PayPal and reconcile 1-2 centavo 50% split rounding drift
  let captureDetails = null;
  try {
    captureDetails = await getPaypalCaptureDetails(captureId, accessToken);
  } catch (lookupErr) {
    console.warn(`[PAYPAL CAPTURE LOOKUP WARNING] Proceeding with requested refund amount for capture ${captureId}:`, lookupErr.message);
  }

  if (captureDetails) {
    if (String(captureDetails.status || "").toUpperCase() === "REFUNDED") {
      throw new Error("This PayPal payment has already been fully refunded on PayPal.");
    }

    const currencyCode = String(captureDetails.currencyCode || "PHP").toUpperCase();
    if (currencyCode === "PHP" && typeof captureDetails.capturedAmountPhp === "number" && captureDetails.capturedAmountPhp > 0) {
      if (refundAmountPhp > captureDetails.capturedAmountPhp) {
        const overagePhp = roundCurrency(refundAmountPhp - captureDetails.capturedAmountPhp);
        if (overagePhp <= PAYPAL_REFUND_ROUNDING_TOLERANCE_PHP) {
          console.info(
            `[PAYPAL REFUND ROUNDING ALIGNMENT]: Adjusted refund for capture ${captureId} from ₱${refundAmountPhp.toFixed(2)} to captured amount ₱${captureDetails.capturedAmountPhp.toFixed(2)}.`
          );
          refundAmountPhp = captureDetails.capturedAmountPhp;
          adjustedForRounding = true;
        } else {
          throw new Error(
            `Refund amount (₱${refundAmountPhp.toFixed(2)}) exceeds the captured PayPal payment amount (₱${captureDetails.capturedAmountPhp.toFixed(2)}).`
          );
        }
      }
    }
  }

  // Include the centavo amount in the idempotency key so a rounded retry never conflicts with an earlier failed payload
  const amountCents = Math.round(refundAmountPhp * 100);
  const idempotencyKey = (
    requestId
      ? `${requestId}-${amountCents}`
      : `mp-ref-${captureId}-${amountCents}-${crypto.randomUUID().slice(0, 8)}`
  ).slice(0, 108);

  const response = await fetch(`${getPaypalApiBase()}/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "PayPal-Request-Id": idempotencyKey
    },
    body: JSON.stringify({
      amount: {
        currency_code: "PHP",
        value: refundAmountPhp.toFixed(2)
      },
      note_to_payer: (noteToPayer || "Mega Pacific Metal and Steel Corp Refund").slice(0, 255)
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.id) {
    const detail = payload?.details?.[0]?.description || payload?.message || "PayPal declined the automated refund request.";
    throw new Error(detail);
  }

  return {
    attempted: true,
    refundId: payload.id,
    captureId,
    status: payload.status || "COMPLETED",
    refundedAmountPhp: refundAmountPhp,
    adjustedForRounding
  };
};

module.exports = {
  getPaypalEnvironmentInfo,
  isPaypalCheckoutEnabled,
  createPaypalOrder,
  capturePaypalOrder,
  getPaypalOrderDetails,
  getPaypalCaptureDetails,
  extractPaypalCaptureIdFromPaymentMethod,
  createPaypalRefund
};
