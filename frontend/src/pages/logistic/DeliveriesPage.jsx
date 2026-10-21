import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const StatusBadge = ({ status }) => {
  const s = status ? status.toLowerCase() : '';
  let color = '#3b82f6';
  let bg = 'rgba(59,130,246,0.1)';
  let icon = <AccessTimeIcon sx={{ fontSize: 13 }} />;

  if (s === 'finance_verified' || s === 'processing') {
    color = '#f59e0b';
    bg = 'rgba(245,158,11,0.12)';
  } else if (s === 'ready_for_pickup') {
    color = '#8b5cf6';
    bg = 'rgba(139,92,246,0.15)';
    icon = <StorefrontIcon sx={{ fontSize: 13 }} />;
  } else if (s === 'shipped' || s === 'out_for_delivery') {
    color = '#2563eb';
    bg = 'rgba(37,99,235,0.12)';
    icon = <LocalShippingIcon sx={{ fontSize: 13 }} />;
  } else if (s === 'completed' || s === 'delivered') {
    color = '#16a34a';
    bg = 'rgba(22,163,74,0.15)';
    icon = <CheckCircleIcon sx={{ fontSize: 13 }} />;
  }

  const label = s === 'ready_for_pickup' ? 'Ready for Pick-up' : status.replace(/_/g, ' ');

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 99,
        background: bg,
        color,
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.01em'
      }}
    >
      {icon}
      <span style={{ textTransform: 'capitalize' }}>{label}</span>
    </span>
  );
};

const DeliveriesPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

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
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, newStatus, isSignal = false) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.patch(
        `${API_URL}/api/logistic/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        await fetchOrders();
        if (selectedOrder && selectedOrder.rawId === id) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
        }
        if (newStatus === 'ready_for_pickup') {
          setActionFeedback({
            type: 'success',
            text: `Ready for Pick-up signal broadcasted! Customer has been notified via live socket and email.`
          });
        } else if (newStatus === 'completed') {
          setActionFeedback({
            type: 'success',
            text: `Order completed successfully!`
          });
        }
        setTimeout(() => setActionFeedback(null), 6000);
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const deliveryOrdersCount = orders.filter((o) => (o.fulfillmentType || 'Delivery') === 'Delivery').length;
  const pickupOrdersCount = orders.filter((o) => o.fulfillmentType === 'Pickup').length;
  const awaitingSignalCount = orders.filter(
    (o) => o.fulfillmentType === 'Pickup' && (o.orderStatus === 'processing' || o.orderStatus === 'finance_verified')
  ).length;

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (fulfillmentFilter === 'delivery') {
      return (o.fulfillmentType || 'Delivery') === 'Delivery';
    }
    if (fulfillmentFilter === 'pickup') {
      return o.fulfillmentType === 'Pickup';
    }
    if (fulfillmentFilter === 'awaiting_signal') {
      return (
        o.fulfillmentType === 'Pickup' &&
        (o.orderStatus === 'processing' || o.orderStatus === 'finance_verified')
      );
    }
    return true;
  });

  return (
    <div style={{ padding: '2rem 2.5rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Deliveries & Plant Pick-ups
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Coordinate jobsite fleet transport and transmit customer ready-for-pickup signals.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <RefreshIcon sx={{ fontSize: 18 }} /> Refresh
        </button>
      </div>

      {actionFeedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 18px',
            borderRadius: 10,
            background: 'rgba(22, 163, 74, 0.12)',
            border: '1px solid rgba(22, 163, 74, 0.3)',
            color: '#15803d',
            marginBottom: '1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
        >
          <NotificationsActiveIcon sx={{ fontSize: 20 }} />
          <span>{actionFeedback.text}</span>
        </div>
      )}

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFulfillmentFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: fulfillmentFilter === 'all' ? '#16a34a' : 'var(--border)',
                background: fulfillmentFilter === 'all' ? 'rgba(22, 163, 74, 0.12)' : 'var(--bg-primary)',
                color: fulfillmentFilter === 'all' ? '#16a34a' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFulfillmentFilter('delivery')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: fulfillmentFilter === 'delivery' ? '#2563eb' : 'var(--border)',
                background: fulfillmentFilter === 'delivery' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-primary)',
                color: fulfillmentFilter === 'delivery' ? '#2563eb' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Fleet Delivery ({deliveryOrdersCount})
            </button>
            <button
              onClick={() => setFulfillmentFilter('pickup')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: fulfillmentFilter === 'pickup' ? '#8b5cf6' : 'var(--border)',
                background: fulfillmentFilter === 'pickup' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-primary)',
                color: fulfillmentFilter === 'pickup' ? '#8b5cf6' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Store Pick-up ({pickupOrdersCount})
            </button>
            {awaitingSignalCount > 0 && (
              <button
                onClick={() => setFulfillmentFilter('awaiting_signal')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: '#f59e0b',
                  background: fulfillmentFilter === 'awaiting_signal' ? '#f59e0b' : 'rgba(245, 158, 11, 0.15)',
                  color: fulfillmentFilter === 'awaiting_signal' ? '#ffffff' : '#b45309',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>🔔 Needs Pick-up Signal</span>
                <span
                  style={{
                    background: fulfillmentFilter === 'awaiting_signal' ? '#ffffff' : '#b45309',
                    color: fulfillmentFilter === 'awaiting_signal' ? '#b45309' : '#ffffff',
                    padding: '1px 6px',
                    borderRadius: 99,
                    fontSize: '0.72rem'
                  }}
                >
                  {awaitingSignalCount}
                </span>
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Order ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Customer & Contact</th>
                <th style={{ padding: '0.85rem 1rem' }}>Fulfillment Method</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Quick Logistics Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isPickup = order.fulfillmentType === 'Pickup';
                const canSignalPickup = isPickup && (order.orderStatus === 'finance_verified' || order.orderStatus === 'processing');
                const isReadyPickup = isPickup && order.orderStatus === 'ready_for_pickup';

                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#16a34a', fontSize: '0.92rem' }}>
                      {order.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {isPickup ? '🏬 Store Pick-up — Dock 1' : (order.address || 'Jobsite Destination')}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 9px',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: isPickup ? 'rgba(139, 92, 246, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                          color: isPickup ? '#8b5cf6' : '#2563eb'
                        }}
                      >
                        {isPickup ? <StorefrontIcon sx={{ fontSize: 14 }} /> : <LocalShippingIcon sx={{ fontSize: 14 }} />}
                        {isPickup ? 'Store Pick-up' : 'Fleet Delivery'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {canSignalPickup && (
                          <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus(order.rawId, 'ready_for_pickup', true)}
                            title="Send Ready for Pick-up signal to customer"
                            style={{
                              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: 7,
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)'
                            }}
                          >
                            <NotificationsActiveIcon sx={{ fontSize: 14 }} />
                            Signal Ready
                          </button>
                        )}

                        {isReadyPickup && (
                          <button
                            disabled={updating}
                            onClick={() => handleUpdateStatus(order.rawId, 'completed')}
                            title="Confirm customer retrieved items"
                            style={{
                              background: 'rgba(22, 163, 74, 0.12)',
                              color: '#16a34a',
                              border: '1px solid rgba(22, 163, 74, 0.4)',
                              padding: '6px 12px',
                              borderRadius: 7,
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 14 }} />
                            Complete Pick-up
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            background: 'rgba(59,130,246,0.1)',
                            color: '#60a5fa',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontWeight: 600,
                            fontSize: '0.78rem'
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: 620, borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Dispatch Control — {selectedOrder.id}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ordered: {new Date(selectedOrder.dateOrdered).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {selectedOrder.fulfillmentType === 'Pickup' && (
                <div
                  style={{
                    background: selectedOrder.orderStatus === 'ready_for_pickup' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid',
                    borderColor: selectedOrder.orderStatus === 'ready_for_pickup' ? 'rgba(22, 163, 74, 0.3)' : 'rgba(139, 92, 246, 0.3)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 24, color: selectedOrder.orderStatus === 'ready_for_pickup' ? '#16a34a' : '#8b5cf6' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: selectedOrder.orderStatus === 'ready_for_pickup' ? '#15803d' : '#6d28d9' }}>
                      {selectedOrder.orderStatus === 'ready_for_pickup'
                        ? 'SIGNAL TRANSMITTED: READY FOR CUSTOMER PICK-UP'
                        : 'CUSTOMER CHOSE STORE / PLANT PICK-UP'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {selectedOrder.orderStatus === 'ready_for_pickup'
                        ? 'Customer has been notified to retrieve sheets at Plant.'
                        : 'Once cutting and staging are complete, transmit the signal below to alert the customer.'}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Customer Info</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selectedOrder.customerName}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{selectedOrder.customerEmail}</p>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Fulfillment Type</p>
                  <p style={{ margin: 0, fontWeight: 800, color: selectedOrder.fulfillmentType === 'Pickup' ? '#8b5cf6' : '#3b82f6' }}>
                    {selectedOrder.fulfillmentType || 'Delivery'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {selectedOrder.fulfillmentType === 'Pickup' ? 'Free Plant Pickup (No Shipping Fee)' : 'Fleet Transport'}
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {selectedOrder.fulfillmentType === 'Pickup' ? 'Pick-up' : 'Shipping Destination'}
                </p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {selectedOrder.fulfillmentType === 'Pickup'
                    ? 'Mega Pacific Roofing — Plant, Imus Main Branch/ Cavite'
                    : (selectedOrder.address || 'N/A')}
                </p>
                {selectedOrder.fulfillmentType !== 'Pickup' && (
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {selectedOrder.cityProvince || ''} {selectedOrder.zipCode || ''}
                  </p>
                )}
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Sheet Specifications to Stage & Release:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {selectedOrder.items.map((i, idx) => {
                      const spec = [
                        i.customLength ? `${i.customLength}m cut length` : null,
                        i.thickness || i.variantName,
                        i.color
                      ].filter(Boolean).join(' · ');
                      return (
                        <li key={idx} style={{ marginBottom: 6 }}>
                          <strong>{i.productName}</strong>
                          {spec && <span style={{ marginLeft: 6, color: '#0284c7' }}>({spec})</span>}
                          <span style={{ marginLeft: 8, fontWeight: 700, color: '#16a34a' }}>× {i.quantity} {i.customLength ? 'sheets' : 'pcs'}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Logistics Actions & Signal Controls:
                </p>

                {(selectedOrder.fulfillmentType === 'Delivery' || !selectedOrder.fulfillmentType) ? (
                  <>
                    {(selectedOrder.orderStatus === 'finance_verified' || selectedOrder.orderStatus === 'processing') && (
                      <button
                        disabled={updating}
                        onClick={() => handleUpdateStatus(selectedOrder.rawId, 'shipped')}
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                      >
                        🚚 Mark as <strong>Shipped (Loaded on Delivery Truck)</strong>
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'shipped' && (
                      <button
                        disabled={updating}
                        onClick={() => handleUpdateStatus(selectedOrder.rawId, 'out_for_delivery')}
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                      >
                        🛣️ Mark as <strong>Out for Delivery (En Route to Jobsite)</strong>
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'out_for_delivery' && (
                      <button
                        disabled={updating}
                        onClick={() => handleUpdateStatus(selectedOrder.rawId, 'completed')}
                        style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontWeight: 700 }}
                      >
                        ✅ Mark as <strong>Delivered & Completed (Signed Handover)</strong>
                      </button>
                    )}
                    {(selectedOrder.orderStatus === 'completed' || selectedOrder.orderStatus === 'delivered') && (
                      <p style={{ color: '#16a34a', fontWeight: 700, margin: 0, padding: '10px 0' }}>✅ Delivery completed successfully.</p>
                    )}
                  </>
                ) : (
                  <>
                    {(selectedOrder.orderStatus === 'finance_verified' || selectedOrder.orderStatus === 'processing') && (
                      <button
                        disabled={updating}
                        onClick={() => handleUpdateStatus(selectedOrder.rawId, 'ready_for_pickup', true)}
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 800,
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}
                      >
                        <NotificationsActiveIcon sx={{ fontSize: 22 }} />
                        <div>
                          <div>Transmit "Ready for Pick-up" Signal to Customer</div>
                          <div style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 400, marginTop: 2 }}>
                            Sends live web socket alert and official pick-up pass email with dock instructions.
                          </div>
                        </div>
                      </button>
                    )}

                    {selectedOrder.orderStatus === 'ready_for_pickup' && (
                      <button
                        disabled={updating}
                        onClick={() => handleUpdateStatus(selectedOrder.rawId, 'completed')}
                        style={{
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          padding: '14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 22 }} />
                        <div>
                          <div>Mark as Picked Up & Handover Completed</div>
                          <div style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 400, marginTop: 2 }}>
                            Customer has verified and loaded the sheets into their vehicle.
                          </div>
                        </div>
                      </button>
                    )}

                    {(selectedOrder.orderStatus === 'completed' || selectedOrder.orderStatus === 'delivered') && (
                      <p style={{ color: '#16a34a', fontWeight: 700, margin: 0, padding: '10px 0' }}>✅ Order picked up and completed.</p>
                    )}
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
