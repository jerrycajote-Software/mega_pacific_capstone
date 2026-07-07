const express = require("express");
const { getEmployeeDashboardStats } = require("../../controllers/employee/dashboardController");
const { verifyEmployee } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyEmployee, getEmployeeDashboardStats);

module.exports = router;
