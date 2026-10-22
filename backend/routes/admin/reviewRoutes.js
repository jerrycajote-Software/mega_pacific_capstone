const express = require("express");
const router = express.Router();
const { getAllReviews } = require("../../controllers/sales/reviewController");
const { verifyAdmin } = require("../../middleware/authMiddleware");


router.get("/", verifyAdmin, getAllReviews);

module.exports = router;
