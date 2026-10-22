const express = require("express");
const router = express.Router();
const inquiryController = require("../controllers/inquiryController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, inquiryController.createInquiry);
router.get("/customer", verifyToken, inquiryController.getCustomerInquiries);

router.get("/:id", verifyToken, inquiryController.getInquiry);
router.post("/:id/messages", verifyToken, inquiryController.addMessage);


router.get("/", verifyToken, inquiryController.getAllInquiries);
router.put("/:id/status", verifyToken, inquiryController.updateInquiryStatus);

module.exports = router;
