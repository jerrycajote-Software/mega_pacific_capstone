import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const S = {
  container: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    background: 'var(--bg-secondary)',
    padding: '1.25rem 1.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border)',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  titleIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#22c55e',
  },
  titleText: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subText: {
    margin: '0.2rem 0 0',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  subTabGroup: {
    display: 'flex',
    gap: '0.5rem',
    background: 'var(--bg-primary)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
  },
  subTab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeSubTab: {
    background: 'var(--bg-secondary)',
    color: '#22c55e',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  inactiveSubTab: {
    background: 'transparent',
    color: 'var(--text-muted)',
  },
  searchBar: {
    position: 'relative',
    minWidth: '260px',
    flex: 1,
    maxWidth: '400px',
  },
  searchInput: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '0.55rem 0.9rem 0.55rem 2.4rem',
    color: 'var(--text-primary)',
    fontSize: '0.84rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  tableCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '0.85rem 1.25rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(0,0,0,0.08)',
  },
  td: {
    padding: '0.9rem 1.25rem',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
  },
  qtyInput: {
    width: '90px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    padding: '0.45rem 0.65rem',
    color: '#22c55e',
    fontWeight: 700,
    fontSize: '0.9rem',
    outline: 'none',
    textAlign: 'center',
  },
  reasonInput: {
    width: '180px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    padding: '0.45rem 0.65rem',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    outline: 'none',
  },
  saveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
    transition: 'transform 0.1s, opacity 0.18s',
  },
  bulkBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1.25rem',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '12px',
    marginBottom: '1rem',
  }
};

