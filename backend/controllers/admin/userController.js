const prisma = require("../../config/db");

const getUsers = async (req, res) => {
  try {
    const rolesToExclude = ['superadmin', 'super_admin'];
    if (req.user.role !== 'owner' && req.user.role !== 'superadmin' && req.user.role !== 'super_admin') {
      rolesToExclude.push('owner');
    }

    const users = await prisma.user.findMany({
      where: {
        role: { notIn: rolesToExclude },
        id: { not: req.user.userId }
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        isEmailVerified: true,
        customerProfile: { select: { name: true, contactNumber: true, city: true, province: true } },
        adminProfile: { select: { name: true, contactNumber: true } },
        superAdminProfile: { select: { name: true, contactNumber: true } },
        ownerProfile: { select: { name: true, contactNumber: true } },
        salesProfile: { select: { name: true, contactNumber: true } },
        logisticProfile: { select: { name: true, contactNumber: true } },
        financeProfile: { select: { name: true, contactNumber: true } }
      }
    });

    const formattedUsers = users.map(user => {
      const name = user.customerProfile?.name || 
                   user.adminProfile?.name || 
                   user.superAdminProfile?.name ||
                   user.ownerProfile?.name || 
                   user.salesProfile?.name || 
                   user.logisticProfile?.name || 
                   user.financeProfile?.name || 
                   user.email.split('@')[0];
      
      const contactNumber = user.customerProfile?.contactNumber ||
                            user.adminProfile?.contactNumber ||
                            user.superAdminProfile?.contactNumber ||
                            user.ownerProfile?.contactNumber ||
                            user.salesProfile?.contactNumber ||
                            user.logisticProfile?.contactNumber ||
                            user.financeProfile?.contactNumber || null;

      const location = [user.customerProfile?.city, user.customerProfile?.province].filter(Boolean).join(', ') || null;

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        isEmailVerified: Boolean(user.isEmailVerified),
        name,
        contactNumber,
        location
      };
    });

    res.status(200).json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status." });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
      select: { id: true, email: true, status: true }
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Failed to update user status:", error);
    res.status(500).json({ success: false, error: "Failed to update user status" });
  }
};

module.exports = {
  getUsers,
  updateUserStatus
};
