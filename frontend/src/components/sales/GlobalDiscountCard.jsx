import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';

const DISCOUNT_PRESETS = [0, 10, 15, 20, 25, 30, 40, 50];

// Format percentage cleanly without unnecessary trailing zeros (ex. 30 instead of 30.00)
const formatPercentValue = (val) => {
  const num = Number(val);
  if (Number.isNaN(num)) return '0';
  return Number.isInteger(num) ? String(num) : String(Math.round(num * 100) / 100);
};

// Pre-Order Products widget for editing the storewide discount across all products
const GlobalDiscountCard = ({ onGlobalDiscountApplied, refreshKey = 0 }) => {
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [overview, setOverview] = useState(null);
  const [discountInput, setDiscountInput] = useState('30');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchGlobalDiscount = useCallback(async () => {
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/sales/dashboard/discount`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success && res.data?.data) {
        setOverview(res.data.data);
        setDiscountInput(formatPercentValue(res.data.data.globalDiscountPercent));
      }
    } catch (err) {
      console.error('Failed to load global product discount:', err);
      setFeedback({
        type: 'error',
        message: 'Unable to load the current discount right now. Please refresh and try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchGlobalDiscount();
  }, [fetchGlobalDiscount, refreshKey]);

  const parsedInput = discountInput === '' ? NaN : Number(discountInput);
  const isInputValid = !Number.isNaN(parsedInput) && parsedInput >= 0 && parsedInput <= 95;
  const previewDiscount = isInputValid ? Math.round(parsedInput * 100) / 100 : 0;
  const sampleOriginalPrice = 1000;
  const sampleSellingPrice = Math.round(sampleOriginalPrice * (1 - previewDiscount / 100) * 100) / 100;

  const handleSelectDiscountPreset = (presetValue) => {
    setDiscountInput(String(presetValue));
    setFeedback({ type: '', message: '' });
  };

  const handleDiscountInputChange = (event) => {
    setDiscountInput(event.target.value);
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
  };

  const handleApplyGlobalDiscount = async (event) => {
    event.preventDefault();
    if (!isInputValid) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid discount percentage between 0% and 95%.'
      });
      return;
    }

    setSaving(true);
    setFeedback({ type: '', message: '' });
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.put(
        `${API_URL}/api/sales/dashboard/discount`,
        { discountPercent: previewDiscount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setOverview(res.data.data);
        setDiscountInput(formatPercentValue(res.data.data.globalDiscountPercent));
        setFeedback({
          type: 'success',
          message:
            res.data.message ||
            `Discount updated to ${formatPercentValue(previewDiscount)}% OFF for all products.`
        });
        if (onGlobalDiscountApplied) {
          onGlobalDiscountApplied(res.data.data.globalDiscountPercent);
        }
      }
    } catch (err) {
      console.error('Failed to update global product discount:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update the discount. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const currentGlobalPct = overview?.globalDiscountPercent ?? 30;
  const totalProducts = overview?.totalProducts ?? 0;
  const customOverrideCount = overview?.customDiscountCount ?? 0;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 16,
        padding: '1.35rem 1.5rem',
        marginBottom: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              All Products Discount
            </h2>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 9999,
                fontSize: '0.72rem',
                fontWeight: 800,
                background: currentGlobalPct > 0 ? 'rgba(220, 38, 38, 0.12)' : 'rgba(100, 116, 139, 0.15)',
                color: currentGlobalPct > 0 ? '#ef4444' : 'var(--text-muted)',
                border: currentGlobalPct > 0 ? '1px solid rgba(220, 38, 38, 0.28)' : '1px solid var(--border-light)'
              }}
            >
              {currentGlobalPct > 0 ? `Currently ${formatPercentValue(currentGlobalPct)}% OFF` : 'No Active Discount (0%)'}
            </span>
          </div>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Set one discount for all products at once and use it as the default for new products. You can still change the discount for each product in the table below.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <CircularProgress size={18} />
          <span>Loading discount settings...</span>
        </div>
      ) : (
        <form onSubmit={handleApplyGlobalDiscount} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <label
                  htmlFor="global-discount-percent-input"
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--text-muted)',
                    marginBottom: 6
                  }}
                >
                  Discount Percentage (0% – 95%)
                </label>
                <div style={{ position: 'relative', width: 150 }}>
                  <input
                    id="global-discount-percent-input"
                    type="number"
                    min="0"
                    max="95"
                    step="0.5"
                    value={discountInput}
                    onChange={handleDiscountInputChange}
                    placeholder="ex. 30"
                    style={{
                      width: '100%',
                      padding: '0.58rem 2rem 0.58rem 0.85rem',
                      borderRadius: 10,
                      background: 'var(--bg-primary)',
                      border: isInputValid ? '1px solid var(--border-light)' : '1px solid #ef4444',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      pointerEvents: 'none'
                    }}
                  >
                    %
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {DISCOUNT_PRESETS.map((preset) => {
                  const isActivePreset = isInputValid && Math.abs(previewDiscount - preset) < 0.001;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectDiscountPreset(preset)}
                      style={{
                        padding: '0.42rem 0.7rem',
                        borderRadius: 8,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: isActivePreset ? '1px solid #22c55e' : '1px solid var(--border-light)',
                        background: isActivePreset ? 'rgba(34, 197, 94, 0.14)' : 'var(--bg-primary)',
                        color: isActivePreset ? '#16a34a' : 'var(--text-muted)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {preset}%
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !isInputValid}
              style={{
                padding: '0.62rem 1.25rem',
                borderRadius: 10,
                border: 'none',
                background: saving || !isInputValid
                  ? '#64748b'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: saving || !isInputValid ? 'not-allowed' : 'pointer',
                boxShadow: saving || !isInputValid ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              {saving ? 'Updating All Products...' : 'Apply Discount to All Products'}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              padding: '0.65rem 0.9rem',
              borderRadius: 10,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              fontSize: '0.76rem',
              color: 'var(--text-muted)'
            }}
          >
            <div>
              {isInputValid ? (
                previewDiscount === 0 ? (
                  <span>
                    Preview: A <strong>₱1,000.00</strong> item will sell at regular price{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>₱1,000.00</strong> (discount badge hidden from customers).
                  </span>
                ) : (
                  <span>
                    Preview: A <strong>₱1,000.00</strong> item will sell at{' '}
                    <strong style={{ color: '#16a34a' }}>
                      ₱{sampleSellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>{' '}
                    (<strong>LESS {formatPercentValue(previewDiscount)}% OFF</strong>).
                  </span>
                )
              ) : (
                <span style={{ color: '#ef4444', fontWeight: 600 }}>
                  Enter a percentage between 0% and 95% to preview pricing.
                </span>
              )}
            </div>

            <div style={{ fontWeight: 600 }}>
              {totalProducts} total {totalProducts === 1 ? 'product' : 'products'}
              {customOverrideCount > 0
                ? ` · ${customOverrideCount} using a different discount`
                : ' · All using the same discount'}
            </div>
          </div>

          {feedback.message && (
            <div
              role="status"
              style={{
                padding: '0.65rem 0.9rem',
                borderRadius: 10,
                fontSize: '0.78rem',
                fontWeight: 600,
                background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(22, 163, 74, 0.12)',
                border: feedback.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(22, 163, 74, 0.3)',
                color: feedback.type === 'error' ? '#ef4444' : '#16a34a'
              }}
            >
              {feedback.message}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default GlobalDiscountCard;
