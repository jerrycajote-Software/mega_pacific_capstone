const crypto = require("crypto");
const prisma = require("../config/db");

const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

const getPaymongoAuthHeader = () => {
  const secretKey = (process.env.PAYMONGO_SECRET_KEY || "").trim();
  if (!secretKey) {
    throw new Error("PayMongo secret key is not configured on the server. Please add PAYMONGO_SECRET_KEY to backend .env.");
  }
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
};

const getPaymongoEnvironmentInfo = () => {
  const secretKey = (process.env.PAYMONGO_SECRET_KEY || "").trim();
  const publicKey = (process.env.PAYMONGO_PUBLIC_KEY || "").trim();
  const isConfigured = Boolean(secretKey);
  const mode = secretKey.startsWith("sk_live_") ? "live" : secretKey.startsWith("sk_test_") ? "test" : "unconfigured";

  return {
    isConfigured,
    mode,
    hasPublicKey: Boolean(publicKey)
  };
};

const isPaymongoGcashQrEnabled = async () => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "paymongo_gcash_qr_enabled" }
    });
    if (!setting) {
      return true;
    }
    return setting.value === "true" || setting.value === "enabled" || setting.value === "1";
  } catch (err) {
    console.warn("Failed to read paymongo_gcash_qr_enabled setting, defaulting to enabled:", err.message);
    return true;
  }
};

const createGcashQrPaymentSession = async ({
  amountPhp,
  description,
  customerName,
  customerEmail,
  contactNumber,
  paymentPlan,
  returnUrl
}) => {
  const authHeader = getPaymongoAuthHeader();
  const numericAmount = Number(amountPhp);

  if (!numericAmount || isNaN(numericAmount) || numericAmount < 20) {
    throw new Error("Minimum payment amount for GCash QR via PayMongo is ₱20.00.");
  }

  const amountCentavos = Math.round(numericAmount * 100);

  const intentResponse = await fetch(`${PAYMONGO_API_BASE}/payment_intents`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountCentavos,
          payment_method_allowed: ["qrph", "gcash"],
          currency: "PHP",
          capture_type: "automatic",
          description: description || "Mega Pacific Metal and Steel Order Payment",
          statement_descriptor: "Mega Pacific Roofing",
          metadata: {
            customerName: customerName || "Customer",
            customerEmail: customerEmail || "",
            contactNumber: contactNumber || "",
            paymentPlan: paymentPlan || "COD_50"
          }
        }
      }
    })
  });

  const intentPayload = await intentResponse.json();
  if (!intentResponse.ok || !intentPayload?.data?.id) {
    const apiErr = intentPayload?.errors?.[0]?.detail || "Failed to initialize PayMongo payment intent.";
    throw new Error(apiErr);
  }

  const paymentIntentId = intentPayload.data.id;

  const methodResponse = await fetch(`${PAYMONGO_API_BASE}/payment_methods`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      data: {
        attributes: {
          type: "qrph",
          billing: {
            name: customerName || "Mega Pacific Customer",
            email: customerEmail || "customer@megapacific.com",
            phone: contactNumber || "09170000000"
          }
        }
      }
    })
  });

  const methodPayload = await methodResponse.json();
  if (!methodResponse.ok || !methodPayload?.data?.id) {
    const apiErr = methodPayload?.errors?.[0]?.detail || "Failed to create PayMongo QR Ph payment method.";
    throw new Error(apiErr);
  }

  const paymentMethodId = methodPayload.data.id;
  const fallbackReturnUrl = returnUrl || `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout`;

  const attachResponse = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}/attach`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      data: {
        attributes: {
          payment_method: paymentMethodId,
          return_url: fallbackReturnUrl
        }
      }
    })
  });

  const attachPayload = await attachResponse.json();
  if (!attachResponse.ok || !attachPayload?.data) {
    const apiErr = attachPayload?.errors?.[0]?.detail || "Failed to attach QR Ph payment method to PayMongo intent.";
    throw new Error(apiErr);
  }

  const attributes = attachPayload.data.attributes || {};
  const nextAction = attributes.next_action || {};
  const codeData = nextAction.code || {};

  return {
    paymentIntentId: attachPayload.data.id,
    paymentMethodId,
    status: attributes.status,
    livemode: Boolean(attributes.livemode),
    amountPhp: numericAmount,
    amountCentavos,
    qrId: codeData.id || null,
    qrImageBase64: codeData.image_url || null,
    testAuthorizeUrl: codeData.test_url || nextAction?.redirect?.url || null,
    statementDescriptor: attributes.statement_descriptor || "Mega Pacific Metal and Steel Corp"
  };
};

const fetchPaymentIntentStatus = async (paymentIntentId) => {
  if (!paymentIntentId || !String(paymentIntentId).startsWith("pi_")) {
    throw new Error("A valid PayMongo Payment Intent ID is required.");
  }

  const authHeader = getPaymongoAuthHeader();
  const response = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${encodeURIComponent(paymentIntentId)}`, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      Accept: "application/json"
    }
  });

  const payload = await response.json();
  if (!response.ok || !payload?.data) {
    const apiErr = payload?.errors?.[0]?.detail || "Unable to verify payment status from PayMongo.";
    throw new Error(apiErr);
  }

  const attributes = payload.data.attributes || {};
  const payments = Array.isArray(attributes.payments) ? attributes.payments : [];
  const latestPayment = payments[0] || null;
  const paymentRecordId = latestPayment?.id || null;

  return {
    paymentIntentId: payload.data.id,
    status: attributes.status,
    isPaid: attributes.status === "succeeded",
    livemode: Boolean(attributes.livemode),
    amountPhp: (attributes.amount || 0) / 100,
    paymentRecordId,
    lastPaymentError: attributes.last_payment_error || null
  };
};

