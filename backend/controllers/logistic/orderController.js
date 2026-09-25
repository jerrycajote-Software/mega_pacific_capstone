const prisma = require("../../config/db");
const { checkAndExtendDeliveryDates } = require("../../utils/deliveryHelper");

const getLogisticOrders = async (req, res) => {
  try {
    // Logistics mainly sees orders that have been finance_verified or are in transit
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["finance_verified", "processing", "shipped", "out_for_delivery", "ready_for_pickup", "completed", "delivered"]
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        items: {
          include: {
            product: { select: { name: true, type: true } },
            variant: { select: { name: true } }
          }
        }
      }
    });

    const updatedOrders = await checkAndExtendDeliveryDates(orders);

    const formattedOrders = updatedOrders.map(o => {
      const productsSummary = o.items.map(item => {
        const variantLabel = item.variantName || item.variant?.name;
        const suffix = variantLabel ? ` — ${variantLabel}` : "";
        return `${item.product.name}${suffix} (x${item.quantity})`;
      }).join(", ");

      return {
        id: `#ORD-${o.id.toString().padStart(3, "0")}`,
        rawId: o.id,
        customerName: o.customerName || (o.user && o.user.name) || "Unknown",
        customerEmail: o.customerEmail || (o.user && o.user.email) || "Unknown",
        productsSummary,
        totalQuantity: o.items.reduce((acc, item) => acc + item.quantity, 0),
        totalAmount: o.total,
        orderStatus: o.status,
        paymentStatus: o.paymentStatus,
        paymentMode: o.paymentMode || 'Cash on Delivery',
        fulfillmentType: o.fulfillmentType,
        deliveryStatus: o.status === "shipped" || o.status === "completed" || o.status === "delivered" || o.status === "out_for_delivery" ? o.status.replace(/_/g, " ") : "Pending",
        estimatedDeliveryDate: o.estimatedDeliveryDate,
        dateOrdered: new Date(o.createdAt).toISOString(),
        address: o.address,
        cityProvince: o.cityProvince,
        zipCode: o.zipCode,
        items: o.items.map(item => ({
          productName: item.product.name,
          variantName: item.variantName || item.variant?.name || null,
          quantity: item.quantity,
          price: item.price,
        }))
      };
    });

    res.status(200).json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error("Failed to fetch logistic orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

const updateLogisticStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const existingOrder = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!existingOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (existingOrder.status === "pending" || existingOrder.status === "sales_approved") {
      return res.status(400).json({ success: false, error: "Order is not yet ready for logistics" });
    }
    
    // allow valid transitions for Delivery or Pickup
    const validDeliveryStatuses = ["shipped", "out_for_delivery", "completed", "delivered"];
    const validPickupStatuses = ["ready_for_pickup", "completed"];
    
    const isDelivery = existingOrder.fulfillmentType === "Delivery";
    
    if (isDelivery && !validDeliveryStatuses.includes(status)) {
       return res.status(400).json({ success: false, error: "Invalid status for Delivery order" });
    }
    
    if (!isDelivery && !validPickupStatuses.includes(status)) {
       return res.status(400).json({ success: false, error: "Invalid status for Pickup order" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("order_status_updated", { orderId: updatedOrder.id, status: updatedOrder.status });
    }

    res.status(200).json({ success: true, data: updatedOrder, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error("Failed to update logistic status:", error);
    res.status(500).json({ success: false, error: "Failed to update order" });
  }
};

module.exports = {
  getLogisticOrders,
  updateLogisticStatus
};
