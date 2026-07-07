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
            name,
            password: hashedPassword,
            contactNumber,
            address,
            city,
            province,
            zipCode,
            otpCode: otp,
            otpExpiresAt,
            lastOtpSentAt: new Date()
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
        name,
        email,
        password: hashedPassword,
        role: "customer",
        contactNumber,
        address,
        city,
        province,
        zipCode,
        isEmailVerified: false,
        otpCode: otp,
        otpExpiresAt,
        lastOtpSentAt: new Date()
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
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if email is verified for customer role
    if (user.role === "customer" && !user.isEmailVerified) {
      return res.status(403).json({ error: "Email not verified", email: user.email });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL: JWT_SECRET environment variable is not set!");
      return res.status(500).json({ error: "Server configuration error." });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};


const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contactNumber: true,
        address: true,
        city: true,
        province: true,
        zipCode: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactNumber, address, city, province, zipCode } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        contactNumber,
        address,
        city,
        province,
        zipCode
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contactNumber: true,
        address: true,
        city: true,
        province: true,
        zipCode: true
      }
    });
    res.status(200).json({ data: updatedUser });
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

module.exports = { register, login, getProfile, updateProfile, verifyOtp, resendOtp, forgotPassword, resetPassword };
