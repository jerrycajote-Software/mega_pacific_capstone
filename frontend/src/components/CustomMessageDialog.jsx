import React, { useEffect, useState } from 'react';
import {
  CustomDialogWarningIcon,
  CustomDialogSuccessIcon,
  CustomDialogDangerIcon,
  CustomDialogInfoIcon
} from './icons';

const dialogStyles = `
  @keyframes cmd-fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes cmd-scaleIn {
    from { opacity: 0; transform: scale(0.94) translateY(12px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .cmd-overlay {
    animation: cmd-fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .cmd-card {
    animation: cmd-scaleIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

const CustomMessageDialog = ({
  open,
  type = 'warning',
  title = 'Action Warning',
  message = '',
  description = '',
  confirmText = 'I Understand',
  cancelText = 'Cancel',
  showCancel = false,
  loading = false,
  inputConfig = null,
  onConfirm,
  onClose
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      if (inputConfig?.defaultValue) {
        setInputValue(inputConfig.defaultValue);
      } else {
        setInputValue('');
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, inputConfig?.defaultValue]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open || loading) return;
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  const getThemeMeta = () => {
    switch (type) {
      case 'success':
        return {
          Icon: CustomDialogSuccessIcon,
          accentColor: '#16a34a',
          accentGradient: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
          btnGradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          btnGlow: 'rgba(34, 197, 94, 0.35)',
          badgeRing: 'rgba(34, 197, 94, 0.15)',
          badgeBorder: 'rgba(34, 197, 94, 0.3)'
        };
      case 'error':
      case 'danger':
        return {
          Icon: CustomDialogDangerIcon,
          accentColor: '#dc2626',
          accentGradient: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
          btnGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          btnGlow: 'rgba(239, 68, 68, 0.35)',
          badgeRing: 'rgba(239, 68, 68, 0.15)',
          badgeBorder: 'rgba(239, 68, 68, 0.3)'
        };
      case 'info':
        return {
          Icon: CustomDialogInfoIcon,
          accentColor: '#2563eb',
          accentGradient: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
          btnGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          btnGlow: 'rgba(59, 130, 246, 0.35)',
          badgeRing: 'rgba(59, 130, 246, 0.15)',
          badgeBorder: 'rgba(59, 130, 246, 0.3)'
        };
      case 'warning':
      default:
        return {
          Icon: CustomDialogWarningIcon,
          accentColor: '#d97706',
          accentGradient: 'linear-gradient(90deg, #f59e0b 0%, #b45309 100%)',
          btnGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          btnGlow: 'rgba(245, 158, 11, 0.35)',
          badgeRing: 'rgba(245, 158, 11, 0.15)',
          badgeBorder: 'rgba(245, 158, 11, 0.3)'
        };
    }
  };

  const theme = getThemeMeta();
  const IconComponent = theme.Icon;

  const handleConfirmAction = () => {
    if (loading) return;
    if (inputConfig) {
      if (inputConfig.required && !inputValue.trim()) return;
      if (onConfirm) onConfirm(inputValue.trim());
    } else {
      if (onConfirm) onConfirm();
    }
  };

  const handleCloseDialog = () => {
    if (loading) return;
    if (onClose) onClose();
  };

  return (
    <>
      <style>{dialogStyles}</style>
      <div
        className="cmd-overlay"
        onClick={handleCloseDialog}
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '1.25rem',
          boxSizing: 'border-box'
        }}
      >
        <div
          className="cmd-card"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: inputConfig ? '480px' : '420px',
            background: 'var(--bg-secondary, #ffffff)',
            border: '1px solid var(--border, #cbd5e1)',
            borderRadius: '22px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            fontFamily: "var(--font-body, 'Inter', system-ui, -apple-system, sans-serif)",
            color: 'var(--text-primary, #0f172a)'
          }}
        >
          {/* Top Industrial Accent Bar */}
          <div
            style={{
              height: '4px',
              width: '100%',
              background: theme.accentGradient
            }}
          />

          <div style={{ padding: '2rem 1.75rem 1.5rem 1.75rem', textAlign: 'center' }}>
            {/* Custom Metal & Steel Icon Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: theme.badgeRing,
                border: `1px solid ${theme.badgeBorder}`,
                boxShadow: `0 8px 24px -4px ${theme.btnGlow}`,
                marginBottom: '1.25rem'
              }}
            >
              <IconComponent size={50} />
            </div>

            {/* Dialog Heading */}
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary, #0f172a)',
                fontFamily: "var(--font-heading, 'Montserrat', sans-serif)",
                letterSpacing: '-0.02em',
                lineHeight: 1.3
              }}
            >
              {title}
            </h3>

            {/* Dialog Message */}
            <p
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.92rem',
                fontWeight: 500,
                lineHeight: 1.55,
                color: 'var(--text-primary, #1e293b)'
              }}
            >
              {message}
            </p>

            {/* Secondary Description */}
            {description && (
              <p
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: 'var(--text-muted, #64748b)'
                }}
              >
                {description}
              </p>
            )}

            {/* Optional Input / Reason Selection Prompt */}
            {inputConfig && (
              <div style={{ marginTop: '1.25rem', textAlign: 'left' }}>
                {inputConfig.label && (
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-muted, #64748b)',
                      marginBottom: '0.4rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {inputConfig.label}
                  </label>
                )}

                {/* Quick Selection Presets */}
                {inputConfig.presets && inputConfig.presets.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {inputConfig.presets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setInputValue(preset)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          border: inputValue === preset ? `1px solid ${theme.accentColor}` : '1px solid var(--border, #cbd5e1)',
                          background: inputValue === preset ? theme.badgeRing : 'var(--bg-primary, #f8fafc)',
                          color: inputValue === preset ? theme.accentColor : 'var(--text-muted, #64748b)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  rows={3}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputConfig.placeholder || 'ex. Duplicate order submission'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border, #cbd5e1)',
                    background: 'var(--bg-primary, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accentColor;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.badgeRing}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border, #cbd5e1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div
            style={{
              padding: '1rem 1.75rem 1.5rem 1.75rem',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: showCancel ? 'space-between' : 'center',
              alignItems: 'center',
              background: 'var(--bg-tertiary, #f1f5f9)',
              borderTop: '1px solid var(--border, #cbd5e1)'
            }}
          >
            {showCancel && (
              <button
                type="button"
                onClick={handleCloseDialog}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--border, #cbd5e1)',
                  background: 'var(--bg-secondary, #ffffff)',
                  color: 'var(--text-muted, #546e7a)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: "var(--font-heading, 'Montserrat', sans-serif)",
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = 'var(--text-muted, #546e7a)';
                    e.currentTarget.style.color = 'var(--text-primary, #1e293b)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = 'var(--border, #cbd5e1)';
                    e.currentTarget.style.color = 'var(--text-muted, #546e7a)';
                  }
                }}
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmAction}
              disabled={loading || (inputConfig?.required && !inputValue.trim())}
              style={{
                flex: showCancel ? 1.2 : 'unset',
                minWidth: showCancel ? 'unset' : '180px',
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                background: theme.btnGradient,
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: loading || (inputConfig?.required && !inputValue.trim()) ? 'not-allowed' : 'pointer',
                opacity: loading || (inputConfig?.required && !inputValue.trim()) ? 0.6 : 1,
                boxShadow: `0 4px 14px ${theme.btnGlow}`,
                transition: 'all 0.18s ease',
                fontFamily: "var(--font-heading, 'Montserrat', sans-serif)",
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading && !(inputConfig?.required && !inputValue.trim())) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 6px 18px ${theme.btnGlow}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 14px ${theme.btnGlow}`;
                }
              }}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomMessageDialog;

