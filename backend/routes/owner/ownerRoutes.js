const express = require("express");
const { getOwnerDashboardStats } = require("../../controllers/owner/dashboardController");
const { verifyOwner } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", verifyOwner, getOwnerDashboardStats);

module.exports = router;
