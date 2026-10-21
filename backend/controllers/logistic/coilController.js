const prisma = require("../../config/db");

const getCoilStatus = (coil) => {
  const count = typeof coil === "object" ? (coil.coilCount ?? 0) : Number(coil);
  const minAlert = (typeof coil === "object" && coil.minAlertCount != null) ? coil.minAlertCount : 1;
  if (count <= 0) return "Out of Stock";
  if (count <= minAlert) return "Low Stock";
  return "Optimal";
};

const getCoils = async (req, res) => {
  try {
    const { thickness, color, status } = req.query;
    const where = {};
    if (thickness && thickness !== "all" && thickness !== "ALL") where.thickness = thickness;
    if (color && color !== "all" && color !== "ALL") where.color = { contains: color, mode: "insensitive" };

    const coils = await prisma.coilInventory.findMany({
      where,
      orderBy: [
        { thickness: "asc" },
        { color: "asc" }
      ]
    });

    const enriched = coils.map((c) => {
      const coilStatus = getCoilStatus(c);
      return {
        ...c,
        status: coilStatus
      };
    });

    let filtered = enriched;
    if (status && status !== "all" && status !== "ALL") {
      filtered = enriched.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    res.status(200).json({ success: true, data: filtered });
  } catch (error) {
    console.error("Failed to fetch coils:", error);
    res.status(500).json({ success: false, error: "Failed to fetch coil inventory" });
  }
};

const getCoilSummary = async (req, res) => {
  try {
    const coils = await prisma.coilInventory.findMany();
    let totalRolls = 0;
    let totalMeters = 0;
    let optimalCount = 0;
    let lowCount = 0;
    let criticalCount = 0;

    const thicknessCounts = {
      "0.35mm": 0,
      "0.40mm": 0,
      "0.50mm": 0,
      "0.60mm": 0
    };

    for (const c of coils) {
      const count = c.coilCount || 0;
      totalRolls += count;
      totalMeters += (c.availableMeters || 0);
      if (thicknessCounts[c.thickness] !== undefined) {
        thicknessCounts[c.thickness] += count;
      }

      const status = getCoilStatus(c);
      if (status === "Out of Stock") criticalCount++;
      else if (status === "Low Stock") lowCount++;
      else optimalCount++;
    }

    res.status(200).json({
      success: true,
      data: {
        totalCoils: totalRolls,
        totalRolls,
        totalMeters: Math.round(totalMeters),
        totalVariants: coils.length,
        thicknessCounts,
        optimalCount,
        lowCount,
        criticalCount
      }
    });
  } catch (error) {
    console.error("Failed to fetch coil summary:", error);
    res.status(500).json({ success: false, error: "Failed to fetch coil summary" });
  }
};

const deductCoil = async (req, res) => {
  const { coilId, coilsDeducted, metersDeducted, orderId, reason } = req.body;
  const staffId = req.user?.userId || req.user?.id || null;

  try {
    const id = parseInt(coilId, 10);
    const countToDeduct = parseInt(coilsDeducted ?? metersDeducted ?? 1, 10);

    if (isNaN(countToDeduct) || countToDeduct <= 0) {
      return res.status(400).json({ success: false, error: "A valid positive integer number of coils (rolls) is required." });
    }

    const coil = await prisma.coilInventory.findUnique({
      where: { id }
    });

    if (!coil) {
      return res.status(404).json({ success: false, error: "Coil inventory record not found" });
    }

    if (coil.coilCount < countToDeduct) {
      return res.status(400).json({
        success: false,
        error: `Insufficient coil stock. Current available: ${coil.coilCount} roll(s), requested deduction: ${countToDeduct} roll(s).`
      });
    }

    const previousCount = coil.coilCount;
    const remainingCount = previousCount - countToDeduct;

    const result = await prisma.$transaction(async (tx) => {
      const updatedCoil = await tx.coilInventory.update({
        where: { id },
        data: {
          coilCount: remainingCount
        }
      });

      const log = await tx.coilInventoryLog.create({
        data: {
          coilId: id,
          userId: staffId ? parseInt(staffId, 10) : null,
          orderId: orderId ? parseInt(orderId, 10) : null,
          previousCount,
          coilsDeducted: countToDeduct,
          remainingCount,
          previousMeters: previousCount,
          metersDeducted: countToDeduct,
          remainingMeters: remainingCount,
          actionType: "deduction",
          reason: reason || (orderId ? `Production Order #ORD-${orderId}` : "Manual roll-forming job deduction")
        }
      });

      return { updatedCoil, log };
    });

    const newStatus = getCoilStatus(result.updatedCoil);

    const io = req.app.get("io");
    if (io) {
      io.emit("coil_inventory_updated", {
        coilId: id,
        thickness: coil.thickness,
        color: coil.color,
        coilCount: remainingCount,
        remainingCount,
        coilsDeducted: countToDeduct,
        status: newStatus
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully deducted ${countToDeduct} coil roll(s) from ${coil.thickness} ${coil.color}.`,
      data: result
    });
  } catch (error) {
    console.error("Failed to deduct coil:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to process deduction" });
  }
};

const restockCoil = async (req, res) => {
  const { coilId, coilsAdded, metersAdded, reason } = req.body;
  const staffId = req.user?.userId || req.user?.id || null;

  try {
    const id = parseInt(coilId, 10);
    const countToAdd = parseInt(coilsAdded ?? metersAdded ?? 1, 10);

    if (isNaN(countToAdd) || countToAdd <= 0) {
      return res.status(400).json({ success: false, error: "A valid positive integer number of coils (rolls) to add is required." });
    }

    const coil = await prisma.coilInventory.findUnique({
      where: { id }
    });

    if (!coil) {
      return res.status(404).json({ success: false, error: "Coil inventory record not found" });
    }

    const previousCount = coil.coilCount;
    const remainingCount = previousCount + countToAdd;

    const result = await prisma.$transaction(async (tx) => {
      const updatedCoil = await tx.coilInventory.update({
        where: { id },
        data: {
          coilCount: remainingCount
        }
      });

      const log = await tx.coilInventoryLog.create({
        data: {
          coilId: id,
          userId: staffId ? parseInt(staffId, 10) : null,
          previousCount,
          coilsDeducted: -countToAdd,
          remainingCount,
          previousMeters: previousCount,
          metersDeducted: -countToAdd,
          remainingMeters: remainingCount,
          actionType: "restock",
          reason: reason || "Coil roll delivery restock"
        }
      });

      return { updatedCoil, log };
    });

    const newStatus = getCoilStatus(result.updatedCoil);

    const io = req.app.get("io");
    if (io) {
      io.emit("coil_inventory_updated", {
        coilId: id,
        thickness: coil.thickness,
        color: coil.color,
        coilCount: remainingCount,
        remainingCount,
        coilsAdded: countToAdd,
        status: newStatus
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully restocked ${countToAdd} coil roll(s) for ${coil.thickness} ${coil.color}.`,
      data: result
    });
  } catch (error) {
    console.error("Failed to restock coil:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to process restock" });
  }
};

const getCoilLogs = async (req, res) => {
  try {
    const { coilId, limit = 50 } = req.query;
    const where = {};
    if (coilId) where.coilId = parseInt(coilId, 10);

    const logs = await prisma.coilInventoryLog.findMany({
      where,
      take: parseInt(limit, 10),
      orderBy: { createdAt: "desc" },
      include: {
        coil: {
          select: { thickness: true, color: true }
        },
        user: {
          select: { email: true }
        },
        order: {
          select: { id: true, customerName: true }
        }
      }
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Failed to fetch coil logs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch audit logs" });
  }
};

module.exports = {
  getCoils,
  getCoilSummary,
  deductCoil,
  restockCoil,
  getCoilLogs
};
