import React from 'react';
import { CustomCloseIcon as CloseIcon } from './icons';
import { generateReceiptPDF } from '../utils/documentGenerator';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const OfficialReceiptModal = ({
  open,
  onClose,
  order,
  onVerifyPayment,
  isProcessing = false
}) => {
  if (!open || !order) return null;

  const items = order.items || [];
  const itemsSubtotal = items.reduce((sum, item) => {
    const len = item.customLength ? parseFloat(item.customLength) : 1;
    const unitPrice = parseFloat(item.price ?? item.unitPrice ?? 0);
    const qty = Number(item.quantity) || 1;
    return sum + (unitPrice * len * qty);
  }, 0);

  const totalAmount = Number(order.total ?? order.totalAmount) || itemsSubtotal;
  const isPickup = (order.fulfillmentType || '').toLowerCase() === 'pickup';
  const deliveryFee = isPickup ? 0 : Math.max(0, Math.round((totalAmount - itemsSubtotal) * 100) / 100);

  const isCOD50 = (order.paymentMode || '').includes('50%') || (order.paymentStatus || '').includes('50%');
  const downpayment = isCOD50 ? Math.round(totalAmount * 0.5 * 100) / 100 : totalAmount;
  const balanceRemaining = isCOD50 ? (totalAmount - downpayment) : 0;

  const orderNum = order.id || `#ORD-${String(order.rawId || '').padStart(3, '0')}`;
  const isSalesApproved = order.orderStatus === 'sales_approved';

  const handleDownloadReceiptPdf = () => {
    generateReceiptPDF(order);
  };

  const handleConfirmPaymentVerification = () => {
    if (onVerifyPayment && !isProcessing) {
      onVerifyPayment(order);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.1rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-primary)',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  color: '#16a34a',
                }}
              >
                OFFICIAL RECEIPT
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                Order {orderNum}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Official receipt and transaction billing verification
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon sx={{ fontSize: 22 }} />
          </button>
        </div>

        <div
          className="official-receipt-modal-body"
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: '1 1 auto',
            minHeight: 0,
            maxHeight: 'calc(90vh - 145px)',
            overscrollBehavior: 'contain',
          }}
        >
          {isSalesApproved && (
            <div
              style={{
                backgroundColor: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                borderRadius: '10px',
                padding: '0.85rem 1.1rem',
                fontSize: '0.84rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
                marginBottom: '1rem',
              }}
            >
              <strong style={{ color: '#d97706' }}>Receipt Verification Notice:</strong> Please examine the official receipt and billing specifications below. Once confirmed, payment is recorded as verified and the order is forwarded to Logistics for fabrication and fulfillment.
            </div>
          )}

          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                backgroundColor: '#1b4332',
                color: '#ffffff',
                padding: '1.1rem 1.4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                borderTopLeftRadius: '11px',
                borderTopRightRadius: '11px',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.02em', color: '#ffffff' }}>
                  MEGA PACIFIC METAL AND STEEL CORP.
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#b7e4c7' }}>
                  Plant: 379 Aguinaldo Highway Anabu 1-C, Imus City, Cavite
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#d8f3dc' }}>
                  Tel: (046) 416 9217 | Mobile: 0917 277 7727 | megapacificmetal@gmail.com
                </p>
              </div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  color: '#1b4332',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em' }}>OFFICIAL RECEIPT</div>
                <div style={{ fontSize: '0.65rem', color: '#4b5563', fontWeight: 600 }}>SALES INVOICE</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.83rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction Details</span>
                <div><strong>Order Reference:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{orderNum}</span></div>
                <div><strong>Date Placed:</strong> {formatDate(order.createdAt || order.dateOrdered)}</div>
                <div><strong>Fulfillment:</strong> {isPickup ? 'Store / Plant Pick-up' : 'Jobsite Fleet Delivery'}</div>
                <div><strong>Payment Method:</strong> {order.paymentMode || 'Cash on Delivery'}</div>
                <div><strong>Payment Status:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{order.paymentStatus || 'Pending'}</span></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.83rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client & Jobsite Destination</span>
                <div><strong>Client Name:</strong> {order.shippingName || order.customerName || 'Valued Customer'}</div>
                <div><strong>Contact Number:</strong> {order.shippingContactNumber || order.contactNumber || 'N/A'}</div>
                <div><strong>Email Address:</strong> {order.customerEmail || 'N/A'}</div>
                <div><strong>Address:</strong> {isPickup ? '379 Aguinaldo Highway Anabu 1-C, Imus City, Cavite' : (order.shippingAddress || order.address || order.cityProvince || 'N/A')}</div>
              </div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Itemized Products
              </span>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <th style={{ padding: '8px 6px' }}>Item Description</th>
                      <th style={{ padding: '8px 6px' }}>Gauge</th>
                      <th style={{ padding: '8px 6px' }}>Color</th>
                      <th style={{ padding: '8px 6px' }}>Length</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px 6px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '8px 6px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const gauge = item.thickness || '0.35mm';
                      const color = item.color || 'Standard';
                      const lengthStr = item.customLength ? `${Number(item.customLength).toFixed(2)}m` : 'Standard';
                      const qty = Number(item.quantity) || 1;
                      const lenMultiplier = item.customLength ? Number(item.customLength) : 1;
                      const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
                      const lineTotal = unitPrice * lenMultiplier * qty;

                      return (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 6px', fontWeight: 600 }}>{item.productName || item.product?.name || `Item #${idx + 1}`}</td>
                          <td style={{ padding: '10px 6px', color: 'var(--text-muted)' }}>{gauge}</td>
                          <td style={{ padding: '10px 6px', color: 'var(--text-muted)' }}>{color}</td>
                          <td style={{ padding: '10px 6px', color: 'var(--text-muted)' }}>{lengthStr}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'center' }}>{qty} {item.customLength ? (qty === 1 ? 'sheet' : 'sheets') : 'pcs'}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(unitPrice)}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderTop: '1px solid var(--border)',
                borderBottomLeftRadius: '11px',
                borderBottomRightRadius: '11px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(itemsSubtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isPickup ? 'Pick-up Handling:' : 'Fleet Logistics Fee:'}</span>
                  <span style={{ fontWeight: 600, color: isPickup ? '#16a34a' : 'inherit' }}>
                    {isPickup ? 'FREE (₱0.00)' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800 }}>
                  <span>Total Order Value:</span>
                  <span style={{ color: '#16a34a' }}>{formatCurrency(totalAmount)}</span>
                </div>
                {isCOD50 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: '0.82rem' }}>
                      <span>50% Downpayment (Paid):</span>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(downpayment)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', fontSize: '0.82rem' }}>
                      <span>Balance on Delivery:</span>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(balanceRemaining)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleDownloadReceiptPdf}
            style={{
              padding: '9px 18px',
              fontSize: '0.84rem',
              fontWeight: 650,
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Download Official Receipt (PDF)
          </button>

          {isSalesApproved && (
            <button
              type="button"
              onClick={handleConfirmPaymentVerification}
              disabled={isProcessing}
              style={{
                padding: '9px 20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: isProcessing ? '#64748b' : '#16a34a',
                border: '1px solid transparent',
                borderRadius: '8px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: isProcessing ? 'none' : '0 2px 10px rgba(22, 163, 74, 0.3)',
                transition: 'all 0.15s ease',
                opacity: isProcessing ? 0.7 : 1,
              }}
            >
              {isProcessing ? 'Verifying Payment...' : 'Confirm Payment Verification'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficialReceiptModal;

