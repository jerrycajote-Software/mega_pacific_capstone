import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StatusBadge = ({ status }) => {
  const s = status ? status.toLowerCase() : '';
  let color = '#3b82f6';
  let bg = 'rgba(59,130,246,0.1)';
  if (s === 'finance_verified' || s === 'processing') { color = '#f59e0b'; bg = 'rgba(245,158,11,0.1)'; }
  if (s === 'shipped' || s === 'out_for_delivery' || s === 'ready_for_pickup') { color = '#8b5cf6'; bg = 'rgba(139,92,246,0.1)'; }
  if (s === 'completed' || s === 'delivered') { color = '#22c55e'; bg = 'rgba(34,197,94,0.1)'; }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 99, background: bg, color, fontSize: '0.75rem', fontWeight: 600 }}>
      <AccessTimeIcon sx={{ fontSize: 12 }} />
      <span style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};

const DeliveriesPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/logistic/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch logistic orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.patch(`${API_URL}/api/logistic/orders/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchOrders();
        if (selectedOrder && selectedOrder.rawId === id) {
          setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
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
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Deliveries & Pickups</h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>Manage dispatch, delivery, and pick-up status for verified orders.</p>
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
              <th style={{ padding: '1rem' }}>Fulfillment</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#4ade80' }}>{order.id}</td>
                <td style={{ padding: '1rem' }}>
                  {order.customerName}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.address || 'Pickup'}</div>
                </td>
                <td style={{ padding: '1rem' }}>{order.fulfillmentType || 'Delivery'}</td>
                <td style={{ padding: '1rem' }}><StatusBadge status={order.orderStatus} /></td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => setSelectedOrder(order)} style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer' }}>
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  </button>
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
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Logistics - {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><CloseIcon /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer Info</p>
                  <p style={{ margin: 0 }}><strong>{selectedOrder.customerName}</strong></p>
                  <p style={{ margin: 0 }}>{selectedOrder.customerEmail}</p>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fulfillment Type</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#60a5fa' }}>{selectedOrder.fulfillmentType || 'Delivery'}</p>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shipping Address</p>
                <p style={{ margin: 0 }}>{selectedOrder.address || 'N/A'}</p>
                <p style={{ margin: 0 }}>{selectedOrder.cityProvince || ''} {selectedOrder.zipCode || ''}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Actions:</p>
                {(selectedOrder.fulfillmentType === 'Delivery' || !selectedOrder.fulfillmentType) ? (
                  <>
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.rawId, 'shipped')} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                      Mark as <strong>Shipped</strong>
                    </button>
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.rawId, 'out_for_delivery')} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                      Mark as <strong>Out for Delivery</strong>
                    </button>
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.rawId, 'completed')} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>
                      Mark as <strong>Delivered (Completed)</strong>
                    </button>
                  </>
                ) : (
                  <>
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.rawId, 'ready_for_pickup')} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                      Mark as <strong>Ready for Pickup</strong>
                    </button>
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.rawId, 'completed')} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>
                      Mark as <strong>Picked Up (Completed)</strong>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;
