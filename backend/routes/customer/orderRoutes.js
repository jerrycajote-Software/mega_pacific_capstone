const express = require("express");
const { verifyToken } = require("../../middleware/authMiddleware");
const { createOrder, createBulkOrder, getOrderById, getMyOrders } = require("../../controllers/customer/orderController");

const router = express.Router();

router.post("/", verifyToken, createOrder);
router.post("/bulk", verifyToken, createBulkOrder);
router.get("/my", verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);

module.exports = router;
