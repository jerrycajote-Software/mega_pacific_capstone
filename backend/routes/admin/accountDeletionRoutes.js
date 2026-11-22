const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../../middleware/authMiddleware");
const {
  listAccountDeletionRequests,
  getAccountDeletionRequestDetail,
  approveAccountDeletionRequest,
  rejectAccountDeletionRequest
} = require("../../controllers/admin/accountDeletionController");

router.get("/", verifyAdmin, listAccountDeletionRequests);
router.get("/:id", verifyAdmin, getAccountDeletionRequestDetail);
router.patch("/:id/approve", verifyAdmin, approveAccountDeletionRequest);
router.patch("/:id/reject", verifyAdmin, rejectAccountDeletionRequest);

module.exports = router;
