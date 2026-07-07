import React, { useEffect } from 'react';

const css = `
  @keyframes lm-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes lm-scaleIn {
    from { opacity: 0; transform: scale(0.95) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .lm-overlay {
    animation: lm-fadeIn 0.2s ease-out forwards;
  }
  .lm-modal-card {
    animation: lm-scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

const LogoutConfirmModal = ({ onClose, onConfirm }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const isStaffPortal = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/employee');

  // Themes matching: emerald gradient for staff, forest gradient for customer
  const confirmBtnBg = isStaffPortal 
    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
    : 'linear-gradient(135deg, #4f772d 0%, #3d5c22 100%)';
  const confirmBtnGlow = isStaffPortal
    ? 'rgba(34, 197, 94, 0.28)'
    : 'rgba(79, 119, 45, 0.3)';

  return (
    <>
      <style>{css}</style>
      <div
        className="lm-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}
      >
        <div
          className="lm-modal-card"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-secondary, #ffffff)',
            border: '1px solid var(--border-light, #e0e7ef)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            padding: '1.75rem',
            boxSizing: 'border-box',
            fontFamily: "'Inter', system-ui, sans-serif"
          }}
        >
          {/* Header */}
          <h3
            style={{
              margin: '0 0 0.75rem 0',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--text-primary, #1a2027)',
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: '-0.01em'
            }}
          >
            Confirm Logout
          </h3>

          {/* Message */}
          <p
            style={{
              margin: '0 0 1.75rem 0',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'var(--text-muted, #546e7a)'
            }}
          >
            Are you sure you want to log out?
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-light, #e0e7ef)',
                background: 'transparent',
                color: 'var(--text-muted, #546e7a)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: "'Poppins', sans-serif",
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(128,128,128,0.05)';
                e.currentTarget.style.borderColor = 'var(--text-muted, #546e7a)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-light, #e0e7ef)';
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '0.625rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: confirmBtnBg,
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: `0 4px 12px ${confirmBtnGlow}`,
                fontFamily: "'Poppins', sans-serif",
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.92';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutConfirmModal;
