import React, { useState, useEffect } from 'react';
import { CustomCloseIcon as CloseIcon } from '../icons';

const QUICK_DISCOUNT_PRESETS = [0, 10, 15, 20, 25, 30, 40, 50];

const formatPercentText = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return Number.isInteger(num) ? String(num) : String(Math.round(num * 100) / 100);
};

// Focused modal allowing Sales staff to update one product's discount and preview all variant prices
const ProductDiscountEditModal = ({
  open,
  product,
  globalDiscountPercent = 30,
  saving = false,
  errorMessage = '',
  onClose,
  onSaveProductDiscount
}) => {
  const [discountInput, setDiscountInput] = useState('30');

  useEffect(() => {
    if (open && product) {
      const currentPct = product.discountPercent ?? globalDiscountPercent ?? 30;
      setDiscountInput(formatPercentText(currentPct));
    }
  }, [open, product, globalDiscountPercent]);

  if (!open || !product) return null;

  const rawInitialPct = Number(product.discountPercent ?? globalDiscountPercent ?? 30);
  const initialDiscountPct = Number.isNaN(rawInitialPct) ? 0 : Math.round(rawInitialPct * 100) / 100;
  const parsedValue = discountInput === '' ? NaN : Number(discountInput);
  const isValid = !Number.isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 95;
  const nextDiscountPct = isValid ? Math.round(parsedValue * 100) / 100 : 0;
  // Disable saving until the user enters a valid discount that differs from the current saved value
  const hasDiscountChanged = isValid && Math.abs(nextDiscountPct - initialDiscountPct) >= 0.001;
  const isSaveDisabled = !isValid || !hasDiscountChanged || saving;

  const baseOriginal = Number(product.originalPrice ?? product.price ?? 0);
  const nextBaseSelling = Math.round(baseOriginal * (1 - nextDiscountPct / 100) * 100) / 100;
  const productVariants = Array.isArray(product.variants) ? product.variants : [];

  const handleDiscountInputChange = (event) => {
    setDiscountInput(event.target.value);
  };

  const handleSelectDiscountPreset = (presetValue) => {
    setDiscountInput(String(presetValue));
  };

  const handleApplyGlobalDefaultPreset = () => {
    setDiscountInput(formatPercentText(globalDiscountPercent));
  };

  const handleSubmitProductDiscount = (event) => {
    event.preventDefault();
    if (isSaveDisabled) return;
    if (onSaveProductDiscount) {
      onSaveProductDiscount(product, nextDiscountPct);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Edit discount for ${product.name}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 18,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.45)',
          boxSizing: 'border-box'
        }}
      >
        {/* Modal header with single designated X close button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.15rem 1.4rem',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Edit Product Discount
            </h3>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {product.name} ({product.type || 'Roofing Profile'})
            </div>
          </div>

          <button
            type="button"
            aria-label="Close edit product discount modal"
            onClick={onClose}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 9,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-primary)',
              color: 'var(--text-muted)',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            <CloseIcon sx={{ fontSize: 17 }} />
          </button>
        </div>

        <form onSubmit={handleSubmitProductDiscount} style={{ padding: '1.35rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label
                htmlFor="product-discount-input"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--text-muted)'
                }}
              >
                Product Discount Percentage (0% – 95%)
              </label>

              <button
                type="button"
                onClick={handleApplyGlobalDefaultPreset}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Use Default Discount ({formatPercentText(globalDiscountPercent)}%)
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                id="product-discount-input"
                type="number"
                min="0"
                max="95"
                step="0.5"
                required
                value={discountInput}
                onChange={handleDiscountInputChange}
                placeholder="ex. 20"
                style={{
                  width: '100%',
                  padding: '0.68rem 2.2rem 0.68rem 0.9rem',
                  borderRadius: 10,
                  background: 'var(--bg-primary)',
                  border: isValid ? '1px solid var(--border-light)' : '1px solid #ef4444',
                  color: 'var(--text-primary)',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)'
                }}
              >
                %
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {QUICK_DISCOUNT_PRESETS.map((preset) => {
                const active = isValid && Math.abs(nextDiscountPct - preset) < 0.001;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectDiscountPreset(preset)}
                    style={{
                      padding: '0.35rem 0.68rem',
                      borderRadius: 8,
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: active ? '1px solid #22c55e' : '1px solid var(--border-light)',
                      background: active ? 'rgba(34, 197, 94, 0.14)' : 'var(--bg-primary)',
                      color: active ? '#16a34a' : 'var(--text-muted)'
                    }}
                  >
                    {preset}%
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live selling price preview for base product and all variants */}
          <div
            style={{
              padding: '0.9rem 1rem',
              borderRadius: 12,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
              Updated Selling Price Preview
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                Base ({product.thickness || 'Standard'})
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                {nextDiscountPct > 0 && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₱{baseOriginal.toFixed(2)}
                  </span>
                )}
                <span style={{ fontWeight: 800, color: '#16a34a' }}>
                  ₱{nextBaseSelling.toFixed(2)}
                </span>
              </div>
            </div>

            {productVariants.map((variant) => {
              const vOrig = Number(variant.originalPrice ?? variant.price ?? 0);
              const vNextSelling = Math.round(vOrig * (1 - nextDiscountPct / 100) * 100) / 100;
              return (
                <div
                  key={variant.id || variant.thickness}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    paddingTop: 6,
                    borderTop: '1px dashed var(--border-light)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                    {variant.name || variant.thickness}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    {nextDiscountPct > 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₱{vOrig.toFixed(2)}
                      </span>
                    )}
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>
                      ₱{vNextSelling.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {nextDiscountPct === 0
                ? 'At 0%, the discount badge and strikethrough price will be hidden on the customer catalog.'
                : `Customers will see LESS ${formatPercentText(nextDiscountPct)}% OFF on this product and all of its thickness variants.`}
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: 9,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.76rem',
                fontWeight: 600
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Focused footer action without redundant close button */}
          <button
            type="submit"
            disabled={isSaveDisabled}
            style={{
              width: '100%',
              padding: '0.72rem 1rem',
              borderRadius: 10,
              border: 'none',
              background: isSaveDisabled
                ? '#64748b'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: isSaveDisabled ? 'not-allowed' : 'pointer',
              opacity: isSaveDisabled ? 0.65 : 1,
              boxShadow: isSaveDisabled ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.32)',
              transition: 'all 0.15s ease'
            }}
          >
            {saving ? 'Saving Discount...' : 'Save Product Discount'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDiscountEditModal;
