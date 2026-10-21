const express = require("express");
const router = express.Router();
const { getOrders, updateOrderStatus } = require("../../controllers/admin/orderController");
const { verifyAdmin } = require("../../middleware/authMiddleware");

router.get("/", verifyAdmin, getOrders);
router.patch("/:id/status", verifyAdmin, updateOrderStatus);

module.exports = router;
