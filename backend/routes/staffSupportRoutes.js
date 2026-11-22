const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const {
  getStaffSupportUnreadBadge,
  listStaffSupportThreadsHandler,
  createStaffSupportThreadHandler,
  getStaffSupportThreadHandler,
  sendStaffSupportMessageHandler,
  markStaffSupportThreadReadHandler,
  updateStaffSupportThreadStatusHandler
} = require("../controllers/staffSupportController");

router.get("/unread-summary", verifyToken, getStaffSupportUnreadBadge);
router.get("/threads", verifyToken, listStaffSupportThreadsHandler);
router.post("/threads", verifyToken, createStaffSupportThreadHandler);
router.get("/threads/:id", verifyToken, getStaffSupportThreadHandler);
router.post("/threads/:id/messages", verifyToken, sendStaffSupportMessageHandler);
router.patch("/threads/:id/read", verifyToken, markStaffSupportThreadReadHandler);
router.patch("/threads/:id/status", verifyAdmin, updateStaffSupportThreadStatusHandler);

module.exports = router;
