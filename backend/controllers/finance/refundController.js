const prisma = require("../../config/db");
const { sendRefundNotificationEmail } = require("../../utils/emailService");


const getRefunds = async (req, res) => {
  try {
    const { status, search } = req.query || {};

    const where = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const refunds = await prisma.refund.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: { select: { name: true, type: true } },
                variant: { select: { name: true } }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            customerProfile: { select: { name: true, contactNumber: true } }
          }
        },
        processedByUser: {
          select: {
            id: true,
            email: true,
            financeProfile: { select: { name: true } }
          }
        }
      }
    });

    const searchLower = (search || "").trim().toLowerCase();

    const formattedRefunds = refunds
      .map(r => {
        const orderNum = `#ORD-${String(r.orderId).padStart(3, "0")}`;
        const refundNum = `#REF-${String(r.id).padStart(3, "0")}`;
        const customerName = r.order?.customerName || r.order?.shippingName || r.user?.customerProfile?.name || "Customer";
        const customerEmail = r.order?.customerEmail || r.user?.email || "N/A";
        const contactNumber = r.order?.shippingContactNumber || r.user?.customerProfile?.contactNumber || "N/A";

        const itemsSummary = (r.order?.items || []).map(item => {
          const variant = item.variantName || item.variant?.name;
          const suffix = variant ? ` (${variant})` : "";
          return `${item.product?.name || "Item"}${suffix} x${item.quantity}`;
        }).join(", ");

        return {
          id: refundNum,
          rawId: r.id,
          orderId: orderNum,
          rawOrderId: r.orderId,
          customerName,
          customerEmail,
          contactNumber,
          amount: r.amount,
          orderTotal: r.order?.total || 0,
          paymentMethod: r.paymentMethod,
          reason: r.reason || "Order rejected by Sales staff",
          status: r.status,
          transactionReference: r.transactionReference,
          notes: r.notes,
          refundedAt: r.refundedAt ? new Date(r.refundedAt).toISOString() : null,
          createdAt: new Date(r.createdAt).toISOString(),
          processedBy: r.processedByUser?.financeProfile?.name || r.processedByUser?.email || null,
          itemsSummary,
          shippingAddress: r.order?.shippingAddress,
          cityProvince: r.order?.shippingProvince ? `${r.order?.shippingCity || ""}, ${r.order?.shippingProvince}` : r.order?.shippingCity
        };
      })
      .filter(r => {
        if (!searchLower) return true;
        return (
          r.id.toLowerCase().includes(searchLower) ||
          r.orderId.toLowerCase().includes(searchLower) ||
          r.customerName.toLowerCase().includes(searchLower) ||
          r.customerEmail.toLowerCase().includes(searchLower) ||
          (r.transactionReference && r.transactionReference.toLowerCase().includes(searchLower)) ||
          r.paymentMethod.toLowerCase().includes(searchLower)
        );
      });

    res.status(200).json({ success: true, data: formattedRefunds });
  } catch (error) {
    console.error("Failed to fetch finance refunds:", error);
    res.status(500).json({ success: false, error: "Failed to fetch refunds" });
  }
};

