const prisma = require("../../config/db");
const { refreshCache } = require("../../config/systemStatusCache");

// Initial default statuses if not present in DB
const defaultStatuses = {
  admin_portal_status: "online",
  sales_portal_status: "online",
  customer_portal_status: "online",
};

// GET /api/system/status (Public Endpoint)
exports.getSystemStatus = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ["admin_portal_status", "sales_portal_status", "customer_portal_status"],
        },
      },
    });

    const statusMap = { ...defaultStatuses };
    settings.forEach((setting) => {
      statusMap[setting.key] = setting.value;
    });

    res.json({
      success: true,
      data: statusMap,
    });
  } catch (error) {
    console.error("Error fetching system status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/superadmin/status (Protected Endpoint)
exports.getSuperadminStatus = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ["admin_portal_status", "sales_portal_status", "customer_portal_status"],
        },
      },
    });

    const statusMap = { ...defaultStatuses };
    settings.forEach((setting) => {
      statusMap[setting.key] = setting.value;
    });

    res.json({
      success: true,
      data: statusMap,
    });
  } catch (error) {
    console.error("Error fetching system status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/superadmin/status (Protected Endpoint)
exports.updateSuperadminStatus = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!["admin_portal_status", "sales_portal_status", "customer_portal_status"].includes(key)) {
      return res.status(400).json({ success: false, message: "Invalid portal key" });
    }

    if (!["online", "offline"].includes(value)) {
      return res.status(400).json({ success: false, message: "Value must be online or offline" });
    }

    const updatedSetting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, description: `Status for ${key}` },
    });

    await refreshCache();

    const io = req.app.get("io");
    if (io) {
      io.emit("system_status_updated", { key, value });
    }

    res.json({
      success: true,
      message: `Successfully updated ${key} to ${value}`,
      data: updatedSetting,
    });
  } catch (error) {
    console.error("Error updating system status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/superadmin/active-users
exports.getActiveUsers = (req, res) => {
  try {
    const socketTrackingService = require("../../services/socketTrackingService");
    const activeUsers = socketTrackingService.getActiveUsers();
    res.json({ success: true, data: activeUsers });
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/superadmin/session-logs
exports.getSessionLogs = async (req, res) => {
  try {
    const logs = await prisma.userSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100 for performance
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching session logs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
