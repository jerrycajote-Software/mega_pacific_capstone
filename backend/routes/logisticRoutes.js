const express = require('express');
const router = express.Router();
const { verifyLogistic } = require('../middleware/authMiddleware');
const { getLogisticOrders, updateLogisticStatus } = require('../controllers/logistic/orderController');

// Dashboard Overview
router.get('/dashboard', verifyLogistic, (req, res) => {
  res.json({ success: true, message: 'Logistic dashboard data' });
});

// Logistic Order Routes
router.get('/orders', verifyLogistic, getLogisticOrders);
router.patch('/orders/:id/status', verifyLogistic, updateLogisticStatus);

// Other placeholder routes for now
router.get('/deliveries', verifyLogistic, (req, res) => {
  res.json({ success: true, message: 'Deliveries data' });
});

router.get('/shipments', verifyLogistic, (req, res) => {
  res.json({ success: true, message: 'Shipments data' });
});

router.get('/products', verifyLogistic, (req, res) => {
  res.json({ success: true, message: 'Products data' });
});

module.exports = router;
