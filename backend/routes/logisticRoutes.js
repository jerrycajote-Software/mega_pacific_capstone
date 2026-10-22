const express = require('express');
const router = express.Router();
const { verifyLogistic, verifyStaff } = require('../middleware/authMiddleware');
const { getLogisticOrders, updateLogisticStatus } = require('../controllers/logistic/orderController');
const { getDashboardData } = require('../controllers/logistic/logisticController');
const {
  getCoils,
  getCoilSummary,
  deductCoil,
  restockCoil,
  getCoilLogs,
  addCoil
} = require('../controllers/logistic/coilController');

router.get('/dashboard', verifyLogistic, getDashboardData);

router.get('/orders', verifyLogistic, getLogisticOrders);
router.patch('/orders/:id/status', verifyLogistic, updateLogisticStatus);

router.get('/coils', verifyStaff, getCoils);
router.post('/coils', verifyLogistic, addCoil);
router.get('/coils/summary', verifyStaff, getCoilSummary);
router.post('/coils/deduct', verifyLogistic, deductCoil);
router.post('/coils/restock', verifyLogistic, restockCoil);
router.get('/coils/logs', verifyStaff, getCoilLogs);

router.get('/deliveries', verifyLogistic, (req, res) => {
  res.json({ success: true, message: 'Deliveries data' });
});

router.get('/products', verifyLogistic, (req, res) => {
  res.json({ success: true, message: 'Products data' });
});

module.exports = router;
