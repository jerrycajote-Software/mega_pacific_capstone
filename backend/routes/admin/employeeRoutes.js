const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../../middleware/authMiddleware");
const {
  getEmployees,
  createEmployee,
  updateEmployee,
  resetEmployeePassword,
  updateEmployeeStatus,
} = require("../../controllers/admin/employeeController");

// All employee management routes are admin-only
router.get("/", verifyAdmin, getEmployees);
router.post("/", verifyAdmin, createEmployee);
router.put("/:id", verifyAdmin, updateEmployee);
router.patch("/:id/reset-password", verifyAdmin, resetEmployeePassword);
router.patch("/:id/status", verifyAdmin, updateEmployeeStatus);

module.exports = router;
