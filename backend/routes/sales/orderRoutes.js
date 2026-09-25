const express = require("express");
const { getSalesOrders, approveOrder } = require("../../controllers/sales/orderController");
const { verifySales } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifySales, getSalesOrders);
router.patch("/:id/approve", verifySales, approveOrder);

module.exports = router;
