const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const register = async (req, res) => {
  const { name, email, password, contactNumber, address, city, province, zipCode } = req.body;
  try {
    // Check for duplicate email before attempting DB insert
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (existingUser.status === "deleted") {
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            otpCode: otp,
            otpExpiresAt,
            lastOtpSentAt: new Date(),
            customerProfile: {
              upsert: {
                create: { name, contactNumber, address, city, province, zipCode },
                update: { name, contactNumber, address, city, province, zipCode }
              }
            }
          }
        });

        try {
          const { sendOtpEmail } = require("../utils/emailService");
          await sendOtpEmail(email, otp);
        } catch (emailError) {
          console.error("WARNING: OTP email failed to send (user restoration):", emailError.message);
        }

        return res.status(200).json({ 
          message: "An account associated with this email address already exists but has been deactivated. Verify your email to restore your account.", 
          isRestoration: true, 
          email: existingUser.email 
        });
      }

      return res.status(409).json({ error: "An account with this email already exists. Please use a different email or sign in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "customer",
        isEmailVerified: false,
        otpCode: otp,
        otpExpiresAt,
        lastOtpSentAt: new Date(),
        customerProfile: {
          create: {
            name,
            contactNumber,
            address,
            city,
            province,
            zipCode
          }
        }
      },
    });

    // Send OTP email — wrapped in its own try/catch so an email failure
    // does NOT fail the registration. The user is already created.
    try {
      const { sendOtpEmail } = require("../utils/emailService");
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error("WARNING: OTP email failed to send (user was still created):", emailError.message);
      // Registration is still considered successful
    }

    res.status(201).json({ message: "User created successfully. OTP verification code sent.", userId: user.id, email: user.email });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};


const login = async (req, res) => {
  const { email, password, otp, expectedRoles } = req.body;
  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        customerProfile: true,
        adminProfile: true,
        superAdminProfile: true,
        ownerProfile: true,
        salesProfile: true,
        logisticProfile: true,
        financeProfile: true
      }
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Validate the role against expected roles for the specific portal FIRST
    if (expectedRoles && expectedRoles.length > 0) {
      if (!expectedRoles.includes(user.role)) {
        return res.status(403).json({ error: "Access Denied: You are not authorized to access this portal." });
      }
    }

    // Ensure the account is fully active AFTER verifying they are in the right portal
    if (user.status !== "active") {
      let statusMsg = "Your account is currently disabled.";
      if (user.status === "pending") statusMsg = "Your account is pending approval by a Super Admin.";
      else if (user.status === "suspended") statusMsg = "Your account has been suspended.";
      else if (user.status === "deleted") statusMsg = "Your account has been deleted.";
      return res.status(403).json({ error: statusMsg });
    }

    // Check if email is verified for customer role
    if (user.role === "customer" && !user.isEmailVerified) {
      return res.status(403).json({ error: "Email not verified", email: user.email });
    }

    // Require OTP for customer on every login
    if (user.role === "customer") {
      if (!otp) {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
          where: { id: user.id },
          data: {
            otpCode: newOtp,
            otpExpiresAt,
            lastOtpSentAt: new Date()
          }
        });

        try {
          const { sendOtpEmail } = require("../utils/emailService");
          await sendOtpEmail(user.email, newOtp);
        } catch (emailError) {
          console.error("WARNING: OTP email failed to send (customer login):", emailError.message);
        }

        return res.status(200).json({ requiresOtp: true, message: "OTP sent to your email to verify login." });
      } else {
        if (!user.otpCode || user.otpCode !== otp) {
          return res.status(400).json({ error: "Invalid OTP code" });
        }
        if (new Date() > new Date(user.otpExpiresAt)) {
          return res.status(400).json({ error: "OTP has expired. Please log in again." });
        }
        
        await prisma.user.update({
          where: { id: user.id },
          data: { otpCode: null, otpExpiresAt: null }
        });
      }
    }

    let sessionToken = null;
    if (user.role === "admin" || user.role === "sales" || user.role === "owner" || user.role === "superadmin" || user.role === "finance" || user.role === "logistic") {
      // 1. Clean up stale sessions (inactive for > 12 hours)
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      await prisma.userSession.updateMany({
        where: { userId: user.id, isActive: true, lastActive: { lt: twelveHoursAgo } },
        data: { isActive: false, loggedOutAt: new Date() }
      });

      let activeSessionsCount = await prisma.userSession.count({
        where: { userId: user.id, isActive: true }
      });

      const setting = await prisma.systemSetting.findUnique({ where: { key: "max_sales_devices" } });
      const maxDevices = setting ? parseInt(setting.value, 10) : 3;

      if (activeSessionsCount >= maxDevices && user.role !== "superadmin") {
        // 2. Instead of blocking, invalidate the oldest session(s) to make room
        const excessCount = activeSessionsCount - maxDevices + 1; // +1 to allow the current new login
        const oldestSessions = await prisma.userSession.findMany({
          where: { userId: user.id, isActive: true },
          orderBy: { lastActive: 'asc' },
          take: excessCount
        });

        if (oldestSessions.length > 0) {
          const sessionIdsToInvalidate = oldestSessions.map(s => s.id);
          await prisma.userSession.updateMany({
            where: { id: { in: sessionIdsToInvalidate } },
            data: { isActive: false, loggedOutAt: new Date() }
          });
          activeSessionsCount -= excessCount;
        }
      }

      if (activeSessionsCount > 0 && !otp && user.role !== "superadmin") {
        // Requires OTP for another device login
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
          where: { id: user.id },
          data: {
            otpCode: newOtp,
            otpExpiresAt,
            lastOtpSentAt: new Date()
          }
        });

        try {
          const { sendOtpEmail } = require("../utils/emailService");
          await sendOtpEmail(user.email, newOtp);
        } catch (emailError) {
          console.error("WARNING: OTP email failed to send (new device login):", emailError.message);
        }

        return res.status(200).json({ requiresOtp: true, message: "OTP sent to your email to verify new device login." });
      }

      if (otp) {
        if (!user.otpCode || user.otpCode !== otp) {
          return res.status(400).json({ error: "Invalid OTP code" });
        }
        if (new Date() > new Date(user.otpExpiresAt)) {
          return res.status(400).json({ error: "OTP has expired. Please log in again." });
        }
        
        await prisma.user.update({
          where: { id: user.id },
          data: { otpCode: null, otpExpiresAt: null }
        });
      }

      const crypto = require("crypto");
      sessionToken = crypto.randomUUID();
      const ipAddress = req.ip || req.connection.remoteAddress || "Unknown IP";
      const userAgent = req.headers['user-agent'] || "Unknown Device";

      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken,
          deviceInfo: userAgent,
          ipAddress: ipAddress
        }
      });

      if (activeSessionsCount > 0) {
        const io = req.app.get("io");
        if (io) {
          io.to(`user_${user.id}`).emit("new_device_login", {
            message: "Another device has logged into your account.",
            deviceInfo: userAgent,
            ipAddress: ipAddress,
            time: new Date()
          });
        }
      }
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL: JWT_SECRET environment variable is not set!");
      return res.status(500).json({ error: "Server configuration error." });
    }
    
    const payload = { userId: user.id, role: user.role };
    if (sessionToken) {
      payload.sessionToken = sessionToken;
    }

    const token = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: "1d" }
    );

    let profile = null;
    if (user.role === 'customer') profile = user.customerProfile;
    else if (user.role === 'admin') profile = user.adminProfile;
    else if (user.role === 'super_admin') profile = user.superAdminProfile;
    else if (user.role === 'owner') profile = user.ownerProfile;
    else if (user.role === 'sales') profile = user.salesProfile;
    else if (user.role === 'logistic') profile = user.logisticProfile;
    else if (user.role === 'finance') profile = user.financeProfile;

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: profile?.name || user.email.split('@')[0],
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed: " + (error.message || "Unknown error") });
  }
};


