const express = require("express");
const router = express.Router();
const { getOrders, updateOrderStatus } = require("../../controllers/admin/orderController");

router.get("/", getOrders);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
