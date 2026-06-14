import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Filter, RefreshCw, Eye, CheckCircle2, XCircle, Clock, Truck,
  CreditCard, ChevronLeft, ChevronRight, Package, MapPin, Calendar, X, Shuffle
} from 'lucide-react';
import { ShippingInfoMapper } from '../../utils/ShippingInfoMapper';
import { EstimatedDeliveryValidator } from '../../utils/EstimatedDeliveryValidator';

const th = {
  padding: '1rem 1.25rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: '#9ca3af',
  background: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid #2e2e2e',
  whiteSpace: 'nowrap'
};

const td = {
  padding: '1rem 1.25rem',
  fontSize: '0.85rem',
  color: '#d1d5db',
  borderBottom: '1px solid #1a1a1a',
};

const statusMap = {
  completed: { cls: 'badge-green', Icon: CheckCircle2 },
  delivered: { cls: 'badge-green', Icon: CheckCircle2 },
  pending: { cls: 'badge-amber', Icon: Clock },
  shipped: { cls: 'badge-blue', Icon: Truck },
  out_for_delivery: { cls: 'badge-blue', Icon: Truck },
  cancelled: { cls: 'badge-red', Icon: XCircle },
};

const paymentStatusMap = {
  paid: { cls: 'badge-green', Icon: CheckCircle2 },
  unpaid: { cls: 'badge-amber', Icon: Clock },
};

