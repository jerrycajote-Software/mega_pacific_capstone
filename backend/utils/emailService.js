const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for port 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  }
});

// ─── Email Verification OTP ───────────────────────────────────────────────────

const sendOtpEmail = async (email, otp) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL FALLBACK - Email Verification]`);
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires in: 10 minutes`);
    console.log(`======================================================\n`);
    return { success: true, message: "Logged to console (SMTP not configured)" };
  }

  const mailOptions = {
    from: `"Mega Pacific Metal and Steel Corp" <${process.env.SMTP_FROM || 'noreply@megapacific.com'}>`,
    to: email,
    subject: "Email Verification OTP - Mega Pacific",
    text: `Your One-Time Password (OTP) for email verification is: ${otp}. This code expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #4f772d; text-align: center; margin-top: 0;">Mega Pacific Metal and Steel Corp</h2>
        <p style="color: #333333; font-size: 16px;">Dear Customer,</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.5;">Thank you for registering on our platform. To complete your registration and activate your account, please enter the One-Time Password (OTP) below:</p>
        <div style="font-size: 26px; font-weight: bold; color: #3d5c22; text-align: center; margin: 30px 0; letter-spacing: 5px; padding: 15px; background-color: #f7f9f6; border-radius: 8px; border: 1px solid #e2ebd5;">
          ${otp}
        </div>
        <p style="color: #666666; font-size: 13px; line-height: 1.5;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone for security purposes.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999999; font-size: 11px; text-align: center; margin-bottom: 0;">Mega Pacific Metal and Steel Corp &copy; 2026. All rights reserved.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send verification email:", error.message);
    throw error;
  }
};

// ─── Forgot Password OTP ──────────────────────────────────────────────────────

const sendForgotPasswordEmail = async (email, otp) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL FALLBACK - Password Reset]`);
    console.log(`To: ${email}`);
    console.log(`Reset OTP Code: ${otp}`);
    console.log(`Expires in: 10 minutes`);
    console.log(`======================================================\n`);
    return { success: true, message: "Logged to console (SMTP not configured)" };
  }

  const mailOptions = {
    from: `"Mega Pacific Metal and Steel Corp" <${process.env.SMTP_FROM || 'noreply@megapacific.com'}>`,
    to: email,
    subject: "Password Reset OTP - Mega Pacific",
    text: `Your One-Time Password (OTP) for password reset is: ${otp}. This code expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #4f772d; text-align: center; margin-top: 0;">Mega Pacific Metal and Steel Corp</h2>
        <p style="color: #333333; font-size: 16px;">Dear Customer,</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.5;">We received a request to reset your password. Use the One-Time Password (OTP) below to proceed:</p>
        <div style="font-size: 26px; font-weight: bold; color: #3d5c22; text-align: center; margin: 30px 0; letter-spacing: 5px; padding: 15px; background-color: #f7f9f6; border-radius: 8px; border: 1px solid #e2ebd5;">
          ${otp}
        </div>
        <p style="color: #666666; font-size: 13px; line-height: 1.5;">This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email — your account remains secure.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999999; font-size: 11px; text-align: center; margin-bottom: 0;">Mega Pacific Metal and Steel Corp &copy; 2026. All rights reserved.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send password reset email:", error.message);
    throw error;
  }
};

module.exports = { sendOtpEmail, sendForgotPasswordEmail };
