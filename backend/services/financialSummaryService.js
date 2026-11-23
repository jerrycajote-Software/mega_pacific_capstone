// Shared helper service for computing company expenses, category breakdowns, and net profit

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

// Resolve a supported Owner/Finance reporting period into start/end dates and a clear label
const resolveFinancialPeriodRange = (rawPeriod = "all") => {
  const normalized = String(rawPeriod || "all").trim().toLowerCase();
  const now = new Date();

  if (normalized === "month") {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      period: "month",
      periodLabel: `This Month (${now.toLocaleString("en-US", { month: "long", year: "numeric" })})`,
      startDate,
      endDate: null
    };
  }

  if (normalized === "last_month") {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      period: "last_month",
      periodLabel: `Last Month (${startDate.toLocaleString("en-US", { month: "long", year: "numeric" })})`,
      startDate,
      endDate
    };
  }

  if (normalized === "quarter") {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
    return {
      period: "quarter",
      periodLabel: `Q${currentQuarter + 1} ${now.getFullYear()}`,
      startDate,
      endDate: null
    };
  }

  if (normalized === "year") {
    const startDate = new Date(now.getFullYear(), 0, 1);
    return {
      period: "year",
      periodLabel: `Year to Date (${now.getFullYear()})`,
      startDate,
      endDate: null
    };
  }

  return {
    period: "all",
    periodLabel: "All Time",
    startDate: null,
    endDate: null
  };
};

// Group approved expenses by category with amounts, entry counts, and percentage share
const buildExpenseCategoryBreakdown = (expenses = []) => {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const totalExpenses = safeExpenses.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const categoryMap = {};

  safeExpenses.forEach((expense) => {
    const categoryName = String(expense?.category || "Operations").trim() || "Operations";
    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = { name: categoryName, amount: 0, count: 0 };
    }
    categoryMap[categoryName].amount += Number(expense?.amount) || 0;
    categoryMap[categoryName].count += 1;
  });

  return Object.values(categoryMap)
    .map((entry) => ({
      name: entry.name,
      amount: roundCurrency(entry.amount),
      count: entry.count,
      sharePercent: totalExpenses > 0 ? Number(((entry.amount / totalExpenses) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.amount - a.amount);
};

// Calculate consistent revenue, approved expense, net profit, and margin figures
const computeProfitSummary = ({ totalRevenue = 0, expenses = [] }) => {
  const safeRevenue = roundCurrency(totalRevenue);
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const totalExpenses = roundCurrency(
    safeExpenses.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0)
  );
  const netProfit = roundCurrency(safeRevenue - totalExpenses);
  const profitMargin = safeRevenue > 0 ? Number(((netProfit / safeRevenue) * 100).toFixed(1)) : 0;
  const expenseRatio = safeRevenue > 0 ? Number(((totalExpenses / safeRevenue) * 100).toFixed(1)) : 0;
  const categoryBreakdown = buildExpenseCategoryBreakdown(safeExpenses);

  return {
    totalRevenue: safeRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    expenseRatio,
    expensesCount: safeExpenses.length,
    expenseCategoriesCount: categoryBreakdown.length,
    categoryBreakdown
  };
};

module.exports = {
  roundCurrency,
  resolveFinancialPeriodRange,
  buildExpenseCategoryBreakdown,
  computeProfitSummary
};
