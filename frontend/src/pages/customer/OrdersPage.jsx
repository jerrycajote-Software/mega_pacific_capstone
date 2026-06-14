import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Search,
  Loader2,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Filter,
  ShoppingBag,
  Calendar,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';



const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    Icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  processing: {
    label: 'Processing',
    Icon: Package,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    Icon: Truck,
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  delivered: {
    label: 'Delivered',
    Icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    Icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatCurrency = (amount) =>
  `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;



const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase() || 'pending';
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.pending;
  const { Icon, label, bg, text, border, dot } = cfg;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${bg} ${text} ${border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};


const OrderCard = ({ order, onClick }) => {
  const previewImages = order.items
    .slice(0, 3)
    .map((item) => item.product?.imageUrls?.[0] || item.product?.imageUrl)
    .filter(Boolean);

  const totalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden
                 hover:border-gray-300 hover:shadow-md hover:shadow-gray-200
                 transition-all duration-300 cursor-pointer"
    >
      
      <div className="h-0.5 w-full bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6">
      
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Order ID</p>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              #{String(order.id).padStart(4, '0')}
            </h2>
          </div>
          <StatusBadge status={order.status} />
        </div>

       
        <div className="flex items-center gap-3 mb-5">
          <div className="flex -space-x-3">
            {previewImages.length > 0 ? (
              previewImages.map((url, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden bg-gray-50 flex-shrink-0"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <Package size={20} className="text-gray-400" />
              </div>
            )}
            {order.items.length > 3 && (
              <div className="w-12 h-12 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-bold flex-shrink-0">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 font-bold text-sm truncate">
              {order.items.map((i) => i.product?.name).filter(Boolean).join(', ')}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {order.items.length} product{order.items.length !== 1 ? 's' : ''} · {totalQty} unit
              {totalQty !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

     
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1 font-bold">
              <Calendar size={11} /> Date
            </p>
            <p className="text-sm text-gray-700 font-bold">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1 font-bold">
              <CreditCard size={11} /> Payment
            </p>
            <p className="text-sm text-gray-700 font-bold capitalize">
              {order.paymentMode || '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1 font-bold">Total</p>
            <p className="text-sm font-extrabold text-gray-900">{formatCurrency(order.total)}</p>
          </div>
        </div>
      </div>

     
      <div className="px-6 pb-5 flex items-center gap-2 text-gray-600 text-xs font-bold opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300">
        View full details <ChevronRight size={14} />
      </div>
    </div>
  );
};



const OrdersPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchMyOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/customer/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const mappedOrders = res.data.data.map(o => ({
          ...o,
          status: o.status.toLowerCase() === 'shipped' ? 'processing' : o.status
        }));
        setOrders(mappedOrders);
      } else {
        setError(res.data.error || 'Failed to load orders.');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      const status = err.response?.status;
      const serverMsg = err.response?.data?.error;
      if (status === 401) {
        setError('Your session has expired. Please log out and log back in.');
      } else if (status === 403) {
        setError('Access denied. Please contact support.');
      } else if (serverMsg) {
        setError(serverMsg);
      } else {
        setError('Could not connect to the server. Check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyOrders();
    } else {
      setLoading(false);
      setError('You are not logged in. Please log in to view your orders.');
    }
  }, [token]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter =
        activeFilter === 'all' || o.status?.toLowerCase() === activeFilter;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        String(o.id).includes(searchLower) ||
        o.items.some((item) => item.product?.name?.toLowerCase().includes(searchLower)) ||
        o.paymentMode?.toLowerCase().includes(searchLower) ||
        o.status?.toLowerCase().includes(searchLower);

      return matchesFilter && matchesSearch;
    });
  }, [orders, searchTerm, activeFilter]);

  
  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status?.toLowerCase() === 'delivered').length;
    const pending = orders.filter((o) =>
      ['pending', 'processing', 'out_for_delivery'].includes(o.status?.toLowerCase())
    ).length;
    const totalSpent = orders.reduce((acc, o) => acc + Number(o.total), 0);
    return { total, delivered, pending, totalSpent };
  }, [orders]);

 
  return (
    <div className="animate-fade-in-up pb-20 max-w-6xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
     
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

     
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
          <ShoppingBag className="text-gray-700" size={36} />
          My Orders
        </h1>
        <p className="text-gray-600 mt-2 font-medium">Track and manage all your previous and current purchases.</p>
      </div>

     
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: stats.total, color: 'text-gray-900' },
            { label: 'Delivered', value: stats.delivered, color: 'text-emerald-600' },
            { label: 'In Progress', value: stats.pending, color: 'text-amber-600' },
            {
              label: 'Total Spent',
              value: formatCurrency(stats.totalSpent),
              color: 'text-gray-900',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-4"
            >
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{s.label}</p>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

     
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
       
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-700 transition-colors">
            <Search size={17} />
          </div>
          <input
            type="text"
            id="orders-search"
            placeholder="Search by order ID, product name, payment method…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 shadow-sm rounded-xl py-3 pl-10 pr-4
                       text-gray-900 placeholder-gray-400 text-sm font-medium
                       focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400/50
                       transition-all"
          />
        </div>

        
        <div className="relative flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Filter size={15} />
          </div>
          <select
            id="orders-filter"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 shadow-sm rounded-xl py-3 pl-9 pr-8
                       text-sm text-gray-700 font-bold
                       focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400/50
                       transition-all cursor-pointer"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronRight
            size={14}
            className="absolute inset-y-0 right-3 my-auto text-gray-500 rotate-90 pointer-events-none"
          />
        </div>
      </div>

      
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all
              ${activeFilter === opt.value
                ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 shadow-sm'
              }`}
          >
            {opt.label}
            {opt.value !== 'all' && (
              <span className="ml-1.5 opacity-70">
                ({orders.filter((o) => o.status?.toLowerCase() === opt.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 size={44} className="text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600 font-bold">Loading your orders…</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-red-200 text-red-600 rounded-2xl p-8 text-center shadow-sm">
          <XCircle size={40} className="mx-auto mb-3 text-red-500" />
          <p className="font-bold mb-4">{error}</p>
          <button
            onClick={fetchMyOrders}
            className="bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 px-5 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-16 text-center">
          <ShoppingBag size={52} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {orders.length === 0 ? "You haven't placed any orders yet" : 'No orders match your search'}
          </h3>
          <p className="text-gray-500 mb-6 font-medium">
            {orders.length === 0
              ? 'Browse our catalog and start shopping!'
              : 'Try adjusting your filters or search terms.'}
          </p>
          {orders.length === 0 && (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              Browse Products
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-gray-600 text-sm mb-4 font-bold">
            Showing <span className="text-gray-900 font-extrabold">{filteredOrders.length}</span> order
            {filteredOrders.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/order/${order.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
