const prisma = require("../../config/db");

// Strip the internal archival prefix from soft-deleted account emails for readable Admin display
const formatDisplayEmail = (email) => {
  if (!email) return "";
  return String(email).replace(/^deleted_\d+_\d+_/, "");
};

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
        deletedAt: true,
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
      const displayEmail = formatDisplayEmail(user.email);
      const name = user.customerProfile?.name || 
                   user.adminProfile?.name || 
                   user.superAdminProfile?.name ||
                   user.ownerProfile?.name || 
                   user.salesProfile?.name || 
                   user.logisticProfile?.name || 
                   user.financeProfile?.name || 
                   displayEmail.split('@')[0];
      
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
        email: displayEmail,
        role: user.role,
        status: user.status,
        deletedAt: user.deletedAt,
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
      return res.status(400).json({ success: false, message: "Status must be either active or suspended." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      select: { id: true, status: true }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User account could not be found." });
    }

    if (existingUser.status === "deleted") {
      return res.status(400).json({
        success: false,
        message: "This account has already been deleted and cannot be reactivated or suspended."
      });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: { status },
      select: { id: true, email: true, status: true }
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Failed to update user status:", error);
    res.status(500).json({ success: false, message: "Failed to update user status." });
  }
};

module.exports = {
  getUsers,
  updateUserStatus
};