const StatusBadge = ({ status, type = 'order' }) => {
  const s = status ? status.toLowerCase() : '';
  const map = type === 'payment' ? paymentStatusMap : statusMap;
  const config = map[s] || { cls: 'badge-blue', Icon: Clock };
  const { cls, Icon } = config;
  return (
    <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 99 }}>
      <Icon size={12} />
      <span style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spin, setSpin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');


  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');

 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const refresh = () => {
    setSpin(true);
    fetchOrders().then(() => setTimeout(() => setSpin(false), 800));
  };

  const handleUpdateStatus = async (id, newStatus, newPaymentStatus = null) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const payload = { status: newStatus };
      if (newPaymentStatus) payload.paymentStatus = newPaymentStatus;

      const res = await axios.patch(`${API_URL}/api/admin/orders/${id}/status`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        await fetchOrders();
        if (selectedOrder && selectedOrder.rawId === id) {
          setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus, paymentStatus: newPaymentStatus || prev.paymentStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateDeliveryDate = async () => {
    if (!selectedOrder || !deliveryDate) return;
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const res = await axios.patch(`${API_URL}/api/admin/orders/${selectedOrder.rawId}/status`, { estimatedDeliveryDate: deliveryDate }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        await fetchOrders();
        setSelectedOrder(prev => ({ ...prev, estimatedDeliveryDate: deliveryDate }));
      }
    } catch (err) {
      console.error('Failed to update delivery date', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setDeliveryDate(order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : '');
  };

  
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'All' || order.orderStatus.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

 
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#9ca3af' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
        Loading Orders...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
     
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Order Management</h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
            View and manage all customer orders from the platform.
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 10,
            color: '#9ca3af', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#e5e7eb'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#9ca3af'; }}
        >
          <RefreshCw size={15} style={{ animation: spin ? 'spin 0.8s linear infinite' : 'none', color: spin ? '#22c55e' : 'inherit' }} />
          Refresh Data
        </button>
      </div>

     
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#121212', padding: '1rem', borderRadius: 16, border: '1px solid #1f1f1f',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} color="#6b7280" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', background: '#0a0a0a', border: '1px solid #2e2e2e',
                padding: '10px 14px 10px 38px', borderRadius: 10, color: '#e5e7eb', fontSize: '0.85rem',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#22c55e'}
              onBlur={e => e.target.style.borderColor = '#2e2e2e'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Filter size={14} color="#6b7280" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              style={{
                appearance: 'none', background: '#0a0a0a', border: '1px solid #2e2e2e',
                padding: '10px 32px', borderRadius: 10, color: '#e5e7eb', fontSize: '0.85rem',
                outline: 'none', cursor: 'pointer', minWidth: '140px'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      
      <div style={{ background: '#121212', borderRadius: 16, border: '1px solid #1f1f1f', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr>
              <th style={th}>Order ID</th>
              <th style={th}>Customer</th>
              <th style={th}>Products Summary</th>
              <th style={th}>Qty</th>
              <th style={th}>Amount</th>
              <th style={th}>Date Ordered</th>
              <th style={th}>Payment Mode</th>
              <th style={th}>Order Status</th>
              <th style={{ ...th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                  No orders found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedOrders.map(order => (
                <tr key={order.id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...td, fontFamily: 'monospace', color: '#4ade80', fontWeight: 600 }}>{order.id}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 500, color: '#e5e7eb' }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ ...td, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.productsSummary}>
                    {order.productsSummary}
                  </td>
                  <td style={td}>{order.totalQuantity}</td>
                  <td style={{ ...td, color: '#22c55e', fontWeight: 600 }}>₱{order.totalAmount.toLocaleString()}</td>
                  <td style={{ ...td, color: '#9ca3af', fontSize: '0.8rem' }}>
                    {new Date(order.dateOrdered).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: '0.8rem', color: '#e5e7eb', background: '#1a1a1a', padding: '4px 8px', borderRadius: 6, border: '1px solid #2e2e2e' }}>
                      {order.paymentMode}
                    </span>
                  </td>
                  <td style={td}><StatusBadge status={order.orderStatus} /></td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        style={{ background: 'rgba(59,130,246,0.1)', border: 'none', padding: '6px', borderRadius: 6, color: '#60a5fa', cursor: 'pointer' }}
                        onClick={() => openModal(order)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Action Shortcuts */}
                      {/* {order.orderStatus === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.rawId, 'shipped')}
                          style={{ background: 'rgba(34,197,94,0.1)', border: 'none', padding: '6px', borderRadius: 6, color: '#4ade80', cursor: 'pointer' }}
                          title="Mark as Shipped"
                        >
                          <Truck size={16} />
                        </button>
                      )} */}
                      
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid #1a1a1a' }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: currentPage === 1 ? 'transparent' : '#1a1a1a',
                  border: `1px solid ${currentPage === 1 ? '#2e2e2e' : '#3f3f46'}`,
                  color: currentPage === 1 ? '#4b5563' : '#e5e7eb',
                  padding: '6px', borderRadius: 6, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  style={{
                    background: currentPage === idx + 1 ? '#22c55e' : 'transparent',
                    border: `1px solid ${currentPage === idx + 1 ? '#22c55e' : '#2e2e2e'}`,
                    color: currentPage === idx + 1 ? '#000' : '#e5e7eb',
                    fontWeight: currentPage === idx + 1 ? 600 : 400,
                    width: 30, height: 30, borderRadius: 6, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
                  }}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: currentPage === totalPages ? 'transparent' : '#1a1a1a',
                  border: `1px solid ${currentPage === totalPages ? '#2e2e2e' : '#3f3f46'}`,
                  color: currentPage === totalPages ? '#4b5563' : '#e5e7eb',
                  padding: '6px', borderRadius: 6, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

     
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#111111] border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

            
            <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-[#111111]/90 backdrop-blur-md z-10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  Order Details <span className="text-blue-500">{selectedOrder.id}</span>
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Placed on {new Date(selectedOrder.dateOrdered).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

           
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2 space-y-6">
               
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                    <MapPin size={18} className="text-blue-500" /> Customer & Shipping Info
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="text-sm text-gray-200">{ShippingInfoMapper.map(selectedOrder)?.fullName}</p>
                      <p className="text-sm text-gray-400">{ShippingInfoMapper.map(selectedOrder)?.email}</p>
                      <p className="text-sm text-gray-400">{ShippingInfoMapper.map(selectedOrder)?.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <StatusBadge status={selectedOrder.orderStatus} />
                      <p className="text-xs text-gray-500 mt-3 mb-1">Payment Method</p>
                      <p className="text-sm text-gray-200">{ShippingInfoMapper.map(selectedOrder)?.paymentMethod}</p>
                    </div>
                    <div className="col-span-2 mt-2">
                      <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-300">
                        {ShippingInfoMapper.map(selectedOrder)?.address}<br/>
                        {ShippingInfoMapper.map(selectedOrder)?.cityProvince}<br/>
                        {ShippingInfoMapper.map(selectedOrder)?.zipCode}
                      </p>
                      {ShippingInfoMapper.map(selectedOrder)?.notes && ShippingInfoMapper.map(selectedOrder)?.notes !== "None" && (
                        <>
                          <p className="text-xs text-gray-500 mt-3 mb-1">Order Notes</p>
                          <p className="text-sm text-gray-300 italic">"{ShippingInfoMapper.map(selectedOrder)?.notes}"</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                    <Package size={18} className="text-blue-500" /> Order Items
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map(item => (
                        <div key={item.id} className="flex justify-between items-start p-3 bg-[#111111] rounded-xl border border-gray-800/50">
                          <div>
                            <p className="text-sm text-gray-200 font-medium">{item.productName}</p>
                            {item.variantName && (
                              <div className="flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md w-fit">
                                <Shuffle size={10} className="text-blue-400" />
                                <span className="text-blue-400 text-xs font-semibold">{item.variantName}</span>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-400 font-semibold">₱{item.price.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">unit price</p>
                            <p className="text-xs text-gray-400 mt-1">= ₱{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-300">{selectedOrder.productsSummary}</p>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between font-medium border-t border-gray-800 pt-3">
                    <span className="text-gray-400">Total Quantity: {selectedOrder.totalQuantity}</span>
                    <span className="text-blue-400">Total Amount: ₱{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

             
              <div className="space-y-6">

                
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm border-b border-gray-800 pb-2">
                    <Calendar size={16} className="text-blue-500" /> Estimated Delivery
                  </h4>
                  <div className="flex flex-col gap-3">
                    <input
                      type="date"
                      min={EstimatedDeliveryValidator.getMinDate()}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      disabled={!EstimatedDeliveryValidator.canEditDate(selectedOrder.orderStatus)}
                      className="bg-[#111111] border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {!EstimatedDeliveryValidator.canEditDate(selectedOrder.orderStatus) && (
                      <p className="text-xs text-amber-500/80 italic">
                        Delivery date locked because the order is {selectedOrder.orderStatus.replace(/_/g, ' ')}.
                      </p>
                    )}
                    <button
                      onClick={handleUpdateDeliveryDate}
                      disabled={isUpdating || !EstimatedDeliveryValidator.canEditDate(selectedOrder.orderStatus)}
                      className="bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-sm text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Date
                    </button>
                  </div>
                </div>

               
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm border-b border-gray-800 pb-2">
                    <CheckCircle2 size={16} className="text-blue-500" /> Update Order Status
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selectedOrder.orderStatus === 'pending' && (
                      <button onClick={() => handleUpdateStatus(selectedOrder.rawId, 'shipped')} disabled={isUpdating} className="w-full text-left px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium rounded-lg transition-colors border border-blue-500/20 flex items-center gap-2">
                        <Truck size={14} /> Mark as Shipped
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'shipped' && (
                      <button onClick={() => handleUpdateStatus(selectedOrder.rawId, 'out_for_delivery')} disabled={isUpdating} className="w-full text-left px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium rounded-lg transition-colors border border-amber-500/20 flex items-center gap-2">
                        <Truck size={14} /> Out for Delivery
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'out_for_delivery' && (
                      <button onClick={() => handleUpdateStatus(selectedOrder.rawId, 'delivered', 'paid')} disabled={isUpdating} className="w-full text-left px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium rounded-lg transition-colors border border-green-500/20 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Mark Delivered & Paid
                      </button>
                    )}
                    {(selectedOrder.orderStatus === 'pending' || selectedOrder.orderStatus === 'shipped') && (
                      <button onClick={() => handleUpdateStatus(selectedOrder.rawId, 'cancelled')} disabled={isUpdating} className="w-full text-left px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/20 flex items-center gap-2 mt-4">
                        <XCircle size={14} /> Cancel Order
                      </button>
                    )}

                    {(selectedOrder.orderStatus === 'delivered' || selectedOrder.orderStatus === 'cancelled') && (
                      <p className="text-xs text-gray-500 italic text-center py-2">No further status updates available.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default OrderManagement;
