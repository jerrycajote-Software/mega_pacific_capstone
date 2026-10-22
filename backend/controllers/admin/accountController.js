const prisma = require("../../config/db");
const bcrypt = require("bcryptjs");
const { validateRealisticEmail } = require("../../utils/emailValidator");

/**
 * GET /api/admin/accounts (and /api/admin/sales)
 * List staff and management accounts
 */
const getAccounts = async (req, res) => {
  try {
    const rolesToInclude = ["sales", "logistic", "finance"];
    const isSuperAdmin = req.user.role === 'superadmin' || req.user.role === 'super_admin';
    if (req.user.role === 'owner') {
      rolesToInclude.push('admin');
    } else if (isSuperAdmin) {
      rolesToInclude.push('admin', 'owner', 'super_admin', 'superadmin');
    }

    const accounts = await prisma.user.findMany({
      where: { 
        role: { in: rolesToInclude },
        ...(isSuperAdmin ? {} : { id: { not: req.user.userId } })
      },
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
    const flattenedAccounts = accounts.map(emp => {
      let profile = null;
      if (emp.role === 'admin') profile = emp.adminProfile;
      else if (emp.role === 'super_admin' || emp.role === 'superadmin') profile = emp.superAdminProfile;
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
    res.status(200).json({ success: true, data: flattenedAccounts });
  } catch (error) {
    console.error("Failed to fetch staff accounts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch accounts" });
  }
};

/**
 * POST /api/admin/accounts (and /api/admin/sales)
 * Create a new account (admin sets password)
 */
const createAccount = async (req, res) => {
  try {
    const { email, password, role, name, status, contactNumber } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    if (role === "super_admin" || role === "superadmin") {
      return res.status(403).json({
        success: false,
        error: "Super Admin accounts are reserved exclusively for system developers and cannot be provisioned.",
      });
    }

    let assignedRole = ["sales", "logistic", "finance", "admin", "owner"].includes(role) ? role : "sales";

    const currentUserRole = req.user.role;
    if (currentUserRole === 'admin') {
      return res.status(403).json({
        success: false,
        error: "Admins cannot create accounts. Staff accounts must be provisioned via Super Admin Mission Control.",
      });
    }

    // Strict Singleton Rule: Only one account can exist for Super Admin, Admin, Owner, Sales, Finance, Logistic
    const SINGLETON_ROLES = ["super_admin", "superadmin", "admin", "owner", "sales", "finance", "logistic"];
    if (SINGLETON_ROLES.includes(assignedRole)) {
      const roleFilter = (assignedRole === "super_admin" || assignedRole === "superadmin")
        ? { in: ["super_admin", "superadmin"] }
        : assignedRole;

      const existingRoleAccount = await prisma.user.findFirst({
        where: {
          role: roleFilter,
          status: { not: "deleted" },
          deletedAt: null
        },
        select: { id: true, email: true, role: true }
      });

      if (existingRoleAccount) {
        const roleLabels = {
          admin: "Admin",
          owner: "Owner",
          sales: "Sales",
          finance: "Finance",
          logistic: "Logistics",
          super_admin: "Super Admin",
          superadmin: "Super Admin"
        };
        const roleName = roleLabels[assignedRole] || assignedRole.toUpperCase();
        return res.status(409).json({
          success: false,
          error: `Account creation rejected: Only one account can exist for ${roleName}. An active account already exists (${existingRoleAccount.email}). Creating another one is not allowed.`,
          code: "SINGLETON_ROLE_LIMIT_REACHED",
          existingAccount: existingRoleAccount
        });
      }
    }

    const normalizedEmail = (email || '').trim().toLowerCase();

    const emailCheck = validateRealisticEmail(normalizedEmail);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, error: emailCheck.error });
    }

    const existing = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' }
      }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Account creation automatically rejected: An account with email "${existing.email}" already exists with the role '${existing.role.toUpperCase()}'.`,
        existingRole: existing.role
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountName = (name && name.trim()) || normalizedEmail.split('@')[0];
    const isSuperOrOwner = currentUserRole === 'super_admin' || currentUserRole === 'superadmin' || currentUserRole === 'owner';
    const initialStatus = isSuperOrOwner ? (status || "active") : "pending";

    const account = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        status: initialStatus,
        isEmailVerified: isSuperOrOwner ? true : false,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const profileData = { 
      userId: account.id, 
      name: accountName,
      contactNumber: contactNumber || null 
    };
    switch(assignedRole) {
      case "admin": await prisma.adminProfile.create({ data: profileData }); break;
      case "logistic": await prisma.logisticProfile.create({ data: profileData }); break;
      case "finance": await prisma.financeProfile.create({ data: profileData }); break;
      case "owner": await prisma.ownerProfile.create({ data: profileData }); break;
      case "sales": await prisma.salesProfile.create({ data: profileData }); break;
      case "super_admin": await prisma.superAdminProfile.create({ data: profileData }); break;
    }

    res.status(201).json({ 
      success: true, 
      data: { 
        ...account, 
        name: accountName,
        contactNumber: contactNumber || null 
      } 
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: "Account creation automatically rejected: An account with this email address already exists."
      });
    }
    console.error("Failed to create account:", error);
    res.status(500).json({ success: false, error: "Failed to create account" });
  }
};

/**
 * PUT /api/admin/accounts/:id (and /api/admin/sales/:id)
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
 * PATCH /api/admin/accounts/:id/reset-password (and /api/admin/sales/:id/reset-password)
 * Admin resets staff password
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

    const adminUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!adminUser) {
      return res.status(404).json({ success: false, error: "Admin user not found." });
    }
    const isAdminMatch = await bcrypt.compare(adminPassword, adminUser.password);
    if (!isAdminMatch) {
      return res.status(403).json({ success: false, error: "Incorrect admin password.", forceLogout: true });
    }

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
 * PATCH /api/admin/accounts/:id/status (and /api/admin/sales/:id/status)
 * Activate or deactivate an account
 */
const updateAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminPassword } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status. Use 'active' or 'suspended'." });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: "Account not found." });
    }
    if ((targetUser.role === 'super_admin' || targetUser.role === 'superadmin') && status === 'suspended') {
      return res.status(403).json({ success: false, error: "Developer Super Admin accounts cannot be suspended." });
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

    const account = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
      select: { id: true, email: true, status: true },
    });

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Failed to update account status:", error);
    res.status(500).json({ success: false, error: "Failed to update account status" });
  }
};

/**
 * DELETE /api/admin/accounts/:id (and /api/admin/sales/:id)
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

    const targetUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: "Account not found." });
    }
    if (targetUser.role === 'super_admin' || targetUser.role === 'superadmin') {
      return res.status(403).json({ success: false, error: "Developer Super Admin accounts cannot be deleted." });
    }

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
