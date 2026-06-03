const prisma = require("../../config/db");

// Create a new order from checkout
const createOrder = async (req, res) => {
  const {
    userId,
    productId,
    variantId,      // NEW: Optional variant selection
    quantity,
    paymentMode,
    customerName,
    customerEmail,
    contactNumber,
    address,
    cityProvince,
    zipCode,
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
          customerName,
          customerEmail,
          contactNumber,
          address,
          cityProvince,
          zipCode,
          notes,
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
        // Deduct from variant stock
        await tx.productVariant.update({
          where: { id: parsedVariantId },
          data: { stock: { decrement: parseInt(quantity) } }
        });
      } else {
        // Deduct from product stock
        await tx.product.update({
          where: { id: parseInt(productId) },
          data: { stock: { decrement: parseInt(quantity) } }
        });
      }

      return order;
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error("Failed to create order:", error);
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

    res.status(200).json({ success: true, data: order });
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

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders
};
