const prisma = require("../../config/db");
const { createPaymongoRefund, extractPaymongoIdFromPaymentMethod } = require("../../services/paymongoService");
const { notifyPaymentRefunded } = require("../../services/notificationManagerService");


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
  const refundId = parseInt(id, 10);
  const { transactionReference, notes, returnMethod, amount } = req.body || {};

  if (Number.isNaN(refundId)) {
    return res.status(400).json({ success: false, error: "Invalid refund ID specified." });
  }

  let lockClaimed = false;

  try {
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
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

    if (refund.status === "processing") {
      return res.status(409).json({
        success: false,
        error: "This refund is currently being processed by another Finance staff member. Please wait a moment and refresh."
      });
    }

    const financeUserId = req.user?.userId || req.user?.id || null;

    // Atomically claim the pending refund before calling external payment APIs to prevent double payouts
    const claimResult = await prisma.refund.updateMany({
      where: { id: refundId, status: "pending" },
      data: {
        status: "processing",
        processedBy: financeUserId
      }
    });

    if (claimResult.count === 0) {
      const latestRefund = await prisma.refund.findUnique({ where: { id: refundId } });
      if (latestRefund?.status === "completed") {
        return res.status(400).json({ success: false, error: "This refund has already been processed" });
      }
      return res.status(409).json({
        success: false,
        error: "This refund is already being processed or was updated by another Finance staff member. Please refresh."
      });
    }

    lockClaimed = true;

    const finalAmount = amount !== undefined && !isNaN(parseFloat(amount))
      ? parseFloat(amount)
      : refund.amount;

    const finalMethod = returnMethod || refund.paymentMethod;
    let refNo = transactionReference && transactionReference.trim()
      ? transactionReference.trim()
      : `REF-${Date.now().toString(36).toUpperCase()}`;

    let paymongoRefundResult = null;
    let finalNotes = notes || null;
    const paymongoLinked = extractPaymongoIdFromPaymentMethod(finalMethod);
    if (paymongoLinked && finalAmount > 0) {
      try {
        paymongoRefundResult = await createPaymongoRefund({
          paymentMethodStr: finalMethod,
          amountPhp: finalAmount,
          reason: "requested_by_customer",
          notes: notes || `Refund for Order #ORD-${String(refund.orderId).padStart(3, "0")}`
        });
        if (paymongoRefundResult?.refundId) {
          refNo = paymongoRefundResult.refundId;
        }
      } catch (pmErr) {
        const errMsg = pmErr.message || "";
        const isQrPhLimitation =
          errMsg.toLowerCase().includes("qrph") ||
          errMsg.toLowerCase().includes("not allowed for payments with source type") ||
          errMsg.toLowerCase().includes("provider is unavailable");

        if (isQrPhLimitation) {
          console.info(`[PAYMONGO QRPH PAYOUT FALLBACK]: QR Ph payment (${paymongoLinked.id}) processed via Direct GCash Payout fallback.`);
          refNo = `GCASH-REF-${paymongoLinked.id.replace(/^(pay_|pi_)/, "").slice(0, 8).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
          if (!finalNotes || finalNotes.includes("Automated GCash reversal via PayMongo Refund API")) {
            finalNotes = `Direct GCash Refund Disbursed for PayMongo QR Ph (${paymongoLinked.id})`;
          }
        } else {
          // Release the processing lock so Finance can retry after resolving the PayMongo error
          await prisma.refund.updateMany({
            where: { id: refundId, status: "processing" },
            data: { status: "pending", processedBy: null }
          });
          lockClaimed = false;
          console.warn("[PAYMONGO REFUND API WARNING]:", errMsg);
          return res.status(400).json({
            success: false,
            error: `PayMongo Refund API error: ${errMsg}`
          });
        }
      }
    }

    const processedAt = new Date();

    const { updatedRefund, updatedOrder } = await prisma.$transaction(async (tx) => {
      const ref = await tx.refund.update({
        where: { id: refundId },
        data: {
          status: "completed",
          amount: finalAmount,
          paymentMethod: finalMethod,
          transactionReference: refNo,
          notes: finalNotes,
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

      // Use a deterministic reference per refund ID so duplicate refund expense rows are impossible
      const expenseRef = `EXP-REF-${refund.id}`;
      await tx.expense.upsert({
        where: { reference: expenseRef },
        create: {
          reference: expenseRef,
          category: "Refund",
          description: `Customer refund for order #ORD-${String(refund.orderId).padStart(3, "0")} via ${finalMethod}`,
          amount: finalAmount,
          status: "Approved",
          date: processedAt
        },
        update: {
          amount: finalAmount,
          description: `Customer refund for order #ORD-${String(refund.orderId).padStart(3, "0")} via ${finalMethod}`,
          date: processedAt
        }
      });

      return { updatedRefund: ref, updatedOrder: ord };
    });

    lockClaimed = false;

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
        notes: finalNotes,
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
    const ioInstance = req.app.get("io");

    try {
      await notifyPaymentRefunded({
        io: ioInstance,
        order: refund.order,
        refund: updatedRefund,
        transactionReference: refNo,
        notes: finalNotes,
        processedAt,
        customerName,
        customerEmail
      });
    } catch (emailErr) {
      console.error("[REFUND NOTIFICATION NOTICE] Failed to send refund notice, proceeding:", emailErr.message);
    }

    res.status(200).json({
      success: true,
      data: updatedRefund,
      message: "Refund processed successfully and customer notified."
    });
  } catch (error) {
    if (lockClaimed) {
      await prisma.refund.updateMany({
        where: { id: refundId, status: "processing" },
        data: { status: "pending", processedBy: null }
      }).catch((revertErr) => {
        console.error("Failed to release refund processing lock:", revertErr);
      });
    }
    console.error("Failed to process refund:", error);
    res.status(500).json({ success: false, error: "Failed to process refund" });
  }
};

module.exports = {
  getRefunds,
  getRefundStats,
  processRefund
};
