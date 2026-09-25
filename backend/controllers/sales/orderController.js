const prisma = require("../../config/db");
const { checkAndExtendDeliveryDates } = require("../../utils/deliveryHelper");

const getSalesOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
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
    console.error("Failed to fetch sales orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

const approveOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const existingOrder = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!existingOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (existingOrder.status !== "pending") {
      return res.status(400).json({ success: false, error: "Only pending orders can be approved by sales" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: "sales_approved" }
    });
    
    // Emit socket event if io is available
    const io = req.app.get("io");
    if (io) {
      io.emit("order_status_updated", { orderId: updatedOrder.id, status: updatedOrder.status });
    }

    res.status(200).json({ success: true, data: updatedOrder, message: "Order approved and forwarded to Finance." });
  } catch (error) {
    console.error("Failed to approve order:", error);
    res.status(500).json({ success: false, error: "Failed to approve order" });
  }
};

module.exports = {
  getSalesOrders,
  approveOrder
};
