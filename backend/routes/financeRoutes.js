const express = require('express');
const router = express.Router();
const { verifyFinance } = require('../middleware/authMiddleware');
const { getFinanceOrders, verifyPayment } = require('../controllers/finance/orderController');

// Dashboard Overview
router.get('/dashboard', verifyFinance, (req, res) => {
  res.json({ success: true, message: 'Finance dashboard data' });
});

// Finance Order Routes
router.get('/orders', verifyFinance, getFinanceOrders);
router.patch('/orders/:id/verify', verifyFinance, verifyPayment);

// Other placeholder routes for now
router.get('/expenses', verifyFinance, (req, res) => {
  res.json({ success: true, message: 'Expenses data' });
});

router.get('/payments', verifyFinance, (req, res) => {
  res.json({ success: true, message: 'Payments data' });
});

router.get('/reports', verifyFinance, (req, res) => {
  res.json({ success: true, message: 'Reports data' });
});

module.exports = router;
