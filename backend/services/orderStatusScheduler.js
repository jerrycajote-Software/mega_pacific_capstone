const prisma = require("../config/db");

/**
 * Automated Order Status Progression Scheduler
 * ─────────────────────────────────────────────
 * Automatically advances orders through the status pipeline:
 *   pending  ──(1.5 min)──▶  processing
 *   processing ─(1.5 min)──▶  out_for_delivery
 *   out_for_delivery ─(2 min)──▶  delivered  (+paymentStatus=paid, +estimatedDeliveryDate=now)
 *
 * NOTE: These intervals are intentionally short for testing purposes.
 * For production, update the *_DELAY_MS constants to realistic values.
 *
 * Cancelled orders are NEVER touched by this scheduler.
 */

// ── Timing Constants (testing mode) ──────────────────────────────────────────
const PENDING_TO_PROCESSING_DELAY_MS    = 1.5 * 60 * 1000; //  1 min 30 sec
const SCHEDULER_INTERVAL_MS             =      30 * 1000;   // check every 30 sec
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the elapsed milliseconds since a given date.
 * Falls back to `createdAt` when `statusUpdatedAt` is null (first transition).
 */
const elapsedMs = (order) => {
  const ref = order.statusUpdatedAt || order.createdAt;
  return Date.now() - new Date(ref).getTime();
};

/**
 * Updates a single order's status and stamps `statusUpdatedAt`.
 * Optionally updates paymentStatus and estimatedDeliveryDate.
 */
const progressOrder = async (orderId, newStatus, extras = {}) => {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
      statusUpdatedAt: new Date(),
      ...extras,
    },
  });
};

/**
 * Main scheduler tick — runs on every interval.
 */
const runOrderStatusScheduler = async (io) => {
  try {
    // ── 1. pending → processing ─────────────────────────────────────────────
    const pendingOrders = await prisma.order.findMany({
      where: { status: "pending" },
    });

    for (const order of pendingOrders) {
      if (elapsedMs(order) >= PENDING_TO_PROCESSING_DELAY_MS) {
        await progressOrder(order.id, "processing");
        console.log(`[Order Scheduler] #${order.id}: pending → processing`);
        io?.to(`order_${order.id}`).emit("order_status_updated", {
          orderId: order.id,
          status: "processing",
        });
        // Also broadcast to sales/admin rooms
        io?.emit("admin_order_updated", { orderId: order.id, status: "processing" });
      }
    }

    // ── 2. processing → out_for_delivery is now MANUAL ──
    // ── 3. out_for_delivery → delivered is now MANUAL ──

  } catch (error) {
    console.error("[Order Scheduler] Error during status progression:", error);
  }
};

/**
 * Initializes the order status scheduler.
 * @param {import('socket.io').Server} io  - Socket.IO server instance
 */
const initOrderStatusScheduler = (io) => {
  // Run once on startup to catch any orders that were mid-progression
  runOrderStatusScheduler(io);

  setInterval(() => runOrderStatusScheduler(io), SCHEDULER_INTERVAL_MS);

  console.log(
    `[Order Scheduler] Started — Intervals: pending→processing: ${PENDING_TO_PROCESSING_DELAY_MS / 1000}s | Check every ${SCHEDULER_INTERVAL_MS / 1000}s`
  );
};

module.exports = { initOrderStatusScheduler };