export default function StockManagementTab({ products, onRefreshProducts }) {
  const [subTab, setSubTab] = useState('restock'); // 'restock' | 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  
  // Stock Addition state: key is `p-${productId}` or `v-${variantId}`
  // value: { addedQty: number, reason: string }
  const [stockInputs, setStockInputs] = useState({});
  const [submittingKey, setSubmittingKey] = useState(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch logs when log tab opens
  useEffect(() => {
    if (subTab === 'logs') {
      fetchLogs();
    }
  }, [subTab]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/admin/products/stock-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stock logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleInputChange = (key, field, value) => {
    setStockInputs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSingleSave = async (itemKey, productId, variantId, currentStock) => {
    const input = stockInputs[itemKey];
    const qty = parseInt(input?.addedQty);

    if (!qty || qty <= 0) {
      setAlertInfo({ type: 'error', message: 'Please enter a valid positive stock quantity to add.' });
      return;
    }

    setSubmittingKey(itemKey);
    setAlertInfo({ type: '', message: '' });

    try {
      const token = localStorage.getItem('appToken');
      const payload = {
        productId,
        variantId: variantId || null,
        addedQuantity: qty,
        reason: input?.reason || 'Restock'
      };

      const res = await axios.post(`${API_URL}/api/admin/products/stock-adjust`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setAlertInfo({ type: 'success', message: `Successfully added +${qty} units to stock!` });
        // Clear input for this item
        setStockInputs(prev => {
          const next = { ...prev };
          delete next[itemKey];
          return next;
        });
        if (onRefreshProducts) onRefreshProducts();
      }
    } catch (err) {
      console.error('Single stock adjust failed:', err);
      setAlertInfo({ type: 'error', message: err.response?.data?.error || 'Failed to update stock.' });
    } finally {
      setSubmittingKey(null);
    }
  };

  const handleBulkSave = async () => {
    const itemsToSave = [];
    Object.keys(stockInputs).forEach(key => {
      const input = stockInputs[key];
      const qty = parseInt(input?.addedQty);
      if (qty && qty > 0) {
        const isVariant = key.startsWith('v-');
        const id = parseInt(key.replace(/^[pv]-/, ''));
        if (isVariant) {
          // Find product ID for this variant
          let pId = null;
          products.forEach(p => {
            if (p.variants?.some(v => v.id === id)) {
              pId = p.id;
            }
          });
          itemsToSave.push({
            productId: pId,
            variantId: id,
            addedQuantity: qty,
            reason: input.reason || 'Bulk Restock'
          });
        } else {
          itemsToSave.push({
            productId: id,
            variantId: null,
            addedQuantity: qty,
            reason: input.reason || 'Bulk Restock'
          });
        }
      }
    });

    if (itemsToSave.length === 0) {
      setAlertInfo({ type: 'error', message: 'No items with positive added quantities to save.' });
      return;
    }

    setBulkSubmitting(true);
    setAlertInfo({ type: '', message: '' });

    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.post(`${API_URL}/api/admin/products/stock-adjust-bulk`, { adjustments: itemsToSave }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setAlertInfo({ type: 'success', message: `Bulk Restock Completed! Updated ${res.data.count} item(s).` });
        setStockInputs({});
        if (onRefreshProducts) onRefreshProducts();
      }
    } catch (err) {
      console.error('Bulk stock adjust failed:', err);
      setAlertInfo({ type: 'error', message: err.response?.data?.error || 'Bulk restock failed.' });
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Build flattened table list of products & variants for restocking
  const stockItemsList = [];
  const productTypes = ['All'];

  products.forEach(p => {
    if (p.type && !productTypes.includes(p.type)) {
      productTypes.push(p.type);
    }

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || p.type === selectedType;

    if (matchesSearch && matchesType) {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
          stockItemsList.push({
            key: `v-${v.id}`,
            productId: p.id,
            variantId: v.id,
            displayName: `${p.name} — (${v.name})`,
            type: p.type || 'Standard',
            unit: p.unit || 'per unit',
            currentStock: v.stock,
            isVariant: true
          });
        });
      } else {
        stockItemsList.push({
          key: `p-${p.id}`,
          productId: p.id,
          variantId: null,
          displayName: p.name,
          type: p.type || 'Standard',
          unit: p.unit || 'per unit',
          currentStock: p.stock,
          isVariant: false
        });
      }
    }
  });

  // Calculate count of modified bulk items
  const modifiedCount = Object.keys(stockInputs).filter(k => parseInt(stockInputs[k]?.addedQty) > 0).length;

  return (
    <Box style={S.container}>
      {/* Top Header Bar & Sub-Tab Controls */}
      <Box style={S.headerBar}>
        <Box style={S.titleGroup}>
          <Box style={S.titleIcon}>
            <Inventory2Icon />
          </Box>
          <Box>
            <Typography style={S.titleText}>Stock Quantity Management</Typography>
            <Typography style={S.subText}>Add inventory stock quantity & view restock transaction logs</Typography>
          </Box>
        </Box>

        <Box style={S.subTabGroup}>
          <button
            style={{ ...S.subTab, ...(subTab === 'restock' ? S.activeSubTab : S.inactiveSubTab) }}
            onClick={() => setSubTab('restock')}
          >
            <AddCircleOutlinedIcon sx={{ fontSize: 18 }} />
            Stock In / Restock
          </button>
          <button
            style={{ ...S.subTab, ...(subTab === 'logs' ? S.activeSubTab : S.inactiveSubTab) }}
            onClick={() => setSubTab('logs')}
          >
            <HistoryIcon sx={{ fontSize: 18 }} />
            Restock Audit Logs
          </button>
        </Box>
      </Box>

      {alertInfo.message && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo({ type: '', message: '' })}>
          {alertInfo.message}
        </Alert>
      )}

      {/* SUB-TAB 1: STOCK IN / RESTOCK */}
      {subTab === 'restock' && (
        <>
          {/* Controls Bar */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
              <Box style={S.searchBar}>
                <SearchIcon style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 20 }} />
                <input
                  type="text"
                  placeholder="Search item or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={S.searchInput}
                />
              </Box>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '0.55rem 0.9rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {productTypes.map(t => (
                  <option key={t} value={t}>{t === 'All' ? 'All Product Types' : t}</option>
                ))}
              </select>
            </Box>

            {onRefreshProducts && (
              <IconButton onClick={onRefreshProducts} title="Refresh Inventory Data" style={{ color: 'var(--text-muted)' }}>
                <RefreshIcon />
              </IconButton>
            )}
          </Box>

          {/* Bulk Restock Action Banner */}
          {modifiedCount > 0 && (
            <Box style={S.bulkBanner}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircleOutlinedIcon style={{ color: '#22c55e' }} />
                <Typography style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Ready to restock {modifiedCount} item{modifiedCount > 1 ? 's' : ''}
                </Typography>
              </Box>

              <Box style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  size="small"
                  onClick={() => setStockInputs({})}
                  style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'none' }}
                >
                  Clear All
                </Button>
                <button
                  style={S.saveBtn}
                  disabled={bulkSubmitting}
                  onClick={handleBulkSave}
                >
                  {bulkSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: 18 }} />}
                  Save All Restocks ({modifiedCount})
                </button>
              </Box>
            </Box>
          )}

          {/* Items Stock Table */}
          <Paper style={S.tableCard}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Item / Variant Name</th>
                  <th style={S.th}>Product Type</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Current Stock</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Add Quantity (+ Units)</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>New Total Stock</th>
                  <th style={S.th}>Reason / Note</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stockItemsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ ...S.td, textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No items found matching filter.
                    </td>
                  </tr>
                ) : (
                  stockItemsList.map(item => {
                    const input = stockInputs[item.key] || {};
                    const addedQty = parseInt(input.addedQty) || 0;
                    const newTotal = item.currentStock + addedQty;
                    const isSaving = submittingKey === item.key;

                    return (
                      <tr key={item.key} style={{ background: addedQty > 0 ? 'rgba(34, 197, 94, 0.03)' : 'transparent' }}>
                        <td style={S.td}>
                          <Typography style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {item.displayName}
                          </Typography>
                        </td>

                        <td style={S.td}>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.73rem',
                            color: 'var(--text-primary)'
                          }}>
                            {item.type}
                          </span>
                        </td>

                        <td style={{ ...S.td, textAlign: 'center' }}>
                          <span style={{
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            color: item.currentStock <= 10 ? '#ef4444' : 'var(--text-primary)'
                          }}>
                            {item.currentStock} {item.unit}
                          </span>
                        </td>

                        <td style={{ ...S.td, textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="+ 0"
                            value={input.addedQty || ''}
                            onChange={(e) => handleInputChange(item.key, 'addedQty', e.target.value)}
                            style={S.qtyInput}
                          />
                        </td>

                        <td style={{ ...S.td, textAlign: 'center' }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: addedQty > 0 ? '#22c55e' : 'var(--text-muted)'
                          }}>
                            {newTotal} {item.unit}
                          </span>
                        </td>

                        <td style={S.td}>
                          <input
                            type="text"
                            placeholder="e.g. Supplier delivery"
                            value={input.reason || ''}
                            onChange={(e) => handleInputChange(item.key, 'reason', e.target.value)}
                            style={S.reasonInput}
                          />
                        </td>

                        <td style={{ ...S.td, textAlign: 'right' }}>
                          <button
                            style={{
                              ...S.saveBtn,
                              opacity: addedQty > 0 ? 1 : 0.4,
                              cursor: addedQty > 0 ? 'pointer' : 'not-allowed'
                            }}
                            disabled={addedQty <= 0 || isSaving}
                            onClick={() => handleSingleSave(item.key, item.productId, item.variantId, item.currentStock)}
                          >
                            {isSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
                            Add Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Paper>
        </>
      )}

      {/* SUB-TAB 2: RESTOCK AUDIT LOGS */}
      {subTab === 'logs' && (
        <Paper style={S.tableCard}>
          <Box style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Recent Restock Activity Log
            </Typography>
            <Button size="small" onClick={fetchLogs} startIcon={<RefreshIcon />} style={{ color: 'var(--text-muted)', textTransform: 'none' }}>
              Refresh Logs
            </Button>
          </Box>

          {loadingLogs ? (
            <Box style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CircularProgress size={28} />
              <Typography style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Loading restock logs...</Typography>
            </Box>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Date & Time</th>
                  <th style={S.th}>Item / Variant</th>
                  <th style={S.th}>Previous Stock</th>
                  <th style={S.th}>Added Quantity</th>
                  <th style={S.th}>New Total Stock</th>
                  <th style={S.th}>Restocked By</th>
                  <th style={S.th}>Reason / Note</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ ...S.td, textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No restock history recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td style={S.td}>
                        <Typography style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </Typography>
                      </td>

                      <td style={S.td}>
                        <Typography style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {log.product?.name} {log.variant ? `(${log.variant.name})` : ''}
                        </Typography>
                      </td>

                      <td style={S.td}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {log.previousStock} units
                        </span>
                      </td>

                      <td style={S.td}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22c55e' }}>
                          +{log.addedQuantity} units
                        </span>
                      </td>

                      <td style={S.td}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.newStock} units
                        </span>
                      </td>

                      <td style={S.td}>
                        <Typography style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {log.user ? `${log.user.name} (${log.user.role})` : 'System'}
                        </Typography>
                      </td>

                      <td style={S.td}>
                        <Typography style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {log.reason || 'Restock'}
                        </Typography>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </Paper>
      )}
    </Box>
  );
}
