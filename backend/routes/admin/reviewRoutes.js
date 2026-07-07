const express = require("express");
const router = express.Router();
const { getAllReviews } = require("../../controllers/employee/reviewController");
const { verifyAdmin } = require("../../middleware/authMiddleware");

// @route   GET /api/admin/reviews
// @desc    Get all reviews (read-only for admin)
// @access  Private (Admin only)
router.get("/", verifyAdmin, getAllReviews);

module.exports = router;
