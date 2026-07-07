const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");

/**
 * GET /api/admin/employees
 * List all employees
 */
const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: "employee" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        contactNumber: true,
        createdAt: true,
      },
    });
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    res.status(500).json({ success: false, error: "Failed to fetch employees" });
  }
};

/**
 * POST /api/admin/employees
 * Create a new employee account (admin sets password)
 */
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, contactNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, and password are required." });
    }

    // Check for existing email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        contactNumber: contactNumber || null,
        role: "employee",
        status: "active",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        contactNumber: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error("Failed to create employee:", error);
    res.status(500).json({ success: false, error: "Failed to create employee" });
  }
};

/**
 * PUT /api/admin/employees/:id
 * Update employee info (name, contact, status)
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactNumber, status } = req.body;

    const employee = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(contactNumber !== undefined && { contactNumber }),
        ...(status && { status }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        contactNumber: true,
        createdAt: true,
      },
    });

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error("Failed to update employee:", error);
    res.status(500).json({ success: false, error: "Failed to update employee" });
  }
};

/**
 * PATCH /api/admin/employees/:id/reset-password
 * Admin resets employee password
 */
const resetEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword },
    });

    res.status(200).json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("Failed to reset password:", error);
    res.status(500).json({ success: false, error: "Failed to reset password" });
  }
};

/**
 * PATCH /api/admin/employees/:id/status
 * Activate or deactivate an employee
 */
const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status. Use 'active' or 'suspended'." });
    }

    const employee = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
      select: { id: true, name: true, status: true },
    });

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error("Failed to update employee status:", error);
    res.status(500).json({ success: false, error: "Failed to update employee status" });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  resetEmployeePassword,
  updateEmployeeStatus,
};
