const prisma = require("../../config/db");
const { checkAndExtendDeliveryDates } = require("../../utils/deliveryHelper");

const getFinanceOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["sales_approved", "finance_verified", "processing"]
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
        customerName: o.customerName || o.shippingName || "Unknown",
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
        createdAt: o.createdAt,
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
    console.error("Failed to fetch finance orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

const verifyPayment = async (req, res) => {
  const { id } = req.params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return res.status(400).json({ success: false, error: "Invalid order ID specified." });
  }

  try {
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const currentStatus = (existingOrder.status || '').trim().toLowerCase();
    if (currentStatus === "finance_verified") {
      return res.status(200).json({
        success: true,
        data: existingOrder,
        message: "Payment is already verified and order forwarded to Logistics."
      });
    }

    if (currentStatus !== "sales_approved") {
      return res.status(400).json({
        success: false,
        error: `Only sales_approved orders can be verified by finance (current status: ${existingOrder.status})`
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "paid",
        status: "finance_verified",
        statusUpdatedAt: new Date()
      }
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("order_status_updated", { orderId: updatedOrder.id, status: updatedOrder.status });
    }

    res.status(200).json({ success: true, data: updatedOrder, message: "Payment verified and order forwarded to Logistics." });
  } catch (error) {
    console.error("Failed to verify payment:", error);
    res.status(500).json({ success: false, error: "Failed to verify payment due to an internal server error." });
  }
};

module.exports = {
  getFinanceOrders,
  verifyPayment
};
