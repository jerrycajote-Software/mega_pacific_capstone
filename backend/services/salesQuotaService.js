const prisma = require("../config/db");

const BUSINESS_SALES_QUOTA_KEY = "business_sales_quota";

// Return the default quota configuration when the Owner has not saved a custom target yet
const getDefaultQuotaConfig = () => ({
  targetAmount: 500000,
  periodType: "monthly",
  targetOrders: 25,
  noteToSales: "Prioritize pending roofing pre-orders and respond to customer inquiries promptly to reach our target.",
  updatedBy: "Business Owner",
  updatedAt: null
});

// Determine the date range and display label for the chosen quota period (daily, weekly, or monthly)
const getQuotaPeriodWindow = (periodType = "monthly") => {
  const now = new Date();
  const normalizedPeriod = ["daily", "weekly", "monthly"].includes(periodType) ? periodType : "monthly";

  if (normalizedPeriod === "daily") {
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const periodRangeText = startDate.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    return {
      periodType: "daily",
      periodLabel: "Daily Sales Target",
      periodRangeText,
      startDate,
      endDate
    };
  }

  if (normalizedPeriod === "weekly") {
    // Align the weekly range to run from Monday through Sunday
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6, 23, 59, 59, 999);
    const startText = startDate.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    const endText = endDate.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
    return {
      periodType: "weekly",
      periodLabel: "Weekly Sales Target",
      periodRangeText: `${startText} - ${endText}`,
      startDate,
      endDate
    };
  }

  // Default to the current calendar month (first day through last day)
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const periodRangeText = startDate.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric"
  });

  return {
    periodType: "monthly",
    periodLabel: "Monthly Sales Target",
    periodRangeText,
    startDate,
    endDate
  };
};

// Format numeric values as Philippine Peso amounts with comma separators
const formatPesoAmount = (amount) => {
  const numericValue = Number(amount || 0);
  return `₱${numericValue.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
};

// Read the saved sales quota settings from SystemSetting, falling back to defaults if unavailable
const getStoredQuotaConfig = async () => {
  const defaultConfig = getDefaultQuotaConfig();
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: BUSINESS_SALES_QUOTA_KEY }
    });

    if (!setting || !setting.value) {
      return defaultConfig;
    }

    const parsed = JSON.parse(setting.value);
    const targetAmount = Number(parsed.targetAmount);
    const targetOrders = parseInt(parsed.targetOrders, 10);

    return {
      targetAmount: !Number.isNaN(targetAmount) && targetAmount > 0 ? targetAmount : defaultConfig.targetAmount,
      periodType: ["daily", "weekly", "monthly"].includes(parsed.periodType) ? parsed.periodType : defaultConfig.periodType,
      targetOrders: !Number.isNaN(targetOrders) && targetOrders >= 0 ? targetOrders : defaultConfig.targetOrders,
      noteToSales: typeof parsed.noteToSales === "string" ? parsed.noteToSales : defaultConfig.noteToSales,
      updatedBy: parsed.updatedBy || defaultConfig.updatedBy,
      updatedAt: parsed.updatedAt || setting.updatedAt?.toISOString() || null
    };
  } catch (error) {
    console.warn("Hindi mabasa ang naka-save na sales quota config, gagamitin ang default:", error.message);
    return defaultConfig;
  }
};

// Build the full sales quota summary by comparing actual valid orders against the target
const getBusinessSalesQuotaSummary = async () => {
  const config = await getStoredQuotaConfig();
  const periodWindow = getQuotaPeriodWindow(config.periodType);

  // Only count active orders that have not been cancelled, rejected, or refunded
  const validPeriodOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: periodWindow.startDate,
        lte: periodWindow.endDate
      },
      status: { notIn: ["cancelled", "rejected"] },
      paymentStatus: { not: "refunded" }
    },
    select: {
      id: true,
      total: true
    }
  });

  const currentSalesAmount = validPeriodOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const currentOrdersCount = validPeriodOrders.length;
  const targetAmount = Number(config.targetAmount) || 0;
  const targetOrders = Number(config.targetOrders) || 0;

  const rawProgressPercent = targetAmount > 0
    ? Math.round((currentSalesAmount / targetAmount) * 1000) / 10
    : 0;
  const progressPercent = Math.min(Math.max(rawProgressPercent, 0), 100);
  const remainingAmount = Math.max(targetAmount - currentSalesAmount, 0);
  const remainingOrders = targetOrders > 0 ? Math.max(targetOrders - currentOrdersCount, 0) : 0;
  const isQuotaReached = targetAmount > 0 && currentSalesAmount >= targetAmount;

  let statusLabel = "Needs Sales Push";
  if (rawProgressPercent >= 100) {
    statusLabel = "Target Reached";
  } else if (rawProgressPercent >= 70) {
    statusLabel = "On Track";
  } else if (rawProgressPercent >= 35) {
    statusLabel = "In Progress";
  }

  return {
    targetAmount,
    targetOrders,
    periodType: periodWindow.periodType,
    periodLabel: periodWindow.periodLabel,
    periodRangeText: periodWindow.periodRangeText,
    startDate: periodWindow.startDate.toISOString(),
    endDate: periodWindow.endDate.toISOString(),
    currentSalesAmount,
    currentOrdersCount,
    progressPercent,
    rawProgressPercent,
    remainingAmount,
    remainingOrders,
    isQuotaReached,
    statusLabel,
    noteToSales: config.noteToSales,
    updatedBy: config.updatedBy,
    updatedAt: config.updatedAt,
    formattedTargetAmount: formatPesoAmount(targetAmount),
    formattedCurrentSales: formatPesoAmount(currentSalesAmount),
    formattedRemainingAmount: formatPesoAmount(remainingAmount)
  };
};

// Save the updated target sales quota from the Owner and return the refreshed summary
const saveBusinessSalesQuota = async ({ targetAmount, periodType, targetOrders, noteToSales, updatedBy }) => {
  const parsedAmount = Number(targetAmount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error("Please enter a valid target sales amount greater than ₱0.");
  }

  const normalizedPeriod = ["daily", "weekly", "monthly"].includes(periodType) ? periodType : "monthly";
  const parsedOrders = targetOrders === "" || targetOrders === null || targetOrders === undefined
    ? 0
    : Math.max(0, parseInt(targetOrders, 10) || 0);
  const sanitizedNote = typeof noteToSales === "string" ? noteToSales.trim() : "";

  const payload = {
    targetAmount: Math.round(parsedAmount * 100) / 100,
    periodType: normalizedPeriod,
    targetOrders: parsedOrders,
    noteToSales: sanitizedNote,
    updatedBy: updatedBy || "Business Owner",
    updatedAt: new Date().toISOString()
  };

  await prisma.systemSetting.upsert({
    where: { key: BUSINESS_SALES_QUOTA_KEY },
    update: {
      value: JSON.stringify(payload),
      description: "Business sales target quota set by Owner for Sales Staff"
    },
    create: {
      key: BUSINESS_SALES_QUOTA_KEY,
      value: JSON.stringify(payload),
      description: "Business sales target quota set by Owner for Sales Staff"
    }
  });

  return getBusinessSalesQuotaSummary();
};

module.exports = {
  BUSINESS_SALES_QUOTA_KEY,
  getQuotaPeriodWindow,
  getStoredQuotaConfig,
  getBusinessSalesQuotaSummary,
  saveBusinessSalesQuota
};
