import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatOrderData = (orders) => {
  return orders.map(order => ({
    'Order Number': order.id,
    'Customer Name': order.customerName || order.user?.name || 'N/A',
    'Customer Email': order.customerEmail || order.user?.email || 'N/A',
    'Total Amount': `₱${order.total.toLocaleString()}`,
    'Payment Method': order.paymentMode,
    'Order Status': order.status,
    'Shipping Address': order.shippingAddress || 'N/A',
    'Delivery Status': order.shippingStatus || order.status, // or logic based on your db
    'Order Date': new Date(order.createdAt).toLocaleDateString(),
    'Estimated Delivery Date': order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'
  }));
};

const calculateSummary = (orders) => {
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalDelivered = orders.filter(order => order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered').length;
  const totalPending = orders.filter(order => order.status.toLowerCase() === 'pending').length;
  const totalCancelled = orders.filter(order => order.status.toLowerCase() === 'cancelled').length;

  return [
    ['Total Orders', totalOrders],
    ['Total Sales', `₱${totalSales.toLocaleString()}`],
    ['Total Delivered Orders', totalDelivered],
    ['Total Pending Orders', totalPending],
    ['Total Cancelled Orders', totalCancelled],
  ];
};

export const exportToExcel = (orders, filename = 'Orders_Report') => {
  const formattedData = formatOrderData(orders);
  const summaryData = calculateSummary(orders);

  const wb = XLSX.utils.book_new();

  // Create Orders Sheet
  const wsOrders = XLSX.utils.json_to_sheet(formattedData);
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders');

  // Create Summary Sheet
  const wsSummary = XLSX.utils.aoa_to_sheet([
    ['Report Summary'],
    [],
    ['Metric', 'Value'],
    ...summaryData
  ]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Export
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (orders, filename = 'Orders_Report') => {
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(18);
  doc.text('Order Management Report', 14, 22);
  
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

  const finalY = doc.lastAutoTable.finalY || 30;

  // Orders Table
  const formattedData = formatOrderData(orders);
  const tableHeaders = [
    'Order ID', 'Customer Name', 'Total', 'Payment', 'Status', 'Date'
  ];
  const tableData = formattedData.map(row => [
    row['Order Number'],
    row['Customer Name'],
    row['Total Amount'],
    row['Payment Method'],
    row['Order Status'],
    row['Order Date']
  ]);

  doc.autoTable({
    startY: finalY + 15,
    head: [tableHeaders],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [79, 119, 45] },
    styles: { fontSize: 9 }
  });

  doc.save(`${filename}.pdf`);
};
