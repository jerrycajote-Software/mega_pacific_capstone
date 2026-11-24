const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getPaymentGatewayConfig,
  initiatePaymongoGcashQr,
  checkPaymongoPaymentStatus,
  receivePaymongoWebhook,
  initiatePaypalOrder,
  capturePaypalOrderPayment,
  checkPaypalOrderStatus
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/config", getPaymentGatewayConfig);
router.post("/paymongo/create-qr", verifyToken, initiatePaymongoGcashQr);
router.get("/paymongo/status/:intentId", verifyToken, checkPaymongoPaymentStatus);
router.post("/paymongo/webhook", receivePaymongoWebhook);
router.post("/paypal/create-order", verifyToken, initiatePaypalOrder);
router.post("/paypal/capture-order", verifyToken, capturePaypalOrderPayment);
router.get("/paypal/status/:paypalOrderId", verifyToken, checkPaypalOrderStatus);

module.exports = router;

