const prisma = require("../../config/db");
const { checkAndExtendDeliveryDates } = require("../../utils/deliveryHelper");
const { uploadBase64Image } = require("../../services/storageService");
const { isPartial50Order, buildOrderPaymentSummary } = require("../../services/paymentCalculationService");
const {
  notifyOrderOutForDelivery,
  notifyOrderReadyForPickup,
  notifyOrderDeliveredOrCompleted,
  notifyLogisticsStatusTransition,
  notifyFinanceBalanceCollected
} = require("../../services/notificationManagerService");

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
        user: {
          select: {
            email: true,
            customerProfile: { select: { contactNumber: true } }
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

      const paymentSummary = buildOrderPaymentSummary(o);

      return {
        id: `#ORD-${o.id.toString().padStart(4, "0")}`,
        rawId: o.id,
        customerName: o.customerName || o.shippingName || "Unknown",
        customerEmail: o.customerEmail || (o.user && o.user.email) || "Unknown",
        contactNumber: o.shippingContactNumber || o.user?.customerProfile?.contactNumber || null,
        productsSummary,
        totalQuantity: o.items.reduce((acc, item) => acc + item.quantity, 0),
        totalAmount: o.total,
        collectedAmount: paymentSummary.collectedAmount,
        pendingBalanceAmount: paymentSummary.pendingBalanceAmount,
        isPending50Payment: paymentSummary.isPending50Payment,
        paymentSummary,
        paymentProofUrl: o.paymentProofUrl || null,
        balanceConfirmedAt: o.balanceConfirmedAt || null,
        balanceConfirmedByName: o.balanceConfirmedByName || null,
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
  const { status, paymentProofImage } = req.body;
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

    const isCompletingOrder = status === "completed" || status === "delivered";
    const needsBalanceCollection = isPartial50Order(existingOrder);

    if (existingOrder.status === status && !(isCompletingOrder && needsBalanceCollection)) {
      return res.status(200).json({
        success: true,
        data: {
          ...existingOrder,
          paymentSummary: buildOrderPaymentSummary(existingOrder)
        },
        message: `Order #${existingOrder.id} is already marked as ${status.replace(/_/g, " ")}.`
      });
    }

    if (isCompletingOrder && needsBalanceCollection && !paymentProofImage && !existingOrder.paymentProofUrl) {
      return res.status(400).json({
        success: false,
        error: "Please attach a clear photo showing the customer's remaining 50% balance payment before confirming full payment."
      });
    }

    let uploadedProofUrl = existingOrder.paymentProofUrl || null;
    if (paymentProofImage) {
      try {
        uploadedProofUrl = await uploadBase64Image(paymentProofImage, "payment-proofs");
      } catch (uploadErr) {
        console.error("Failed to upload logistics payment proof image:", uploadErr);
        return res.status(400).json({
          success: false,
          error: "Failed to upload payment proof photo. Please retake or upload a smaller image."
        });
      }
    }

    const updateData = {
      status,
      statusUpdatedAt: new Date()
    };

    if (uploadedProofUrl) {
      updateData.paymentProofUrl = uploadedProofUrl;
    }

    if (isCompletingOrder && needsBalanceCollection) {
      updateData.paymentStatus = "paid";
      updateData.balanceConfirmedAt = new Date();
      updateData.balanceConfirmedById = req.user?.userId || req.user?.id || null;
      updateData.balanceConfirmedByName = req.user?.name || req.user?.email || "Logistics Staff";
    }

    const orderId = parseInt(id, 10);

    // Atomically verify the order is still in the expected status before transitioning
    const claimed = await prisma.order.updateMany({
      where: { id: orderId, status: existingOrder.status },
      data: updateData
    });

    if (claimed.count === 0) {
      const latestOrder = await prisma.order.findUnique({ where: { id: orderId } });
      if (latestOrder && latestOrder.status === status) {
        return res.status(200).json({
          success: true,
          data: {
            ...latestOrder,
            paymentSummary: buildOrderPaymentSummary(latestOrder)
          },
          message: `Order #${latestOrder.id} was already updated to ${status.replace(/_/g, " ")}.`
        });
      }
      return res.status(409).json({
        success: false,
        error: `This order was already updated by another staff member (current status: ${latestOrder?.status || "unknown"}). Please refresh.`
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
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
    const paymentSummary = buildOrderPaymentSummary(updatedOrder);
    if (io) {
      const orderNumber = `#ORD-${updatedOrder.id.toString().padStart(4, "0")}`;
      const payload = {
        orderId: updatedOrder.id,
        orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        paymentSummary,
        paymentProofUrl: updatedOrder.paymentProofUrl || null,
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

      if (isCompletingOrder && needsBalanceCollection) {
        io.emit("order_payment_completed", {
          orderId: updatedOrder.id,
          orderNumber,
          totalAmount: updatedOrder.total,
          paymentProofUrl: updatedOrder.paymentProofUrl,
          confirmedBy: updatedOrder.balanceConfirmedByName,
          confirmedAt: updatedOrder.balanceConfirmedAt
        });
        notifyFinanceBalanceCollected({ io, order: updatedOrder });
      }

      notifyLogisticsStatusTransition({ io, order: updatedOrder });
    }

    // Dispatch Gmail and real-time browser notifications via NotificationManager
    if (status === "out_for_delivery") {
      notifyOrderOutForDelivery({ io, order: updatedOrder }).catch(err => {
        console.error("Failed to send out-for-delivery notification:", err);
      });
    } else if (status === "ready_for_pickup") {
      notifyOrderReadyForPickup({ io, order: updatedOrder }).catch(err => {
        console.error("Failed to send ready-for-pickup notification:", err);
      });
    } else if (status === "delivered" || status === "completed") {
      notifyOrderDeliveredOrCompleted({ io, order: updatedOrder }).catch(err => {
        console.error("Failed to send completed/delivered notification:", err);
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...updatedOrder,
        paymentSummary
      },
      message: isCompletingOrder && needsBalanceCollection
        ? `Order #${updatedOrder.id} marked completed and remaining 50% payment confirmed with photo proof!`
        : status === "ready_for_pickup"
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
