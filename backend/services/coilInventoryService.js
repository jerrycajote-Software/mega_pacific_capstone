const { notifyLogisticLowCoilStock } = require("./notificationManagerService");
const {
  lockCoilInventoryRowById,
  lockCoilInventoryRowBySpec,
  lockOrderRowById
} = require("../utils/concurrencyHelper");

const METERS_PER_COIL_ROLL = 4100;

// Round meter values to 2 decimal places to avoid floating-point drift
const roundMeters = (value) => {
  const num = Number(value) || 0;
  return Math.round(num * 100) / 100;
};

// Normalize coil thickness strings (ex. "0.35mm Thickness" -> "0.35mm")
const normalizeCoilThickness = (rawThickness) => {
  if (!rawThickness) return "0.35mm";
  const str = String(rawThickness).trim();
  const match = str.match(/0\.\d+/);
  return match ? `${match[0]}mm` : str;
};

// Resolve exact remaining meters for a coil record, falling back to roll count for legacy rows
const resolveCoilAvailableMeters = (coil) => {
  if (!coil) return 0;
  const storedMeters = Number(coil.availableMeters);
  const storedRolls = Number(coil.coilCount) || 0;

  if (!Number.isNaN(storedMeters) && storedMeters > 0) {
    return roundMeters(storedMeters);
  }
  if (storedRolls > 0) {
    return roundMeters(storedRolls * METERS_PER_COIL_ROLL);
  }
  return 0;
};

// Calculate physical active roll count from remaining meters (1 roll = 4,100m)
const computeRollCountFromMeters = (availableMeters) => {
  const meters = roundMeters(availableMeters);
  if (meters <= 0) return 0;
  return Math.ceil(meters / METERS_PER_COIL_ROLL);
};

// Evaluate coil health status from both roll count and remaining meters
const getCoilStockStatus = (coil) => {
  const meters = resolveCoilAvailableMeters(coil);
  const count = computeRollCountFromMeters(meters);
  const minAlertCount = coil?.minAlertCount != null ? Number(coil.minAlertCount) : 1;
  const minAlertMeters = coil?.minAlertMeters != null ? Number(coil.minAlertMeters) : 200;

  if (meters <= 0 || count <= 0) return "Out of Stock";
  if (count <= minAlertCount || meters <= minAlertMeters) return "Low Stock";
  return "Optimal";
};

// Compute total linear meters needed from coil inventory for a single order item
const computeOrderItemCoilMeters = ({ customLength, quantity, variantName, productUnit, isPerMeter }) => {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const numericLength = customLength !== null && customLength !== undefined && customLength !== ""
    ? Number(customLength)
    : NaN;

  if (!Number.isNaN(numericLength) && numericLength > 0) {
    return roundMeters(numericLength * qty);
  }

  // Extract fixed standard sheet length when specified in variant/unit text (ex. "0.40mm (2.44m)")
  const lengthSource = `${variantName || ""} ${productUnit || ""}`;
  const fixedMeterMatch = lengthSource.match(/(\d+(?:\.\d+)?)\s*m\b/i);
  if (fixedMeterMatch) {
    return roundMeters(parseFloat(fixedMeterMatch[1]) * qty);
  }

  return isPerMeter ? roundMeters(1 * qty) : roundMeters(qty);
};

// Atomically validate and deduct coil meters for all colored sheet items inside an order transaction
const deductCoilsForOrderInTx = async (tx, { orderId, userId, items = [] }) => {
  const groupedDemands = new Map();

  for (const item of items) {
    if (!item?.color || !String(item.color).trim()) continue;

    const cleanThickness = normalizeCoilThickness(
      item.thickness || item.variantName || item.productThickness || "0.35mm"
    );
    const cleanColor = String(item.color).trim();
    const metersNeeded = computeOrderItemCoilMeters(item);
    if (metersNeeded <= 0) continue;

    const key = `${cleanThickness.toLowerCase()}__${cleanColor.toLowerCase()}`;
    if (!groupedDemands.has(key)) {
      groupedDemands.set(key, {
        thickness: cleanThickness,
        color: cleanColor,
        metersNeeded: 0,
        productNames: new Set()
      });
    }

    const entry = groupedDemands.get(key);
    entry.metersNeeded = roundMeters(entry.metersNeeded + metersNeeded);
    if (item.productName) {
      entry.productNames.add(item.productName);
    }
  }

  const updates = [];

  // Sort grouped demands deterministically so concurrent bulk orders always lock rows in the same order
  const sortedDemands = Array.from(groupedDemands.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, demand]) => demand);

  for (const demand of sortedDemands) {
    const coil = await lockCoilInventoryRowBySpec(tx, demand.thickness, demand.color);

    const previousMeters = resolveCoilAvailableMeters(coil);
    const previousCount = coil ? (coil.coilCount ?? computeRollCountFromMeters(previousMeters)) : 0;
    const itemLabel = `${Array.from(demand.productNames).join(", ") || "Roofing Sheet"} (${demand.thickness} • ${demand.color})`;

    if (!coil || previousMeters <= 0) {
      throw {
        type: "STOCK_ERROR",
        unit: "meters",
        itemName: itemLabel,
        available: 0,
        requested: demand.metersNeeded,
        message: `The color finish "${demand.color}" in ${demand.thickness} thickness is currently out of stock in Coil Inventory.`
      };
    }

    if (previousMeters < demand.metersNeeded) {
      throw {
        type: "STOCK_ERROR",
        unit: "meters",
        itemName: itemLabel,
        available: previousMeters,
        requested: demand.metersNeeded,
        message: `Not enough ${demand.thickness} ${demand.color} coil length in stock. Remaining: ${previousMeters.toFixed(2)}m, but your order needs ${demand.metersNeeded.toFixed(2)}m.`
      };
    }

    const remainingMeters = roundMeters(Math.max(0, previousMeters - demand.metersNeeded));
    const remainingCount = computeRollCountFromMeters(remainingMeters);
    const coilsDeducted = Math.max(0, previousCount - remainingCount);

    const updatedCoil = await tx.coilInventory.update({
      where: { id: coil.id },
      data: {
        availableMeters: remainingMeters,
        coilCount: remainingCount
      }
    });

    await tx.coilInventoryLog.create({
      data: {
        coilId: coil.id,
        userId: userId ? parseInt(userId, 10) : null,
        orderId: orderId ? parseInt(orderId, 10) : null,
        previousCount,
        coilsDeducted,
        remainingCount,
        previousMeters,
        metersDeducted: demand.metersNeeded,
        remainingMeters,
        actionType: "deduction",
        reason: `Auto-deducted ${demand.metersNeeded}m for Customer Order #ORD-${String(orderId).padStart(3, "0")}`
      }
    });

    updates.push({
      coil: updatedCoil,
      metersDeducted: demand.metersNeeded,
      coilsDeducted,
      status: getCoilStockStatus(updatedCoil)
    });
  }

  return updates;
};

