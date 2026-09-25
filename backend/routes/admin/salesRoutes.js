const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../../middleware/authMiddleware");
const {
  getAccounts,
  createAccount,
  updateAccount,
  resetAccountPassword,
  updateAccountStatus,
  deleteAccount,
} = require("../../controllers/admin/salesController");

// All account management routes are admin-only
router.get("/", verifyAdmin, getAccounts);
router.post("/", verifyAdmin, createAccount);
router.put("/:id", verifyAdmin, updateAccount);
router.patch("/:id/reset-password", verifyAdmin, resetAccountPassword);
router.patch("/:id/status", verifyAdmin, updateAccountStatus);
router.delete("/:id", verifyAdmin, deleteAccount);

module.exports = router;
