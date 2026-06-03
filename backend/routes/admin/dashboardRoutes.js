const express = require("express");
const { getDashboardStats } = require("../../controllers/admin/dashboardController");
const { verifyAdmin } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyAdmin, getDashboardStats);

module.exports = router;
