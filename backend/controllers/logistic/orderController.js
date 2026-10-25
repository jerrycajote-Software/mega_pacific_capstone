const prisma = require("../../config/db");
const { checkAndExtendDeliveryDates } = require("../../utils/deliveryHelper");
const { sendReadyForPickupEmail } = require("../../utils/emailService");

const getLogisticOrders = async (req, res) => {
  try {
    
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
        const spec = [
          item.customLength ? `${item.customLength}m` : null,
          item.thickness || item.variantName || item.variant?.name,
          item.color
        ].filter(Boolean).join(" · ");
        const suffix = spec ? ` — ${spec}` : "";
        return `${item.product.name}${suffix} (x${item.quantity})`;
      }).join(", ");

      return {
        id: `#ORD-${o.id.toString().padStart(4, "0")}`,
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
        address: o.shippingAddress,
        cityProvince: o.shippingProvince ? `${o.shippingCity || ''}, ${o.shippingProvince}` : o.shippingCity,
        zipCode: o.shippingZipCode,
        items: o.items.map(item => ({
          productName: item.product.name,
          variantName: item.variantName || item.variant?.name || null,
          customLength: item.customLength,
          thickness: item.thickness,
          color: item.color,
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
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            customerProfile: { select: { name: true } }
          }
        },
        items: {
          include: {
            product: { select: { name: true, type: true } },
            variant: { select: { name: true } }
          }
        }
      }
    });

    if (!existingOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (existingOrder.status === "pending" || existingOrder.status === "sales_approved") {
      return res.status(400).json({ success: false, error: "Order is not yet ready for logistics" });
    }
    
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
      data: {
        status,
        statusUpdatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            customerProfile: { select: { name: true } }
          }
        },
        items: {
          include: {
            product: { select: { name: true, type: true } },
            variant: { select: { name: true } }
          }
        }
      }
    });

    const io = req.app.get("io");
    if (io) {
      const orderNumber = `#ORD-${updatedOrder.id.toString().padStart(4, "0")}`;
      const payload = {
        orderId: updatedOrder.id,
        orderNumber,
        status: updatedOrder.status,
        fulfillmentType: updatedOrder.fulfillmentType,
        customerName: updatedOrder.customerName || updatedOrder.shippingName || updatedOrder.user?.customerProfile?.name || updatedOrder.user?.name,
        pickupLocation: "379 Aguinaldo Highway Anabu 1-C, Imus City, Cavite",
        message: status === "ready_for_pickup"
          ? `Order ${orderNumber} is ready for pick-up!`
          : `Order ${orderNumber} status updated to ${status.replace(/_/g, " ")}.`
      };

      io.emit("order_status_updated", payload);
      if (status === "ready_for_pickup") {
        io.emit("order_ready_for_pickup", payload);
        if (updatedOrder.userId) {
          io.to(`user_${updatedOrder.userId}`).emit("order_ready_for_pickup", payload);
        }
      }
    }

    if (status === "ready_for_pickup") {
      const targetEmail = updatedOrder.customerEmail || (updatedOrder.user && updatedOrder.user.email);
      if (targetEmail) {
        sendReadyForPickupEmail(targetEmail, updatedOrder).catch(err => {
          console.error("Failed to send ready for pickup email notification:", err);
        });
      }
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: status === "ready_for_pickup"
        ? `Order #${updatedOrder.id} marked Ready for Pick-up! Customer notified via email and live signal.`
        : `Order status updated to ${status}`
    });
  } catch (error) {
    console.error("Failed to update logistic status:", error);
    res.status(500).json({ success: false, error: "Failed to update order" });
  }
};

module.exports = {
  getLogisticOrders,
  updateLogisticStatus
};
