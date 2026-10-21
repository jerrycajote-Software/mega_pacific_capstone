const nodemailer = require("nodemailer");

const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  },
  connectionTimeout: 10000
});

const isEmailConfigured = () => {
  return Boolean(
    process.env.BREVO_API_KEY ||
    (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith("xkeysib-")) ||
    process.env.RESEND_API_KEY ||
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  );
};

const deliverMail = async (mailOptions) => {
  const brevoApiKey = process.env.BREVO_API_KEY ||
    (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith("xkeysib-") ? process.env.SMTP_PASS : null);
  const resendApiKey = process.env.RESEND_API_KEY;

  if (brevoApiKey) {
    const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@megapacific.com";
    const senderName = "Mega Pacific Metal and Steel Corp";
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: mailOptions.to }],
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
        textContent: mailOptions.text
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Brevo API Error (${res.status}): ${data.message || JSON.stringify(data)}`);
    }
    return { success: true, messageId: data.messageId };
  }

  if (resendApiKey) {
    const sender = process.env.SMTP_FROM || "Mega Pacific <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: sender,
        to: [mailOptions.to],
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Resend API Error (${res.status}): ${data.message || JSON.stringify(data)}`);
    }
    return { success: true, messageId: data.id };
  }

  return await transporter.sendMail(mailOptions);
};


const sendOtpEmail = async (email, otp) => {
  if (!isEmailConfigured()) {
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
    const info = await deliverMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send verification email:", error.message);
    throw error;
  }
};


const sendForgotPasswordEmail = async (email, otp) => {
  if (!isEmailConfigured()) {
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
    const info = await deliverMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send password reset email:", error.message);
    throw error;
  }
};


