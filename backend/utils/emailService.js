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

// Email Verification OTP

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

// Forgot Password OTP

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

// Customer Order Receipt Email

const sendOrderReceiptEmail = async (email, order) => {
  if (!email) {
    console.warn("[EMAIL RECEIPT] No recipient email specified, skipping email.");
    return { success: false, message: "No email specified" };
  }

  const orderNum = order.id ? `#ORD-${String(order.id).padStart(6, '0')}` : 'N/A';
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) : new Date().toLocaleString('en-US');

  const customerName = order.customerName || order.shippingName || (order.user?.name) || 'Valued Customer';
  const fulfillmentType = order.fulfillmentType || 'Delivery';
  const isPickup = fulfillmentType.toLowerCase() === 'pickup';
  const deliveryAddress = isPickup
    ? 'Mega Pacific Roofing — Imus Branch, Cavite (Store Pick-up)'
    : [order.shippingAddress, order.shippingCity, order.shippingProvince, order.shippingZipCode].filter(Boolean).join(', ') || 'N/A';

  const items = order.items || [];
  const itemsSubtotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.price || 0) * (item.quantity || 1));
  }, 0);
  const shippingFee = 100.00;
  const orderTotal = parseFloat(order.total) || (itemsSubtotal + shippingFee);

  const isCOD50 = (order.paymentMode || '').includes('50%') || (order.paymentStatus || '').includes('50%');
  const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';

  const downpaymentAmount = isCOD50 ? (orderTotal * 0.5) : orderTotal;
  const balanceOnDelivery = isCOD50 ? (orderTotal * 0.5) : 0;

  let paymentBadge = '';
  if (isCOD50) {
    paymentBadge = '<span style="background-color: #dbeafe; color: #1e40af; font-weight: 700; padding: 4px 10px; border-radius: 9999px; font-size: 12px; letter-spacing: 0.5px;">50% DOWNPAYMENT PAID</span>';
  } else if (isPaid) {
    paymentBadge = '<span style="background-color: #dcfce7; color: #15803d; font-weight: 700; padding: 4px 10px; border-radius: 9999px; font-size: 12px; letter-spacing: 0.5px;">PAID (FULL PAYMENT)</span>';
  } else {
    paymentBadge = '<span style="background-color: #fef9c3; color: #854d0e; font-weight: 700; padding: 4px 10px; border-radius: 9999px; font-size: 12px; letter-spacing: 0.5px;">PENDING PAYMENT</span>';
  }

  // Build items rows
  const itemsHtml = items.map((item) => {
    const prodName = item.product?.name || item.name || 'Roofing / Metal Product';
    const variantName = item.variantName || item.variant?.name || '';
    const colorSpec = item.color ? `Color: ${item.color}` : '';
    const specs = [variantName, colorSpec].filter(Boolean).join(' | ');
    const qty = item.quantity || 1;
    const unitPrice = parseFloat(item.price || 0);
    const lineTotal = (unitPrice * qty).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; text-align: left; vertical-align: top;">
          <div style="font-weight: 600; color: #0f172a; font-size: 14px;">${prodName}</div>
          ${specs ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">${specs}</div>` : ''}
        </td>
        <td style="padding: 12px 8px; text-align: center; vertical-align: top; font-size: 13px; color: #334155;">
          ${qty}
        </td>
        <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-size: 13px; color: #334155;">
          ₱${unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-weight: 600; font-size: 13px; color: #0f172a;">
          ₱${lineTotal}
        </td>
      </tr>
    `;
  }).join('');

  const totalAmount = orderTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL FALLBACK - Order Receipt]`);
    console.log(`To: ${email}`);
    console.log(`Order: ${orderNum}`);
    console.log(`Total: ₱${totalAmount}`);
    console.log(`Payment: ${order.paymentMode} (${order.paymentStatus})`);
    console.log(`======================================================\n`);
    return { success: true, message: "Logged to console (SMTP not configured)" };
  }

  const mailOptions = {
    from: `"Mega Pacific Metal and Steel Corp" <${process.env.SMTP_FROM || 'noreply@megapacific.com'}>`,
    to: email,
    subject: `Order Receipt & Confirmation ${orderNum} - Mega Pacific`,
    text: `Thank you for your order! Your receipt for order ${orderNum} is ready. Total: ₱${totalAmount}. Payment Method: ${order.paymentMode || 'Card'}. Status: ${order.paymentStatus}.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Receipt - Mega Pacific</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px;">
        <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 32px 28px; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">MEGA PACIFIC</h1>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #93c5fd; font-weight: 500;">Metal and Steel Corporation</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1;">Official Receipt</div>
                <div style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 2px;">${orderNum}</div>
              </div>
            </div>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px;">
            <!-- Greeting & Status -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
              <div>
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">Hi ${customerName},</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">
                  ${isPaid ? 'Thank you for your payment! Your order has been placed successfully.' : 'Thank you for your order! We are processing your request.'}
                </p>
              </div>
              <div style="text-align: right;">
                ${paymentBadge}
              </div>
            </div>

            <!-- Order Metadata Grid -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 50%;">
                  <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Date Placed</span>
                  <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">${orderDate}</div>
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 50%;">
                  <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Payment Method</span>
                  <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">${order.paymentMode || 'Credit / Debit Card'}</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; width: 50%;">
                  <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Fulfillment</span>
                  <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">${fulfillmentType === 'Pickup' ? 'Store Pick-up' : 'Home Delivery'}</div>
                </td>
                <td style="padding: 12px 16px; width: 50%;">
                  <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Contact Number</span>
                  <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">${order.shippingContactNumber || 'N/A'}</div>
                </td>
              </tr>
            </table>

            <!-- Address Block -->
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
              <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">
                ${isPickup ? 'Pick-up Location' : 'Delivery Address'}
              </span>
              <div style="font-size: 13px; color: #1e293b; margin-top: 4px; line-height: 1.4;">
                ${deliveryAddress}
              </div>
            </div>

            <!-- Items Purchased Table -->
            <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700;">Item</th>
                  <th style="padding: 10px 8px; text-align: center; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; width: 50px;">Qty</th>
                  <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; width: 100px;">Price</th>
                  <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; width: 110px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Financial Totals Block -->
            <div style="margin-left: auto; max-width: 320px; border-top: 2px solid #e2e8f0; padding-top: 14px; margin-bottom: 28px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #64748b;">
                <span>Subtotal:</span>
                <span style="font-weight: 600; color: #0f172a;">₱${itemsSubtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; color: #64748b;">
                <span>Standard Shipping Fee:</span>
                <span style="font-weight: 600; color: #0f172a;">₱100.00</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e2e8f0; margin-bottom: 10px; font-size: 14px; font-weight: 700; color: #0f172a;">
                <span>Total Amount:</span>
                <span>₱${totalAmount}</span>
              </div>
              ${isCOD50 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #166534; background-color: #f0fdf4; padding: 6px 10px; border-radius: 4px; border: 1px solid #bbf7d0;">
                  <span style="font-weight: 600;">50% Downpayment Paid:</span>
                  <span style="font-weight: 800;">₱${downpaymentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #9a3412; background-color: #fff7ed; padding: 6px 10px; border-radius: 4px; border: 1px solid #fed7aa;">
                  <span style="font-weight: 600;">50% Balance on Delivery:</span>
                  <span style="font-weight: 800;">₱${balanceOnDelivery.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ` : `
                <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 16px; font-weight: 800; color: #1e3a8a;">
                  <span>Total Paid:</span>
                  <span>₱${totalAmount}</span>
                </div>
              `}
            </div>

            <!-- Customer Note / Callout -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
              ${isCOD50 ? `
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
                  <strong>Cash on Delivery (50% Downpayment):</strong> 50% bank transfer and 50% Cash on the Item Delivered. Your 50% downpayment of ₱${downpaymentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} has been received. Please prepare the remaining 50% cash balance of <strong>₱${balanceOnDelivery.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> upon arrival of your delivery.
                </p>
              ` : `
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
                  <strong>Full Payment Settled:</strong> Your payment of ₱${totalAmount} (including ₱100.00 shipping fee) has been fully settled. No further payment is needed upon delivery.
                </p>
              `}
              <p style="margin: 0; font-size: 11px; color: #3b82f6;">
                Track your order progress anytime at your <a href="http://192.168.1.55:5173/dashboard" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Mega Pacific Customer Dashboard</a>.
              </p>
            </div>

            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />

            <!-- Support Footer -->
            <div style="text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 4px 0;">Need help with this order? Reach us at <strong style="color: #64748b;">support@megapacific.com</strong> or call <strong>(046) 471-2345</strong>.</p>
              <p style="margin: 0;">Mega Pacific Metal and Steel Corp &copy; 2026. All rights reserved.</p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL RECEIPT SUCCESS] Sent order receipt for ${orderNum} to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL RECEIPT ERROR] Failed to send receipt for ${orderNum} to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
  sendForgotPasswordEmail,
  sendOrderReceiptEmail
};
