const prisma = require('../../config/db');

// Get current user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: true
          }
        },
        variant: true
      }
    });

    res.json({ success: true, data: cartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cart items' });
  }
};

// Add or update a cart item
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variantId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ success: false, error: 'Product ID and quantity are required' });
    }

    // Check if the product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check if variant exists if variantId is provided
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || variant.productId !== productId) {
        return res.status(404).json({ success: false, error: 'Variant not found' });
      }
    }

    // Find existing cart item for this product/variant combination
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        variantId: variantId || null,
      }
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true, variant: true }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          variantId: variantId || null,
          quantity
        },
        include: { product: true, variant: true }
      });
    }

    res.json({ success: true, data: cartItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Failed to add item to cart' });
  }
};

// Update cart item quantity (absolute quantity, not additive)
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: 'Invalid quantity' });
    }

    // Verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity }
    });

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ success: false, error: 'Failed to update quantity' });
  }
};

// Remove a specific cart item
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ success: false, error: 'Failed to remove item from cart' });
  }
};

// Clear the entire cart for a user
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.cartItem.deleteMany({
      where: { userId }
    });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, error: 'Failed to clear cart' });
  }
};

// Sync local storage cart to database
exports.syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // Expecting array of { productId, variantId, quantity }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Invalid items array' });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity) continue;

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId,
          productId: item.productId,
          variantId: item.variantId || null,
        }
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity
          }
        });
      }
    }

    // Return the newly merged cart
    const updatedCart = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: true
          }
        },
        variant: true
      }
    });

    res.json({ success: true, data: updatedCart });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ success: false, error: 'Failed to sync cart' });
  }
};
