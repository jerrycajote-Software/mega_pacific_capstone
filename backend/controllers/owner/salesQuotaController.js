const prisma = require("../../config/db");
const {
  getBusinessSalesQuotaSummary,
  saveBusinessSalesQuota
} = require("../../services/salesQuotaService");

// Fetch the current target sales quota and progress for the Owner portal
const getOwnerSalesQuota = async (req, res) => {
  try {
    const quotaSummary = await getBusinessSalesQuotaSummary();
    res.status(200).json({
      success: true,
      data: quotaSummary
    });
  } catch (error) {
    console.error("Owner get sales quota error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load the business sales quota. Please try again."
    });
  }
};

// Update the target sales quota set by the Owner and broadcast it to the Sales team in real time
const updateAndSendSalesQuota = async (req, res) => {
  try {
    const { targetAmount, periodType, targetOrders, noteToSales } = req.body;
    const numericTarget = Number(targetAmount);

    if (Number.isNaN(numericTarget) || numericTarget <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid target sales amount greater than ₱0."
      });
    }

    if (periodType && !["daily", "weekly", "monthly"].includes(periodType)) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid quota period: daily, weekly, or monthly."
      });
    }

    // Look up the Owner's profile name to display who last updated the quota
    let ownerDisplayName = "Business Owner";
    if (req.user?.userId) {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId: req.user.userId },
        select: { name: true }
      });
      if (ownerProfile?.name) {
        ownerDisplayName = ownerProfile.name;
      }
    }

    const updatedQuota = await saveBusinessSalesQuota({
      targetAmount: numericTarget,
      periodType: periodType || "monthly",
      targetOrders,
      noteToSales,
      updatedBy: ownerDisplayName
    });

    // Notify all connected Sales dashboards about the updated sales quota via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("sales_quota_updated", {
        quota: updatedQuota,
        message: `New ${updatedQuota.periodLabel} from ${ownerDisplayName}: ${updatedQuota.formattedTargetAmount}`
      });
    }

    res.status(200).json({
      success: true,
      message: "Sales quota target has been saved and sent to the Sales team.",
      data: updatedQuota
    });
  } catch (error) {
    console.error("Owner update sales quota error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save and send the sales quota target."
    });
  }
};

module.exports = {
  getOwnerSalesQuota,
  updateAndSendSalesQuota
};
