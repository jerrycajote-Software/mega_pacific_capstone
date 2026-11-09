const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getPaymentGatewayConfig,
  initiatePaymongoGcashQr,
  checkPaymongoPaymentStatus,
  receivePaymongoWebhook
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/config", getPaymentGatewayConfig);
router.post("/paymongo/create-qr", verifyToken, initiatePaymongoGcashQr);
router.get("/paymongo/status/:intentId", verifyToken, checkPaymongoPaymentStatus);
router.post("/paymongo/webhook", receivePaymongoWebhook);

module.exports = router;