const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        adminProfile: true,
        superAdminProfile: true,
        ownerProfile: true,
        salesProfile: true,
        logisticProfile: true,
        financeProfile: true,
        addresses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    let profile = null;
    if (user.role === 'customer') profile = user.customerProfile;
    else if (user.role === 'admin') profile = user.adminProfile;
    else if (user.role === 'super_admin') profile = user.superAdminProfile;
    else if (user.role === 'owner') profile = user.ownerProfile;
    else if (user.role === 'sales') profile = user.salesProfile;
    else if (user.role === 'logistic') profile = user.logisticProfile;
    else if (user.role === 'finance') profile = user.financeProfile;

    const flattenedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      name: profile?.name || null,
      contactNumber: profile?.contactNumber || null,
      address: profile?.address || null,
      city: profile?.city || null,
      province: profile?.province || null,
      zipCode: profile?.zipCode || null,
      avatarUrl: profile?.avatarUrl || null,
      addresses: user.addresses || []
    };

    res.status(200).json({ data: flattenedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactNumber, address, city, province, zipCode } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const profileData = { contactNumber, address, city, province, zipCode };
    const role = user.role;
    
    if (role === 'customer') {
      await prisma.customerProfile.update({ where: { userId }, data: profileData });
    } else if (role === 'admin') {
      await prisma.adminProfile.update({ where: { userId }, data: { contactNumber } });
    } else if (role === 'super_admin') {
      await prisma.superAdminProfile.update({ where: { userId }, data: { contactNumber } });
    } else if (role === 'owner') {
      await prisma.ownerProfile.update({ where: { userId }, data: { contactNumber } });
    } else if (role === 'sales') {
      await prisma.salesProfile.update({ where: { userId }, data: { contactNumber } });
    } else if (role === 'logistic') {
      await prisma.logisticProfile.update({ where: { userId }, data: { contactNumber } });
    } else if (role === 'finance') {
      await prisma.financeProfile.update({ where: { userId }, data: { contactNumber } });
    }

    // Return the updated data (simplification for response)
    res.status(200).json({ data: { id: userId, email: user.email, role, ...profileData } });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    // OTP matches and is valid
    const updateData = {
      isEmailVerified: true,
      otpCode: null,
      otpExpiresAt: null
    };

    if (user.status === "deleted") {
      updateData.status = "active";
      updateData.deletedAt = null;
    }

    await prisma.user.update({
      where: { email },
      data: updateData
    });

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Check cooldown (60 seconds)
    if (user.lastOtpSentAt) {
      const timeSinceLastOtp = Date.now() - new Date(user.lastOtpSentAt).getTime();
      const cooldownRemaining = 60 - Math.floor(timeSinceLastOtp / 1000);
      if (cooldownRemaining > 0) {
        return res.status(429).json({ 
          error: `Please wait ${cooldownRemaining} seconds before requesting another code.`,
          cooldownRemaining 
        });
      }
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpiresAt,
        lastOtpSentAt: new Date()
      }
    });

    // Send email
    const { sendOtpEmail } = require("../utils/emailService");
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP verification code resent successfully.", cooldownRemaining: 60 });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return 200 to avoid exposing whether the email is registered
    if (!user) {
      return res.status(200).json({ message: "If that email is registered, you will receive a reset code shortly." });
    }

    if (user.role !== "customer") {
      return res.status(403).json({ error: "Password reset is only available for customer accounts." });
    }

    // Generate a fresh 6-digit reset OTP (stored separately from email verification OTP)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: { resetOtpCode: otp, resetOtpExpiresAt },
    });

    const { sendForgotPasswordEmail } = require("../utils/emailService");
    await sendForgotPasswordEmail(email, otp);

    res.status(200).json({ message: "If that email is registered, you will receive a reset code shortly." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Failed to process password reset request." });
  }
};


