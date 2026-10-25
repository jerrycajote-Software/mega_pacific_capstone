const prisma = require("../../config/db");

const OFFICIAL_COIL_COLORS = [
  "Marshall Dark Gray",
  "Saipan Brown",
  "Tongan Red",
  "Maori Green",
  "Samoan Beige",
  "Seafoam Green",
  "Fijian White",
  "Hawaiian Blue",
  "Tahiti Grey",
  "Kauai Dark",
  "Aussie Red",
  "New Zealand Green",
  "Nauru Blue",
  "New Guinea Brown"
];

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
      thicknessCounts[c.thickness] = (thicknessCounts[c.thickness] || 0) + count;

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

const addCoil = async (req, res) => {
  const { thickness, color, colors, coilCount = 1, minAlertCount = 1 } = req.body;
  const staffId = req.user?.userId || req.user?.id || null;

  try {
    if (!thickness || typeof thickness !== "string" || !thickness.trim()) {
      return res.status(400).json({ success: false, error: "Coil thickness gauge is required (ex. 0.40mm, 0.70mm)." });
    }

    let normalizedThickness = thickness.trim();
    if (!normalizedThickness.toLowerCase().endsWith("mm")) {
      normalizedThickness = `${normalizedThickness}mm`;
    }

    const thicknessMatch = normalizedThickness.match(/^(\d+(\.\d+)?)mm$/i);
    if (!thicknessMatch) {
      return res.status(400).json({ success: false, error: "Invalid thickness format. Expected format like '0.40mm' or '0.70mm'." });
    }

    const numVal = parseFloat(thicknessMatch[1]);
    if (isNaN(numVal) || numVal <= 0 || numVal > 10.0) {
      return res.status(400).json({ success: false, error: "Coil thickness must be between 0.10mm and 10.00mm." });
    }

    let inputColors = [];
    if (Array.isArray(colors) && colors.length > 0) {
      inputColors = colors;
    } else if (color && typeof color === "string") {
      inputColors = [color];
    } else {
      return res.status(400).json({ success: false, error: "Please select at least one color from the 14 available official colors." });
    }

    const validColors = [];
    for (const c of inputColors) {
      if (typeof c !== "string") continue;
      const match = OFFICIAL_COIL_COLORS.find(oc => oc.toLowerCase() === c.trim().toLowerCase());
      if (match && !validColors.includes(match)) {
        validColors.push(match);
      }
    }

    if (validColors.length === 0) {
      return res.status(400).json({
        success: false,
        error: "None of the selected colors matched the 14 official coil colors.",
        availableColors: OFFICIAL_COIL_COLORS
      });
    }

    const initialCount = parseInt(coilCount, 10);
    const parsedInitialCount = isNaN(initialCount) || initialCount < 0 ? 1 : initialCount;
    const alertCount = parseInt(minAlertCount, 10);
    const parsedAlertCount = isNaN(alertCount) || alertCount < 0 ? 1 : alertCount;

    const existingCoils = await prisma.coilInventory.findMany({
      where: {
        thickness: normalizedThickness,
        color: { in: validColors }
      }
    });

    const existingColorNames = existingCoils.map(ec => ec.color);
    const colorsToCreate = validColors.filter(vc => !existingColorNames.includes(vc));

    if (colorsToCreate.length === 0) {
      return res.status(409).json({
        success: false,
        error: `All selected colors for thickness ${normalizedThickness} already exist in inventory (${existingColorNames.join(", ")}).`,
        alreadyExisted: existingColorNames
      });
    }

    const createdCoils = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const col of colorsToCreate) {
        const newCoil = await tx.coilInventory.create({
          data: {
            name: "Steel Coil",
            thickness: normalizedThickness,
            color: col,
            coilCount: parsedInitialCount,
            minAlertCount: parsedAlertCount,
            availableMeters: parsedInitialCount * 1000
          }
        });

        await tx.coilInventoryLog.create({
          data: {
            coilId: newCoil.id,
            userId: staffId ? parseInt(staffId, 10) : null,
            previousCount: 0,
            coilsDeducted: -parsedInitialCount,
            remainingCount: parsedInitialCount,
            previousMeters: 0,
            metersDeducted: -parsedInitialCount * 1000,
            remainingMeters: parsedInitialCount * 1000,
            actionType: "creation",
            reason: `Initial stock provisioning for gauge/color: ${normalizedThickness} ${col}`
          }
        });

        created.push({
          ...newCoil,
          status: getCoilStatus(newCoil)
        });
      }
      return created;
    });

    const io = req.app?.get ? req.app.get("io") : null;
    if (io) {
      io.emit("coil_inventory_updated", {
        type: "batch_created",
        thickness: normalizedThickness,
        createdCount: createdCoils.length
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully provisioned ${createdCoils.length} new coil record(s) for ${normalizedThickness}.`,
      data: createdCoils,
      alreadyExisted: existingColorNames
    });
  } catch (error) {
    console.error("Failed to add coil specification:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to add coil specification" });
  }
};

module.exports = {
  getCoils,
  getCoilSummary,
  deductCoil,
  restockCoil,
  getCoilLogs,
  addCoil,
  OFFICIAL_COIL_COLORS
};

