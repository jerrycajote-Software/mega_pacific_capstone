import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Stack,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';

const ReportsPage = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState(null);

  const fetchReports = async (selectedPeriod) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/finance/reports?period=${selectedPeriod || period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load financial reports:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
    const interval = setInterval(() => {
      fetchReports(period);
    }, 15000);
    const handleFocus = () => fetchReports(period);
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [period]);

  const handlePeriodChange = (e) => {
    const val = e.target.value;
    setPeriod(val);
  };

  const handleExportPDF = () => {
    if (!reportData) return;
    try {
      const doc = new jsPDF();
      const summary = reportData.summary;

      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MEGA PACIFIC METAL AND STEEL ROOFING SYSTEM', 14, 13);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL FINANCIAL STATEMENT & P&L REPORT', 14, 21);

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(9);
      doc.text(`Reporting Period: ${reportData.periodLabel}`, 14, 36);
      doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString('en-PH')}`, 14, 42);

      autoTable(doc, {
        startY: 48,
        head: [['Key Metric', 'Financial Figure']],
        body: [
          ['Gross Operating Revenue', `PHP ${(summary.grossRevenue || 0).toLocaleString()}`],
          ['Total Operating Expenses', `PHP ${(summary.totalExpenses || 0).toLocaleString()}`],
          ['Net Operating Profit (EBITDA)', `PHP ${(summary.netIncome || 0).toLocaleString()}`],
          ['Estimated 12% Value Added Tax (VAT)', `PHP ${(summary.vat12 || 0).toLocaleString()}`],
          ['Net Sales (Net of VAT)', `PHP ${(summary.netSales || 0).toLocaleString()}`],
          ['Net Operating Margin', `${summary.profitMargin || 0}%`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
        styles: { fontSize: 9 }
      });

      const finalY = doc.lastAutoTable.finalY + 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Income Statement Breakdown', 14, finalY);

      const tableRows = reportData.incomeStatementRows.map(r => [
        r.category,
        r.item,
        `PHP ${r.amount.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: finalY + 4,
        head: [['Category', 'Account Description', 'Amount']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85], fontStyle: 'bold' },
        styles: { fontSize: 8.5 }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Mega Pacific Finance System • Page ${i} of ${pageCount}`,
          105,
          290,
          { align: 'center' }
        );
      }

      doc.save(`MegaPacific_Financial_Report_${period}_${Date.now().toString().slice(-4)}.pdf`);
      toast.success('Financial PDF Report exported successfully');
    } catch (err) {
      console.error('Export PDF error:', err);
      toast.error('Failed to generate PDF');
    }
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    try {
      const summary = reportData.summary;

      
      const pnlData = [
        ['MEGA PACIFIC METAL AND STEEL ROOFING SYSTEM - FINANCIAL REPORT'],
        ['Period:', reportData.periodLabel],
        ['Generated Date:', new Date(reportData.generatedAt).toLocaleString()],
        [],
        ['SUMMARY METRICS', 'AMOUNT (PHP)'],
        ['Gross Operating Revenue', summary.grossRevenue || 0],
        ['Total Operating Expenses', summary.totalExpenses || 0],
        ['Net Operating Income', summary.netIncome || 0],
        ['Estimated 12% VAT', summary.vat12 || 0],
        ['Net Sales (Net of VAT)', summary.netSales || 0],
        ['Profit Margin %', `${summary.profitMargin || 0}%`],
        [],
        ['CATEGORY', 'ACCOUNT DESCRIPTION', 'AMOUNT (PHP)']
      ];

      reportData.incomeStatementRows.forEach(r => {
        pnlData.push([r.category, r.item, r.amount]);
      });

      const wb = XLSX.utils.book_new();
      const wsPnl = XLSX.utils.aoa_to_sheet(pnlData);
      wsPnl['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsPnl, 'Income Statement');

      
      if (reportData.recentExpenses && reportData.recentExpenses.length > 0) {
        const expData = [
          ['REFERENCE', 'DATE', 'CATEGORY', 'DESCRIPTION', 'AMOUNT (PHP)', 'STATUS']
        ];
        reportData.recentExpenses.forEach(e => {
          expData.push([e.reference, e.date, e.category, e.description, e.amount, e.status]);
        });
        const wsExp = XLSX.utils.aoa_to_sheet(expData);
        wsExp['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, wsExp, 'Expenses');
      }

      
      if (reportData.recentPaidOrders && reportData.recentPaidOrders.length > 0) {
        const ordData = [
          ['ORDER ID', 'DATE', 'CUSTOMER', 'PAYMENT MODE', 'TOTAL (PHP)']
        ];
        reportData.recentPaidOrders.forEach(o => {
          ordData.push([o.id, o.date, o.customer, o.paymentMode, o.total]);
        });
        const wsOrd = XLSX.utils.aoa_to_sheet(ordData);
        wsOrd['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsOrd, 'Paid Orders');
      }

      XLSX.writeFile(wb, `MegaPacific_Financial_Report_${period}_${Date.now().toString().slice(-4)}.xlsx`);
      toast.success('Financial Excel Report exported successfully');
    } catch (err) {
      console.error('Export Excel error:', err);
      toast.error('Failed to generate Excel report');
    }
  };

  const summary = reportData?.summary || {};

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, animation: 'fadeIn 0.4s ease-in-out' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 4
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
              Financial Reports
            </Typography>
            <Chip
              label={reportData?.periodLabel || 'Consolidated'}
              size="small"
              sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', fontWeight: 700, fontSize: '0.72rem' }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Statutory income statements, tax calculations, and exportable ledgers.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            select
            size="small"
            value={period}
            onChange={handlePeriodChange}
            sx={{
              minWidth: 190,
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontWeight: 600, fontSize: '0.85rem' }
            }}
          >
            <MenuItem value="month">This Month (September 2026)</MenuItem>
            <MenuItem value="last_month">Last Month (August 2026)</MenuItem>
            <MenuItem value="quarter">This Quarter (Q3 2026)</MenuItem>
            <MenuItem value="year">Year to Date (2026)</MenuItem>
          </TextField>

          <Button
            variant="contained"
            color="primary"
            onClick={handleExportPDF}
            disabled={loading || !reportData}
            startIcon={<i className="fi fi-rr-file-pdf" 
            style={{ fontSize: 14 }} />}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            Export PDF
          </Button>

          <Button
            variant="outlined"
            color="success"
            onClick={handleExportExcel}
            disabled={loading || !reportData}
            startIcon={<i className="fi fi-rr-file-excel" style={{ fontSize: 14 }} />}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              py: 1,
              borderColor: 'success.main',
              bgcolor: 'background.paper'
            }}
          >
            Export Excel
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
          <CircularProgress size={44} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Compiling ledger entries and fiscal summary...
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderTop: '3px solid #10B981',
                  bgcolor: 'background.paper',
                  height: '100%'
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Gross Revenue
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ my: 0.5, color: '#047857' }}>
                  ₱{(summary.grossRevenue || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  From {summary.ordersCount || 0} completed orders
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderTop: '3px solid #EF4444',
                  bgcolor: 'background.paper',
                  height: '100%'
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Operating Expenses
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ my: 0.5, color: '#DC2626' }}>
                  ₱{(summary.totalExpenses || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Across {summary.expensesCount || 0} approved disbursals
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderTop: '3px solid #2563EB',
                  bgcolor: 'background.paper',
                  height: '100%'
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Net Operating Income
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ my: 0.5, color: '#1D4ED8' }}>
                  ₱{(summary.netIncome || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  EBITDA Margin: <strong style={{ color: '#2563EB' }}>{summary.profitMargin || 0}%</strong>
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderTop: '3px solid #F59E0B',
                  bgcolor: 'background.paper',
                  height: '100%'
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Est. 12% Value Added Tax
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ my: 0.5, color: '#B45309' }}>
                  ₱{(summary.vat12 || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Net of Tax: ₱{(summary.netSales || 0).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, pt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    minHeight: 48
                  }
                }}
              >
                <Tab label="Income Statement (P&L)" />
                <Tab label="Expenses by Category" />
                <Tab label="Order Settlement Ledger" />
              </Tabs>
            </Box>

            {activeTab === 0 && (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary' }}>Classification</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary' }}>Account / Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textAlign: 'right' }}>Amount (PHP)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.incomeStatementRows?.map((row, idx) => {
                      const isBold = row.isBold;
                      const isNet = row.type === 'net_income';
                      const isTotalInc = row.type === 'total_income';
                      const isTotalExp = row.type === 'total_expense';

                      return (
                        <TableRow
                          key={idx}
                          sx={{
                            bgcolor: isNet
                              ? 'rgba(37, 99, 235, 0.04)'
                              : isTotalInc
                              ? 'rgba(16, 185, 129, 0.04)'
                              : isTotalExp
                              ? 'rgba(239, 68, 68, 0.04)'
                              : 'inherit',
                            '& td': {
                              fontWeight: isBold ? 800 : 500,
                              fontSize: isBold ? '0.9rem' : '0.85rem',
                              borderBottom: isBold ? '2px solid' : '1px solid',
                              borderColor: 'divider'
                            }
                          }}
                        >
                          <TableCell sx={{ color: isBold ? 'text.primary' : 'text.secondary' }}>
                            {row.category}
                          </TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>
                            {row.item}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: 'right',
                              color: isNet
                                ? 'primary.main'
                                : isTotalInc
                                ? '#059669'
                                : isTotalExp
                                ? '#DC2626'
                                : 'text.primary'
                            }}
                          >
                            ₱{row.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                      Category Disbursements Summary
                    </Typography>
                    <Stack spacing={2}>
                      {reportData?.expensesByCategory?.map((cat, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                            <Typography variant="body2" fontWeight={600}>{cat.name}</Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight={800}>
                            ₱{cat.amount.toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                      Recent Expense Records
                    </Typography>
                    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Ref</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'right' }}>Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData?.recentExpenses?.map((e, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'error.main' }}>{e.reference}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem' }}>{e.category}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, textAlign: 'right' }}>₱{e.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 2 && (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Settlement Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Payment Mode</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', textAlign: 'right' }}>Settled Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.recentPaidOrders?.map((ord, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.85rem' }}>{ord.id}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{ord.date}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{ord.customer}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>
                          <Chip label={ord.paymentMode} size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 800, fontSize: '0.85rem' }}>
                          ₱{ord.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!reportData?.recentPaidOrders || reportData.recentPaidOrders.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          No settled orders recorded for this period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ReportsPage;
