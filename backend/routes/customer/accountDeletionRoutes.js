const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/authMiddleware");
const {
  getMyAccountDeletionStatus,
  submitMyAccountDeletionRequest,
  cancelMyAccountDeletionRequest
} = require("../../controllers/customer/accountDeletionController");

router.get("/status", verifyToken, getMyAccountDeletionStatus);
router.post("/request", verifyToken, submitMyAccountDeletionRequest);
router.patch("/cancel", verifyToken, cancelMyAccountDeletionRequest);

module.exports = router;
