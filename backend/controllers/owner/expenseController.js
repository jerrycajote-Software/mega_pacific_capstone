const prisma = require("../../config/db");
const { getCollectedRevenueAmount } = require("../../services/paymentCalculationService");
const {
  roundCurrency,
  resolveFinancialPeriodRange,
  computeProfitSummary
} = require("../../services/financialSummaryService");

// Return read-only company expenses, category breakdown, and true net profit for the Owner
const getOwnerExpenses = async (req, res) => {
  try {
    const { period: rawPeriod = "all", category: rawCategory = "All", search: rawSearch = "" } = req.query;
    const { period, periodLabel, startDate, endDate } = resolveFinancialPeriodRange(rawPeriod);

    const dateFilter = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lt = endDate;
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    const orderWhere = {
      status: { notIn: ["cancelled", "rejected"] },
      paymentStatus: { notIn: ["refunded", "refund_pending"] },
      ...(hasDateFilter ? { createdAt: dateFilter } : {})
    };

    const expenseWhere = {
      status: "Approved",
      ...(hasDateFilter ? { date: dateFilter } : {})
    };

    const [validOrders, periodExpenses] = await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        select: { total: true, status: true, paymentStatus: true, paymentMode: true }
      }),
      prisma.expense.findMany({
        where: expenseWhere,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }]
      })
    ]);

    const totalRevenue = validOrders.reduce((sum, order) => sum + getCollectedRevenueAmount(order), 0);
    const profitSummary = computeProfitSummary({
      totalRevenue,
      expenses: periodExpenses
    });

    const normalizedCategory = String(rawCategory || "All").trim();
    const normalizedSearch = String(rawSearch || "").trim().toLowerCase();

    const filteredExpenses = periodExpenses.filter((expense) => {
      const matchesCategory =
        !normalizedCategory ||
        normalizedCategory.toLowerCase() === "all" ||
        String(expense.category || "").toLowerCase() === normalizedCategory.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        String(expense.reference || "").toLowerCase().includes(normalizedSearch) ||
        String(expense.category || "").toLowerCase().includes(normalizedSearch) ||
        String(expense.description || "").toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });

    const filteredTotalAmount = roundCurrency(
      filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    );

    const formattedExpenses = filteredExpenses.map((expense) => ({
      id: expense.id,
      reference: expense.reference || `EXP-${expense.id}`,
      category: expense.category || "Operations",
      description: expense.description || "Company expense",
      amount: roundCurrency(expense.amount),
      status: expense.status || "Approved",
      date: expense.date || expense.createdAt,
      createdAt: expense.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        period,
        periodLabel,
        summary: {
          totalRevenue: profitSummary.totalRevenue,
          totalExpenses: profitSummary.totalExpenses,
          netProfit: profitSummary.netProfit,
          profitMargin: profitSummary.profitMargin,
          expenseRatio: profitSummary.expenseRatio,
          expensesCount: profitSummary.expensesCount,
          expenseCategoriesCount: profitSummary.expenseCategoriesCount,
          filteredCount: formattedExpenses.length,
          filteredTotalAmount
        },
        categories: profitSummary.categoryBreakdown.map((item) => item.name),
        categoryBreakdown: profitSummary.categoryBreakdown,
        expenses: formattedExpenses
      }
    });
  } catch (error) {
    console.error("Failed to fetch owner company expenses:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load company expenses and profit summary right now. Please try again."
    });
  }
};

module.exports = {
  getOwnerExpenses
};
