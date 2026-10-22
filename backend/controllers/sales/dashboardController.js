const prisma = require("../../config/db");

const getSalesDashboardStats = async (req, res) => {
  try {
    const pendingOrdersCount = await prisma.order.count({ where: { status: "pending" } });
    const processingOrdersCount = await prisma.order.count({ where: { status: "processing" } });
    const outForDeliveryCount = await prisma.order.count({ 
      where: { status: { in: ["shipped", "out_for_delivery"] } } 
    });
    const completedOrdersCount = await prisma.order.count({
      where: { status: { in: ["completed", "delivered"] } }
    });
    const cancelledOrdersCount = await prisma.order.count({
      where: { status: { in: ["cancelled", "rejected"] } }
    });
    const rejectedOrdersCount = await prisma.order.count({
      where: { status: "rejected" }
    });

    const products = await prisma.product.findMany({
      include: { variants: true }
    });

    const totalProducts = products.length;
    const validOrdersCount = await prisma.order.count({
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

    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockProductsList = [];

    products.forEach(p => {
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

    
    lowStockProductsList.sort((a, b) => a.stock - b.stock);
    const lowStockProducts = lowStockProductsList.slice(0, 5);

    const categories = [...new Set(products.map(p => p.type))];

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

    const recentOrdersData = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            customerProfile: { select: { name: true, avatarUrl: true } }
          }
        },
        items: {
          select: { quantity: true }
        }
      }
    });

    const recentOrders = recentOrdersData.map(o => {
      const itemCount = o.items ? o.items.reduce((acc, it) => acc + (it.quantity || 1), 0) : 1;
      const customerName = o.customerName || o.shippingName || o.user?.customerProfile?.name || (o.user ? o.user.email.split('@')[0] : "Customer");
      return {
        id: `#ORD-${o.id.toString().padStart(3, "0")}`,
        rawId: o.id,
        customer: customerName,
        avatarUrl: o.user?.customerProfile?.avatarUrl || null,
        date: new Date(o.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }),
        status: o.status,
        paymentMode: o.paymentMode || "Cash on Delivery",
        paymentStatus: o.paymentStatus || "unpaid",
        itemCount,
        total: `₱${o.total.toLocaleString()}`,
        rawTotal: o.total
      };
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const ordersPlacedToday = await prisma.order.count({
      where: {
        createdAt: { gte: todayStart },
        status: { notIn: ["cancelled", "rejected"] }
      }
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

    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart },
        status: { notIn: ["cancelled", "rejected"] },
        paymentStatus: { not: "refunded" }
      },
      include: { items: true }
    });

    let itemsSoldToday = 0;
    let todayRevenue = 0;
    todayOrders.forEach(o => {
      todayRevenue += (o.total || 0);
      o.items.forEach(item => {
        itemsSoldToday += item.quantity;
      });
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
      take: 4
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

    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);
      last7Days.push({
        dayName: d.toLocaleDateString("en-PH", { weekday: "short" }),
        dateStr: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
        start: d,
        end: nextD
      });
    }

    let pastWeekOrders = [];
    try {
      pastWeekOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: last7Days[0].start },
          status: { notIn: ["cancelled", "rejected"] },
          paymentStatus: { not: "refunded" }
        },
        select: { createdAt: true, total: true, status: true, paymentStatus: true }
      });
    } catch (e) {
      console.warn("Could not fetch past week orders:", e.message);
    }

    const salesTrend = last7Days.map(slot => {
      const dayOrders = pastWeekOrders.filter(o => o.createdAt >= slot.start && o.createdAt < slot.end);
      const dayRev = dayOrders
        .reduce((sum, o) => sum + (o.total || 0), 0);
      return {
        day: slot.dayName,
        date: slot.dateStr,
        orders: dayOrders.length,
        revenue: dayRev
      };
    });

    let openInquiriesCount = 0;
    try {
      openInquiriesCount = await prisma.inquiry.count({
        where: { status: { in: ["Open", "In Progress"] } }
      });
    } catch (e) {
      console.warn("Could not count open inquiries:", e.message);
    }

    let pendingReviewsCount = 0;
    let averageRating = 4.9;
    let totalReviewsCount = 0;
    try {
      totalReviewsCount = await prisma.review.count();
      pendingReviewsCount = await prisma.review.count({
        where: { reply: null }
      });
      const avg = await prisma.review.aggregate({ _avg: { rating: true } });
      if (avg && avg._avg && avg._avg.rating) {
        averageRating = Number(avg._avg.rating.toFixed(1));
      }
    } catch (e) {
      console.warn("Could not compute review stats:", e.message);
    }

    res.status(200).json({
      success: true,
      data: {
        totals: {
          revenue: `₱${totalRevenue.toLocaleString()}`,
          rawRevenue: totalRevenue,
          products: totalProducts,
          orders: validOrdersCount
        },
        topProducts,
        counts: {
          pending: pendingOrdersCount,
          processing: processingOrdersCount,
          delivery: outForDeliveryCount,
          completed: completedOrdersCount,
          cancelled: cancelledOrdersCount,
          rejected: rejectedOrdersCount
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
          itemsSold: itemsSoldToday,
          todayRevenue: `₱${todayRevenue.toLocaleString()}`
        },
        salesTrend,
        customerService: {
          openInquiries: openInquiriesCount,
          pendingReviews: pendingReviewsCount,
          averageRating: averageRating,
          totalReviews: totalReviewsCount
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
