const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/customer/cartController');
const { verifyToken } = require('../../middleware/authMiddleware');

// All cart routes require authentication
router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/sync', cartController.syncCart);
router.put('/:id', cartController.updateQuantity);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
