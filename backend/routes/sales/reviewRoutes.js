const express = require("express");
const router = express.Router();
const { getAllReviews, replyToReview } = require("../../controllers/sales/reviewController");
const { verifySales } = require("../../middleware/authMiddleware");

router.get("/", verifySales, getAllReviews);

router.post("/:id/reply", verifySales, replyToReview);

module.exports = router;
