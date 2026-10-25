import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { generateReceiptPDF } from '../../utils/documentGenerator';

const StatusBadge = ({ status }) => {
  const s = status ? status.toLowerCase() : '';
  let color = '#3b82f6';
  let bg = 'rgba(59,130,246,0.1)';
  if (s === 'pending') { color = '#f59e0b'; bg = 'rgba(245,158,11,0.1)'; }
  if (s === 'sales_approved' || s === 'finance_verified') { color = '#8b5cf6'; bg = 'rgba(139,92,246,0.1)'; }
  if (s === 'completed' || s === 'delivered') { color = '#22c55e'; bg = 'rgba(34,197,94,0.1)'; }
  if (s === 'rejected' || s === 'cancelled') { color = '#ef4444'; bg = 'rgba(239,68,68,0.1)'; }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 99, background: bg, color, fontSize: '0.75rem', fontWeight: 600 }}>
      <AccessTimeIcon sx={{ fontSize: 12 }} />
      <span style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/sales/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sales orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.patch(`${API_URL}/api/sales/orders/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchOrders();
        if (selectedOrder && selectedOrder.rawId === id) setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Failed to approve order', err);
      alert('Failed to approve order');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for cancellation / rejection ('Duplicate order', 'Customer request'):", "Duplicate order submission");
    if (reason === null) return;

    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.patch(`${API_URL}/api/sales/orders/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(res.data.message || 'Order rejected and forwarded to Finance for customer refund.');
        fetchOrders();
        if (selectedOrder && selectedOrder.rawId === id) setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Failed to reject order', err);
      alert(err.response?.data?.error || 'Failed to reject order');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem 2.5rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Sales Order Approval</h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>Review customer orders and approve them to forward to Finance.</p>
        </div>
        <button onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer' }}>
          <RefreshIcon sx={{ fontSize: 18 }} /> Refresh
        </button>
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
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => setSelectedOrder(order)} title="View Order Details" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', marginRight: 8 }}>
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  </button>
                  <button onClick={() => generateReceiptPDF(order)} title="Download Official Receipt (PDF)" style={{ background: 'rgba(79,119,45,0.15)', color: '#4ade80', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', marginRight: 8 }}>
                    <i className="fi fi-rr-receipt" style={{ fontSize: 16 }} />
                  </button>
                  {order.orderStatus === 'pending' && (
                    <span style={{ display: 'inline-flex', gap: 6, verticalAlign: 'middle' }}>
                      <button onClick={() => handleApprove(order.rawId)} style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                        Approve
                      </button>
                      <button onClick={() => handleReject(order.rawId)} title="Reject / Cancel Duplicate Order" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                        Reject
                      </button>
                    </span>
                  )}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: 640, borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Order Details {selectedOrder.id}</h3>
                <StatusBadge status={selectedOrder.orderStatus} />
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Customer</div>
                  <div style={{ fontWeight: 600, marginTop: 3, color: 'var(--text-primary)' }}>{selectedOrder.customerName}</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Email</div>
                  <div style={{ fontWeight: 600, marginTop: 3, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{selectedOrder.customerEmail}</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Amount</div>
                  <div style={{ fontWeight: 700, marginTop: 3, color: '#16a34a', fontSize: '1.1rem' }}>₱{selectedOrder.totalAmount.toLocaleString()}</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Fulfillment Type</div>
                  <div style={{ fontWeight: 600, marginTop: 3, color: 'var(--text-primary)' }}>{selectedOrder.fulfillmentType || 'Delivery'}</div>
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-primary)' }}>Products Ordered:</div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)', padding: '10px 14px', maxHeight: '180px', overflowY: 'auto' }}>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                  {selectedOrder.items.map((i, idx) => {
                    const spec = [
                      i.customLength ? `${i.customLength}m length` : null,
                      i.thickness || i.variantName,
                      i.color
                    ].filter(Boolean).join(' · ');
                    return (
                      <li key={i.id || i.productName || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{i.productName}</span>
                          {spec && <span style={{ display: 'block', color: '#0284c7', fontSize: '0.8rem', marginTop: 2 }}>{spec}</span>}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                          × {i.quantity} {i.customLength ? 'sheets' : 'units'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => generateReceiptPDF(selectedOrder)} 
                style={{ 
                  width: '100%',
                  background: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--border)', 
                  padding: '11px 16px', 
                  borderRadius: 10, 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8, 
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--text-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <i className="fi fi-rr-receipt" style={{ fontSize: 16, color: '#3b82f6' }} />
                <span>Download Official Receipt (PDF)</span>
              </button>

              {selectedOrder.orderStatus === 'pending' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 12 }}>
                  <button 
                    onClick={() => handleReject(selectedOrder.rawId)} 
                    title="Reject / Cancel Duplicate Order"
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.08)', 
                      color: '#dc2626', 
                      border: '1px solid rgba(239, 68, 68, 0.35)', 
                      padding: '11px 16px', 
                      borderRadius: 10, 
                      cursor: 'pointer', 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                    <span>Reject / Cancel</span>
                  </button>

                  <button 
                    onClick={() => handleApprove(selectedOrder.rawId)} 
                    title="Approve order and forward to Finance"
                    style={{ 
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                      color: '#ffffff', 
                      border: 'none', 
                      padding: '11px 20px', 
                      borderRadius: 10, 
                      cursor: 'pointer', 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.25)';
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                    <span>Approve & Forward to Finance</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    style={{ 
                      padding: '9px 20px', 
                      borderRadius: 8, 
                      border: '1px solid var(--border)', 
                      background: 'var(--bg-secondary)', 
                      color: 'var(--text-muted)', 
                      fontWeight: 600, 
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
