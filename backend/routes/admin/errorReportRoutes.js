const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../../middleware/authMiddleware");
const {
  listAdminErrorReports,
  getAdminErrorReportById,
  updateAdminErrorReportStatus
} = require("../../controllers/admin/errorReportController");

router.get("/", verifyAdmin, listAdminErrorReports);
router.get("/:id", verifyAdmin, getAdminErrorReportById);
router.patch("/:id", verifyAdmin, updateAdminErrorReportStatus);

module.exports = router;
