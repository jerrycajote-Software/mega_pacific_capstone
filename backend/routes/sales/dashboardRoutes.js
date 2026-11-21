const express = require("express");
const {
  getSalesDashboardStats,
  getSalesQuotaForStaff,
  getGlobalDiscountSettings,
  updateGlobalDiscountForAllProducts
} = require("../../controllers/sales/dashboardController");
const { verifySales } = require("../../middleware/authMiddleware");

const router = express.Router();

// Routes for Sales dashboard metrics, sales quota summary, and storewide product discount controls
router.get("/", verifySales, getSalesDashboardStats);
router.get("/quota", verifySales, getSalesQuotaForStaff);
router.get("/discount", verifySales, getGlobalDiscountSettings);
router.put("/discount", verifySales, updateGlobalDiscountForAllProducts);

module.exports = router;
