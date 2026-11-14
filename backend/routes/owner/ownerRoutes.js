const express = require("express");
const { getOwnerDashboardStats } = require("../../controllers/owner/dashboardController");
const { getOwnerSalesQuota, updateAndSendSalesQuota } = require("../../controllers/owner/salesQuotaController");
const { verifyOwner } = require("../../middleware/authMiddleware");

const router = express.Router();

// Endpoints for the Owner dashboard overview and business sales quota
router.get("/dashboard", verifyOwner, getOwnerDashboardStats);
router.get("/sales-quota", verifyOwner, getOwnerSalesQuota);
router.put("/sales-quota", verifyOwner, updateAndSendSalesQuota);

module.exports = router;
