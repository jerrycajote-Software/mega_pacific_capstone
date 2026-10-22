const prisma = require("../../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Customer statistics
    const totalCustomers = await prisma.user.count({
      where: { role: "customer", status: { not: "deleted" } }
    });
    const newCustomersThisWeek = await prisma.user.count({
      where: {
        role: "customer",
        status: { not: "deleted" },
        createdAt: { gte: oneWeekAgo }
      }
    });
    const activeCustomers = await prisma.user.count({
      where: { role: "customer", status: "active" }
    });
    const suspendedCustomers = await prisma.user.count({
      where: { role: "customer", status: "suspended" }
    });
    const verifiedCustomers = await prisma.user.count({
      where: {
        role: "customer",
        status: { not: "deleted" },
        isEmailVerified: true
      }
    });
    const unverifiedCustomers = totalCustomers - verifiedCustomers;
    const verificationRate = totalCustomers > 0
      ? Math.round((verifiedCustomers / totalCustomers) * 100)
      : 100;

    // Departmental staff accounts
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ["sales", "logistic", "finance", "owner", "admin"] },
        status: { not: "deleted" }
      },
      include: {
        adminProfile: true,
        ownerProfile: true,
        salesProfile: true,
        logisticProfile: true,
        financeProfile: true
      },
      orderBy: { role: "asc" }
    });

    const staffMembers = staffUsers.map(u => {
      let profile = null;
      if (u.role === "admin") profile = u.adminProfile;
      else if (u.role === "owner") profile = u.ownerProfile;
      else if (u.role === "sales") profile = u.salesProfile;
      else if (u.role === "logistic") profile = u.logisticProfile;
      else if (u.role === "finance") profile = u.financeProfile;

      return {
        id: u.id,
        role: u.role,
        email: u.email,
        name: profile?.name || u.email.split("@")[0],
        contactNumber: profile?.contactNumber || null,
        status: u.status,
        createdAt: u.createdAt
      };
    });

    const activeStaff = staffMembers.filter(s => s.status === "active").length;
    const totalStaff = staffMembers.length;

    // Recent 5 customer registrations
    const recentCustomersData = await prisma.user.findMany({
      where: { role: "customer", status: { not: "deleted" } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customerProfile: true }
    });

    const recentCustomers = recentCustomersData.map(c => ({
      id: c.id,
      email: c.email,
      name: c.customerProfile?.name || c.email.split("@")[0],
      contactNumber: c.customerProfile?.contactNumber || null,
      location: [c.customerProfile?.city, c.customerProfile?.province].filter(Boolean).join(", ") || "CALABARZON",
      isEmailVerified: c.isEmailVerified,
      status: c.status,
      createdAt: c.createdAt
    }));

    // System configuration & security status
    const maxDeviceSetting = await prisma.systemSetting.findUnique({
      where: { key: "max_sales_devices" }
    });
    const activeSessionsCount = await prisma.userSession.count({
      where: { isActive: true }
    });

    // Orders & revenue for high-level cross-department context
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count({
      where: { status: { notIn: ["cancelled", "rejected"] } }
    });
    const completedOrders = await prisma.order.findMany({
      where: {
        status: { notIn: ["cancelled", "rejected"] },
        paymentStatus: { not: "refunded" }
      },
      select: { total: true }
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        kpi: {
          totalCustomers,
          newCustomersThisWeek,
          activeCustomers,
          suspendedCustomers,
          verifiedCustomers,
          unverifiedCustomers,
          verificationRate,
          totalStaff,
          activeStaff,
          flagsCount: suspendedCustomers + unverifiedCustomers
        },
        staffMembers,
        recentCustomers,
        systemStatus: {
          singletonCount: staffMembers.length,
          maxSalesDevices: maxDeviceSetting ? parseInt(maxDeviceSetting.value, 10) : 3,
          activeSessionsCount
        },
        totals: {
          revenue: `₱${totalRevenue.toLocaleString()}`,
          products: totalProducts,
          orders: totalOrders,
          users: totalCustomers
        }
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
