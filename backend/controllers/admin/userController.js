const prisma = require("../../config/db");


const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'superadmin' }
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        customerProfile: { select: { name: true } },
        adminProfile: { select: { name: true } },
        superAdminProfile: { select: { name: true } },
        ownerProfile: { select: { name: true } },
        salesProfile: { select: { name: true } },
        logisticProfile: { select: { name: true } },
        financeProfile: { select: { name: true } }
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
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        name
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
