const express = require('express');
const router = express.Router();
const { verifyLogistic } = require('../middleware/authMiddleware');
const { getLogisticOrders, updateLogisticStatus } = require('../controllers/logistic/orderController');

const { getDashboardData } = require('../controllers/logistic/logisticController');

// Dashboard Overview
router.get('/dashboard', verifyLogistic, getDashboardData);

// Logistic Order Routes
router.get('/orders', verifyLogistic, getLogisticOrders);
router.patch('/orders/:id/status', verifyLogistic, updateLogisticStatus);

// Other placeholder routes for now
router.get('/deliveries', verifyLogistic, (req, res) => {
  res.json({ success: true, message: 'Deliveries data' });
});

router.get('/products', verifyLogistic, (req, res) => {
  res.json({ success: true, message: 'Products data' });
});

module.exports = router;
