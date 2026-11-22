import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { getStoredAuthToken } from '../../context/AuthContext';
import LogisticsPaymentProofModal from '../../components/LogisticsPaymentProofModal';
import OrderStatusFilterSelect from '../../components/OrderStatusFilterSelect';
import {
  CustomSearchIcon as SearchIcon,
  CustomChevronRightIcon as ChevronRightIcon,
  CustomCloseIcon as CloseIcon,
  CustomAccessTimeIcon as AccessTimeIcon,
  CustomCheckCircleIcon as CheckCircleIcon,
  CustomStorefrontIcon as StorefrontIcon,
  CustomLocalShippingIcon as LocalShippingIcon
} from '../../components/icons';

const LOGISTICS_STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses', dotColor: null, matches: () => true },
  { value: 'finance_verified', label: 'Finance Verified', dotColor: '#f59e0b', matches: (s) => s === 'finance_verified' },
  { value: 'processing', label: 'Processing', dotColor: '#f59e0b', matches: (s) => s === 'processing' },
  { value: 'shipped', label: 'Shipped', dotColor: '#2563eb', matches: (s) => s === 'shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery', dotColor: '#2563eb', matches: (s) => s === 'out_for_delivery' },
  { value: 'ready_for_pickup', label: 'Ready for Pick-up', dotColor: '#8b5cf6', matches: (s) => s === 'ready_for_pickup' },
  { value: 'completed', label: 'Completed', dotColor: '#16a34a', matches: (s) => s === 'completed' || s === 'delivered' }
];

