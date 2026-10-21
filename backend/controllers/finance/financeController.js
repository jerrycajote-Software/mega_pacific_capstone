const prisma = require('../../config/db');

const getDashboardData = async (req, res) => {
  try {
    // 1. Total Revenue (Sum of 'paid' orders or total of completed orders)
    // For now, we sum all orders that are not pending/cancelled
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'paid',
        status: { notIn: ['cancelled', 'rejected'] }
      },
    });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    const pendingOrders = await prisma.order.count({
      where: { paymentStatus: 'pending', paymentMode: 'Bank Transfer' },
    });

    const expenses = await prisma.expense.findMany({
      where: { status: 'Approved' },
    });
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    const netProfit = totalRevenue - totalExpenses;

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        total: true,
        paymentMode: true,
        paymentStatus: true,
        customerName: true
      }
    });

    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const activity = [
      ...recentOrders.map(o => ({
        id: `#ORD-${o.id.toString().padStart(3, '0')}`,
        date: o.createdAt.toISOString().split('T')[0],
        amount: `₱${(o.total || 0).toLocaleString()}`,
        method: o.paymentMode || 'Cash on Delivery',
        status: o.paymentStatus === 'paid' ? 'verified' : o.paymentStatus,
        by: o.customerName || 'Customer',
        type: 'order',
        timestamp: o.createdAt
      })),
      ...recentExpenses.map(e => ({
        id: e.reference || `#EXP-${e.id}`,
        date: e.date.toISOString().split('T')[0],
        amount: `₱${e.amount.toLocaleString()}`,
        method: 'Expense',
        status: e.status.toLowerCase(),
        by: e.category,
        type: 'expense',
        timestamp: e.createdAt
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

    // 6-month revenue vs expenses trend
    const now = new Date();
    const trendMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short' });
      trendMap[key] = { month: key, revenue: 0, expenses: 0, profit: 0 };
    }

    orders.forEach(o => {
      const m = new Date(o.createdAt).toLocaleString('en-US', { month: 'short' });
      if (trendMap[m]) {
        trendMap[m].revenue += (o.total || 0);
      }
    });

    expenses.forEach(e => {
      const m = new Date(e.date || e.createdAt).toLocaleString('en-US', { month: 'short' });
      if (trendMap[m]) {
        trendMap[m].expenses += (e.amount || 0);
      }
    });

    const revenueVsExpensesTrend = Object.values(trendMap).map(item => ({
      ...item,
      profit: item.revenue - item.expenses
    }));

    const paymentMap = {};
    orders.forEach(o => {
      const mode = o.paymentMode || 'Cash on Delivery';
      if (!paymentMap[mode]) paymentMap[mode] = { name: mode, value: 0, count: 0 };
      paymentMap[mode].value += (o.total || 0);
      paymentMap[mode].count += 1;
    });
    const paymentBreakdown = Object.values(paymentMap);

    const categoryMap = {};
    expenses.forEach(e => {
      const cat = e.category || 'Operations';
      if (!categoryMap[cat]) categoryMap[cat] = { name: cat, value: 0, count: 0 };
      categoryMap[cat].value += (e.amount || 0);
      categoryMap[cat].count += 1;
    });
    const expenseCategoryBreakdown = Object.values(categoryMap);

    const profitMargin = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;
    const expenseRatio = totalRevenue > 0 ? Number(((totalExpenses / totalRevenue) * 100).toFixed(1)) : 0;
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    res.json({
      success: true,
      data: {
        kpi: {
          totalRevenue,
          pendingPayments: pendingOrders,
          totalExpenses,
          netProfit,
          profitMargin,
          expenseRatio,
          avgOrderValue,
          paidOrdersCount: orders.length
        },
        revenueVsExpensesTrend,
        paymentBreakdown: paymentBreakdown.length > 0 ? paymentBreakdown : [
          { name: 'Cash on Delivery', value: totalRevenue || 1, count: orders.length || 1 }
        ],
        expenseCategoryBreakdown: expenseCategoryBreakdown.length > 0 ? expenseCategoryBreakdown : [
          { name: 'Logistics', value: 1000, count: 1 },
          { name: 'Maintenance', value: 500, count: 1 }
        ],
        recentActivity: activity
      }
    });
  } catch (error) {
    console.error('Finance Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getFinancialReports = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate = new Date();
    let periodLabel = 'This Month (September 2026)';

    if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodLabel = 'Last Month (August 2026)';
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      periodLabel = `Q${currentQuarter + 1} ${now.getFullYear()}`;
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      periodLabel = `Year to Date (${now.getFullYear()})`;
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      periodLabel = `This Month (${now.toLocaleString('en-US', { month: 'long', year: 'numeric' })})`;
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['cancelled', 'rejected'] }
      }
    });

    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: startDate },
        status: 'Approved'
      }
    });

    const paidOrders = orders.filter(o => o.paymentStatus === 'paid' && !['cancelled', 'rejected'].includes(o.status));
    const grossRevenue = paidOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const netIncome = grossRevenue - totalExpenses;
    const vat12 = Math.round(grossRevenue * (0.12 / 1.12));
    const netSales = grossRevenue - vat12;
    const profitMargin = grossRevenue > 0 ? Number(((netIncome / grossRevenue) * 100).toFixed(1)) : 0;

    const deliveryRevenue = paidOrders.filter(o => o.fulfillmentType === 'Delivery').reduce((acc, o) => acc + (o.total || 0), 0);
    const pickupRevenue = paidOrders.filter(o => o.fulfillmentType === 'Pickup').reduce((acc, o) => acc + (o.total || 0), 0);

    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const incomeStatementRows = [
      { category: 'Operating Revenue', item: 'Online Deliveries Fulfillment', amount: deliveryRevenue, type: 'income' },
      { category: 'Operating Revenue', item: 'In-Store Pickup Orders', amount: pickupRevenue, type: 'income' },
      { category: 'Operating Revenue', item: 'Gross Operating Revenue', amount: grossRevenue, type: 'total_income', isBold: true },
      ...Object.entries(categoryTotals).map(([cat, amt]) => ({
        category: 'Operating Expenses',
        item: `${cat} Expense`,
        amount: amt,
        type: 'expense'
      })),
      { category: 'Operating Expenses', item: 'Total Operating Expenses', amount: totalExpenses, type: 'total_expense', isBold: true },
      { category: 'Net Results', item: 'Net Operating Income', amount: netIncome, type: 'net_income', isBold: true }
    ];

    res.json({
      success: true,
      data: {
        period,
        periodLabel,
        generatedAt: new Date().toISOString(),
        summary: {
          grossRevenue,
          totalExpenses,
          netIncome,
          vat12,
          netSales,
          profitMargin,
          ordersCount: paidOrders.length,
          expensesCount: expenses.length
        },
        incomeStatementRows,
        expensesByCategory: Object.entries(categoryTotals).map(([name, amount]) => ({ name, amount })),
        recentExpenses: expenses.map(e => ({
          reference: e.reference,
          date: e.date.toISOString().split('T')[0],
          category: e.category,
          description: e.description,
          amount: e.amount,
          status: e.status
        })),
        recentPaidOrders: paidOrders.map(o => ({
          id: `#ORD-${o.id.toString().padStart(3, '0')}`,
          customer: o.customerName || o.shippingName || 'Customer',
          total: o.total,
          date: o.createdAt.toISOString().split('T')[0],
          paymentMode: o.paymentMode
        }))
      }
    });
  } catch (error) {
    console.error('Financial Reports Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Get Expenses Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createExpense = async (req, res) => {
  try {
    const { category, description, amount } = req.body;
    const expense = await prisma.expense.create({
      data: {
        reference: `EXP-${Date.now().toString().slice(-6)}`,
        category,
        description,
        amount: parseFloat(amount),
        status: 'Approved'
      }
    });
    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Create Expense Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const { getDeliveryConfig, PLANT_ORIGIN, VEHICLE_SPECS } = require('../../services/deliveryFeeService');

const getDeliverySettings = async (req, res) => {
  try {
    const config = await getDeliveryConfig();
    res.json({
      success: true,
      data: {
        ...config,
        plantOriginDetails: PLANT_ORIGIN,
        vehicleSpecs: VEHICLE_SPECS
      }
    });
  } catch (error) {
    console.error('Get Delivery Settings Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateDeliverySettings = async (req, res) => {
  try {
    const { dieselPrice, adminCostPct, includeDepreciation, plantOrigin } = req.body;

    const updates = [];
    if (dieselPrice !== undefined) {
      updates.push(prisma.systemSetting.upsert({
        where: { key: 'delivery_diesel_price' },
        update: { value: String(dieselPrice), description: 'Current Diesel unit price per liter (PHP)' },
        create: { key: 'delivery_diesel_price', value: String(dieselPrice), description: 'Current Diesel unit price per liter (PHP)' }
      }));
    }
    if (adminCostPct !== undefined) {
      updates.push(prisma.systemSetting.upsert({
        where: { key: 'delivery_admin_cost_pct' },
        update: { value: String(adminCostPct), description: 'Admin operation cost percentage for PMS and incidentals' },
        create: { key: 'delivery_admin_cost_pct', value: String(adminCostPct), description: 'Admin operation cost percentage for PMS and incidentals' }
      }));
    }
    if (includeDepreciation !== undefined) {
      updates.push(prisma.systemSetting.upsert({
        where: { key: 'delivery_include_depreciation' },
        update: { value: String(includeDepreciation), description: 'Include vehicle depreciation in delivery charge calculation' },
        create: { key: 'delivery_include_depreciation', value: String(includeDepreciation), description: 'Include vehicle depreciation in delivery charge calculation' }
      }));
    }
    if (plantOrigin !== undefined) {
      updates.push(prisma.systemSetting.upsert({
        where: { key: 'delivery_plant_origin' },
        update: { value: String(plantOrigin), description: 'Manufacturing Plant Origin for delivery distance calculation' },
        create: { key: 'delivery_plant_origin', value: String(plantOrigin), description: 'Manufacturing Plant Origin for delivery distance calculation' }
      }));
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }
    const updatedConfig = await getDeliveryConfig();

    res.json({
      success: true,
      message: 'Delivery settings updated successfully',
      data: updatedConfig
    });
  } catch (error) {
    console.error('Update Delivery Settings Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update delivery settings' });
  }
};

module.exports = {
  getDashboardData,
  getFinancialReports,
  getExpenses,
  createExpense,
  getDeliverySettings,
  updateDeliverySettings
};
