const prisma = require("../../config/db");

const getSalesDashboardStats = async (req, res) => {
  try {
    // 1. Order status counts
    const pendingOrdersCount = await prisma.order.count({ where: { status: "pending" } });
    const processingOrdersCount = await prisma.order.count({ where: { status: "processing" } });
    const outForDeliveryCount = await prisma.order.count({ 
      where: { status: { in: ["shipped", "out_for_delivery"] } } 
    });

    // 2. Fetch products and check stock
    const products = await prisma.product.findMany({
      include: { variants: true }
    });

    const totalProducts = products.length;
    const totalOrders = await prisma.order.count();
    
    const completedOrders = await prisma.order.findMany({
      where: { status: { not: "cancelled" } },
      select: { total: true, createdAt: true }
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockProductsList = [];

    products.forEach(p => {
      // Calculate stock using variant logic if variants exist, else base stock
      let stock = p.stock;
      if (p.variants && p.variants.length > 0) {
        stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
      }

      totalStock += stock;

      if (stock === 0) {
        outOfStockCount++;
      }
      
      if (stock < 10) {
        lowStockCount++;
        lowStockProductsList.push({
          id: p.id,
          name: p.name,
          stock: stock,
          category: p.type
        });
      }
    });

    // Sort low stock products by stock ascending, limit to 5
    lowStockProductsList.sort((a, b) => a.stock - b.stock);
    const lowStockProducts = lowStockProductsList.slice(0, 5);

    // Get unique categories list
    const categories = [...new Set(products.map(p => p.type))];

    // 3. Recently Added Products
    const recentlyAddedData = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    });

    const recentlyAdded = recentlyAddedData.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      price: p.price,
      unit: p.unit,
      dateAdded: new Date(p.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
    }));

    // 4. Recent Customer Orders
    const recentOrdersData = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } }
    });

    const recentOrders = recentOrdersData.map(o => ({
      id: `#ORD-${o.id.toString().padStart(3, "0")}`,
      rawId: o.id,
      customer: o.customerName || o.shippingName || (o.user ? o.user.email.split('@')[0] : "Anonymous"),
      date: new Date(o.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }),
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      total: `₱${o.total.toLocaleString()}`
    }));

    // 5. Daily Activity Summary
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const ordersPlacedToday = await prisma.order.count({
      where: { createdAt: { gte: todayStart } }
    });

    const ordersDeliveredToday = await prisma.order.count({
      where: {
        status: "delivered",
        OR: [
          { estimatedDeliveryDate: { gte: todayStart } },
          { createdAt: { gte: todayStart } }
        ]
      }
    });

    // Total items sold today
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart },
        status: { not: "cancelled" }
      },
      include: { items: true }
    });

    let itemsSoldToday = 0;
    todayOrders.forEach(o => {
      o.items.forEach(item => {
        itemsSoldToday += item.quantity;
      });
    });

    // 6. Top Selling Products
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

    res.status(200).json({
      success: true,
      data: {
        totals: {
          revenue: `₱${totalRevenue.toLocaleString()}`,
          products: totalProducts,
          orders: totalOrders
        },
        topProducts,
        counts: {
          pending: pendingOrdersCount,
          processing: processingOrdersCount,
          delivery: outForDeliveryCount
        },
        inventorySummary: {
          totalProducts: products.length,
          totalCategories: categories.length,
          totalStock: totalStock,
          outOfStock: outOfStockCount,
          lowStock: lowStockCount
        },
        lowStockProducts,
        recentlyAdded,
        recentOrders,
        dailyActivity: {
          placed: ordersPlacedToday,
          delivered: ordersDeliveredToday,
          itemsSold: itemsSoldToday
        }
      }
    });

  } catch (error) {
    console.error("Sales dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch sales dashboard statistics" });
  }
};

module.exports = {
  getSalesDashboardStats
};
