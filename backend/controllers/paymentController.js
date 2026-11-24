const {
  getPaymongoEnvironmentInfo,
  isPaymongoGcashQrEnabled,
  createGcashQrPaymentSession,
  fetchPaymentIntentStatus
} = require("../services/paymongoService");
const {
  getPaypalEnvironmentInfo,
  isPaypalCheckoutEnabled,
  createPaypalOrder,
  capturePaypalOrder,
  getPaypalOrderDetails
} = require("../services/paypalService");

const getPaymentGatewayConfig = async (req, res) => {
  try {
    const envInfo = getPaymongoEnvironmentInfo();
    const settingEnabled = await isPaymongoGcashQrEnabled();
    const gcashQrEnabled = Boolean(settingEnabled && envInfo.isConfigured);

    const paypalEnv = getPaypalEnvironmentInfo();
    const paypalSettingEnabled = await isPaypalCheckoutEnabled();
    const paypalEnabled = Boolean(paypalSettingEnabled && paypalEnv.isConfigured);

    return res.status(200).json({
      success: true,
      message: "Payment gateway configuration retrieved successfully.",
      data: {
        gcashQrEnabled,
        settingEnabled,
        isConfigured: envInfo.isConfigured,
        mode: envInfo.mode,
        paypalEnabled,
        paypalSettingEnabled,
        paypalConfigured: paypalEnv.isConfigured,
        paypalMode: paypalEnv.mode,
        paypalClientId: paypalEnv.clientId
      }
    });
  } catch (error) {
    console.error("Failed to retrieve payment gateway configuration:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load payment gateway configuration."
    });
  }
};

// Create a PayPal Checkout order in Philippine Pesos for the current checkout total
const initiatePaypalOrder = async (req, res) => {
  try {
    const settingEnabled = await isPaypalCheckoutEnabled();
    if (!settingEnabled) {
      return res.status(403).json({
        success: false,
        message: "PayPal checkout is currently disabled by the system administrator."
      });
    }

    const { amountPhp, description, customerName, paymentPlan, customId } = req.body || {};
    const orderSession = await createPaypalOrder({
      amountPhp,
      description,
      customerName,
      paymentPlan,
      customId
    });

    return res.status(201).json({
      success: true,
      message: "PayPal checkout order created successfully.",
      data: orderSession
    });
  } catch (error) {
    console.error("PayPal order initiation error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to start PayPal checkout. Please try again."
    });
  }
};

// Capture an approved PayPal Checkout order on the server
const capturePaypalOrderPayment = async (req, res) => {
  try {
    const { paypalOrderId } = req.body || {};
    const captureData = await capturePaypalOrder(paypalOrderId);

    if (captureData.isPaid) {
      const io = req.app.get("io");
      if (io) {
        io.emit("paypal_payment_confirmed", {
          paypalOrderId: captureData.paypalOrderId,
          captureId: captureData.captureId,
          status: captureData.status
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: captureData.isPaid
        ? "PayPal payment has been verified and captured."
        : "PayPal payment has not completed yet.",
      data: captureData
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to capture PayPal payment."
    });
  }
};

// Check the current status of a PayPal order for reconnect recovery
const checkPaypalOrderStatus = async (req, res) => {
  try {
    const { paypalOrderId } = req.params;
    const statusData = await getPaypalOrderDetails(paypalOrderId);

    return res.status(200).json({
      success: true,
      message: statusData.isPaid
        ? "PayPal payment is verified and completed."
        : "Waiting for PayPal payment authorization.",
      data: statusData
    });
  } catch (error) {
    console.error("PayPal status verification error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to verify PayPal payment status."
    });
  }
};

const initiatePaymongoGcashQr = async (req, res) => {
  try {
    const settingEnabled = await isPaymongoGcashQrEnabled();
    if (!settingEnabled) {
      return res.status(403).json({
        success: false,
        message: "Automated GCash QR payment is currently disabled by the system administrator. Please refresh checkout to use standard GCash verification."
      });
    }

    const {
      amountPhp,
      description,
      customerName,
      customerEmail,
      contactNumber,
      paymentPlan,
      returnUrl
    } = req.body;

    const session = await createGcashQrPaymentSession({
      amountPhp,
      description,
      customerName,
      customerEmail,
      contactNumber,
      paymentPlan,
      returnUrl
    });

    return res.status(201).json({
      success: true,
      message: "GCash QR payment session generated successfully. Please scan the QR code to complete payment.",
      data: session
    });
  } catch (error) {
    console.error("PayMongo GCash QR initiation error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to generate GCash QR code from PayMongo. Please try again."
    });
  }
};

const checkPaymongoPaymentStatus = async (req, res) => {
  try {
    const { intentId } = req.params;
    const statusData = await fetchPaymentIntentStatus(intentId);

    if (statusData.isPaid) {
      const io = req.app.get("io");
      if (io) {
        io.emit("paymongo_payment_confirmed", {
          paymentIntentId: statusData.paymentIntentId,
          status: statusData.status,
          paymentRecordId: statusData.paymentRecordId
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: statusData.isPaid
        ? "GCash payment has been verified and confirmed by PayMongo."
        : "Waiting for customer to scan and authorize GCash QR payment.",
      data: statusData
    });
  } catch (error) {
    console.error("PayMongo status verification error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to check PayMongo payment status."
    });
  }
};

const receivePaymongoWebhook = async (req, res) => {
  try {
    const event = req.body?.data;
    const eventType = event?.attributes?.type;
    const resource = event?.attributes?.data;

    if (eventType === "payment.paid" || eventType === "qrph.expired") {
      const paymentIntentId =
        resource?.attributes?.payment_intent_id ||
        resource?.id ||
        null;

      const io = req.app.get("io");
      if (io && paymentIntentId) {
        io.emit("paymongo_payment_confirmed", {
          paymentIntentId,
          eventType,
          status: eventType === "payment.paid" ? "succeeded" : "expired"
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "PayMongo webhook event processed successfully."
    });
  } catch (error) {
    console.error("PayMongo webhook processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process PayMongo webhook event."
    });
  }
};

module.exports = {
  getPaymentGatewayConfig,
  initiatePaymongoGcashQr,
  checkPaymongoPaymentStatus,
  receivePaymongoWebhook,
  initiatePaypalOrder,
  capturePaypalOrderPayment,
  checkPaypalOrderStatus
};

