const express = require('express');
const router = express.Router();
const { verifyFinance } = require('../middleware/authMiddleware');
const { getFinanceOrders, verifyPayment } = require('../controllers/finance/orderController');

const { getDashboardData, getFinancialReports, getExpenses, createExpense } = require('../controllers/finance/financeController');

// Dashboard Overview
router.get('/dashboard', verifyFinance, getDashboardData);

// Financial Reports
router.get('/reports', verifyFinance, getFinancialReports);

// Finance Order Routes
router.get('/orders', verifyFinance, getFinanceOrders);
router.patch('/orders/:id/verify', verifyFinance, verifyPayment);

// Expenses Routes
router.get('/expenses', verifyFinance, getExpenses);
router.post('/expenses', verifyFinance, createExpense);

// Other routes
router.get('/payments', verifyFinance, (req, res) => {
  res.json({ success: true, message: 'Payments data' });
});

module.exports = router;
