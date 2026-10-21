const express = require('express');
const router = express.Router();
const { verifyFinance } = require('../middleware/authMiddleware');
const { getFinanceOrders, verifyPayment } = require('../controllers/finance/orderController');

const { getDashboardData, getFinancialReports, getExpenses, createExpense, getDeliverySettings, updateDeliverySettings } = require('../controllers/finance/financeController');
const { getRefunds, getRefundStats, processRefund } = require('../controllers/finance/refundController');

router.get('/dashboard', verifyFinance, getDashboardData);

router.get('/reports', verifyFinance, getFinancialReports);

router.get('/orders', verifyFinance, getFinanceOrders);
router.patch('/orders/:id/verify', verifyFinance, verifyPayment);

router.get('/refunds', verifyFinance, getRefunds);
router.get('/refunds/stats', verifyFinance, getRefundStats);
router.patch('/refunds/:id/process', verifyFinance, processRefund);
router.post('/refunds/:id/process', verifyFinance, processRefund);

router.get('/expenses', verifyFinance, getExpenses);
router.post('/expenses', verifyFinance, createExpense);

router.get('/delivery-settings', verifyFinance, getDeliverySettings);
router.put('/delivery-settings', verifyFinance, updateDeliverySettings);

router.get('/payments', verifyFinance, (req, res) => {
  res.json({ success: true, message: 'Payments data' });
});

module.exports = router;
