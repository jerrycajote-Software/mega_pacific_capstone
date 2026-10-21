const express = require("express");
const { getSalesOrders, approveOrder, rejectOrder } = require("../../controllers/sales/orderController");
const { verifySales } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifySales, getSalesOrders);
router.patch("/:id/approve", verifySales, approveOrder);
router.patch("/:id/reject", verifySales, rejectOrder);

module.exports = router;
