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

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    Icon: Clock,
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  processing: {
    label: 'Processing',
    Icon: Package,
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    Icon: Truck,
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
  delivered: {
    label: 'Delivered',
    Icon: CheckCircle2,
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    Icon: XCircle,
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
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

/* ─────────────────────────────────────────────
   Status Badge
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Order Card
───────────────────────────────────────────── */
const OrderCard = ({ order, onClick }) => {
  const previewImages = order.items
    .slice(0, 3)
    .map((item) => item.product?.imageUrls?.[0] || item.product?.imageUrl)
    .filter(Boolean);

  const totalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden
                 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10
                 transition-all duration-300 cursor-pointer"
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
            <h2 className="text-xl font-extrabold text-white">
              #{String(order.id).padStart(4, '0')}
            </h2>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Product images + names */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex -space-x-3">
            {previewImages.length > 0 ? (
              previewImages.map((url, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-xl border-2 border-[#111111] overflow-hidden bg-gray-800 flex-shrink-0"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                <Package size={20} className="text-gray-500" />
              </div>
            )}
            {order.items.length > 3 && (
              <div className="w-12 h-12 rounded-xl border-2 border-[#111111] bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-medium flex-shrink-0">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {order.items.map((i) => i.product?.name).filter(Boolean).join(', ')}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {order.items.length} product{order.items.length !== 1 ? 's' : ''} · {totalQty} unit
              {totalQty !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-800/70">
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Calendar size={11} /> Date
            </p>
            <p className="text-sm text-gray-300 font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <CreditCard size={11} /> Payment
            </p>
            <p className="text-sm text-gray-300 font-medium capitalize">
              {order.paymentMode || '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-sm font-extrabold text-blue-400">{formatCurrency(order.total)}</p>
          </div>
        </div>
      </div>

      {/* Hover CTA */}
      <div className="px-6 pb-5 flex items-center gap-2 text-blue-400 text-xs font-semibold opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300">
        View full details <ChevronRight size={14} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
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
        setOrders(res.data.data);
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

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status?.toLowerCase() === 'delivered').length;
    const pending = orders.filter((o) =>
      ['pending', 'processing', 'out_for_delivery'].includes(o.status?.toLowerCase())
    ).length;
    const totalSpent = orders.reduce((acc, o) => acc + Number(o.total), 0);
    return { total, delivered, pending, totalSpent };
  }, [orders]);

  /* ── Render ── */
  return (
    <div className="animate-fade-in-up pb-20 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
          <ShoppingBag className="text-blue-500" size={36} />
          My Orders
        </h1>
        <p className="text-gray-400 mt-2">Track and manage all your previous purchases.</p>
      </div>

      {/* Stats strip */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: stats.total, color: 'text-white' },
            { label: 'Delivered', value: stats.delivered, color: 'text-emerald-400' },
            { label: 'In Progress', value: stats.pending, color: 'text-amber-400' },
            {
              label: 'Total Spent',
              value: formatCurrency(stats.totalSpent),
              color: 'text-blue-400',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#111111] border border-gray-800 rounded-2xl px-5 py-4"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
            <Search size={17} />
          </div>
          <input
            type="text"
            id="orders-search"
            placeholder="Search by order ID, product name, payment method…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111111] border border-gray-800 rounded-xl py-3 pl-10 pr-4
                       text-white placeholder-gray-600 text-sm
                       focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50
                       transition-all"
          />
        </div>

        {/* Filter dropdown */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Filter size={15} />
          </div>
          <select
            id="orders-filter"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="appearance-none bg-[#111111] border border-gray-800 rounded-xl py-3 pl-9 pr-8
                       text-sm text-gray-300
                       focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50
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

      {/* Quick filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${
                activeFilter === opt.value
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-[#111111] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
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

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 size={44} className="text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading your orders…</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-8 text-center">
          <XCircle size={40} className="mx-auto mb-3 text-red-500" />
          <p className="font-semibold mb-4">{error}</p>
          <button
            onClick={fetchMyOrders}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-5 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-16 text-center">
          <ShoppingBag size={52} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {orders.length === 0 ? "You haven't placed any orders yet" : 'No orders match your search'}
          </h3>
          <p className="text-gray-500 mb-6">
            {orders.length === 0
              ? 'Browse our catalog and start shopping!'
              : 'Try adjusting your filters or search terms.'}
          </p>
          {orders.length === 0 && (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/30"
            >
              Browse Products
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">
            Showing <span className="text-white font-semibold">{filteredOrders.length}</span> order
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
