const prisma = require("../../config/db");

// Create a new order from checkout
const createOrder = async (req, res) => {
  const {
    userId,
    productId,
    variantId,      // NEW: Optional variant selection
    quantity,
    paymentMode,
    customerEmail,
    shippingName,
    shippingContactNumber,
    shippingAddress,
    shippingCity,
    shippingProvince,
    shippingZipCode,
    notes
  } = req.body;

  try {
    // Fetch the product
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    let unitPrice;
    let variantName = null;
    const parsedVariantId = variantId ? parseInt(variantId) : null;

    if (parsedVariantId) {
      // Variant-based order: validate variant and check its stock
      const variant = await prisma.productVariant.findUnique({
        where: { id: parsedVariantId }
      });

      if (!variant) {
        return res.status(404).json({ success: false, error: "Product variant not found" });
      }

      if (variant.status === "out_of_stock" || variant.stock < parseInt(quantity)) {
        return res.status(400).json({ success: false, error: "Insufficient stock for selected variant" });
      }

      unitPrice = variant.price;
      variantName = variant.name; // Snapshot the variant name
    } else {
      // Base product order: check product stock
      if (product.stock < parseInt(quantity)) {
        return res.status(400).json({ success: false, error: "Insufficient stock" });
      }
      unitPrice = product.price;
    }

    const total = unitPrice * parseInt(quantity);

    // Create order + item + deduct stock in a transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: parseInt(userId),
          total,
          status: "pending",
          paymentStatus: "unpaid",
          paymentMode,
          customerEmail,
          shippingName,
          shippingContactNumber,
          shippingAddress,
          shippingCity,
          shippingProvince,
          shippingZipCode,
          notes,
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Default 2 days delivery
          items: {
            create: {
              productId: parseInt(productId),
              variantId: parsedVariantId,
              variantName,       // Snapshot stored for order history
              quantity: parseInt(quantity),
              price: unitPrice,
            }
          }
        }
      });

      if (parsedVariantId) {
        // Deduct from variant stock atomically
        const updated = await tx.productVariant.updateMany({
          where: { id: parsedVariantId, stock: { gte: parseInt(quantity) } },
          data: { stock: { decrement: parseInt(quantity) } }
        });
        if (updated.count === 0) {
          const current = await tx.productVariant.findUnique({ where: { id: parsedVariantId } });
          throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: quantity };
        }
      } else {
        // Deduct from product stock atomically
        const updated = await tx.product.updateMany({
          where: { id: parseInt(productId), stock: { gte: parseInt(quantity) } },
          data: { stock: { decrement: parseInt(quantity) } }
        });
        if (updated.count === 0) {
          const current = await tx.product.findUnique({ where: { id: parseInt(productId) } });
          throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: quantity };
        }
      }

      return order;
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error("Failed to create order:", error);
    if (error.type === 'STOCK_ERROR') {
      return res.status(409).json({ success: false, error: 'Out of Stock', details: error });
    }
    res.status(500).json({ success: false, error: error.message || "Failed to create order" });
  }
};

// Fetch a single order by ID for the customer details page
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, type: true, imageUrl: true, imageUrls: true }
            },
            variant: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Enforce ownership — customers can only see their own orders
    if (req.user && req.user.role !== 'admin') {
      const requestingUserId = req.user.userId ?? req.user.id;
      if (order.userId !== parseInt(requestingUserId)) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }
    }

    // Fetch reviews submitted for this specific order
    const orderReviews = await prisma.review.findMany({
      where: { orderId: order.id },
      select: { productId: true }
    });
    const reviewedProductIds = orderReviews.map(r => r.productId);

    // Map items to include isReviewed status
    const itemsWithReviewStatus = order.items.map(item => ({
      ...item,
      isReviewed: reviewedProductIds.includes(item.productId)
    }));

    const orderWithReviews = {
      ...order,
      items: itemsWithReviewStatus
    };

    const { checkAndExtendDeliveryDates } = require("../../utils/deliveryHelper");
    const updatedOrder = await checkAndExtendDeliveryDates(orderWithReviews);

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    res.status(500).json({ success: false, error: "Failed to fetch order details" });
  }
};

// Fetch all orders for the currently authenticated customer
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: user ID not found in token" });
    }

    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, type: true, imageUrl: true, imageUrls: true }
            },
            variant: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const { checkAndExtendDeliveryDates } = require("../../utils/deliveryHelper");
    const updatedOrders = await checkAndExtendDeliveryDates(orders);

    res.status(200).json({ success: true, data: updatedOrders });
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

// Create a bulk order from cart checkout
const createBulkOrder = async (req, res) => {
  const {
    userId,
    items, // Array of { productId, variantId, quantity }
    paymentMode,
    customerEmail,
    shippingName,
    shippingContactNumber,
    shippingAddress,
    shippingCity,
    shippingProvince,
    shippingZipCode,
    notes
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "Order items are required" });
  }

  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const { productId, variantId, quantity } = item;
        const parsedVariantId = variantId ? parseInt(variantId) : null;
        
        const product = await tx.product.findUnique({ where: { id: parseInt(productId) } });
        if (!product) {
          throw new Error(`Product ID ${productId} not found`);
        }

        let unitPrice;
        let variantName = null;

        if (parsedVariantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: parsedVariantId } });
          if (!variant) throw new Error(`Variant ID ${parsedVariantId} not found`);
          if (variant.status === "out_of_stock" || variant.stock < parseInt(quantity)) {
            throw { type: 'STOCK_ERROR', itemName: variant.name, available: variant.stock, requested: quantity };
          }

          unitPrice = variant.price;
          variantName = variant.name;

          // Deduct variant stock atomically
          const updated = await tx.productVariant.updateMany({
            where: { id: parsedVariantId, stock: { gte: parseInt(quantity) } },
            data: { stock: { decrement: parseInt(quantity) } }
          });
          if (updated.count === 0) {
            const current = await tx.productVariant.findUnique({ where: { id: parsedVariantId } });
            throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: quantity };
          }
        } else {
          if (product.stock < parseInt(quantity)) {
            throw { type: 'STOCK_ERROR', itemName: product.name, available: product.stock, requested: quantity };
          }
          unitPrice = product.price;

          // Deduct product stock atomically
          const updated = await tx.product.updateMany({
            where: { id: parseInt(productId), stock: { gte: parseInt(quantity) } },
            data: { stock: { decrement: parseInt(quantity) } }
          });
          if (updated.count === 0) {
            const current = await tx.product.findUnique({ where: { id: parseInt(productId) } });
            throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: quantity };
          }
        }

        totalAmount += unitPrice * parseInt(quantity);
        orderItemsData.push({
          productId: parseInt(productId),
          variantId: parsedVariantId,
          variantName,
          quantity: parseInt(quantity),
          price: unitPrice
        });
      }

      const order = await tx.order.create({
        data: {
          userId: parseInt(userId),
          total: totalAmount,
          status: "pending",
          paymentStatus: "unpaid",
          paymentMode,
          customerEmail,
          shippingName,
          shippingContactNumber,
          shippingAddress,
          shippingCity,
          shippingProvince,
          shippingZipCode,
          notes,
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Default 2 days delivery
          items: {
            create: orderItemsData
          }
        }
      });

      return order;
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error("Failed to create bulk order:", error);
    if (error.type === 'STOCK_ERROR') {
      return res.status(409).json({ success: false, error: 'Out of Stock', details: error });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to create bulk order" });
  }
};

module.exports = {
  createOrder,
  createBulkOrder,
  getOrderById,
  getMyOrders
};
