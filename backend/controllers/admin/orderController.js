const prisma = require("../../config/db");
const EstimatedDeliveryValidator = require("../../utils/EstimatedDeliveryValidator");


const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: { select: { name: true, type: true } },
            variant: { select: { name: true } }
          }
        }
      }
    });

    const formattedOrders = orders.map(o => {
      
      const productsSummary = o.items.map(item => {
        const variantLabel = item.variantName || item.variant?.name;
        const suffix = variantLabel ? ` — ${variantLabel}` : "";
        return `${item.product.name}${suffix} (x${item.quantity})`;
      }).join(", ");

      return {
        id: `#ORD-${o.id.toString().padStart(3, "0")}`,
        rawId: o.id,
        customerName: o.customerName || o.user.name,
        customerEmail: o.customerEmail || o.user.email,
        productsSummary,
        totalQuantity: o.items.reduce((acc, item) => acc + item.quantity, 0),
        totalAmount: o.total,
        orderStatus: o.status,
        paymentStatus: o.paymentStatus,
        paymentMode: o.paymentMode || 'Cash on Delivery',
        deliveryStatus: o.status === "shipped" || o.status === "completed" || o.status === "delivered" || o.status === "out_for_delivery" ? o.status.replace(/_/g, " ") : "Pending",
        estimatedDeliveryDate: o.estimatedDeliveryDate,
        dateOrdered: new Date(o.createdAt).toISOString(),
        contactNumber: o.contactNumber,
        address: o.address,
        cityProvince: o.cityProvince,
        zipCode: o.zipCode,
        notes: o.notes,
        
        items: o.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          productType: item.product.type,
          variantName: item.variantName || item.variant?.name || null,
          quantity: item.quantity,
          price: item.price,
        }))
      };
    });

    res.status(200).json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};


const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus, estimatedDeliveryDate } = req.body;
  try {
    const existingOrder = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!existingOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (estimatedDeliveryDate !== undefined) {
      const validation = EstimatedDeliveryValidator.validateUpdate(existingOrder.status, estimatedDeliveryDate);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: validation.message });
      }
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (estimatedDeliveryDate !== undefined) updateData.estimatedDeliveryDate = estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null;

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Failed to update order:", error);
    res.status(500).json({ success: false, error: "Failed to update order" });
  }
};

module.exports = {
  getOrders,
  updateOrderStatus
};
