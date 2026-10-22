const prisma = require("../../config/db");
const { refreshCache } = require("../../config/systemStatusCache");

const defaultStatuses = {
  admin_portal_status: "online",
  sales_portal_status: "online",
  customer_portal_status: "online",
};


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


exports.getSessionLogs = async (req, res) => {
  try {
    const logs = await prisma.userSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, 
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


exports.getSystemInfo = async (req, res) => {
  try {
    const memory = process.memoryUsage();
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMB: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMB: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMB: Math.round(memory.heapTotal / (1024 * 1024)),
      },
      dbStatus: "connected",
      serverTime: new Date().toISOString()
    };
    res.json({ success: true, data: systemInfo });
  } catch (error) {
    console.error("Error fetching system info:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getEmailStatus = (req, res) => {
  try {
    const { getEmailDiagnostics } = require("../../utils/emailService");
    const diagnostics = getEmailDiagnostics();
    res.json({ success: true, data: diagnostics });
  } catch (error) {
    console.error("Error fetching email status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.testEmailDelivery = async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!recipient) {
      return res.status(400).json({ success: false, message: "Target email address is required" });
    }

    const { testEmailDispatch } = require("../../utils/emailService");
    const result = await testEmailDispatch(recipient);
    res.json({ success: true, message: `Test email dispatched to ${recipient}`, data: result });
  } catch (error) {
    console.error("Error testing email delivery:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

