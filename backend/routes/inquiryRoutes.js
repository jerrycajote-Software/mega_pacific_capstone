const express = require("express");
const router = express.Router();
const inquiryController = require("../controllers/inquiryController");
const { verifyToken } = require("../middleware/authMiddleware");

// Customer routes
router.post("/", verifyToken, inquiryController.createInquiry);
router.get("/customer", verifyToken, inquiryController.getCustomerInquiries);

// Shared route
router.get("/:id", verifyToken, inquiryController.getInquiry);
router.post("/:id/messages", verifyToken, inquiryController.addMessage);

// Employee/Admin routes
router.get("/", verifyToken, inquiryController.getAllInquiries);
router.put("/:id/status", verifyToken, inquiryController.updateInquiryStatus);

module.exports = router;
