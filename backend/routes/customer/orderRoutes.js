const express = require("express");
const router = express.Router();
const { createOrder, getOrderById, getMyOrders } = require("../../controllers/customer/orderController");
const { verifyToken } = require("../../middleware/authMiddleware");

router.post("/", createOrder);
router.get("/my", verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);

module.exports = router;