// Atomically restore deducted coil meters when an order is rejected or cancelled (idempotent)
const restoreCoilsForOrderInTx = async (tx, { orderId, staffUserId = null, reason = "" }) => {
  const parsedOrderId = parseInt(orderId, 10);
  if (Number.isNaN(parsedOrderId)) return [];

  // Lock the order row first so simultaneous cancel/reject requests cannot both restore the same meters
  await lockOrderRowById(tx, parsedOrderId);

  // Skip if this order's coil meters were already restored
  const alreadyRestoredCount = await tx.coilInventoryLog.count({
    where: {
      orderId: parsedOrderId,
      actionType: "restock"
    }
  });
  if (alreadyRestoredCount > 0) return [];

  const deductionLogs = await tx.coilInventoryLog.findMany({
    where: {
      orderId: parsedOrderId,
      actionType: "deduction"
    },
    orderBy: { coilId: "asc" }
  });

  if (!deductionLogs || deductionLogs.length === 0) return [];

  const restoredUpdates = [];

  for (const log of deductionLogs) {
    const metersToRestore = roundMeters(Math.abs(Number(log.metersDeducted) || 0));
    if (metersToRestore <= 0) continue;

    // Lock the coil row before adding restored meters back
    const coil = await lockCoilInventoryRowById(tx, log.coilId);
    if (!coil) continue;

    const previousMeters = resolveCoilAvailableMeters(coil);
    const previousCount = coil.coilCount ?? computeRollCountFromMeters(previousMeters);
    const remainingMeters = roundMeters(previousMeters + metersToRestore);
    const remainingCount = computeRollCountFromMeters(remainingMeters);
    const rollsAdded = Math.max(0, remainingCount - previousCount);

    const updatedCoil = await tx.coilInventory.update({
      where: { id: coil.id },
      data: {
        availableMeters: remainingMeters,
        coilCount: remainingCount
      }
    });

    await tx.coilInventoryLog.create({
      data: {
        coilId: coil.id,
        userId: staffUserId ? parseInt(staffUserId, 10) : null,
        orderId: parsedOrderId,
        previousCount,
        coilsDeducted: -rollsAdded,
        remainingCount,
        previousMeters,
        metersDeducted: -metersToRestore,
        remainingMeters,
        actionType: "restock",
        reason: reason || `Restored ${metersToRestore}m from cancelled/rejected Order #ORD-${String(parsedOrderId).padStart(3, "0")}`
      }
    });

    restoredUpdates.push({
      coil: updatedCoil,
      metersRestored: metersToRestore,
      coilsAdded: rollsAdded,
      status: getCoilStockStatus(updatedCoil)
    });
  }

  return restoredUpdates;
};

// Emit real-time Socket.IO coil inventory updates and low-stock alerts after transaction commits
const emitCoilInventoryUpdates = (io, updates = []) => {
  if (!io || !Array.isArray(updates) || updates.length === 0) return;

  for (const entry of updates) {
    const coil = entry?.coil;
    if (!coil) continue;

    io.emit("coil_inventory_updated", {
      coilId: coil.id,
      thickness: coil.thickness,
      color: coil.color,
      coilCount: coil.coilCount,
      remainingCount: coil.coilCount,
      availableMeters: coil.availableMeters,
      metersDeducted: entry.metersDeducted || 0,
      metersRestored: entry.metersRestored || 0,
      status: entry.status
    });

    if (entry.metersDeducted > 0) {
      notifyLogisticLowCoilStock({ io, coil, status: entry.status });
    }
  }
};

module.exports = {
  METERS_PER_COIL_ROLL,
  roundMeters,
  normalizeCoilThickness,
  resolveCoilAvailableMeters,
  computeRollCountFromMeters,
  getCoilStockStatus,
  computeOrderItemCoilMeters,
  deductCoilsForOrderInTx,
  restoreCoilsForOrderInTx,
  emitCoilInventoryUpdates
};
