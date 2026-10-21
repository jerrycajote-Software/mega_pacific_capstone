const express = require("express");
const { getSalesDashboardStats } = require("../../controllers/sales/dashboardController");
const { verifySales } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifySales, getSalesDashboardStats);

module.exports = router;
