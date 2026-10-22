import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaletteIcon from '@mui/icons-material/Palette';

import {
  STANDARD_THICKNESSES,
  DECKING_THICKNESSES,
  ROOFING_COLORS,
  getColorHex
} from '../../constants/roofingSpecs';

const CoilInventoryPage = () => {
  const [coils, setCoils] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); 
  const [viewMode, setViewMode] = useState('grouped'); 
  const [selectedThickness, setSelectedThickness] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchColor, setSearchColor] = useState('');

  const [deductModalOpen, setDeductModalOpen] = useState(false);
  const [selectedCoil, setSelectedCoil] = useState(null);
  const [rollsToDeduct, setRollsToDeduct] = useState('1');
  const [orderRef, setOrderRef] = useState('');
  const [deductReason, setDeductReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [rollsToRestock, setRollsToRestock] = useState('1');
  const [restockReason, setRestockReason] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addThickness, setAddThickness] = useState('');
  const [selectedColorsToAdd, setSelectedColorsToAdd] = useState([]);
  const [initialRolls, setInitialRolls] = useState('1');
  const [minAlertRolls, setMinAlertRolls] = useState('1');
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccessMsg, setAddSuccessMsg] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchCoilData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('appToken');
      const [coilsRes, summaryRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/api/logistic/coils`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/logistic/coils/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/logistic/coils/logs?limit=50`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (coilsRes.data?.success) setCoils(coilsRes.data.data);
      if (summaryRes.data?.success) setSummary(summaryRes.data.data);
      if (logsRes.data?.success) setLogs(logsRes.data.data);
    } catch (err) {
      console.error('Failed to load coil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoilData();
  }, []);

  const openDeductModal = (coil) => {
    setSelectedCoil(coil);
    setRollsToDeduct('1');
    setOrderRef('');
    setDeductReason('');
    setActionError('');
    setDeductModalOpen(true);
  };

  const openRestockModal = (coil) => {
    setSelectedCoil(coil);
    setRollsToRestock('1');
    setRestockReason('');
    setActionError('');
    setRestockModalOpen(true);
  };

  const handleConfirmDeduction = async (e) => {
    e.preventDefault();
    const count = parseInt(rollsToDeduct, 10);
    if (!count || count <= 0) {
      setActionError('Please specify at least 1 coil roll to deduct.');
      return;
    }
    const currentStock = selectedCoil.coilCount ?? 0;
    if (count > currentStock) {
      setActionError(`Cannot deduct ${count} rolls. Current available stock is ${currentStock} roll(s).`);
      return;
    }

    setSubmittingAction(true);
    setActionError('');
    try {
      const token = localStorage.getItem('appToken');
      const payload = {
        coilId: selectedCoil.id,
        coilsDeducted: count,
        orderId: orderRef ? parseInt(orderRef.replace(/\D/g, ''), 10) || null : null,
        reason: deductReason || (orderRef ? `Production for ${orderRef}` : 'Manual roll-forming job deduction')
      };

      await axios.post(`${API_URL}/api/logistic/coils/deduct`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDeductModalOpen(false);
      fetchCoilData();
    } catch (err) {
      console.error('Deduction error:', err);
      setActionError(err.response?.data?.error || 'Failed to process deduction.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmRestock = async (e) => {
    e.preventDefault();
    const count = parseInt(rollsToRestock, 10);
    if (!count || count <= 0) {
      setActionError('Please specify at least 1 coil roll to restock.');
      return;
    }

    setSubmittingAction(true);
    setActionError('');
    try {
      const token = localStorage.getItem('appToken');
      const payload = {
        coilId: selectedCoil.id,
        coilsAdded: count,
        reason: restockReason || 'Coil shipment delivery replenishment'
      };

      await axios.post(`${API_URL}/api/logistic/coils/restock`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRestockModalOpen(false);
      fetchCoilData();
    } catch (err) {
      console.error('Restock error:', err);
      setActionError(err.response?.data?.error || 'Failed to process restock.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const allThicknesses = React.useMemo(() => {
    const fromCoils = coils.map(c => c.thickness);
    const combined = Array.from(new Set([...STANDARD_THICKNESSES, ...fromCoils])).filter(Boolean);
    return combined.sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB;
    });
  }, [coils]);

  const normalizedAddThickness = React.useMemo(() => {
    if (!addThickness || !addThickness.trim()) return '';
    const trimmed = addThickness.trim();
    return trimmed.toLowerCase().endsWith('mm') ? trimmed : `${trimmed}mm`;
  }, [addThickness]);

  const existingColorsForAddThickness = React.useMemo(() => {
    if (!normalizedAddThickness) return [];
    return coils
      .filter(c => c.thickness.toLowerCase() === normalizedAddThickness.toLowerCase())
      .map(c => c.color);
  }, [coils, normalizedAddThickness]);

  const openAddModal = (presetThickness = '') => {
    setAddThickness(presetThickness);
    setSelectedColorsToAdd([]);
    setInitialRolls('1');
    setMinAlertRolls('1');
    setAddError('');
    setAddSuccessMsg('');
    setAddModalOpen(true);
  };

  const toggleColorSelection = (colorName) => {
    if (existingColorsForAddThickness.includes(colorName)) return;
    setSelectedColorsToAdd(prev =>
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
  };

  const handleSelectAllAvailableColors = () => {
    const available = ROOFING_COLORS
      .map(c => c.name)
      .filter(name => !existingColorsForAddThickness.includes(name));
    setSelectedColorsToAdd(available);
  };

  const handleClearColorSelection = () => {
    setSelectedColorsToAdd([]);
  };

  const handleConfirmAddCoil = async (e) => {
    e.preventDefault();
    if (!normalizedAddThickness) {
      setAddError('Please specify a valid thickness gauge (e.g. 0.70mm).');
      return;
    }
    if (selectedColorsToAdd.length === 0) {
      setAddError('Please select at least one color from the 14 available official colors.');
      return;
    }

    setSubmittingAdd(true);
    setAddError('');
    setAddSuccessMsg('');
    try {
      const token = localStorage.getItem('appToken');
      const payload = {
        thickness: normalizedAddThickness,
        colors: selectedColorsToAdd,
        coilCount: parseInt(initialRolls, 10) || 1,
        minAlertCount: parseInt(minAlertRolls, 10) || 1
      };

      const res = await axios.post(`${API_URL}/api/logistic/coils`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setAddSuccessMsg(res.data.message || 'Coil specification successfully added!');
        setTimeout(() => {
          setAddModalOpen(false);
          fetchCoilData();
        }, 600);
      }
    } catch (err) {
      console.error('Failed to add coil specification:', err);
      setAddError(err.response?.data?.error || 'Failed to add coil specification.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const filteredCoils = coils.filter(c => {
    const matchesThickness = selectedThickness === 'ALL' || c.thickness === selectedThickness;
    const matchesStatus = selectedStatus === 'ALL' || c.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesColor = searchColor === '' || c.color.toLowerCase().includes(searchColor.toLowerCase());
    return matchesThickness && matchesStatus && matchesColor;
  });

  const getStatusBadgeStyle = (status) => {
    if (status === 'Out of Stock') {
      return {
        bg: 'rgba(239,68,68,0.1)',
        color: '#ef4444',
        border: 'rgba(239,68,68,0.25)',
        dot: '#ef4444'
      };
    }
    if (status === 'Low Stock') {
      return {
        bg: 'rgba(245,158,11,0.1)',
        color: '#f59e0b',
        border: 'rgba(245,158,11,0.25)',
        dot: '#f59e0b'
      };
    }
    return {
      bg: 'rgba(16,185,129,0.1)',
      color: '#10b981',
      border: 'rgba(16,185,129,0.25)',
      dot: '#10b981'
    };
  };

  const renderRollPips = (count) => {
    const pips = [];
    const maxPips = Math.min(count, 5);
    for (let i = 0; i < maxPips; i++) {
      pips.push(
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: count > 1 ? '#10b981' : (count === 1 ? '#f59e0b' : '#ef4444'),
            marginRight: 3
          }}
        />
      );
    }
    if (count > 5) {
      pips.push(
        <span key="plus" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
          +{count - 5}
        </span>
      );
    }
    return pips;
  };

  return (
    <div style={{ padding: '2rem 2.5rem', color: 'var(--text-primary)', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Raw Material Coil Inventory
            </h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.65rem', borderRadius: 9999, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>
              Physical Coil Count Tracking
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track physical master coil rolls per thickness gauge across 14 official finishes. Record roll-forming allocations and shipments in roll counts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => openAddModal()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0.6rem 1.15rem', borderRadius: 10,
              background: '#3b82f6', border: '1px solid #60a5fa',
              color: '#ffffff', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <AddCircleIcon sx={{ fontSize: 18 }} />
            <span>+ Add Coil / Thickness</span>
          </button>
          <button
            onClick={fetchCoilData}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0.6rem 0.95rem', borderRadius: 10,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
              color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <RefreshIcon sx={{ fontSize: 16 }} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Total Warehouse Coils
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {summary?.totalRolls ?? 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Rolls</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: 4 }}>
            Steel Master Rolls in Storage
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            0.35mm Gauge Rolls
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', marginTop: 4 }}>
            {summary?.thicknessCounts?.['0.35mm'] ?? 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Rolls</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            14 Colors Available in 0.35mm
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            0.40mm - 0.60mm Rolls
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>
            {((summary?.thicknessCounts?.['0.40mm'] || 0) + (summary?.thicknessCounts?.['0.50mm'] || 0) + (summary?.thicknessCounts?.['0.60mm'] || 0))} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Rolls</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Heavy & Commercial Gauges
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Stock Health Status
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
              {summary?.optimalCount || 0}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Optimal (≥2 rolls)
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: (summary?.lowCount || summary?.criticalCount) ? '#f59e0b' : '#10b981', marginTop: 4 }}>
            {summary?.criticalCount || 0} Out of Stock · {summary?.lowCount || 0} Low Stock
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontSize: '0.88rem', fontWeight: activeTab === 'inventory' ? 700 : 500,
            color: activeTab === 'inventory' ? '#3b82f6' : 'var(--text-muted)',
            borderBottom: activeTab === 'inventory' ? '2px solid #3b82f6' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Coil Rolls by Gauge ({coils.length} Finishes)
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.65rem 1.25rem', background: 'none', border: 'none',
            fontSize: '0.88rem', fontWeight: activeTab === 'logs' ? 700 : 500,
            color: activeTab === 'logs' ? '#3b82f6' : 'var(--text-muted)',
            borderBottom: activeTab === 'logs' ? '2px solid #3b82f6' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          <HistoryIcon sx={{ fontSize: 16 }} /> Coil Allocation & Restock Logs ({logs.length})
        </button>
      </div>

      {activeTab === 'inventory' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
              <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18, pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search finish / color name..."
                value={searchColor}
                onChange={(e) => setSearchColor(e.target.value)}
                style={{
                  width: '100%', padding: '0.55rem 0.85rem 0.55rem 2.3rem', borderRadius: 8,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Thickness Gauge:</span>
              <button
                onClick={() => setSelectedThickness('ALL')}
                style={{
                  padding: '0.35rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedThickness === 'ALL' ? '1px solid #3b82f6' : '1px solid var(--border-light)',
                  background: selectedThickness === 'ALL' ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: selectedThickness === 'ALL' ? '#60a5fa' : 'var(--text-muted)'
                }}
              >
                ALL ({summary?.totalRolls ?? 0} Rolls)
              </button>
              {allThicknesses.map(th => {
                const count = summary?.thicknessCounts?.[th] ?? 0;
                const isSelected = selectedThickness === th;
                return (
                  <button
                    key={th}
                    onClick={() => setSelectedThickness(th)}
                    style={{
                      padding: '0.35rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-light)',
                      background: isSelected ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: isSelected ? '#60a5fa' : 'var(--text-muted)'
                    }}
                  >
                    {th} ({count} rolls)
                  </button>
                );
              })}

              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: 8 }}>Status:</span>
              {['ALL', 'Optimal', 'Low Stock', 'Out of Stock'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  style={{
                    padding: '0.35rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer',
                    border: selectedStatus === st ? '1px solid var(--border-light)' : '1px solid transparent',
                    background: selectedStatus === st ? 'var(--bg-tertiary)' : 'transparent',
                    color: selectedStatus === st ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  {st}
                </button>
              ))}

              <div style={{ marginLeft: 8, display: 'flex', border: '1px solid var(--border-light)', borderRadius: 6, overflow: 'hidden' }}>
                <button
                  onClick={() => setViewMode('grouped')}
                  title="Grouped by Thickness Gauge"
                  style={{
                    padding: '0.35rem 0.65rem',
                    background: viewMode === 'grouped' ? 'var(--bg-tertiary)' : 'transparent',
                    border: 'none',
                    color: viewMode === 'grouped' ? '#3b82f6' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  <ViewModuleIcon sx={{ fontSize: 16 }} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Flat Master Table"
                  style={{
                    padding: '0.35rem 0.65rem',
                    background: viewMode === 'table' ? 'var(--bg-tertiary)' : 'transparent',
                    border: 'none',
                    color: viewMode === 'table' ? '#3b82f6' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  <ViewListIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CircularProgress size={30} />
              <div style={{ marginTop: 10, fontSize: '0.84rem' }}>Loading physical coil inventory...</div>
            </div>
          ) : filteredCoils.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border-light)' }}>
              No coils matched the selected filter criteria.
            </div>
          ) : viewMode === 'grouped' ? (
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {(selectedThickness === 'ALL' ? allThicknesses : [selectedThickness]).map(th => {
                const groupCoils = filteredCoils.filter(c => c.thickness === th);
                if (groupCoils.length === 0) return null;
                const totalGaugeRolls = groupCoils.reduce((sum, c) => sum + (c.coilCount ?? 0), 0);

                return (
                  <div key={th} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'inline-flex', padding: '0.3rem 0.75rem', borderRadius: 8, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontWeight: 800, fontSize: '0.92rem' }}>
                          {th} Gauge
                        </span>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            {th} Master Coil Stock
                          </span>
                          <span style={{ marginLeft: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            ({groupCoils.length} finishes shown)
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Total in Stock: <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{totalGaugeRolls} Rolls</strong>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {groupCoils.map(coil => {
                        const hex = getColorHex(coil.color);
                        const badge = getStatusBadgeStyle(coil.status);
                        const count = coil.coilCount ?? 0;

                        return (
                          <div
                            key={coil.id}
                            style={{
                              background: 'var(--bg-tertiary)',
                              border: `1px solid ${count === 0 ? 'rgba(239,68,68,0.3)' : (count === 1 ? 'rgba(245,158,11,0.25)' : 'var(--border-light)')}`,
                              borderRadius: 12,
                              padding: '1rem 1.15rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: hex, border: '1px solid rgba(0,0,0,0.3)', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{coil.color}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{coil.thickness} Gauge</div>
                                  </div>
                                </div>

                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '0.15rem 0.5rem', borderRadius: 9999, fontSize: '0.68rem', fontWeight: 700,
                                  background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                                }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: badge.dot }} />
                                  {coil.status}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0.75rem 0 0.5rem' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                                  Physical Roll Count
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: count === 0 ? '#ef4444' : (count === 1 ? '#f59e0b' : '#10b981') }}>
                                    {count}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {count === 1 ? 'Roll' : 'Rolls'}
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                {renderRollPips(count)}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                              <button
                                onClick={() => openDeductModal(coil)}
                                disabled={count <= 0}
                                style={{
                                  flex: 1,
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                  padding: '0.45rem 0.5rem', borderRadius: 8,
                                  border: '1px solid rgba(239,68,68,0.25)',
                                  background: count <= 0 ? 'rgba(0,0,0,0.05)' : 'rgba(239,68,68,0.08)',
                                  color: count <= 0 ? 'var(--text-muted)' : '#f87171',
                                  fontSize: '0.76rem', fontWeight: 600,
                                  cursor: count <= 0 ? 'not-allowed' : 'pointer',
                                  opacity: count <= 0 ? 0.5 : 1
                                }}
                              >
                                <RemoveCircleIcon sx={{ fontSize: 14 }} /> Deduct
                              </button>

                              <button
                                onClick={() => openRestockModal(coil)}
                                style={{
                                  flex: 1,
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                  padding: '0.45rem 0.5rem', borderRadius: 8,
                                  border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.08)',
                                  color: '#34d399', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer'
                                }}
                              >
                                <AddCircleIcon sx={{ fontSize: 14 }} /> Restock
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* FLAT TABLE VIEW */
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.05)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Color Finish (14 Standard)</th>
                      <th style={{ padding: '0.9rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Thickness</th>
                      <th style={{ padding: '0.9rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Coil Count (Rolls)</th>
                      <th style={{ padding: '0.9rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Status</th>
                      <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoils.map(coil => {
                      const hex = getColorHex(coil.color);
                      const badge = getStatusBadgeStyle(coil.status);
                      const count = coil.coilCount ?? 0;

                      return (
                        <tr key={coil.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.9rem 1.25rem', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 22, height: 22, borderRadius: '50%', background: hex, border: '1px solid rgba(0,0,0,0.25)', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{coil.color}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Master Steel Roll</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle' }}>
                            <span style={{ display: 'inline-flex', padding: '0.2rem 0.55rem', borderRadius: 6, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 700, fontSize: '0.75rem' }}>
                              {coil.thickness}
                            </span>
                          </td>

                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: count === 0 ? '#ef4444' : (count === 1 ? '#f59e0b' : 'var(--text-primary)') }}>
                                  {count}
                                </span>
                                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                  {count === 1 ? 'Roll' : 'Rolls'}
                                </span>
                              </div>
                              <div style={{ marginTop: 4 }}>
                                {renderRollPips(count)}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.9rem 1rem', verticalAlign: 'middle' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '0.2rem 0.6rem', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700,
                              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.dot }} />
                              {coil.status}
                            </span>
                          </td>

                          <td style={{ padding: '0.9rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                              <button
                                onClick={() => openDeductModal(coil)}
                                disabled={count <= 0}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '0.4rem 0.75rem', borderRadius: 8,
                                  border: '1px solid rgba(239,68,68,0.25)',
                                  background: count <= 0 ? 'rgba(0,0,0,0.05)' : 'rgba(239,68,68,0.08)',
                                  color: count <= 0 ? 'var(--text-muted)' : '#f87171',
                                  fontSize: '0.78rem', fontWeight: 600,
                                  cursor: count <= 0 ? 'not-allowed' : 'pointer',
                                  opacity: count <= 0 ? 0.5 : 1
                                }}
                              >
                                <RemoveCircleIcon sx={{ fontSize: 15 }} /> Deduct
                              </button>

                              <button
                                onClick={() => openRestockModal(coil)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '0.4rem 0.75rem', borderRadius: 8,
                                  border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.08)',
                                  color: '#34d399', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                                }}
                              >
                                <AddCircleIcon sx={{ fontSize: 15 }} /> Restock
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'logs' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 16, overflow: 'hidden' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No coil deductions or restocks logged yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.05)', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Timestamp</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Coil Finish & Gauge</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Action</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Quantity</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Remaining Balance</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Job / Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const isDeduction = log.actionType === 'deduction';
                    const rollQty = Math.abs(log.coilsDeducted || log.metersDeducted || 1);
                    const remainingBalance = log.remainingCount ?? log.remainingMeters ?? 0;

                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.coil?.thickness} {log.coil?.color}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            padding: '0.15rem 0.45rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700,
                            background: isDeduction ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            color: isDeduction ? '#ef4444' : '#10b981'
                          }}>
                            {isDeduction ? 'Deduction' : 'Restock'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: isDeduction ? '#ef4444' : '#10b981' }}>
                          {isDeduction ? `-${rollQty} roll${rollQty > 1 ? 's' : ''}` : `+${rollQty} roll${rollQty > 1 ? 's' : ''}`}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {remainingBalance} roll{remainingBalance !== 1 ? 's' : ''}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {log.reason || '—'}
                          {log.order && ` (Order #${log.order.id})`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {deductModalOpen && selectedCoil && (
        <Dialog open={true} onClose={() => setDeductModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>Deduct Steel Coil Roll</DialogTitle>
          <form onSubmit={handleConfirmDeduction}>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {actionError && (
                <div style={{ padding: '0.65rem 0.9rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.82rem' }}>
                  {actionError}
                </div>
              )}

              <div style={{ background: 'var(--bg-tertiary)', padding: '0.9rem 1rem', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: getColorHex(selectedCoil.color), border: '1px solid rgba(0,0,0,0.3)' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Target Finish</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {selectedCoil.thickness} · {selectedCoil.color}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Stock</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: (selectedCoil.coilCount ?? 0) === 0 ? '#ef4444' : '#10b981' }}>
                    {selectedCoil.coilCount ?? 0} {(selectedCoil.coilCount ?? 0) === 1 ? 'Roll' : 'Rolls'}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Coil Rolls to Deduct *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max={selectedCoil.coilCount ?? 1}
                  required
                  placeholder="e.g. 1"
                  value={rollsToDeduct}
                  onChange={(e) => setRollsToDeduct(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8,
                    background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                {rollsToDeduct && !isNaN(parseInt(rollsToDeduct, 10)) && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Remaining after deduction:{' '}
                    <strong style={{ color: (selectedCoil.coilCount - parseInt(rollsToDeduct, 10)) <= 0 ? '#ef4444' : '#10b981' }}>
                      {Math.max(0, (selectedCoil.coilCount ?? 0) - parseInt(rollsToDeduct, 10))} Roll(s)
                    </strong>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Order Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-084"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8,
                    background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Reason / Production Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mounted on roll-forming line for custom sheets"
                  value={deductReason}
                  onChange={(e) => setDeductReason(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8,
                    background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDeductModalOpen(false)} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained" color="error" disabled={submittingAction}>
                {submittingAction ? <CircularProgress size={16} /> : 'Deduct Roll'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {restockModalOpen && selectedCoil && (
        <Dialog open={true} onClose={() => setRestockModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>Restock Steel Coil Rolls</DialogTitle>
          <form onSubmit={handleConfirmRestock}>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {actionError && (
                <div style={{ padding: '0.65rem 0.9rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.82rem' }}>
                  {actionError}
                </div>
              )}

              <div style={{ background: 'var(--bg-tertiary)', padding: '0.9rem 1rem', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: getColorHex(selectedCoil.color), border: '1px solid rgba(0,0,0,0.3)' }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Target Finish</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {selectedCoil.thickness} · {selectedCoil.color}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Stock</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981' }}>
                    {selectedCoil.coilCount ?? 0} {(selectedCoil.coilCount ?? 0) === 1 ? 'Roll' : 'Rolls'}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Coil Rolls to Add *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="e.g. 2"
                  value={rollsToRestock}
                  onChange={(e) => setRollsToRestock(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8,
                    background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                {rollsToRestock && !isNaN(parseInt(rollsToRestock, 10)) && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    New Stock after Restock:{' '}
                    <strong style={{ color: '#10b981' }}>
                      {(selectedCoil.coilCount ?? 0) + parseInt(rollsToRestock, 10)} Roll(s)
                    </strong>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Supplier / Shipment Batch Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shipment batch #CS-2026-10"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8,
                    background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setRestockModalOpen(false)} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained" color="success" disabled={submittingAction}>
                {submittingAction ? <CircularProgress size={16} /> : 'Restock Rolls'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {}
      {addModalOpen && (
        <Dialog
          open={true}
          onClose={() => !submittingAdd && setAddModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon sx={{ color: '#2563eb' }} />
            Add Coil Inventory / Thickness Specification
          </DialogTitle>
          <form onSubmit={handleConfirmAddCoil}>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: '72vh' }}>
              {addError && (
                <div style={{ padding: '0.65rem 0.9rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.82rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {addError}
                </div>
              )}
              {addSuccessMsg && (
                <div style={{ padding: '0.65rem 0.9rem', borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '0.82rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {addSuccessMsg}
                </div>
              )}

              {}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                  Coil Thickness / Gauge *
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0.70mm or 0.75"
                    value={addThickness}
                    onChange={(e) => setAddThickness(e.target.value)}
                    style={{
                      flex: 1, minWidth: 180, padding: '0.65rem 0.85rem', borderRadius: 8,
                      background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                      color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  {normalizedAddThickness && (
                    <div style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: existingColorsForAddThickness.length > 0 ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)',
                      color: existingColorsForAddThickness.length > 0 ? '#3b82f6' : '#10b981',
                      border: `1px solid ${existingColorsForAddThickness.length > 0 ? 'rgba(59,130,246,0.25)' : 'rgba(16,185,129,0.25)'}`
                    }}>
                      {existingColorsForAddThickness.length > 0
                        ? `Existing Gauge (${existingColorsForAddThickness.length}/14 colors registered)`
                        : 'New Gauge (Will be provisioned)'}
                    </div>
                  )}
                </div>
                
                {}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                    Standard & Heavy Decking Presets:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[...STANDARD_THICKNESSES, ...DECKING_THICKNESSES].map(gauge => {
                      const isSelected = normalizedAddThickness.toLowerCase() === gauge.toLowerCase();
                      const existingInStock = coils.some(c => c.thickness.toLowerCase() === gauge.toLowerCase());
                      return (
                        <button
                          key={gauge}
                          type="button"
                          onClick={() => setAddThickness(gauge)}
                          style={{
                            padding: '3px 9px',
                            borderRadius: 14,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            border: isSelected
                              ? '1.5px solid #2563eb'
                              : '1px solid var(--border-light)',
                            background: isSelected
                              ? 'rgba(37,99,235,0.15)'
                              : 'var(--bg-tertiary)',
                            color: isSelected
                              ? '#2563eb'
                              : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {gauge}
                          {existingInStock && (
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>• in stock</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                      Choose Roofing Color(s) to Add * ({selectedColorsToAdd.length} of 14 selected)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Select the colors to initialize for {normalizedAddThickness || 'this thickness'}. Colors already in inventory for this gauge cannot be duplicated.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={handleSelectAllAvailableColors}
                      disabled={!normalizedAddThickness}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)',
                        cursor: normalizedAddThickness ? 'pointer' : 'not-allowed',
                        opacity: normalizedAddThickness ? 1 : 0.5
                      }}
                    >
                      Select All Available
                    </button>
                    <button
                      type="button"
                      onClick={handleClearColorSelection}
                      disabled={selectedColorsToAdd.length === 0}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-muted)',
                        cursor: selectedColorsToAdd.length > 0 ? 'pointer' : 'not-allowed',
                        opacity: selectedColorsToAdd.length > 0 ? 1 : 0.5
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 8,
                  padding: 8,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 10,
                  border: '1px solid var(--border-light)',
                  maxHeight: 280,
                  overflowY: 'auto'
                }}>
                  {ROOFING_COLORS.map(colorItem => {
                    const alreadyExists = existingColorsForAddThickness.some(
                      c => c.toLowerCase() === colorItem.name.toLowerCase()
                    );
                    const isSelected = selectedColorsToAdd.includes(colorItem.name);

                    return (
                      <div
                        key={colorItem.name}
                        onClick={() => toggleColorSelection(colorItem.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: isSelected
                            ? 'rgba(37,99,235,0.1)'
                            : (alreadyExists ? 'rgba(0,0,0,0.03)' : 'var(--bg-primary)'),
                          border: isSelected
                            ? '1.5px solid #2563eb'
                            : (alreadyExists ? '1px dashed var(--border-light)' : '1px solid var(--border-light)'),
                          cursor: alreadyExists ? 'not-allowed' : 'pointer',
                          opacity: alreadyExists ? 0.5 : 1,
                          transition: 'all 0.15s ease',
                          position: 'relative'
                        }}
                        title={alreadyExists ? `${colorItem.name} is already registered for ${normalizedAddThickness}` : colorItem.name}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: colorItem.hex,
                            border: `1.5px solid ${colorItem.border || 'rgba(0,0,0,0.2)'}`,
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {colorItem.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: alreadyExists ? '#f59e0b' : 'var(--text-muted)' }}>
                            {alreadyExists ? 'Already in stock' : (isSelected ? 'Selected' : 'Click to select')}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#2563eb', flexShrink: 0 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Initial Rolls per Color *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={initialRolls}
                    onChange={(e) => setInitialRolls(e.target.value)}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8,
                      background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Total new rolls: {(parseInt(initialRolls, 10) || 0) * selectedColorsToAdd.length}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Low-Stock Alert Threshold *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={minAlertRolls}
                    onChange={(e) => setMinAlertRolls(e.target.value)}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8,
                      background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Triggers warning when rolls &le; threshold
                  </span>
                </div>
              </div>
            </DialogContent>
            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {selectedColorsToAdd.length > 0 && normalizedAddThickness
                  ? `Provisioning ${selectedColorsToAdd.length} coil specification(s) at ${normalizedAddThickness}`
                  : 'Select thickness and colors to proceed'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={() => setAddModalOpen(false)} color="inherit" disabled={submittingAdd}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submittingAdd || !normalizedAddThickness || selectedColorsToAdd.length === 0}
                  sx={{ fontWeight: 700 }}
                >
                  {submittingAdd ? (
                    <CircularProgress size={16} sx={{ color: '#fff' }} />
                  ) : (
                    `Add ${selectedColorsToAdd.length > 0 ? selectedColorsToAdd.length : ''} Coil(s)`
                  )}
                </Button>
              </div>
            </DialogActions>
          </form>
        </Dialog>
      )}

    </div>
  );
};

export default CoilInventoryPage;