const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.resetOtpCode || user.resetOtpCode !== otp) {
      return res.status(400).json({ error: "Invalid or expired reset code." });
    }

    if (new Date() > new Date(user.resetOtpExpiresAt)) {
      return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtpCode: null,
        resetOtpExpiresAt: null,
      },
    });

    res.status(200).json({ message: "Password has been reset successfully. You can now log in with your new password." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactNumber, address, city, province, zipCode, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    // If it's the first address, make it default automatically
    const existingCount = await prisma.address.count({ where: { userId } });
    const makeDefault = existingCount === 0 ? true : (isDefault || false);

    const newAddress = await prisma.address.create({
      data: {
        userId,
        contactNumber,
        address,
        city,
        province,
        zipCode,
        isDefault: makeDefault
      }
    });

    res.status(201).json({ message: "Address added successfully", data: newAddress });
  } catch (error) {
    console.error("Add Address Error:", error);
    res.status(500).json({ error: "Failed to add address" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { contactNumber, address, city, province, zipCode } = req.body;

    // Verify ownership
    const existing = await prisma.address.findFirst({ where: { id: Number(id), userId } });
    if (!existing) {
      return res.status(404).json({ error: "Address not found" });
    }

    const updated = await prisma.address.update({
      where: { id: Number(id) },
      data: {
        contactNumber,
        address,
        city,
        province,
        zipCode
      }
    });

    res.status(200).json({ message: "Address updated successfully", data: updated });
  } catch (error) {
    console.error("Update Address Error:", error);
    res.status(500).json({ error: "Failed to update address" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await prisma.address.findFirst({ where: { id: Number(id), userId } });
    if (!existing) {
      return res.status(404).json({ error: "Address not found" });
    }

    await prisma.address.delete({ where: { id: Number(id) } });

    // If it was default and there are others left, make the newest one default
    if (existing.isDefault) {
      const fallback = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (fallback) {
        await prisma.address.update({
          where: { id: fallback.id },
          data: { isDefault: true }
        });
      }
    }

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res.status(500).json({ error: "Failed to delete address" });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await prisma.address.findFirst({ where: { id: Number(id), userId } });
    if (!existing) {
      return res.status(404).json({ error: "Address not found" });
    }

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    await prisma.address.update({
      where: { id: Number(id) },
      data: { isDefault: true }
    });

    res.status(200).json({ message: "Default address updated" });
  } catch (error) {
    console.error("Set Default Address Error:", error);
    res.status(500).json({ error: "Failed to set default address" });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user && req.user.sessionToken) {
      await prisma.userSession.updateMany({
        where: { sessionToken: req.user.sessionToken, isActive: true },
        data: { isActive: false, loggedOutAt: new Date() }
      });
    }
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Failed to log out." });
  }
};

module.exports = { register, login, logout, getProfile, updateProfile, verifyOtp, resendOtp, forgotPassword, resetPassword, addAddress, updateAddress, deleteAddress, setDefaultAddress };
