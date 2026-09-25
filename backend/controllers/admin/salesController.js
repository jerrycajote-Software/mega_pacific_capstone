const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");

/**
 * GET /api/admin/saless
 * List all saless
 */
const getAccounts = async (req, res) => {
  try {
    const saless = await prisma.user.findMany({
      where: { role: { in: ["sales", "logistic", "finance", "admin", "owner", "super_admin"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        adminProfile: true,
        superAdminProfile: true,
        ownerProfile: true,
        salesProfile: true,
        logisticProfile: true,
        financeProfile: true,
      },
    });
    
    // Flatten the profile data into the main object for the frontend
    const flattenedSaless = saless.map(emp => {
      let profile = null;
      if (emp.role === 'admin') profile = emp.adminProfile;
      else if (emp.role === 'super_admin') profile = emp.superAdminProfile;
      else if (emp.role === 'owner') profile = emp.ownerProfile;
      else if (emp.role === 'sales') profile = emp.salesProfile;
      else if (emp.role === 'logistic') profile = emp.logisticProfile;
      else if (emp.role === 'finance') profile = emp.financeProfile;
      
      return {
        id: emp.id,
        email: emp.email,
        role: emp.role,
        status: emp.status,
        createdAt: emp.createdAt,
        name: profile?.name || emp.email.split('@')[0],
        contactNumber: profile?.contactNumber || null,
        avatarUrl: profile?.avatarUrl || null,
      };
    });
    res.status(200).json({ success: true, data: flattenedSaless });
  } catch (error) {
    console.error("Failed to fetch saless:", error);
    res.status(500).json({ success: false, error: "Failed to fetch saless" });
  }
};

/**
 * POST /api/admin/saless
 * Create a new account (admin sets password)
 */
const createAccount = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const assignedRole = ["sales", "logistic", "finance", "admin", "owner", "super_admin", "superadmin"].includes(role) ? role : "sales";

    // Enforce role restrictions
    const currentUserRole = req.user.role;
    if (currentUserRole === 'admin' && ['admin', 'owner', 'super_admin', 'superadmin'].includes(assignedRole)) {
      return res.status(403).json({ success: false, error: "Admins cannot create accounts with this role." });
    }

    // Check for existing email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const generatedName = email.split('@')[0];

    const account = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: assignedRole,
        status: "pending",
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const profileData = { userId: account.id, name: generatedName };
    switch(assignedRole) {
      case "admin": await prisma.adminProfile.create({ data: profileData }); break;
      case "logistic": await prisma.logisticProfile.create({ data: profileData }); break;
      case "finance": await prisma.financeProfile.create({ data: profileData }); break;
      case "owner": await prisma.ownerProfile.create({ data: profileData }); break;
      case "sales": await prisma.salesProfile.create({ data: profileData }); break;
      case "super_admin": await prisma.superAdminProfile.create({ data: profileData }); break;
    }

    res.status(201).json({ success: true, data: { ...account, name: generatedName } });
  } catch (error) {
    console.error("Failed to create account:", error);
    res.status(500).json({ success: false, error: "Failed to create account" });
  }
};

/**
 * PUT /api/admin/saless/:id
 * Update account info (name, contact, status)
 */
const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactNumber, status } = req.body;

    const account = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Update profile depending on role
    const profileUpdate = {};
    if (name) profileUpdate.name = name;
    if (contactNumber !== undefined) profileUpdate.contactNumber = contactNumber;

    if (Object.keys(profileUpdate).length > 0) {
      const role = account.role;
      if (role === 'admin') await prisma.adminProfile.update({ where: { userId: account.id }, data: profileUpdate }).catch(() => {});
      else if (role === 'super_admin') await prisma.superAdminProfile.update({ where: { userId: account.id }, data: profileUpdate }).catch(() => {});
      else if (role === 'owner') await prisma.ownerProfile.update({ where: { userId: account.id }, data: profileUpdate }).catch(() => {});
      else if (role === 'sales') await prisma.salesProfile.update({ where: { userId: account.id }, data: profileUpdate }).catch(() => {});
      else if (role === 'logistic') await prisma.logisticProfile.update({ where: { userId: account.id }, data: profileUpdate }).catch(() => {});
      else if (role === 'finance') await prisma.financeProfile.update({ where: { userId: account.id }, data: profileUpdate }).catch(() => {});
    }

    res.status(200).json({ success: true, data: { ...account, ...profileUpdate } });
  } catch (error) {
    console.error("Failed to update account:", error);
    res.status(500).json({ success: false, error: "Failed to update account" });
  }
};

/**
 * PATCH /api/admin/saless/:id/reset-password
 * Admin resets sales password
 */
const resetAccountPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, adminPassword } = req.body;

    if (!adminPassword) {
      return res.status(400).json({ success: false, error: "Admin password is required to confirm." });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
    }

    // 1. Verify admin password
    const adminUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!adminUser) {
      return res.status(404).json({ success: false, error: "Admin user not found." });
    }
    const isAdminMatch = await bcrypt.compare(adminPassword, adminUser.password);
    if (!isAdminMatch) {
      return res.status(403).json({ success: false, error: "Incorrect admin password.", forceLogout: true });
    }

    // 2. Ensure new password is not the same as the current password
    const targetUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: "Target user not found." });
    }
    const isSamePassword = await bcrypt.compare(newPassword, targetUser.password);
    if (isSamePassword) {
      return res.status(400).json({ success: false, error: "New password cannot be the same as the current password." });
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
 * PATCH /api/admin/saless/:id/status
 * Activate or deactivate an sales
 */
const updateAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminPassword } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status. Use 'active' or 'suspended'." });
    }

    if (status === 'active') {
      if (!adminPassword) {
        return res.status(400).json({ success: false, error: "Super Admin password is required to approve an account." });
      }

      const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const isMatch = await bcrypt.compare(adminPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: "Invalid Super Admin password." });
      }
    }

    const sales = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
      select: { id: true, email: true, status: true },
    });

    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    console.error("Failed to update sales status:", error);
    res.status(500).json({ success: false, error: "Failed to update sales status" });
  }
};

/**
 * DELETE /api/admin/saless/:id
 * Reject/Delete an account
 */
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminPassword } = req.body;

    if (!adminPassword) {
      return res.status(400).json({ success: false, error: "Super Admin password is required to reject an account." });
    }

    const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isMatch = await bcrypt.compare(adminPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid Super Admin password." });
    }

    // Delete the user; cascading deletes should handle profiles if configured correctly,
    // but Prisma relation onDelete: Cascade on user profiles will clean them up.
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ success: true, message: "Account rejected and deleted successfully." });
  } catch (error) {
    console.error("Failed to delete account:", error);
    res.status(500).json({ success: false, error: "Failed to reject account" });
  }
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  resetAccountPassword,
  updateAccountStatus,
  deleteAccount,
};
