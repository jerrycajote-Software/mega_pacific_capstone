const prisma = require("../config/db");
const { checkAndExtendDeliveryDates } = require("../utils/deliveryHelper");

/**
 * Background worker to automatically extend estimated delivery dates for delayed orders.
 * Scans the database for orders whose estimated delivery date is in the past
 * and status is NOT marked as delivered, cancelled, or completed.
 */
const runDeliveryScheduler = async () => {
  try {
    console.log("[Delivery Scheduler] Starting automated delivery date check...");
    
    // Find all active orders that are not delivered, completed, or cancelled
    const activeOrders = await prisma.order.findMany({
      where: {
        status: {
          notIn: ["delivered", "completed", "cancelled"]
        },
        estimatedDeliveryDate: {
          not: null
        }
      }
    });

    if (activeOrders.length === 0) {
      console.log("[Delivery Scheduler] No active orders found with estimated delivery dates.");
      return;
    }

    const beforeCount = activeOrders.map(o => ({ id: o.id, date: o.estimatedDeliveryDate?.toISOString() }));
    
    // Run the extension logic
    await checkAndExtendDeliveryDates(activeOrders);
    
    console.log(`[Delivery Scheduler] Checked ${activeOrders.length} orders for updates.`);
  } catch (error) {
    console.error("[Delivery Scheduler] Error during delivery check:", error);
  }
};

// Initialize the scheduler
const initDeliveryScheduler = () => {
  // Run on startup
  runDeliveryScheduler();

  // Run every 12 hours
  const intervalMs = 12 * 60 * 60 * 1000;
  setInterval(runDeliveryScheduler, intervalMs);
  console.log("[Delivery Scheduler] Background service registered (Interval: 12 Hours)");
};

module.exports = { initDeliveryScheduler };
