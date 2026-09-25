const prisma = require("../../config/db");

const getOwnerDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: "customer" } });
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    
    const completedOrders = await prisma.order.findMany({
      where: { status: { not: "cancelled" } },
      select: { total: true, createdAt: true }
    });
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

    // Revenue Trend Chart Data (Last 30 Days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    
    const chartDataMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      chartDataMap[dateStr] = 0;
    }

    completedOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= thirtyDaysAgo) {
        const dateStr = orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (chartDataMap[dateStr] !== undefined) {
          chartDataMap[dateStr] += order.total;
        }
      }
    });

    const revenueChartData = Object.keys(chartDataMap).map(key => ({
      date: key,
      revenue: chartDataMap[key]
    }));

    // Recent Actionable Orders
    const recentOrdersData = await prisma.order.findMany({
      where: { status: "pending" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } }
    });

    const recentOrders = recentOrdersData.map(o => ({
      id: `#ORD-${o.id.toString().padStart(3, "0")}`,
      customer: o.customerName || o.shippingName || (o.user ? o.user.email.split('@')[0] : "Anonymous"),
      date: new Date(o.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }),
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      total: `₱${o.total.toLocaleString()}`
    }));

    // Stock Alerts (Low Stock < 20)
    const stockAlertsData = await prisma.product.findMany({
      where: { stock: { lt: 20 } },
      take: 10,
      orderBy: { stock: "asc" }
    });
    const stockAlerts = stockAlertsData.map(p => ({
      name: p.name,
      stock: p.stock,
      type: p.type
    }));

    // Inventory Value
    const products = await prisma.product.findMany({ select: { type: true, stock: true, price: true } });
    let totalStock = 0;
    let totalInventoryValue = 0;
    
    products.forEach(p => {
      totalStock += p.stock;
      totalInventoryValue += (p.stock * p.price);
    });

    // Top Selling Products
    const topSelling = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProducts = [];
    for (const ts of topSelling) {
      if (!ts.productId) continue;
      const prod = await prisma.product.findUnique({
        where: { id: ts.productId },
        include: { orderItems: true } 
      });
      if (prod) {
        const revenue = prod.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        topProducts.push({
          name: prod.name,
          type: prod.type,
          sold: ts._sum.quantity,
          revenue: revenue,
          revenueStr: `₱${revenue.toLocaleString()}`,
          stock: prod.stock
        });
      }
    }
    
    // Fallback if no sales
    if (topProducts.length === 0) {
      const fallbackProducts = await prisma.product.findMany({ take: 5, orderBy: { stock: "desc" } });
      fallbackProducts.forEach(p => {
        topProducts.push({
          name: p.name,
          type: p.type,
          sold: 0,
          revenue: 0,
          revenueStr: "₱0",
          stock: p.stock
        });
      });
    }

    // Sort top products by revenue for owner
    topProducts.sort((a, b) => b.revenue - a.revenue);

    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    res.status(200).json({
      success: true,
      data: {
        totals: {
          revenue: `₱${totalRevenue.toLocaleString()}`,
          inventoryValue: `₱${totalInventoryValue.toLocaleString()}`,
          products: totalProducts,
          orders: totalOrders,
          users: totalUsers,
          avgOrderValue: `₱${Math.round(avgOrderValue).toLocaleString()}`
        },
        revenueChartData,
        recentOrders,
        stockAlerts,
        topProducts
      }
    });

  } catch (error) {
    console.error("Owner Dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch owner dashboard statistics" });
  }
};

module.exports = {
  getOwnerDashboardStats
};