const getRefundStats = async (req, res) => {
  try {
    const allRefunds = await prisma.refund.findMany({
      select: { amount: true, status: true, refundedAt: true }
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let pendingCount = 0;
    let pendingAmount = 0;
    let completedCount = 0;
    let completedAmount = 0;
    let todayCount = 0;
    let todayAmount = 0;

    allRefunds.forEach(r => {
      if (r.status === "pending") {
        pendingCount += 1;
        pendingAmount += r.amount;
      } else if (r.status === "completed") {
        completedCount += 1;
        completedAmount += r.amount;
        if (r.refundedAt && new Date(r.refundedAt) >= startOfToday) {
          todayCount += 1;
          todayAmount += r.amount;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        pendingCount,
        pendingAmount: Math.round(pendingAmount * 100) / 100,
        completedCount,
        completedAmount: Math.round(completedAmount * 100) / 100,
        todayCount,
        todayAmount: Math.round(todayAmount * 100) / 100,
        totalCount: allRefunds.length
      }
    });
  } catch (error) {
    console.error("Failed to fetch refund stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch refund statistics" });
  }
};

const processRefund = async (req, res) => {
  const { id } = req.params;
  const { transactionReference, notes, returnMethod, amount } = req.body || {};

  try {
    const refund = await prisma.refund.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: {
          include: {
            user: { select: { email: true } }
          }
        },
        user: {
          select: {
            email: true,
            customerProfile: { select: { name: true } }
          }
        }
      }
    });

    if (!refund) {
      return res.status(404).json({ success: false, error: "Refund request not found" });
    }

    if (refund.status === "completed") {
      return res.status(400).json({ success: false, error: "This refund has already been processed" });
    }

    const finalAmount = amount !== undefined && !isNaN(parseFloat(amount))
      ? parseFloat(amount)
      : refund.amount;

    const finalMethod = returnMethod || refund.paymentMethod;
    const refNo = transactionReference && transactionReference.trim()
      ? transactionReference.trim()
      : `REF-${Date.now().toString(36).toUpperCase()}`;

    const processedAt = new Date();
    const financeUserId = req.user?.id || null;

    const { updatedRefund, updatedOrder } = await prisma.$transaction(async (tx) => {
      const ref = await tx.refund.update({
        where: { id: parseInt(id) },
        data: {
          status: "completed",
          amount: finalAmount,
          paymentMethod: finalMethod,
          transactionReference: refNo,
          notes: notes || null,
          processedBy: financeUserId,
          refundedAt: processedAt
        }
      });

      const ord = await tx.order.update({
        where: { id: refund.orderId },
        data: {
          paymentStatus: "refunded"
        }
      });

      const expenseRef = `EXP-REF-${refund.id}-${Date.now().toString().slice(-4)}`;
      await tx.expense.create({
        data: {
          reference: expenseRef,
          category: "Refund",
          description: `Customer refund for order #ORD-${String(refund.orderId).padStart(3, "0")} via ${finalMethod}`,
          amount: finalAmount,
          status: "Approved",
          date: processedAt
        }
      });

      return { updatedRefund: ref, updatedOrder: ord };
    });

    const io = req.app.get("io");
    const orderNumStr = `#ORD-${String(refund.orderId).padStart(3, "0")}`;
    const refundMsg = `Your payment refund of ₱${finalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })} for ${orderNumStr} has been successfully completed via ${finalMethod}.`;

    if (io) {
      io.to(`user_${refund.userId}`).emit("order_refunded", {
        refundId: updatedRefund.id,
        orderId: refund.orderId,
        orderNumber: orderNumStr,
        amount: finalAmount,
        paymentMethod: finalMethod,
        transactionReference: refNo,
        notes: notes || null,
        message: refundMsg,
        processedAt: processedAt.toISOString()
      });

      io.emit("order_status_updated", {
        orderId: refund.orderId,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus
      });
    }

    const customerEmail = refund.order?.customerEmail || refund.user?.email;
    const customerName = refund.order?.customerName || refund.order?.shippingName || refund.user?.customerProfile?.name || "Valued Customer";

    try {
      await sendRefundNotificationEmail(customerEmail, {
        order: refund.order,
        refund: updatedRefund,
        transactionReference: refNo,
        notes: notes || null,
        processedAt,
        customerName
      });
    } catch (emailErr) {
      console.error("[REFUND EMAIL NOTICE] Failed to send email, proceeding:", emailErr.message);
    }

    res.status(200).json({
      success: true,
      data: updatedRefund,
      message: "Refund processed successfully and customer notified."
    });
  } catch (error) {
    console.error("Failed to process refund:", error);
    res.status(500).json({ success: false, error: "Failed to process refund" });
  }
};

module.exports = {
  getRefunds,
  getRefundStats,
  processRefund
};
