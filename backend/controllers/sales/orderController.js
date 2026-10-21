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
        const spec = [
          item.customLength ? `${item.customLength}m` : null,
          item.thickness || item.variantName || item.variant?.name,
          item.color
        ].filter(Boolean).join(" · ");
        const suffix = spec ? ` — ${spec}` : "";
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
        contactNumber: o.shippingContactNumber,
        address: o.shippingAddress,
        cityProvince: o.shippingProvince ? `${o.shippingCity || ''}, ${o.shippingProvince}` : o.shippingCity,
        zipCode: o.shippingZipCode,
        notes: o.notes,
        items: o.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          productType: item.product.type,
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

const rejectOrder = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { email: true } } }
    });
    if (!existingOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (existingOrder.status !== "pending") {
      return res.status(400).json({ success: false, error: "Only pending orders can be rejected or cancelled" });
    }

    let refundableAmount = existingOrder.total;
    const pStatus = (existingOrder.paymentStatus || '').toLowerCase();
    if (pStatus.includes('50%')) {
      refundableAmount = Math.round(existingOrder.total * 0.5 * 100) / 100;
    } else if (pStatus === 'unpaid') {
      refundableAmount = 0;
    }

    const { updatedOrder, refund } = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: parseInt(id) },
        data: {
          status: "rejected",
          paymentStatus: refundableAmount > 0 ? "refund_pending" : existingOrder.paymentStatus,
          statusUpdatedAt: new Date(),
          notes: reason ? `${existingOrder.notes ? existingOrder.notes + ' | ' : ''}Rejection Reason: ${reason}` : existingOrder.notes
        }
      });

      const ref = await tx.refund.upsert({
        where: { orderId: parseInt(id) },
        create: {
          orderId: parseInt(id),
          userId: existingOrder.userId,
          amount: refundableAmount,
          paymentMethod: existingOrder.paymentMode || 'Cash on Delivery',
          reason: reason || 'Order rejected by Sales staff',
          status: 'pending'
        },
        update: {
          amount: refundableAmount,
          paymentMethod: existingOrder.paymentMode || 'Cash on Delivery',
          reason: reason || 'Order rejected by Sales staff',
          status: 'pending'
        }
      });

      return { updatedOrder: ord, refund: ref };
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("order_status_updated", {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus
      });
      io.emit("new_refund_request", {
        refundId: refund.id,
        orderId: updatedOrder.id,
        orderNumber: `#ORD-${String(updatedOrder.id).padStart(3, '0')}`,
        customerName: existingOrder.customerName || existingOrder.shippingName || "Customer",
        customerEmail: existingOrder.customerEmail || existingOrder.user?.email,
        amount: refund.amount,
        paymentMethod: refund.paymentMethod,
        reason: refund.reason,
        createdAt: refund.createdAt
      });
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
      refund,
      message: "Order rejected and recorded in Finance refund list for disbursement."
    });
  } catch (error) {
    console.error("Failed to reject order:", error);
    res.status(500).json({ success: false, error: "Failed to reject order" });
  }
};

module.exports = {
  getSalesOrders,
  approveOrder,
  rejectOrder
};
