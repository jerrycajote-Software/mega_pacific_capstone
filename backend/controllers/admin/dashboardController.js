const prisma = require("../../config/db");

const getDashboardStats = async (req, res) => {
  try {
    
    const totalUsers = await prisma.user.count({ where: { role: "customer" } });
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    
    const completedOrders = await prisma.order.findMany({
      where: { status: { not: "cancelled" } },
      select: { total: true, createdAt: true }
    });
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

    
    const recentOrdersData = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } }
    });

    const recentOrders = recentOrdersData.map(o => ({
      id: `#ORD-${o.id.toString().padStart(3, "0")}`,
      customer: o.user.name,
      date: new Date(o.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }),
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      total: `₱${o.total.toLocaleString()}`
    }));

  
    const recentUsersData = await prisma.user.findMany({
      where: { role: "customer" },
      take: 5,
      orderBy: { createdAt: "desc" }
    });
    const recentUsers = recentUsersData.map(u => ({
      name: u.name,
      email: u.email,
      role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
      joined: new Date(u.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
    }));

    
  
    const stockAlertsData = await prisma.product.findMany({
      where: { stock: { lt: 10 } },
      take: 5,
      orderBy: { stock: "asc" }
    });
    const stockAlerts = stockAlertsData.map(p => ({
      name: p.name,
      stock: p.stock
    }));

    
    const products = await prisma.product.findMany({ select: { type: true, stock: true } });
    const typeGroups = {};
    let totalStock = 0;
    products.forEach(p => {
      typeGroups[p.type] = (typeGroups[p.type] || 0) + p.stock;
      totalStock += p.stock;
    });
    
    const colors = ["#22c55e", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6"];
    const glows = ["rgba(34,197,94,0.5)", "rgba(245,158,11,0.5)", "rgba(16,185,129,0.5)", "rgba(6,182,212,0.5)", "rgba(139,92,246,0.5)"];
    
    const inventoryBars = Object.keys(typeGroups).map((type, index) => {
      const pct = totalStock === 0 ? 0 : Math.round((typeGroups[type] / totalStock) * 100);
      return {
        label: type,
        pct: pct,
        color: colors[index % colors.length],
        glow: glows[index % glows.length]
      };
    }).sort((a, b) => b.pct - a.pct); // Sort descending

    
    const topSelling = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 4
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
          revenue: `₱${revenue.toLocaleString()}`,
          stock: prod.stock
        });
      }
    }
    
    
    if (topProducts.length === 0) {
      const fallbackProducts = await prisma.product.findMany({ take: 4, orderBy: { stock: "desc" } });
      fallbackProducts.forEach(p => {
        topProducts.push({
          name: p.name,
          type: p.type,
          sold: 0,
          revenue: "₱0",
          stock: p.stock
        });
      });
    }

    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - today.getDay()); 
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaySales = completedOrders.filter(o => new Date(o.createdAt) >= today);
    const weekSales = completedOrders.filter(o => new Date(o.createdAt) >= weekStart);
    const monthSales = completedOrders.filter(o => new Date(o.createdAt) >= monthStart);

    const todayTotal = todaySales.reduce((acc, o) => acc + o.total, 0);
    const weekTotal = weekSales.reduce((acc, o) => acc + o.total, 0);
    const monthTotal = monthSales.reduce((acc, o) => acc + o.total, 0);

    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    const salesSummary = [
      { label: "Today's Sales", value: `₱${todayTotal.toLocaleString()}`, sub: `${todaySales.length} orders` },
      { label: "This Week", value: `₱${weekTotal.toLocaleString()}`, sub: `${weekSales.length} orders` },
      { label: "This Month", value: `₱${monthTotal.toLocaleString()}`, sub: `${monthSales.length} orders` },
      { label: "Avg Order Value", value: `₱${Math.round(avgOrderValue).toLocaleString()}`, sub: "Per transaction" }
    ];

    res.status(200).json({
      success: true,
      data: {
        totals: {
          revenue: `₱${totalRevenue.toLocaleString()}`,
          products: totalProducts,
          orders: totalOrders,
          users: totalUsers
        },
        recentOrders,
        recentUsers,
        stockAlerts,
        inventoryBars,
        topProducts,
        salesSummary
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard statistics" });
  }
};

module.exports = {
  getDashboardStats
};
