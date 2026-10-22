const express = require("express");
const router = express.Router();
const systemController = require("../controllers/superadmin/systemController");


router.get("/status", systemController.getSystemStatus);
router.get("/email-status", systemController.getEmailStatus);
router.post("/test-email", systemController.testEmailDelivery);

module.exports = router;
