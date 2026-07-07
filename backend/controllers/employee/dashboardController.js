const prisma = require("../../config/db");

const getEmployeeDashboardStats = async (req, res) => {
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
      include: { user: { select: { name: true, email: true } } }
    });

    const recentOrders = recentOrdersData.map(o => ({
      id: `#ORD-${o.id.toString().padStart(3, "0")}`,
      rawId: o.id,
      customer: o.customerName || o.shippingName || (o.user ? o.user.name : "Anonymous"),
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

    res.status(200).json({
      success: true,
      data: {
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
    console.error("Employee dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch employee dashboard statistics" });
  }
};

module.exports = {
  getEmployeeDashboardStats
};
