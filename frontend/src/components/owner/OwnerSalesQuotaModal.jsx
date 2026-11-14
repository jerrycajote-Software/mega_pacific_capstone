import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { CustomCloseIcon } from '../icons';
import { getStoredAuthToken } from '../../context/AuthContext';
import { useAdminTheme } from '../../context/ThemeContext';

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Monthly Target' },
  { value: 'weekly', label: 'Weekly Target' },
  { value: 'daily', label: 'Daily Target' }
];

const OwnerSalesQuotaModal = ({ isOpen, onClose, initialQuota, onQuotaUpdated }) => {
  const { mode } = useAdminTheme();
  const isLightMode = mode === 'light';
  const wasOpenRef = useRef(false);
  const [periodType, setPeriodType] = useState(initialQuota?.periodType || 'monthly');
  const [targetAmount, setTargetAmount] = useState(String(initialQuota?.targetAmount ?? 500000));
  const [targetOrders, setTargetOrders] = useState(String(initialQuota?.targetOrders ?? 25));
  const [noteToSales, setNoteToSales] = useState(initialQuota?.noteToSales || '');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Only initialize inputs when opening the modal so background refreshes do not erase unsaved edits
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setPeriodType(initialQuota?.periodType || 'monthly');
      setTargetAmount(String(initialQuota?.targetAmount ?? 500000));
      setTargetOrders(initialQuota?.targetOrders != null ? String(initialQuota.targetOrders) : '');
      setNoteToSales(initialQuota?.noteToSales || '');
      setFormError('');
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialQuota]);

  if (!isOpen) return null;

  const handleCloseSalesQuotaModal = () => {
    if (isSaving) return;
    setFormError('');
    onClose();
  };

  const handleSelectQuotaPeriod = (selectedPeriod) => setPeriodType(selectedPeriod);
  const handleTargetAmountInputChange = (e) => setTargetAmount(e.target.value);
  const handleTargetOrdersInputChange = (e) => setTargetOrders(e.target.value);
  const handleNoteToSalesInputChange = (e) => setNoteToSales(e.target.value);

  // Save the updated sales quota target and broadcast it to the Sales team
  const handleSendSalesQuotaToStaff = async (e) => {
    e.preventDefault();
    const numericTarget = Number(targetAmount);
    if (Number.isNaN(numericTarget) || numericTarget <= 0) {
      setFormError('Please enter a valid target sales amount greater than ₱0.');
      return;
    }

    const token = getStoredAuthToken();
    if (!token) {
      setFormError('Your session has expired. Please sign in again to update the sales quota.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.put(
        `${API_URL}/api/owner/sales-quota`,
        {
          targetAmount: numericTarget,
          periodType,
          targetOrders: targetOrders === '' ? 0 : parseInt(targetOrders, 10),
          noteToSales
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success && response.data?.data) {
        if (onQuotaUpdated) {
          onQuotaUpdated(response.data.data);
        }
        onClose();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save and send the sales quota target.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    /* Modal for setting a new target sales quota; backdrop clicks do not close it accidentally */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-sales-quota-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isLightMode ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.62)',
        backdropFilter: 'blur(4px)',
        padding: '1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'var(--bg-secondary, #ffffff)',
          border: '1px solid var(--border-light)',
          borderRadius: 18,
          padding: '1.5rem',
          boxShadow: isLightMode
            ? '0 24px 48px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.05)'
            : '0 24px 48px rgba(0, 0, 0, 0.45)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: '1.1rem' }}>
          <div>
            <h3 id="owner-sales-quota-modal-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Set Business Sales Quota
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Your Sales team will immediately see this target in their Business Sales Target view.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseSalesQuotaModal}
            aria-label="Close Sales Quota Modal"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <CustomCloseIcon size={24} />
          </button>
        </div>

        {formError && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 0.9rem', borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSendSalesQuotaToStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Quota Period
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {PERIOD_OPTIONS.map((opt) => {
                const isSelected = periodType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectQuotaPeriod(opt.value)}
                    style={{
                      padding: '0.55rem 0.5rem',
                      borderRadius: 10,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid #f59e0b' : '1px solid var(--border)',
                      background: isSelected ? (isLightMode ? '#fef3c7' : 'rgba(245, 158, 11, 0.16)') : 'var(--bg-tertiary)',
                      color: isSelected ? (isLightMode ? '#b45309' : '#fbbf24') : 'var(--text-primary)'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="quota-target-amount" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Target Sales Amount (PHP)
            </label>
            <input
              id="quota-target-amount"
              type="number"
              min="1"
              step="any"
              required
              value={targetAmount}
              onChange={handleTargetAmountInputChange}
              placeholder="ex. 500000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Enter the total sales revenue target in Philippine Pesos (ex. 500000).
            </div>
          </div>

          <div>
            <label htmlFor="quota-target-orders" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Target Orders Count (Optional)
            </label>
            <input
              id="quota-target-orders"
              type="number"
              min="0"
              step="1"
              value={targetOrders}
              onChange={handleTargetOrdersInputChange}
              placeholder="ex. 25"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Target number of completed customer orders for this period (ex. 25).
            </div>
          </div>

          <div>
            <label htmlFor="quota-note-to-sales" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Message / Note
            </label>
            <textarea
              id="quota-note-to-sales"
              rows={3}
              value={noteToSales}
              onChange={handleNoteToSalesInputChange}
              placeholder="ex. Focus on approving pending pre-order roofing requests and answering customer inquiries promptly."
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              marginTop: 4,
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isSaving ? 0.75 : 1
            }}
          >
            {isSaving && <CircularProgress size={16} sx={{ color: '#ffffff' }} />}
            {isSaving ? 'Sending Quota...' : 'Send Sales Quota to Sales Staff'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerSalesQuotaModal;
