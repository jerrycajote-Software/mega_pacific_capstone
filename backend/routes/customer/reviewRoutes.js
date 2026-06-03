const express = require("express");
const router = express.Router();
const { submitReview, getProductReviews } = require("../../controllers/customer/reviewController");
const { verifyToken } = require("../../middleware/authMiddleware");

// @route   POST /api/customer/reviews
// @desc    Submit a product review
// @access  Private
router.post("/", verifyToken, submitReview);

// @route   GET /api/customer/reviews/product/:productId
// @desc    Get all reviews for a specific product
// @access  Public (or Private depending on needs, assuming Public to view)
router.get("/product/:productId", getProductReviews);

module.exports = router;
