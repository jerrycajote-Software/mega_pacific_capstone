const express = require("express");
const router = express.Router();
const { submitReview, getProductReviews, checkReviewEligibility } = require("../../controllers/customer/reviewController");
const { verifyToken } = require("../../middleware/authMiddleware");

router.post("/", verifyToken, submitReview);

router.get("/eligibility/:productId", verifyToken, checkReviewEligibility);

router.get("/product/:productId", getProductReviews);

module.exports = router;
