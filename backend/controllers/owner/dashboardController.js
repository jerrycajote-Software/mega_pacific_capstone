const prisma = require("../../config/db");

const getOwnerDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: "customer" } });
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count({
      where: { status: { notIn: ["cancelled", "rejected"] } }
    });
    
    const completedOrders = await prisma.order.findMany({
      where: {
        status: { notIn: ["cancelled", "rejected"] },
        paymentStatus: { not: "refunded" }
      },
      select: { total: true, createdAt: true }
    });
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    
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

    const products = await prisma.product.findMany({ select: { type: true, stock: true, price: true } });
    let totalStock = 0;
    let totalInventoryValue = 0;
    
    products.forEach(p => {
      totalStock += p.stock;
      totalInventoryValue += (p.stock * p.price);
    });

    const topSelling = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: { notIn: ["cancelled", "rejected"] },
          paymentStatus: { not: "refunded" }
        }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProducts = [];
    for (const ts of topSelling) {
      if (!ts.productId) continue;
      const prod = await prisma.product.findUnique({
        where: { id: ts.productId },
        include: {
          orderItems: {
            where: {
              order: {
                status: { notIn: ["cancelled", "rejected"] },
                paymentStatus: { not: "refunded" }
              }
            }
          }
        } 
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

    topProducts.sort((a, b) => b.revenue - a.revenue);

    const totalVariants = await prisma.coilInventory.count();
    const coils = await prisma.coilInventory.findMany();
    const totalRolls = coils.reduce((sum, c) => sum + (c.coilCount != null ? c.coilCount : 0), 0);
    const lowCoils = coils.filter(c => (c.coilCount != null ? c.coilCount : 0) <= (c.minAlertCount || 1) && (c.coilCount != null ? c.coilCount : 0) > 0);
    const criticalCoils = coils.filter(c => (c.coilCount != null ? c.coilCount : 0) === 0);

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
          avgOrderValue: `₱${Math.round(avgOrderValue).toLocaleString()}`,
          rawCoilMeters: `${totalRolls} Coils`
        },
        coilHealth: {
          totalCoils: totalRolls,
          totalVariants,
          totalCoilMeters: totalRolls,
          lowCount: lowCoils.length,
          criticalCount: criticalCoils.length,
          lowCoils: [...criticalCoils, ...lowCoils].slice(0, 6).map(c => ({
            name: `${c.color} (${c.thickness})`,
            availableMeters: c.coilCount != null ? c.coilCount : 0,
            coilCount: c.coilCount != null ? c.coilCount : 0,
            minAlertMeters: c.minAlertCount || 1
          }))
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
