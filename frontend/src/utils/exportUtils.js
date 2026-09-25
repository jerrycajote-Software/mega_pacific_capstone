import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ShippingInfoMapper } from './ShippingInfoMapper';

const formatOrderData = (orders) => {
  return orders.map(order => {
    const shippingInfo = ShippingInfoMapper.map(order) || {};
    return {
      'Order Number': order.id || 'N/A',
      'Customer Name': shippingInfo.fullName || order.customerName || order.user?.name || 'N/A',
      'Customer Email': shippingInfo.email || order.customerEmail || order.user?.email || 'N/A',
      'Total Amount': `₱${(order.totalAmount || order.total || 0).toLocaleString()}`,
      'Payment Method': order.paymentMode || 'N/A',
      'Order Status': order.orderStatus || order.status || 'N/A',
      'Shipping Address': `${shippingInfo.address || 'N/A'}, ${shippingInfo.city || 'N/A'}`,
      'Delivery Status': order.orderStatus || order.status || 'N/A',
      'Order Date': order.dateOrdered ? new Date(order.dateOrdered).toLocaleDateString() : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'),
      'Estimated Delivery Date': order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'
    };
  });
};

const calculateSummary = (orders) => {
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
  const totalDelivered = orders.filter(order => {
    const status = (order.orderStatus || order.status || '').toLowerCase();
    return status === 'completed' || status === 'delivered';
  }).length;
  const totalPending = orders.filter(order => {
    const status = (order.orderStatus || order.status || '').toLowerCase();
    return status === 'pending';
  }).length;
  const totalCancelled = orders.filter(order => {
    const status = (order.orderStatus || order.status || '').toLowerCase();
    return status === 'cancelled';
  }).length;

  return [
    ['Total Orders', totalOrders],
    ['Total Sales', `₱${totalSales.toLocaleString()}`],
    ['Total Delivered Orders', totalDelivered],
    ['Total Pending Orders', totalPending],
    ['Total Cancelled Orders', totalCancelled],
  ];
};

const fitToColumn = (data) => {
  const columnWidths = [];
  data.forEach((row) => {
    Object.keys(row).forEach((key, index) => {
      const value = row[key] ? row[key].toString() : '';
      const width = Math.max(key.length, value.length);
      if (!columnWidths[index] || width > columnWidths[index].wch) {
        columnWidths[index] = { wch: width + 2 }; // Add padding
      }
    });
  });
  return columnWidths;
};

const applyHeaderStyles = (ws) => {
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4F772D" } }, // Green background
    alignment: { horizontal: "center", vertical: "center" }
  };

  // The first row is the header, which are cells A1, B1, C1, etc.
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ c: C, r: 0 }); // row 0 is header
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = headerStyle;
  }
};

export const exportToExcel = (orders, filename = 'Orders_Report') => {
  const formattedData = formatOrderData(orders);
  
  // Calculate total amount for the summary row
  const totalAmountSum = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
  
  // Append a Total row
  formattedData.push({
    'Order Number': 'TOTAL',
    'Customer Name': '',
    'Customer Email': '',
    'Total Amount': `₱${totalAmountSum.toLocaleString()}`,
    'Payment Method': '',
    'Order Status': '',
    'Shipping Address': '',
    'Delivery Status': '',
    'Order Date': '',
    'Estimated Delivery Date': ''
  });

  const summaryData = calculateSummary(orders);

  const wb = XLSX.utils.book_new();

  // Create Orders Sheet
  const wsOrders = XLSX.utils.json_to_sheet(formattedData);
  wsOrders['!cols'] = fitToColumn(formattedData);
  applyHeaderStyles(wsOrders);
  
  // Make the last row bold (the TOTAL row)
  const range = XLSX.utils.decode_range(wsOrders['!ref']);
  const lastRow = range.e.r;
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ c: C, r: lastRow });
    if (!wsOrders[cellAddress]) continue;
    wsOrders[cellAddress].s = { font: { bold: true } };
  }

  XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders');

  // Create Summary Sheet
  const wsSummary = XLSX.utils.aoa_to_sheet([
    ['Report Summary'],
    [],
    ['Metric', 'Value'],
    ...summaryData
  ]);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Export
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (orders, filename = 'Orders_Report') => {
  try {
    const doc = new jsPDF('landscape');
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 119, 45); // match header color
    
    const title = 'Order Management Report';
    const pageWidth = doc.internal.pageSize.width || (doc.internal.pageSize.getWidth ? doc.internal.pageSize.getWidth() : 297);
    doc.text(title, pageWidth / 2, 22, { align: 'center' });
    
    // Reset fonts
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Summary Table
    const summaryData = calculateSummary(orders);
    doc.autoTable({
      startY: 30,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [79, 119, 45] },
      margin: { left: 14 },
      tableWidth: 100
    });

    const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : (doc.autoTable && doc.autoTable.previous && doc.autoTable.previous.finalY) ? doc.autoTable.previous.finalY : 30;

    // Orders Table
    const formattedData = formatOrderData(orders);
    
    // Calculate total amount for the summary row
    const totalAmountSum = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    formattedData.push({
      'Order Number': 'TOTAL',
      'Customer Name': '',
      'Customer Email': '',
      'Total Amount': `₱${totalAmountSum.toLocaleString()}`,
      'Payment Method': '',
      'Order Status': '',
      'Shipping Address': '',
      'Delivery Status': '',
      'Order Date': '',
      'Estimated Delivery Date': ''
    });

    const tableHeaders = [
      'Order Number', 'Customer Name', 'Customer Email', 'Total Amount', 'Payment Method', 'Order Status', 'Shipping Address', 'Delivery Status', 'Order Date', 'Estimated Delivery'
    ];
    const tableData = formattedData.map(row => [
      row['Order Number'] || '',
      row['Customer Name'] || '',
      row['Customer Email'] || '',
      row['Total Amount'] || '',
      row['Payment Method'] || '',
      row['Order Status'] || '',
      row['Shipping Address'] || '',
      row['Delivery Status'] || '',
      row['Order Date'] || '',
      row['Estimated Delivery Date'] || ''
    ]);

    doc.autoTable({
      startY: finalY + 15,
      head: [tableHeaders],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 119, 45] },
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      margin: { left: 10, right: 10 },
      didParseCell: function (data) {
        // If it's the last row of the table, make it bold
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      }
    });

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error generating PDF: ", error);
    alert("Failed to generate PDF. Please try again.");
  }
};
