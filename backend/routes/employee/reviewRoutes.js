const express = require("express");
const router = express.Router();
const { getAllReviews, replyToReview } = require("../../controllers/employee/reviewController");
const { verifyEmployee } = require("../../middleware/authMiddleware");

// @route   GET /api/employee/reviews
// @desc    Get all reviews
// @access  Private (Employee/Admin)
router.get("/", verifyEmployee, getAllReviews);

// @route   POST /api/employee/reviews/:id/reply
// @desc    Post or update reply to a customer review
// @access  Private (Employee/Admin)
router.post("/:id/reply", verifyEmployee, replyToReview);

module.exports = router;