const sendOrderReceiptEmail = async (email, order) => {
  if (!email) {
    console.warn("[EMAIL RECEIPT] No recipient email specified, skipping email.");
    return { success: false, message: "No email specified" };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const orderNum = order.id ? `#ORD-${String(order.id).padStart(4, '0')}` : 'N/A';
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) : new Date().toLocaleString('en-US');

  const customerName = order.customerName || order.shippingName || (order.user?.customerProfile?.name) || (order.user?.name) || 'Valued Customer';
  const fulfillmentType = order.fulfillmentType || 'Delivery';
  const isPickup = fulfillmentType.toLowerCase() === 'pickup';
  const deliveryAddress = isPickup
    ? 'Mega Pacific Roofing — Plant Loading Dock 1, Imus Cavite (Store Pick-up)'
    : [order.shippingAddress, order.shippingCity, order.shippingProvince, order.shippingZipCode].filter(Boolean).join(', ') || 'N/A';

  const items = order.items || [];
  const itemsSubtotal = items.reduce((sum, item) => {
    const len = item.customLength ? parseFloat(item.customLength) : 1;
    const unitPrice = parseFloat(item.price || 0);
    return sum + (unitPrice * len * (item.quantity || 1));
  }, 0);
  const orderTotal = parseFloat(order.total) || itemsSubtotal;
  const actualShippingFee = isPickup ? 0 : Math.max(0, Math.round((orderTotal - itemsSubtotal) * 100) / 100);

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

  const itemsHtml = items.map((item) => {
    const prodName = item.product?.name || item.name || 'Roofing / Metal Product';
    const variantName = item.variantName || item.variant?.name || '';
    const thicknessSpec = item.thickness || '';
    const lengthSpec = item.customLength ? `${item.customLength}m Cut Length` : '';
    const colorSpec = item.color ? `Color: ${item.color}` : '';
    const specs = [variantName, thicknessSpec, lengthSpec, colorSpec].filter(Boolean).join(' • ');
    const qty = item.quantity || 1;
    const len = item.customLength ? parseFloat(item.customLength) : 1;
    const unitPrice = parseFloat(item.price || 0);
    const effectiveUnitPrice = unitPrice * len;
    const lineTotal = (effectiveUnitPrice * qty).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; text-align: left; vertical-align: top;">
          <div style="font-weight: 600; color: #0f172a; font-size: 14px;">${prodName}</div>
          ${specs ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">${specs}</div>` : ''}
        </td>
        <td style="padding: 12px 8px; text-align: center; vertical-align: top; font-size: 13px; color: #334155;">
          ${qty} ${item.customLength ? (qty === 1 ? 'sheet' : 'sheets') : 'pcs'}
        </td>
        <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-size: 13px; color: #334155;">
          ₱${effectiveUnitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          ${item.customLength ? `<div style="font-size: 11px; color: #64748b; margin-top: 1px;">(₱${unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}/m)</div>` : ''}
        </td>
        <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-weight: 600; font-size: 13px; color: #0f172a;">
          ₱${lineTotal}
        </td>
      </tr>
    `;
  }).join('');

  const totalAmount = orderTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!isEmailConfigured()) {
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
                  <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">${isPickup ? 'Plant Pick-up (Plant Loading Dock 1)' : 'Jobsite Fleet Delivery'}</div>
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
                ${isPickup ? 'Pick-up Plant Location' : 'Jobsite Delivery Address'}
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
                  <th style="padding: 10px 8px; text-align: center; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; width: 80px;">Qty</th>
                  <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; width: 110px;">Unit Price</th>
                  <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; width: 110px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Financial Totals Block -->
            <div style="margin-left: auto; max-width: 340px; border-top: 2px solid #e2e8f0; padding-top: 14px; margin-bottom: 28px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #64748b;">
                <span>Subtotal:</span>
                <span style="font-weight: 600; color: #0f172a;">₱${itemsSubtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; color: #64748b;">
                <span>${isPickup ? 'Plant Pick-up Handling:' : 'Fleet Delivery Logistics:'}</span>
                <span style="font-weight: 600; color: ${isPickup ? '#16a34a' : '#0f172a'};">${isPickup ? 'FREE (₱0.00)' : `₱${actualShippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
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
                  <strong>Cash on Delivery (50% Downpayment):</strong> 50% downpayment via bank transfer and 50% balance on delivery. Your 50% downpayment of ₱${downpaymentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} has been received. Please prepare the remaining 50% cash balance of <strong>₱${balanceOnDelivery.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> upon arrival of your delivery.
                </p>
              ` : `
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
                  <strong>Full Payment Settled:</strong> Your payment of ₱${totalAmount} ${isPickup ? '(Free Plant Pick-up)' : `(including ₱${actualShippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} delivery logistics)`} has been fully settled. No further payment is needed upon ${isPickup ? 'pick-up' : 'delivery'}.
                </p>
              `}
              <p style="margin: 0; font-size: 11px; color: #3b82f6;">
                Track your order fulfillment journey anytime via <a href="${frontendUrl}/order/${order.id}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Order Tracking #${String(order.id).padStart(4, '0')}</a> or in your <a href="${frontendUrl}/profile" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Customer Profile</a>.
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
    const info = await deliverMail(mailOptions);
    console.log(`[EMAIL RECEIPT SUCCESS] Sent order receipt for ${orderNum} to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL RECEIPT ERROR] Failed to send receipt for ${orderNum} to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};


const sendReadyForPickupEmail = async (email, order) => {
  if (!email) {
    console.warn("[EMAIL PICKUP] No recipient email specified, skipping email.");
    return { success: false, message: "No email specified" };
  }

  const orderNum = order.id ? `#ORD-${String(order.id).padStart(4, '0')}` : 'N/A';
  const customerName = order.customerName || order.shippingName || (order.user?.name) || 'Valued Customer';
  const items = order.items || [];

  const itemsListHtml = items.map((item) => {
    const prodName = item.product?.name || item.productName || 'Roofing Sheet / Product';
    const spec = [
      item.customLength ? `${item.customLength}m cut length` : null,
      item.thickness || item.variantName || item.variant?.name,
      item.color
    ].filter(Boolean).join(' · ');
    const qty = item.quantity || 1;
    return `
      <li style="margin-bottom: 8px; color: #334155; font-size: 14px;">
        <strong style="color: #0f172a;">${prodName}</strong>
        ${spec ? `<span style="color: #0284c7; font-size: 13px;"> (${spec})</span>` : ''}
        <span style="font-weight: 700; color: #047857; margin-left: 6px;">× ${qty} ${item.customLength ? 'sheets' : 'pcs'}</span>
      </li>
    `;
  }).join('');

  if (!isEmailConfigured()) {
    console.log(`[EMAIL FALLBACK - Order Ready for Pick-up]`);
    console.log(`To: ${email}`);
    console.log(`Order: ${orderNum}`);
    console.log(`Customer: ${customerName}`);
    console.log(`Plant Dock: Mega Pacific Roofing — Imus / Cavite Main Branch`);
    console.log(`Operating Hours: Monday to Saturday, 8:00 AM – 5:00 PM`);
    return { success: true, message: "Logged to console (SMTP not configured)" };
  }

  const mailOptions = {
    from: `"Mega Pacific Logistics" <${process.env.SMTP_FROM || 'noreply@megapacific.com'}>`,
    to: email,
    subject: `[Ready for Pick-up] Order ${orderNum} is Staged at Mega Pacific Plant`,
    text: `Good news ${customerName}! Your order ${orderNum} is now ready for pick-up at Mega Pacific Roofing Plant (Imus, Cavite). Operating hours: Monday to Saturday, 8:00 AM - 5:00 PM. Please bring a valid government ID and your Order ID.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Ready for Pick-up</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 28px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">MEGA PACIFIC METAL & STEEL</h1>
            <p style="color: #bbf7d0; margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">LOGISTICS & WAREHOUSE DISPATCH SIGNAL</p>
          </div>

          <div style="padding: 28px 24px;">
            <div style="display: inline-block; background-color: #dcfce7; color: #166534; font-weight: 800; padding: 6px 14px; border-radius: 9999px; font-size: 12px; letter-spacing: 0.5px; margin-bottom: 16px;">
              &#9679; SIGNAL TRANSMITTED &bull; READY FOR PICK-UP
            </div>

            <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 20px;">Your Order is Ready for Pick-up!</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello <strong>${customerName}</strong>, our logistics and staging crew has prepared your roofing order. All sheets and materials have been inspected, banded, and placed at the plant loading bay awaiting your retrieval.
            </p>

            <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Order Reference</span>
                <span style="font-size: 14px; font-weight: 800; color: #0f172a;">${orderNum}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Pick-up Location</span>
                <span style="font-size: 14px; font-weight: 700; color: #047857;">Mega Pacific Roofing — Plant Loading Dock 1</span>
                <span style="font-size: 13px; color: #475569; display: block;">Aguinaldo Highway, Imus / Cavite Branch</span>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Operating Schedule</span>
                <span style="font-size: 13px; font-weight: 600; color: #0f172a;">Monday – Saturday: 8:00 AM – 5:00 PM</span>
              </div>
              <div>
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Plant Dispatch Hotline</span>
                <span style="font-size: 13px; font-weight: 600; color: #0284c7;">(046) 471-2345 / 0917-123-4567</span>
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 14px; color: #0f172a; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">Items Ready at Dock:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${itemsListHtml}
              </ul>
            </div>

            <div style="background-color: #fefce8; border-left: 4px solid #ca8a04; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 4px 0; color: #854d0e; font-size: 13px;">What to Bring for Retrieval:</h4>
              <p style="margin: 0; font-size: 12px; color: #713f12; line-height: 1.5;">
                1. <strong>Valid Government ID</strong> (or authorization letter if dispatching a driver/truck)<br>
                2. <strong>Order ID (${orderNum})</strong> to present to the Plant Dispatch Officer
              </p>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/${order.id}" style="background-color: #15803d; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">View Pick-up Pass (#ORD-${String(order.id).padStart(4, '0')})</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <div style="text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 4px 0;">Mega Pacific Metal and Steel Corp &copy; 2026. All rights reserved.</p>
              <p style="margin: 0;">Industrial Roofing & Prime Steel Fabricators</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await deliverMail(mailOptions);
    console.log(`[EMAIL PICKUP SUCCESS] Sent ready for pickup alert for ${orderNum} to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL PICKUP ERROR] Failed to send pickup email for ${orderNum}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendRefundNotificationEmail = async (email, { order, refund, transactionReference, notes, processedAt, customerName }) => {
  if (!email) {
    console.warn("[EMAIL REFUND] No recipient email specified, skipping email.");
    return { success: false, message: "No email specified" };
  }

  const orderNum = order?.id ? `#ORD-${String(order.id).padStart(4, '0')}` : `#ORD-${String(refund?.orderId || '').padStart(4, '0')}`;
  const refundNum = refund?.id ? `#REF-${String(refund.id).padStart(4, '0')}` : 'N/A';
  const name = customerName || order?.customerName || order?.shippingName || 'Valued Customer';
  const refundAmount = Number(refund?.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const paymentMethod = refund?.paymentMethod || order?.paymentMode || 'Original Payment Method';
  const refNo = transactionReference || refund?.transactionReference || 'N/A';
  const formattedDate = new Date(processedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (!isEmailConfigured()) {
    console.log(`\n[EMAIL FALLBACK - Customer Payment Refunded]`);
    console.log(`To: ${email}`);
    console.log(`Customer: ${name}`);
    console.log(`Order: ${orderNum}`);
    console.log(`Refund Reference: ${refundNum}`);
    console.log(`Amount: ₱${refundAmount}`);
    console.log(`Method Returned: ${paymentMethod}`);
    console.log(`Transaction Reference: ${refNo}`);
    console.log(`Processed At: ${formattedDate}`);
    if (notes) console.log(`Notes: ${notes}`);
    console.log(`======================================================\n`);
    return { success: true, message: "Logged to console (SMTP not configured)" };
  }

  const mailOptions = {
    from: `"Mega Pacific Finance" <${process.env.SMTP_FROM || 'noreply@megapacific.com'}>`,
    to: email,
    subject: `[Refund Processed] ₱${refundAmount} Returned for Order ${orderNum}`,
    text: `Hello ${name}, your refund for order ${orderNum} has been processed by our Finance Department. Amount: ₱${refundAmount}. Returned to: ${paymentMethod}. Transaction Reference: ${refNo}. Thank you for your patience.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Refund Processed</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <div style="background: linear-gradient(135deg, #047857 0%, #065f46 100%); padding: 28px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">MEGA PACIFIC METAL & STEEL</h1>
            <p style="color: #a7f3d0; margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">FINANCE & DISBURSEMENT DEPARTMENT</p>
          </div>

          <div style="padding: 28px 24px;">
            <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-weight: 800; padding: 6px 14px; border-radius: 9999px; font-size: 12px; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #a7f3d0;">
              &#10003; PAYMENT REFUND COMPLETED
            </div>

            <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 20px;">Your Refund Has Been Processed</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Dear <strong>${name}</strong>, our Finance team has completed the return of your payment for Order <strong>${orderNum}</strong>. The funds have been reversed to your original payment account.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Refund Amount</span>
                <span style="font-size: 18px; font-weight: 900; color: #047857;">₱${refundAmount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Order Number</span>
                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${orderNum}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Refund Voucher ID</span>
                <span style="font-size: 13px; font-weight: 700; color: #0284c7;">${refundNum}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Returned Via</span>
                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${paymentMethod}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Transaction Reference</span>
                <span style="font-size: 13px; font-weight: 800; color: #475569; font-family: monospace;">${refNo}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Processed Date</span>
                <span style="font-size: 13px; color: #475569;">${formattedDate}</span>
              </div>
            </div>

            ${notes ? `
            <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
              <span style="display: block; font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; margin-bottom: 4px;">Finance Processing Note:</span>
              <p style="margin: 0; font-size: 13px; color: #334155;">${notes}</p>
            </div>
            ` : ''}

            <div style="background-color: #fefce8; border: 1px solid #fef08a; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 4px 0; color: #854d0e; font-size: 13px;">Payment Channel Posting Times:</h4>
              <p style="margin: 0; font-size: 12px; color: #713f12; line-height: 1.5;">
                • <strong>GCash</strong>: Typically reflects instantly or within 1 to 2 hours.<br>
                • <strong>Bank Transfer / Card Reversal</strong>: Depending on your issuing bank, reversal credits post within 1 to 3 banking days.
              </p>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" style="background-color: #047857; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">View Orders History</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <div style="text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 4px 0;">Mega Pacific Metal and Steel Corp &copy; 2026. All rights reserved.</p>
              <p style="margin: 0;">For billing inquiries, contact us at finance@megapacific.com or (046) 471-2345.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await deliverMail(mailOptions);
    console.log(`[EMAIL REFUND SUCCESS] Sent refund receipt for ${orderNum} (${refundNum}) to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL REFUND ERROR] Failed to send refund receipt for ${orderNum}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
  sendForgotPasswordEmail,
  sendOrderReceiptEmail,
  sendReadyForPickupEmail,
  sendRefundNotificationEmail
};


