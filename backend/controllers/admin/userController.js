const prisma = require("../../config/db");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

module.exports = {
  getUsers
};
