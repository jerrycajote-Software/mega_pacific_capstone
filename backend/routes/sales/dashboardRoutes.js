const express = require("express");
const { getSalesDashboardStats, getSalesQuotaForStaff } = require("../../controllers/sales/dashboardController");
const { verifySales } = require("../../middleware/authMiddleware");

const router = express.Router();

// Routes for full Sales dashboard stats and the dedicated sales quota summary endpoint
router.get("/", verifySales, getSalesDashboardStats);
router.get("/quota", verifySales, getSalesQuotaForStaff);

module.exports = router;
