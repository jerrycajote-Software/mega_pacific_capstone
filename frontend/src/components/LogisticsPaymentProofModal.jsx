import React, { useState, useRef } from 'react';
import { CustomCloseIcon as CloseIcon } from './icons';

// Compress mobile camera photos before upload to keep transfers fast on mobile data
const compressImageToDataUrl = (file, maxDimension = 1400, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const LogisticsPaymentProofModal = ({
  open,
  order,
  targetStatus = 'completed',
  onClose,
  onConfirmPaymentCompletion,
  isSubmitting = false
}) => {
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [fileError, setFileError] = useState('');
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef(null);

  if (!open || !order) return null;

  const isPickup = order.fulfillmentType === 'Pickup';
  const totalAmount = Number(order.totalAmount ?? order.total ?? 0);
  const collectedAmount = Number(order.collectedAmount ?? Math.round(totalAmount * 0.5 * 100) / 100);
  const pendingBalanceAmount = Number(order.pendingBalanceAmount ?? Math.max(0, totalAmount - collectedAmount));

  const handleSelectProofFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid photo file (ex. JPG, PNG, or WEBP).');
      return;
    }

    setFileError('');
    setCompressing(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      setPreviewDataUrl(compressedDataUrl);
    } catch (err) {
      setFileError(err.message || 'Unable to process the selected photo.');
    } finally {
      setCompressing(false);
    }
  };

  const handleClearProofPhoto = () => {
    setPreviewDataUrl('');
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmOrderAndPayment = () => {
    if (!previewDataUrl) {
      setFileError('Please attach a photo showing proof of full payment before confirming.');
      return;
    }
    if (onConfirmPaymentCompletion && !isSubmitting) {
      onConfirmPaymentCompletion(order.rawId, targetStatus, previewDataUrl);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1350,
        padding: '0.85rem'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logistics-proof-modal-title"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90dvh',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div
          style={{
            padding: '1.1rem 1.35rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div>
            <h3
              id="logistics-proof-modal-title"
              style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)' }}
            >
              Confirm 50% Final Payment — {order.id}
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isPickup ? 'Store Pick-up Balance Settlement' : 'Cash on Delivery Balance Settlement'}
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close payment confirmation dialog"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              padding: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.35rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '0.9rem 1rem',
              fontSize: '0.84rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Customer:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{order.customerName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Total Order Amount:</span>
              <strong style={{ color: 'var(--text-primary)' }}>₱{totalAmount.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
              <span>50% Downpayment Paid:</span>
              <strong>₱{collectedAmount.toLocaleString()}</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px dashed rgba(245, 158, 11, 0.45)',
                color: '#d97706',
                fontSize: '0.94rem'
              }}
            >
              <strong>Remaining 50% to Collect:</strong>
              <strong>₱{pendingBalanceAmount.toLocaleString()}</strong>
            </div>
          </div>

          <div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Attach Photo Proof of Customer Payment (Required)
            </p>
            <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Take a photo of the cash handover, signed receipt, or payment confirmation using your camera or upload from your device.
            </p>

            <input
              ref={fileInputRef}
              id="logistics-payment-proof-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleSelectProofFile}
              style={{ display: 'none' }}
            />

            {!previewDataUrl ? (
              <label
                htmlFor="logistics-payment-proof-input"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '130px',
                  border: '2px dashed rgba(22, 163, 74, 0.45)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(22, 163, 74, 0.04)',
                  color: '#16a34a',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  padding: '1rem',
                  textAlign: 'center'
                }}
              >
                {compressing ? 'Preparing photo preview...' : 'Tap Here to Take Photo or Upload Payment Proof'}
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>
                  Works on Chrome, Edge, and Safari mobile cameras
                </span>
              </label>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <img
                  src={previewDataUrl}
                  alt="Selected payment proof preview"
                  style={{
                    width: '100%',
                    maxHeight: '240px',
                    objectFit: 'contain',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <label
                    htmlFor="logistics-payment-proof-input"
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#2563eb',
                      cursor: 'pointer'
                    }}
                  >
                    Retake / Replace Photo
                  </label>
                  <button
                    type="button"
                    onClick={handleClearProofPhoto}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}

            {fileError && (
              <p style={{ margin: '0.6rem 0 0', fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>
                {fileError}
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            padding: '1rem 1.35rem',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            disabled={!previewDataUrl || isSubmitting || compressing}
            onClick={handleConfirmOrderAndPayment}
            style={{
              width: '100%',
              minHeight: '46px',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: !previewDataUrl || isSubmitting || compressing ? '#94a3b8' : '#16a34a',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: !previewDataUrl || isSubmitting || compressing ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting
              ? 'Uploading Photo Proof & Confirming...'
              : 'Confirm Full Payment & Complete Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogisticsPaymentProofModal;