const checkIsOrderPending50 = (order) =>
  Boolean(
    order?.isPending50Payment ||
    order?.paymentSummary?.isPending50Payment ||
    (order?.paymentStatus || '').toLowerCase().includes('50%')
  );

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [proofModalState, setProofModalState] = useState({
    open: false,
    order: null,
    targetStatus: 'completed'
  });

  const fetchOrders = async () => {
    try {
      const token = getStoredAuthToken();
      if (!token) return;
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/logistic/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(prev => {
          const next = res.data.data || [];
          if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to fetch logistic orders', err);
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

  const handleUpdateStatus = async (id, newStatus, isSignal = false, paymentProofImage = null) => {
    try {
      setUpdating(true);
      const token = getStoredAuthToken();
      if (!token) {
        setActionFeedback({
          type: 'error',
          text: 'Your session has expired. Please sign in again to update this order.'
        });
        return;
      }
      const API_URL = import.meta.env.VITE_API_URL || '';
      const payload = { status: newStatus };
      if (paymentProofImage) {
        payload.paymentProofImage = paymentProofImage;
      }

      const res = await axios.patch(
        `${API_URL}/api/logistic/orders/${id}/status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const updatedRecord = res.data.data || {};
        await fetchOrders();
        if (selectedOrder && selectedOrder.rawId === id) {
          setSelectedOrder((prev) => ({
            ...prev,
            orderStatus: updatedRecord.status || newStatus,
            paymentStatus: updatedRecord.paymentStatus || prev.paymentStatus,
            paymentSummary: updatedRecord.paymentSummary || prev.paymentSummary,
            isPending50Payment: Boolean(updatedRecord.paymentSummary?.isPending50Payment),
            paymentProofUrl: updatedRecord.paymentProofUrl || prev.paymentProofUrl,
            balanceConfirmedAt: updatedRecord.balanceConfirmedAt || prev.balanceConfirmedAt,
            balanceConfirmedByName: updatedRecord.balanceConfirmedByName || prev.balanceConfirmedByName
          }));
        }
        setProofModalState({ open: false, order: null, targetStatus: 'completed' });

        if (newStatus === 'ready_for_pickup') {
          setActionFeedback({
            type: 'success',
            text: 'Ready for Pick-up notice sent! Customer has been alerted via browser notification and email.'
          });
        } else if (newStatus === 'out_for_delivery') {
          setActionFeedback({
            type: 'success',
            text: 'Order marked Out for Delivery! Customer has been notified via browser alert and email.'
          });
        } else if (newStatus === 'completed' || newStatus === 'delivered') {
          setActionFeedback({
            type: 'success',
            text: res.data.message || 'Order completed and full payment confirmed!'
          });
        }
        setTimeout(() => setActionFeedback(null), 6500);
      }
    } catch (err) {
      console.error('Failed to update status', err);
      setActionFeedback({
        type: 'error',
        text: err.response?.data?.error || err.message || 'Failed to update order status.'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Require payment photo proof before completing any order with a remaining 50% balance
  const handleInitiateOrderCompletion = (order, targetStatus = 'completed') => {
    if (checkIsOrderPending50(order)) {
      setProofModalState({
        open: true,
        order,
        targetStatus
      });
      return;
    }
    handleUpdateStatus(order.rawId, targetStatus);
  };

  const handleChangeStatusFilter = (nextStatus) => {
    setStatusFilter(nextStatus);
  };

  const deliveryOrdersCount = orders.filter((o) => (o.fulfillmentType || 'Delivery') === 'Delivery').length;
  const pickupOrdersCount = orders.filter((o) => o.fulfillmentType === 'Pickup').length;
  const awaitingSignalCount = orders.filter(
    (o) => o.fulfillmentType === 'Pickup' && (o.orderStatus === 'processing' || o.orderStatus === 'finance_verified')
  ).length;
  const pending50Count = orders.filter(checkIsOrderPending50).length;

  // Apply fulfillment method filter first so status dropdown counts reflect the active fulfillment tab
  const ordersByFulfillment = useMemo(() => {
    return orders.filter((o) => {
      if (fulfillmentFilter === 'delivery') {
        return (o.fulfillmentType || 'Delivery') === 'Delivery';
      }
      if (fulfillmentFilter === 'pickup') {
        return o.fulfillmentType === 'Pickup';
      }
      if (fulfillmentFilter === 'pending_50') {
        return checkIsOrderPending50(o);
      }
      if (fulfillmentFilter === 'awaiting_signal') {
        return (
          o.fulfillmentType === 'Pickup' &&
          (o.orderStatus === 'processing' || o.orderStatus === 'finance_verified')
        );
      }
      return true;
    });
  }, [orders, fulfillmentFilter]);

  // Count orders per status option within the active fulfillment view
  const statusCounts = useMemo(() => {
    return LOGISTICS_STATUS_FILTERS.reduce((counts, option) => {
      counts[option.value] = ordersByFulfillment.filter((o) =>
        option.matches((o.orderStatus || '').toLowerCase())
      ).length;
      return counts;
    }, {});
  }, [ordersByFulfillment]);

  const activeStatusOption =
    LOGISTICS_STATUS_FILTERS.find((opt) => opt.value === statusFilter) || LOGISTICS_STATUS_FILTERS[0];

  const filteredOrders = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return ordersByFulfillment.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        (o.contactNumber || '').toLowerCase().includes(query) ||
        (o.customerEmail || '').toLowerCase().includes(query);

      if (!matchesSearch) return false;

      return activeStatusOption.matches((o.orderStatus || '').toLowerCase());
    });
  }, [ordersByFulfillment, searchTerm, activeStatusOption]);

  return (
    <div className="logistics-page-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Deliveries &amp; Plant Pick-ups
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Manage truck deliveries, notify pick-up customers, and confirm remaining 50% payments with photo proof.
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 10,
            background: actionFeedback.type === 'error' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(22, 163, 74, 0.12)',
            border: actionFeedback.type === 'error' ? '1px solid rgba(220, 38, 38, 0.35)' : '1px solid rgba(22, 163, 74, 0.3)',
            color: actionFeedback.type === 'error' ? '#dc2626' : '#15803d',
            marginBottom: '1.25rem',
            fontWeight: 700,
            fontSize: '0.88rem'
          }}
        >
          <span>{actionFeedback.text}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            aria-label="Dismiss status message"
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      )}

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', padding: '1.15rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', flex: '1 1 380px' }}>
            <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
              <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
              <input
                type="text"
                placeholder="Search by Order ID, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '42px',
                  padding: '10px 12px 10px 38px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Filter logistics orders by delivery or pick-up status */}
            <OrderStatusFilterSelect
              value={statusFilter}
              onChange={handleChangeStatusFilter}
              options={LOGISTICS_STATUS_FILTERS}
              counts={statusCounts}
              ariaLabel="Filter orders by status"
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setFulfillmentFilter('all')}
              style={{
                minHeight: '38px',
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
              type="button"
              onClick={() => setFulfillmentFilter('delivery')}
              style={{
                minHeight: '38px',
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
              Truck Delivery ({deliveryOrdersCount})
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentFilter('pickup')}
              style={{
                minHeight: '38px',
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
            {pending50Count > 0 && (
              <button
                type="button"
                onClick={() => setFulfillmentFilter('pending_50')}
                style={{
                  minHeight: '38px',
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid #d97706',
                  background: fulfillmentFilter === 'pending_50' ? '#d97706' : 'rgba(245, 158, 11, 0.12)',
                  color: fulfillmentFilter === 'pending_50' ? '#ffffff' : '#b45309',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Pending 50% Balance ({pending50Count})
              </button>
            )}
            {awaitingSignalCount > 0 && (
              <button
                type="button"
                onClick={() => setFulfillmentFilter('awaiting_signal')}
                style={{
                  minHeight: '38px',
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid #f59e0b',
                  background: fulfillmentFilter === 'awaiting_signal' ? '#f59e0b' : 'rgba(245, 158, 11, 0.15)',
                  color: fulfillmentFilter === 'awaiting_signal' ? '#ffffff' : '#b45309',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Needs Pick-up Notice ({awaitingSignalCount})
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="logistics-desktop-table">
          <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Order ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Customer &amp; Contact</th>
                <th style={{ padding: '0.85rem 1rem' }}>Method &amp; Payment</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Quick Logistics Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isPickup = order.fulfillmentType === 'Pickup';
                const isPending50 = checkIsOrderPending50(order);
                const pendingBal = order.pendingBalanceAmount ?? Math.round((order.totalAmount || 0) * 0.5 * 100) / 100;
                const canSignalPickup = isPickup && (order.orderStatus === 'finance_verified' || order.orderStatus === 'processing');
                const isReadyPickup = isPickup && order.orderStatus === 'ready_for_pickup';
                const canCompleteDelivery = !isPickup && order.orderStatus === 'out_for_delivery';

                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#16a34a', fontSize: '0.92rem' }}>
                      {order.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {order.contactNumber || (order.customerEmail && order.customerEmail !== 'Unknown' ? order.customerEmail : 'No contact provided')}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 9px',
                            borderRadius: 6,
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            background: isPickup ? 'rgba(139, 92, 246, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                            color: isPickup ? '#8b5cf6' : '#2563eb'
                          }}
                        >
                          {isPickup ? <StorefrontIcon sx={{ fontSize: 14 }} /> : <LocalShippingIcon sx={{ fontSize: 14 }} />}
                          {isPickup ? 'Store Pick-up' : 'Truck Delivery'}
                        </span>
                        {isPending50 ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            Pending 50%: ₱{pendingBal.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>
                            Paid in Full {order.paymentProofUrl ? '• Photo Proof' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {canSignalPickup && (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() => handleUpdateStatus(order.rawId, 'ready_for_pickup', true)}
                            className="btn-table-signal-ready"
                            style={{
                              border: 'none',
                              padding: '7px 12px',
                              borderRadius: 7,
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.76rem'
                            }}
                          >
                            Notify Ready
                          </button>
                        )}

                        {isReadyPickup && (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() => handleInitiateOrderCompletion(order, 'completed')}
                            className="btn-table-pickup-complete"
                            style={{
                              padding: '7px 12px',
                              borderRadius: 7,
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.76rem'
                            }}
                          >
                            {isPending50 ? 'Confirm 50% & Complete' : 'Complete Pick-up'}
                          </button>
                        )}

                        {canCompleteDelivery && (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() => handleInitiateOrderCompletion(order, 'completed')}
                            className="btn-table-pickup-complete"
                            style={{
                              padding: '7px 12px',
                              borderRadius: 7,
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.76rem'
                            }}
                          >
                            {isPending50 ? 'Confirm 50% & Deliver' : 'Mark Delivered'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="mpi-logistics-action-btn"
                          style={{
                            background: 'rgba(34, 197, 94, 0.08)',
                            color: '#15803d',
                            border: '1px solid rgba(34, 197, 94, 0.28)',
                            padding: '7px 13px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>View Details</span>
                          <ChevronRightIcon sx={{ fontSize: 15 }} />
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

        {/* Mobile Browser Card View (Chrome, Edge, Safari) */}
        <div className="logistics-mobile-cards">
          {filteredOrders.map((order) => {
            const isPickup = order.fulfillmentType === 'Pickup';
            const isPending50 = checkIsOrderPending50(order);
            const pendingBal = order.pendingBalanceAmount ?? Math.round((order.totalAmount || 0) * 0.5 * 100) / 100;
            const canSignalPickup = isPickup && (order.orderStatus === 'finance_verified' || order.orderStatus === 'processing');
            const isReadyPickup = isPickup && order.orderStatus === 'ready_for_pickup';
            const canShip = !isPickup && (order.orderStatus === 'finance_verified' || order.orderStatus === 'processing');
            const canOutForDelivery = !isPickup && order.orderStatus === 'shipped';
            const canCompleteDelivery = !isPickup && order.orderStatus === 'out_for_delivery';

            return (
              <div
                key={`mobile-${order.id}`}
                style={{
                  background: 'var(--bg-primary)',
                  border: isPending50 ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a' }}>{order.id}</span>
                  <StatusBadge status={order.orderStatus} />
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {order.customerName}
                  </div>
                  {order.contactNumber ? (
                    <a
                      href={`tel:${order.contactNumber}`}
                      style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 2 }}
                    >
                      {order.contactNumber}
                    </a>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {order.customerEmail || 'No contact provided'}
                    </div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {isPickup ? 'Store Pick-up (Imus Main Branch)' : (order.address || order.cityProvince || 'Delivery Address')}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 9px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: isPickup ? 'rgba(139, 92, 246, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                      color: isPickup ? '#8b5cf6' : '#2563eb'
                    }}
                  >
                    {isPickup ? 'Store Pick-up' : 'Truck Delivery'}
                  </span>

                  {isPending50 ? (
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#d97706' }}>
                      Pending 50%: ₱{pendingBal.toLocaleString()}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#16a34a' }}>
                      Paid in Full (₱{(order.totalAmount || 0).toLocaleString()})
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {canShip && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(order.rawId, 'shipped')}
                      className="btn-dispatch-step"
                      style={{ width: '100%', minHeight: 44, borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Mark Loaded on Truck
                    </button>
                  )}
                  {canOutForDelivery && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(order.rawId, 'out_for_delivery')}
                      className="btn-dispatch-step"
                      style={{ width: '100%', minHeight: 44, borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Mark Out for Delivery
                    </button>
                  )}
                  {canCompleteDelivery && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleInitiateOrderCompletion(order, 'completed')}
                      className="btn-dispatch-complete"
                      style={{ width: '100%', minHeight: 44, borderRadius: 10, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      {isPending50 ? 'Collect 50% & Complete Delivery' : 'Mark Delivered & Completed'}
                    </button>
                  )}
                  {canSignalPickup && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(order.rawId, 'ready_for_pickup', true)}
                      className="btn-dispatch-signal"
                      style={{ width: '100%', minHeight: 44, borderRadius: 10, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Notify Customer Ready for Pick-up
                    </button>
                  )}
                  {isReadyPickup && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleInitiateOrderCompletion(order, 'completed')}
                      className="btn-dispatch-complete"
                      style={{ width: '100%', minHeight: 44, borderRadius: 10, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      {isPending50 ? 'Collect 50% & Complete Pick-up' : 'Complete Store Pick-up'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      width: '100%',
                      minHeight: 42,
                      background: 'rgba(34, 197, 94, 0.08)',
                      color: '#15803d',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <span>View Order Details</span>
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredOrders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              No orders found matching the filter criteria.
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (() => {
        const modalIsPending50 = checkIsOrderPending50(selectedOrder);
        const modalPendingBalance = selectedOrder.pendingBalanceAmount ?? Math.round((selectedOrder.totalAmount || 0) * 0.5 * 100) / 100;
        const modalCollected = selectedOrder.collectedAmount ?? Math.max(0, (selectedOrder.totalAmount || 0) - modalPendingBalance);

        return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250, padding: '0.75rem' }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: 620, maxHeight: '90dvh', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800 }}>Order Details — {selectedOrder.id}</h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Ordered: {new Date(selectedOrder.dateOrdered).toLocaleString('en-US', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} PHT
                </span>
              </div>
              <button type="button" aria-label="Close order details" onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: '1 1 auto' }}>
              {modalIsPending50 ? (
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: '1rem',
                    fontSize: '0.84rem'
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#d97706' }}>
                    Pending 50% Balance to Collect: ₱{modalPendingBalance.toLocaleString()}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.45 }}>
                    50% Downpayment Paid (₱{modalCollected.toLocaleString()}). Collect the remaining 50% and attach a photo proof when marking this order completed.
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(22, 163, 74, 0.08)',
                    border: '1px solid rgba(22, 163, 74, 0.25)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginBottom: '1rem',
                    fontSize: '0.83rem',
                    color: '#15803d',
                    fontWeight: 700
                  }}
                >
                  Payment Status: Paid in Full (₱{(selectedOrder.totalAmount || 0).toLocaleString()})
                </div>
              )}

              {selectedOrder.paymentProofUrl && (
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(22, 163, 74, 0.3)',
                    borderRadius: 10,
                    padding: '12px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap'
                  }}
                >
                  <a href={selectedOrder.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedOrder.paymentProofUrl}
                      alt="Confirmed payment proof"
                      style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(22,163,74,0.35)' }}
                    />
                  </a>
                  <div style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 800, color: '#16a34a' }}>Final Payment Photo Proof Recorded</div>
                    {selectedOrder.balanceConfirmedByName && (
                      <div style={{ color: 'var(--text-secondary)' }}>Confirmed by: {selectedOrder.balanceConfirmedByName}</div>
                    )}
                    {selectedOrder.balanceConfirmedAt && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                        {new Date(selectedOrder.balanceConfirmedAt).toLocaleString('en-US', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} PHT
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedOrder.fulfillmentType === 'Pickup' && (
                <div
                  style={{
                    background: selectedOrder.orderStatus === 'ready_for_pickup' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid',
                    borderColor: selectedOrder.orderStatus === 'ready_for_pickup' ? 'rgba(22, 163, 74, 0.3)' : 'rgba(139, 92, 246, 0.3)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 24, color: selectedOrder.orderStatus === 'ready_for_pickup' ? '#16a34a' : '#8b5cf6' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: selectedOrder.orderStatus === 'ready_for_pickup' ? '#15803d' : '#6d28d9' }}>
                      {selectedOrder.orderStatus === 'ready_for_pickup'
                        ? 'CUSTOMER NOTIFIED: READY FOR STORE PICK-UP'
                        : 'CUSTOMER CHOSE STORE / PLANT PICK-UP'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {selectedOrder.orderStatus === 'ready_for_pickup'
                        ? 'Customer has been notified to pick up sheets at Plant.'
                        : 'Once cutting and preparation are complete, click below to notify the customer.'}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Customer Info</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selectedOrder.customerName}</p>
                  {selectedOrder.contactNumber && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{selectedOrder.contactNumber}</p>
                  )}
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>{selectedOrder.customerEmail}</p>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Delivery &amp; Plan</p>
                  <p style={{ margin: 0, fontWeight: 800, color: selectedOrder.fulfillmentType === 'Pickup' ? '#8b5cf6' : '#3b82f6' }}>
                    {selectedOrder.fulfillmentType || 'Delivery'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {selectedOrder.paymentMode || 'Standard Payment'}
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {selectedOrder.fulfillmentType === 'Pickup' ? 'Pick-up' : 'Shipping Destination'}
                </p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {selectedOrder.fulfillmentType === 'Pickup'
                    ? 'Mega Pacific Metal and Steel — Located, Imus Main Branch/ Cavite'
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
                    Sheet Specifications to Prepare &amp; Release:
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
                          <span style={{ marginLeft: 8, fontWeight: 700, color: '#16a34a' }}>
                            × {i.quantity} {i.customLength ? (i.quantity === 1 ? 'sheet' : 'sheets') : (i.quantity === 1 ? 'pc' : 'pcs')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Logistics Actions:
                </p>

                {(selectedOrder.fulfillmentType === 'Delivery' || !selectedOrder.fulfillmentType) ? (
                  <>
                    {(selectedOrder.orderStatus === 'finance_verified' || selectedOrder.orderStatus === 'processing') && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus(selectedOrder.rawId, 'shipped')}
                        className="btn-dispatch-step"
                        style={{ minHeight: 46, padding: '12px 16px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                      >
                        Mark as <strong>Shipped (Loaded on Delivery Truck)</strong>
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'shipped' && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus(selectedOrder.rawId, 'out_for_delivery')}
                        className="btn-dispatch-step"
                        style={{ minHeight: 46, padding: '12px 16px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                      >
                        Mark as <strong>Out for Delivery (On the Way to Customer)</strong>
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'out_for_delivery' && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleInitiateOrderCompletion(selectedOrder, 'completed')}
                        className="btn-dispatch-complete"
                        style={{ minHeight: 46, padding: '12px 16px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontWeight: 700 }}
                      >
                        {modalIsPending50
                          ? `Confirm Remaining 50% (₱${modalPendingBalance.toLocaleString()}) with Photo Proof & Complete`
                          : 'Mark as Delivered & Completed (Signed Handover)'}
                      </button>
                    )}
                    {(selectedOrder.orderStatus === 'completed' || selectedOrder.orderStatus === 'delivered') && (
                      <p style={{ color: '#16a34a', fontWeight: 700, margin: 0, padding: '10px 0' }}>
                        Delivery completed and confirmed in system.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {(selectedOrder.orderStatus === 'finance_verified' || selectedOrder.orderStatus === 'processing') && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus(selectedOrder.rawId, 'ready_for_pickup', true)}
                        className="btn-dispatch-signal"
                        style={{
                          minHeight: 48,
                          padding: '12px 16px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 800
                        }}
                      >
                        <div>Notify Customer: Order Ready for Pick-up</div>
                        <div style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 400, marginTop: 2 }}>
                          Sends browser notification and official pick-up email with instructions.
                        </div>
                      </button>
                    )}

                    {selectedOrder.orderStatus === 'ready_for_pickup' && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleInitiateOrderCompletion(selectedOrder, 'completed')}
                        className="btn-dispatch-complete"
                        style={{
                          minHeight: 48,
                          padding: '12px 16px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 700
                        }}
                      >
                        <div>
                          {modalIsPending50
                            ? `Collect 50% Balance (₱${modalPendingBalance.toLocaleString()}) with Photo Proof & Complete Pick-up`
                            : 'Mark as Picked Up & Handover Completed'}
                        </div>
                        <div style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 400, marginTop: 2 }}>
                          {modalIsPending50
                            ? 'Requires attaching a payment photo so Finance, Sales, and Owner record 100% full payment.'
                            : 'Customer has verified and loaded the sheets into their vehicle.'}
                        </div>
                      </button>
                    )}

                    {(selectedOrder.orderStatus === 'completed' || selectedOrder.orderStatus === 'delivered') && (
                      <p style={{ color: '#16a34a', fontWeight: 700, margin: 0, padding: '10px 0' }}>
                        Order picked up and completed in system.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      <LogisticsPaymentProofModal
        open={proofModalState.open}
        order={proofModalState.order}
        targetStatus={proofModalState.targetStatus}
        onClose={() => setProofModalState({ open: false, order: null, targetStatus: 'completed' })}
        onConfirmPaymentCompletion={(orderId, status, proofDataUrl) =>
          handleUpdateStatus(orderId, status, false, proofDataUrl)
        }
        isSubmitting={updating}
      />
    </div>
  );
};

export default DeliveriesPage;
