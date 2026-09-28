const prisma = require("../../config/db");
const { sendOrderReceiptEmail } = require("../../utils/emailService");

const HARDCODED_SHIPPING_FEE = 100;

// Helper to determine payment mode description and status
const resolvePaymentInfo = (paymentMode, cardDetails, gcashNumber, paymentPlan, paymentChannel) => {
  const mode = (paymentMode || '').trim();
  const plan = paymentPlan || (mode.toLowerCase().includes('50%') || mode.toLowerCase().includes('cash on delivery') ? 'COD_50' : 'FULL_PAYMENT');
  const channel = paymentChannel || (cardDetails && cardDetails.cardNumber ? 'Card' : gcashNumber ? 'GCash' : (mode.toLowerCase().includes('card') ? 'Card' : 'Card'));

  let channelDetails = '';
  if (channel === 'Card' || (cardDetails && cardDetails.cardNumber)) {
    const rawNumber = (cardDetails?.cardNumber || '').replace(/\D/g, '');
    let brand = 'Card';
    if (/^4/.test(rawNumber)) brand = 'Visa';
    else if (/^(5[1-5]|2[2-7])/.test(rawNumber)) brand = 'Mastercard';
    else if (/^3[47]/.test(rawNumber)) brand = 'American Express';
    else if (/^(?:2131|1800|35)/.test(rawNumber)) brand = 'JCB';

    const last4 = rawNumber.slice(-4) || '••••';
    channelDetails = `Bank Card (${brand} ending in ${last4})`;
  } else if (channel === 'GCash' || gcashNumber) {
    const cleanGcash = (gcashNumber || '').trim();
    channelDetails = `GCash (${cleanGcash || 'Verified'})`;
  } else {
    channelDetails = 'Bank Transfer';
  }

  if (plan === 'COD_50') {
    return {
      paymentMode: `Cash on Delivery (50% Downpayment via ${channelDetails}, 50% on Delivery)`,
      paymentStatus: '50% Downpayment Paid'
    };
  }

  return {
    paymentMode: `Bank Transfer - Full Payment (${channelDetails})`,
    paymentStatus: 'paid'
  };
};

// Create a new order from checkout
const createOrder = async (req, res) => {
  const {
    userId,
    productId,
    variantId,      // Optional variant selection
    quantity,
    paymentMode,
    paymentPlan,
    paymentChannel,
    cardDetails,
    gcashNumber,
    fulfillmentType,
    customerEmail,
    shippingName,
    shippingContactNumber,
    shippingAddress,
    shippingCity,
    shippingProvince,
    shippingZipCode,
    notes,
    color
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

    const itemsTotal = unitPrice * parseInt(quantity);
    const shippingFee = parseFloat(req.body.shippingFee) || HARDCODED_SHIPPING_FEE;
    const total = itemsTotal + shippingFee;

    const { paymentMode: finalPaymentMode, paymentStatus: finalPaymentStatus } = resolvePaymentInfo(
      paymentMode,
      cardDetails,
      gcashNumber,
      paymentPlan,
      paymentChannel
    );

    // Create order + item + deduct stock in a transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: parseInt(userId),
          total,
          status: "pending",
          paymentStatus: finalPaymentStatus,
          paymentMode: finalPaymentMode,
          fulfillmentType: fulfillmentType || "Delivery",
          customerName: shippingName || req.body.customerName || null,
          customerEmail,
          shippingName,
          shippingContactNumber,
          shippingAddress,
          shippingCity,
          shippingProvince,
          shippingZipCode,
          notes,
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          items: {
            create: {
              productId: parseInt(productId),
              variantId: parsedVariantId,
              variantName,       // Snapshot stored for order history
              quantity: parseInt(quantity),
              price: unitPrice,
              color: color || null,
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

    // Fetch full order for receipt email and response
    const fullOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, type: true } },
            variant: { select: { id: true, name: true, price: true } }
          }
        },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    const targetEmail = customerEmail || fullOrder?.user?.email;
    if (targetEmail && fullOrder) {
      sendOrderReceiptEmail(targetEmail, fullOrder).catch((err) => {
        console.error("[RECEIPT EMAIL DISPATCH ERROR]:", err.message);
      });
    }

    res.status(201).json({ success: true, data: fullOrder || newOrder });
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
    paymentPlan,
    paymentChannel,
    cardDetails,
    gcashNumber,
    fulfillmentType,
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

  const { paymentMode: finalPaymentMode, paymentStatus: finalPaymentStatus } = resolvePaymentInfo(
    paymentMode,
    cardDetails,
    gcashNumber,
    paymentPlan,
    paymentChannel
  );

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
          price: unitPrice,
          color: item.color || null
        });
      }

      const shippingFee = parseFloat(req.body.shippingFee) || HARDCODED_SHIPPING_FEE;
      const finalTotal = totalAmount + shippingFee;

      const order = await tx.order.create({
        data: {
          userId: parseInt(userId),
          total: finalTotal,
          status: "pending",
          paymentStatus: finalPaymentStatus,
          paymentMode: finalPaymentMode,
          fulfillmentType: fulfillmentType || "Delivery",
          customerName: shippingName || req.body.customerName || null,
          customerEmail,
          shippingName,
          shippingContactNumber,
          shippingAddress,
          shippingCity,
          shippingProvince,
          shippingZipCode,
          notes,
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          items: {
            create: orderItemsData
          }
        }
      });

      return order;
    });

    // Fetch full order for receipt email and response
    const fullOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, type: true } },
            variant: { select: { id: true, name: true, price: true } }
          }
        },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    const targetEmail = customerEmail || fullOrder?.user?.email;
    if (targetEmail && fullOrder) {
      sendOrderReceiptEmail(targetEmail, fullOrder).catch((err) => {
        console.error("[RECEIPT EMAIL DISPATCH ERROR]:", err.message);
      });
    }

    res.status(201).json({ success: true, data: fullOrder || newOrder });
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
