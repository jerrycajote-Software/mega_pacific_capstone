import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CustomMessageDialog from '../../components/CustomMessageDialog';
import { useCustomDialog } from '../../hooks/useCustomDialog';

const StatusBadge = ({ status }) => {
  const s = status ? status.toLowerCase() : '';
  let color = '#3b82f6';
  let bg = 'rgba(59,130,246,0.1)';
  if (s === 'sales_approved') { color = '#f59e0b'; bg = 'rgba(245,158,11,0.1)'; }
  if (s === 'finance_verified') { color = '#8b5cf6'; bg = 'rgba(139,92,246,0.1)'; }
  if (s === 'completed' || s === 'delivered' || s === 'shipped') { color = '#22c55e'; bg = 'rgba(34,197,94,0.1)'; }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 99, background: bg, color, fontSize: '0.75rem', fontWeight: 600 }}>
      <span style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};

const PaymentsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const {
    dialogState,
    showSuccess,
    showError,
    showConfirm
  } = useCustomDialog();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/finance/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch finance orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const handleFocus = () => fetchOrders();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleVerifyPayment = (orderOrId) => {
    if (processingId) return;
    const target = typeof orderOrId === 'object' && orderOrId !== null
      ? orderOrId 
      : (orders.find(o => o.rawId === orderOrId) || { rawId: orderOrId, id: `#ORD-${orderOrId}` });
    const orderId = target.id || `#ORD-${target.rawId}`;
    const rawId = target.rawId || target.id;

    showConfirm({
      type: 'warning',
      title: 'Confirm Payment Verification',
      message: `Are you sure you want to verify payment for Order ${orderId}?`,
      description: 'This will record payment validation and forward the order to Logistics for fabrication and fulfillment.',
      confirmText: 'Verify Payment',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setProcessingId(rawId);
        try {
          const token = localStorage.getItem('appToken');
          const API_URL = import.meta.env.VITE_API_URL || '';
          const res = await axios.patch(`${API_URL}/api/finance/orders/${rawId}/verify`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            await fetchOrders();
            if (selectedOrder && selectedOrder.rawId === rawId) setSelectedOrder(null);
            showSuccess({
              title: 'Payment Verified Successfully',
              message: res.data.message || 'Payment verified and order forwarded to Logistics.',
              confirmText: 'Acknowledge'
            });
          }
        } catch (err) {
          console.error('Failed to verify order', err);
          const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to verify payment';
          showError({
            title: 'Verification Failed',
            message: errorMessage,
            confirmText: 'Dismiss'
          });
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleViewOrderDetails = (order) => setSelectedOrder(order);
  const handleCloseOrderDetailsModal = () => setSelectedOrder(null);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem 2.5rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Payment Verification</h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>Verify payment for orders approved by Sales to forward them to Logistics.</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem', position: 'relative', width: '300px' }}>
          <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '1rem' }}>Order ID</th>
              <th style={{ padding: '1rem' }}>Customer</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#4ade80' }}>{order.id}</td>
                <td style={{ padding: '1rem' }}>{order.customerName}</td>
                <td style={{ padding: '1rem', color: '#22c55e', fontWeight: 600 }}>₱{order.totalAmount.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}><StatusBadge status={order.orderStatus} /></td>
                <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleViewOrderDetails(order)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '7px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 650,
                        color: '#2563eb',
                        background: 'rgba(37, 99, 235, 0.08)',
                        border: '1px solid rgba(37, 99, 235, 0.28)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        lineHeight: 1.2,
                        textTransform: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(37, 99, 235, 0.16)';
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.28)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      View Details
                    </button>
                    {order.orderStatus === 'sales_approved' && (
                      <button
                        type="button"
                        onClick={() => handleVerifyPayment(order)}
                        disabled={Boolean(processingId)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '7px 16px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          background: processingId === order.rawId ? '#64748b' : '#16a34a',
                          border: '1px solid transparent',
                          borderRadius: '8px',
                          cursor: processingId ? 'not-allowed' : 'pointer',
                          boxShadow: processingId ? 'none' : '0 2px 8px rgba(22, 163, 74, 0.25)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          lineHeight: 1.2,
                          textTransform: 'none',
                          opacity: processingId && processingId !== order.rawId ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!processingId) {
                            e.currentTarget.style.background = '#15803d';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.35)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!processingId) {
                            e.currentTarget.style.background = '#16a34a';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(22, 163, 74, 0.25)';
                          }
                        }}
                      >
                        {processingId === order.rawId ? 'Verifying...' : 'Verify Payment'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: 600, borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Payment Verification {selectedOrder.id}</h3>
              <button onClick={handleCloseOrderDetailsModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><CloseIcon /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
              <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
              <p><strong>Total Amount:</strong> ₱{selectedOrder.totalAmount.toLocaleString()}</p>
              <p><strong>Payment Mode:</strong> {selectedOrder.paymentMode}</p>
              <p><strong>Products:</strong></p>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', color: 'var(--text-muted)' }}>
                {selectedOrder.items.map(i => <li key={i.productName}>{i.productName} {i.variantName ? `(${i.variantName})` : ''} x {i.quantity}</li>)}
              </ul>
            </div>
            {selectedOrder.orderStatus === 'sales_approved' && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)', textAlign: 'right' }}>
                <button 
                  type="button"
                  onClick={() => handleVerifyPayment(selectedOrder)} 
                  disabled={Boolean(processingId)}
                  style={{ 
                    background: processingId ? '#64748b' : '#16a34a', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 22px', 
                    borderRadius: 8, 
                    cursor: processingId ? 'not-allowed' : 'pointer', 
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    boxShadow: processingId ? 'none' : '0 2px 10px rgba(22, 163, 74, 0.3)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: processingId ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!processingId) {
                      e.currentTarget.style.background = '#15803d';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(22, 163, 74, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!processingId) {
                      e.currentTarget.style.background = '#16a34a';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(22, 163, 74, 0.3)';
                    }
                  }}
                >
                  {processingId === selectedOrder.rawId ? 'Verifying...' : 'Verify & Forward to Logistics'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Metal & Steel Message / Warning Dialog */}
      <CustomMessageDialog {...dialogState} />
    </div>
  );
};

export default PaymentsPage;
