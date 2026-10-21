import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatPHP = (amount) => {
  const num = Number(amount) || 0;
  return `PHP ${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Generate and download an Official Order Receipt (PDF)
 * @param {Object} order - Full order object with customer details, items, fulfillment & payment info
 */
export const generateReceiptPDF = (order) => {
  if (!order) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const rawId = order.rawId || order.id || 0;
  const orderNum = typeof order.id === 'string' && order.id.startsWith('#ORD-')
    ? order.id
    : `#ORD-${String(rawId).padStart(4, '0')}`;
  const isPickup = (order.fulfillmentType || '').toLowerCase() === 'pickup';

  doc.setFillColor(79, 119, 45); // Mega Pacific Forest Green
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(163, 177, 138); // Pale Sage
  doc.rect(0, 28, pageWidth, 2, 'F');

  const badgeW = 46;
  const badgeH = 17;
  const badgeX = pageWidth - 14 - badgeW;
  const badgeY = 5.5;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'F');
  doc.setTextColor(79, 119, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('OFFICIAL RECEIPT', badgeX + (badgeW / 2), badgeY + 6.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SALES INVOICE', badgeX + (badgeW / 2), badgeY + 12, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text('MEGA PACIFIC ROOFING MANUFACTURING CORP.', 14, 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(230, 240, 220);
  doc.text('Plant & Depot: Aguinaldo Highway, Imus, Cavite', 14, 17.5);
  doc.text('Dispatch Hotline: (046) 471-2345 | 0917-123-4567 | info@megapacificroofing.ph', 14, 22.5);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);

  let currentY = 38;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 88, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 88, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 119, 45);
  doc.text('TRANSACTION DETAILS', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Order Reference:', 18, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(orderNum, 52, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Date Placed:', 18, currentY + 19);
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(order.createdAt || order.dateOrdered || order.orderDate || order.date), 52, currentY + 19);

  doc.setTextColor(71, 85, 105);
  doc.text('Fulfillment Type:', 18, currentY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPickup ? 124 : 30, isPickup ? 58 : 58, isPickup ? 237 : 138);
  doc.text(isPickup ? 'Store / Plant Pick-up' : 'Jobsite Fleet Delivery', 52, currentY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Status:', 18, currentY + 31);
  doc.setFont('helvetica', 'bold');
  const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';
  doc.setTextColor(isPaid ? 22 : 217, isPaid ? 101 : 119, isPaid ? 52 : 6);
  doc.text((order.paymentStatus || 'Pending').toUpperCase(), 52, currentY + 31);

  // Customer / Destination Box (Right)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, currentY, 88, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(108, currentY, 88, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 119, 45);
  doc.text(isPickup ? 'PICK-UP & CLIENT INFO' : 'DELIVER TO (JOBSITE)', 112, currentY + 6);

  const customerName = order.shippingName || order.customerName || order.user?.name || 'Valued Customer';
  const customerEmail = order.customerEmail || order.shippingEmail || order.user?.email || 'N/A';
  const customerContact = order.shippingContactNumber || order.contactNumber || order.shippingPhone || order.phone || 'N/A';
  const addressLine = isPickup
    ? 'Mega Pacific Plant — Loading Dock 1, Imus Cavite'
    : (order.shippingAddress || order.address || order.cityProvince || 'N/A');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(customerName.slice(0, 35), 112, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact: ${customerContact}`, 112, currentY + 19);
  doc.text(`Email: ${customerEmail}`.slice(0, 42), 112, currentY + 25);

  const splitAddress = doc.splitTextToSize(`Address: ${addressLine}`, 80);
  doc.text(splitAddress.slice(0, 2), 112, currentY + 31);

  currentY += 44;

  const tableHeaders = [
    'Item Description',
    'Gauge',
    'Color Finish',
    'Length',
    'Qty',
    'Total (PHP)'
  ];

  const items = order.items || [];
  const itemsSubtotal = items.reduce((sum, item) => {
    const len = item.customLength ? parseFloat(item.customLength) : 1;
    const unitPrice = parseFloat(item.price ?? item.unitPrice ?? 0);
    return sum + (unitPrice * len * (Number(item.quantity) || 1));
  }, 0);

  const tableRows = items.map((item, idx) => {
    const prodName = item.product?.name || item.productName || item.name || `Item #${idx + 1}`;
    const gauge = item.thickness || item.variant?.thickness || item.product?.thickness || '0.35mm';
    const color = item.color || item.variant?.color || item.product?.color || 'Standard';
    const lengthStr = item.customLength ? `${Number(item.customLength).toFixed(2)}m` : 'Standard';
    const qty = Number(item.quantity) || 1;
    const qtyStr = `${qty} ${item.customLength ? (qty === 1 ? 'sheet' : 'sheets') : 'pcs'}`;
    const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
    const lengthMultiplier = item.customLength ? Number(item.customLength) : 1;
    const lineTotal = unitPrice * lengthMultiplier * qty;
    const priceStr = formatPHP(lineTotal);

    return [
      prodName,
      gauge,
      color,
      lengthStr,
      qtyStr,
      priceStr
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 119, 45],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 22 },
      2: { cellWidth: 36 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 14, right: 14 },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  let finalTableY = doc.lastAutoTable.finalY + 8;
  if (finalTableY + 62 > pageHeight - 16) {
    doc.addPage();
    finalTableY = 20;
  }

  const summaryBoxW = 86;
  const summaryBoxX = pageWidth - 14 - summaryBoxW;
  const totalAmount = Number(order.total ?? order.totalAmount) || itemsSubtotal;
  const actualShippingFee = isPickup ? 0 : Math.max(0, Math.round((totalAmount - itemsSubtotal) * 100) / 100);

  const isCOD50 = (order.paymentMode || '').includes('50%') || (order.paymentStatus || '').includes('50%');
  const downpayment = isCOD50 ? Math.round(totalAmount * 0.5 * 100) / 100 : totalAmount;
  const balanceRemaining = isCOD50 ? (totalAmount - downpayment) : 0;

  const boxHeight = 54;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryBoxX, finalTableY, summaryBoxW, boxHeight, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryBoxX, finalTableY, summaryBoxW, boxHeight, 2, 2, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Method:', summaryBoxX + 4, finalTableY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const paymentMethodStr = String(order.paymentMode || order.paymentMethod || 'Credit / Debit Card').slice(0, 24);
  doc.text(paymentMethodStr, summaryBoxX + summaryBoxW - 4, finalTableY + 7, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Items Subtotal:', summaryBoxX + 4, finalTableY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatPHP(itemsSubtotal), summaryBoxX + summaryBoxW - 4, finalTableY + 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(isPickup ? 'Pick-up Handling:' : 'Fleet Logistics Fee:', summaryBoxX + 4, finalTableY + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPickup ? 22 : 15, isPickup ? 101 : 23, isPickup ? 52 : 42);
  doc.text(isPickup ? 'FREE (PHP 0.00)' : formatPHP(actualShippingFee), summaryBoxX + summaryBoxW - 4, finalTableY + 23, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(summaryBoxX + 4, finalTableY + 27, summaryBoxX + summaryBoxW - 4, finalTableY + 27);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Order Value:', summaryBoxX + 4, finalTableY + 34);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 119, 45);
  doc.setFontSize(9);
  doc.text(formatPHP(totalAmount), summaryBoxX + summaryBoxW - 4, finalTableY + 34, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(isCOD50 ? '50% Downpayment (Paid):' : 'Settled Amount (Paid):', summaryBoxX + 4, finalTableY + 42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(formatPHP(downpayment), summaryBoxX + summaryBoxW - 4, finalTableY + 42, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(isCOD50 ? 'Remaining Balance (Delivery):' : 'Balance Remaining:', summaryBoxX + 4, finalTableY + 49);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isCOD50 ? 180 : 22, isCOD50 ? 83 : 101, isCOD50 ? 9 : 52);
  doc.text(isCOD50 ? formatPHP(balanceRemaining) : 'PHP 0.00 (Settled)', summaryBoxX + summaryBoxW - 4, finalTableY + 49, { align: 'right' });

  // 5. Pick-up / Delivery Guidance Note (Left side)
  const noticeBoxX = 14;
  const noticeBoxW = summaryBoxX - noticeBoxX - 6;
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(noticeBoxX, finalTableY, noticeBoxW, boxHeight, 2, 2, 'F');
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(noticeBoxX, finalTableY, noticeBoxW, boxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(133, 77, 14);
  doc.setFontSize(8);
  doc.text('MANUFACTURER RELEASE NOTICE', 18, finalTableY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(113, 63, 18);
  const releaseNote = isPickup
    ? 'Custom pre-order roll-formed roofing sheets are inspected, banded, and staged at Plant Loading Dock 1. Please present this official receipt reference.'
    : 'All roll-formed products are dispatched strapped on fleet transit directly from our manufacturing bay. Please ensure a representative is available on site to sign the delivery handover sheet.';
  const splitRelease = doc.splitTextToSize(releaseNote, noticeBoxW - 8);
  doc.text(splitRelease, 18, finalTableY + 13);

  // 6. Security & Legal Footer
  const footerY = pageHeight - 16;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('This is an official computer-generated receipt from Mega Pacific Roofing Manufacturing System. Genuine Mill Specs Guaranteed.', 14, footerY);
  doc.text(`Document Reference: ${orderNum} | Generated: ${new Date().toLocaleString('en-PH')}`, pageWidth - 14, footerY, { align: 'right' });

  doc.save(`MegaPacific_Receipt_${order.id || 'Order'}.pdf`);
};

/**
 * Generate and download a Formal Trade Price Quotation (PDF)
 * @param {Object} quoteData - Specification details, customer name, configured items, and total
 */
export const generateQuotationPDF = (quoteData) => {
  if (!quoteData) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const quoteRef = quoteData.quoteNumber || `QT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  doc.setFillColor(30, 58, 138); // Deep Industrial Navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(234, 179, 8); // Gold accent
  doc.rect(0, 28, pageWidth, 2, 'F');

  const qBadgeW = 46;
  const qBadgeH = 17;
  const qBadgeX = pageWidth - 14 - qBadgeW;
  const qBadgeY = 5.5;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qBadgeX, qBadgeY, qBadgeW, qBadgeH, 2, 2, 'F');
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('PRICE QUOTATION', qBadgeX + (qBadgeW / 2), qBadgeY + 6.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('PRO-FORMA ESTIMATE', qBadgeX + (qBadgeW / 2), qBadgeY + 12, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text('MEGA PACIFIC ROOFING MANUFACTURING CORP.', 14, 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(224, 231, 255);
  doc.text('Direct Manufacturer • High-Tensile Prime Steel Coils • Cut-To-Size Roll Forming', 14, 17.5);
  doc.text('Imus Cavite Plant | Valenzuela & Subic Depots | Hotline: (046) 471-2345', 14, 22.5);

  let currentY = 38;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 88, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 88, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(9);
  doc.text('QUOTATION PARAMETERS', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Quotation Reference:', 18, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(quoteRef, 54, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Date Issued:', 18, currentY + 19);
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(new Date()), 54, currentY + 19);

  doc.setTextColor(71, 85, 105);
  doc.text('Price Validity:', 18, currentY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('30 Calendar Days', 54, currentY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Lead Time:', 18, currentY + 31);
  doc.setTextColor(15, 23, 42);
  doc.text('2 to 3 Business Days', 54, currentY + 31);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, currentY, 88, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(108, currentY, 88, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('CLIENT & PROJECT INFORMATION', 112, currentY + 6);

  const clientName = quoteData.customerName || 'Prospective Project Partner / Client';
  const clientEmail = quoteData.customerEmail || 'Contact via Mega Pacific Engineering';
  const clientPhone = quoteData.customerPhone || 'N/A';
  const projectLocation = quoteData.deliveryLocation || 'CALABARZON / Mega Manila Project Site';

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(clientName.slice(0, 35), 112, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact: ${clientPhone}`, 112, currentY + 19);
  doc.text(`Email: ${clientEmail}`.slice(0, 42), 112, currentY + 25);

  const splitLoc = doc.splitTextToSize(`Project Site: ${projectLocation}`, 80);
  doc.text(splitLoc.slice(0, 2), 112, currentY + 31);

  currentY += 44;

  const tableHeaders = [
    'Profile / Specification',
    'Gauge',
    'Finish Color',
    'Length',
    'Qty',
    'Unit Price',
    'Subtotal (PHP)'
  ];

  const items = quoteData.items || [];
  const tableRows = items.map((item, idx) => {
    const name = item.product?.name || item.name || `Item #${idx + 1}`;
    const gauge = item.thickness || item.variant?.thickness || item.product?.thickness || '0.35mm';
    const color = item.color || item.variant?.color || item.product?.color || 'Standard';
    const lengthStr = item.customLength ? `${Number(item.customLength).toFixed(2)}m` : '1.00m';
    const qtyStr = `${item.quantity || 1} ${item.customLength ? (item.quantity === 1 ? 'sheet' : 'sheets') : 'pcs'}`;
    const unitPrice = item.unitPrice || item.price || 0;
    const itemTotal = item.total || (unitPrice * (item.customLength || 1) * (item.quantity || 1));

    return [
      name,
      gauge,
      color,
      lengthStr,
      qtyStr,
      formatPHP(unitPrice),
      formatPHP(itemTotal)
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 44 },
      1: { cellWidth: 18 },
      2: { cellWidth: 32 },
      3: { cellWidth: 18 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 28, halign: 'right' }
    },
    margin: { left: 14, right: 14 },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  let finalTableY = doc.lastAutoTable.finalY + 8;
  if (finalTableY + 82 > pageHeight - 16) {
    doc.addPage();
    finalTableY = 20;
  }

  const qSummaryBoxW = 80;
  const qSummaryBoxX = pageWidth - 14 - qSummaryBoxW;
  const quoteTotal = Number(quoteData.total) || items.reduce((acc, itm) => acc + (Number(itm.total) || 0), 0);
  const dp50 = Math.round(quoteTotal * 0.5 * 100) / 100;
  const balance50 = quoteTotal - dp50;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(qSummaryBoxX, finalTableY, qSummaryBoxW, 48, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(qSummaryBoxX, finalTableY, qSummaryBoxW, 48, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Materials Subtotal:', qSummaryBoxX + 4, finalTableY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatPHP(quoteTotal), qSummaryBoxX + qSummaryBoxW - 4, finalTableY + 7, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Estimated Logistics / Freight:', qSummaryBoxX + 4, finalTableY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('To be finalized', qSummaryBoxX + qSummaryBoxW - 4, finalTableY + 14, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(qSummaryBoxX + 4, finalTableY + 18.5, qSummaryBoxX + qSummaryBoxW - 4, finalTableY + 18.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('TOTAL ESTIMATE:', qSummaryBoxX + 4, finalTableY + 25.5);
  doc.setFontSize(9.5);
  doc.text(formatPHP(quoteTotal), qSummaryBoxX + qSummaryBoxW - 4, finalTableY + 25.5, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('50% Downpayment (To Commence):', qSummaryBoxX + 4, finalTableY + 33.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(formatPHP(dp50), qSummaryBoxX + qSummaryBoxW - 4, finalTableY + 33.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('50% Upon Delivery / Release:', qSummaryBoxX + 4, finalTableY + 41.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(formatPHP(balance50), qSummaryBoxX + qSummaryBoxW - 4, finalTableY + 41.5, { align: 'right' });

  const termsBoxX = 14;
  const termsBoxW = 96;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(termsBoxX, finalTableY, termsBoxW, 48, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(termsBoxX, finalTableY, termsBoxW, 48, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(8);
  doc.text('MANUFACTURING TERMS & CONDITIONS', 18, finalTableY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const termsText = [
    '1. Prices are valid for 30 calendar days from issue date. Subject to coil mill price stability.',
    '2. 50% downpayment confirms scheduling into factory roll-forming lines. Custom cut lengths are non-refundable once roll-forming starts.',
    '3. Standard delivery lead time: 2 to 3 business days across CALABARZON and Metro Manila.',
    '4. Official BIR compliant invoice issued upon final order settlement.'
  ];

  let currentTermY = finalTableY + 12;
  const maxTermWidth = termsBoxW - 8;

  termsText.forEach((term) => {
    const lines = doc.splitTextToSize(term, maxTermWidth);
    doc.text(lines, 18, currentTermY);
    currentTermY += (lines.length * 3.0) + 1.4;
  });

  const sigY = finalTableY + 54;
  if (sigY + 24 < pageHeight) {
    doc.setDrawColor(148, 163, 184);

    doc.line(18, sigY + 10, 88, sigY + 10);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('MEGA PACIFIC SALES ENGINEERING', 18, sigY + 15);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Technical Estimation Team', 18, sigY + 19);

    doc.line(pageWidth - 88, sigY + 10, pageWidth - 18, sigY + 10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('CONFORME & ACCEPTANCE', pageWidth - 88, sigY + 15);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Client Signature over Printed Name / Date', pageWidth - 88, sigY + 19);
  }

  const footerY = pageHeight - 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('This pro-forma quotation is computer-generated by Mega Pacific Roofing System. Genuine Prime Steel Coils Guaranteed.', 14, footerY);
  doc.text(`Reference: ${quoteRef}`, pageWidth - 14, footerY, { align: 'right' });

  doc.save(`MegaPacific_Quotation_${quoteRef}.pdf`);
};
