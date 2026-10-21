const express = require("express");
const router = express.Router();
const { getAllReviews, replyToReview } = require("../../controllers/sales/reviewController");
const { verifySales } = require("../../middleware/authMiddleware");

// @route   GET /api/sales/reviews
// @desc    Get all reviews
// @access  Private (Sales/Admin)
router.get("/", verifySales, getAllReviews);

// @route   POST /api/sales/reviews/:id/reply
// @desc    Post or update reply to a customer review
// @access  Private (Sales/Admin)
router.post("/:id/reply", verifySales, replyToReview);

module.exports = router;