const verifyPaymongoWebhookSignature = (rawBody, signatureHeader, webhookSecret) => {
  if (!webhookSecret || !signatureHeader) return true;
  try {
    const parts = signatureHeader.split(",").reduce((acc, part) => {
      const [k, v] = part.split("=");
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});

    const timestamp = parts.t;
    const signature = parts.li || parts.te;
    if (!timestamp || !signature) return false;

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (err) {
    return false;
  }
};

const extractPaymongoIdFromPaymentMethod = (paymentMethodStr) => {
  if (!paymentMethodStr || typeof paymentMethodStr !== "string") return null;
  const payMatch = paymentMethodStr.match(/pay_[A-Za-z0-9]+/);
  if (payMatch) return { type: "payment", id: payMatch[0] };
  const piMatch = paymentMethodStr.match(/pi_[A-Za-z0-9]+/);
  if (piMatch) return { type: "intent", id: piMatch[0] };
  return null;
};

const createPaymongoRefund = async ({
  paymentMethodStr,
  amountPhp,
  reason = "requested_by_customer",
  notes = ""
}) => {
  const extracted = extractPaymongoIdFromPaymentMethod(paymentMethodStr);
  if (!extracted) {
    return {
      attempted: false,
      refundId: null,
      paymentId: null
    };
  }

  const authHeader = getPaymongoAuthHeader();
  let paymentId = extracted.type === "payment" ? extracted.id : null;

  if (!paymentId && extracted.type === "intent") {
    const intentStatus = await fetchPaymentIntentStatus(extracted.id);
    paymentId = intentStatus.paymentRecordId;
  }

  if (!paymentId) {
    throw new Error("Could not resolve a paid PayMongo Payment ID (pay_...) for this order to execute an automated refund.");
  }

  const numericAmount = Number(amountPhp);
  if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error("Refund amount must be greater than ₱0.00.");
  }

  const amountCentavos = Math.round(numericAmount * 100);
  const validReasons = [
    "duplicate",
    "fraudulent",
    "requested_by_customer",
    "others"
  ];
  const normalizedReason = validReasons.includes(reason) ? reason : "requested_by_customer";

  const response = await fetch(`${PAYMONGO_API_BASE}/refunds`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountCentavos,
          payment_id: paymentId,
          reason: normalizedReason,
          notes: notes || "Mega Pacific Finance Portal Refund Disbursement"
        }
      }
    })
  });

  const payload = await response.json();
  if (!response.ok || !payload?.data?.id) {
    const apiErr = payload?.errors?.[0]?.detail || "PayMongo Refund API rejected the refund request.";
    throw new Error(apiErr);
  }

  return {
    attempted: true,
    refundId: payload.data.id,
    paymentId,
    status: payload.data.attributes?.status || "succeeded",
    livemode: Boolean(payload.data.attributes?.livemode)
  };
};

module.exports = {
  getPaymongoEnvironmentInfo,
  isPaymongoGcashQrEnabled,
  createGcashQrPaymentSession,
  fetchPaymentIntentStatus,
  verifyPaymongoWebhookSignature,
  extractPaymongoIdFromPaymentMethod,
  createPaymongoRefund
};

