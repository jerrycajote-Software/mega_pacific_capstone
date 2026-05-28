import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Filter,
  Package,
  X,
  Edit2,
  Trash2,
  Loader2,
  ImageIcon,
  Tag,
  DollarSign,
  Layers,
  AlignLeft,
  Link2,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

/* ─── Inline styles (scoped, no class conflicts) ─── */
const S = {
  /* Page wrapper */
  page: {
    padding: '2rem 2.5rem',
    maxWidth: 1100,
    width: '100%',
    color: '#f0f0f0',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  /* ── Header ── */
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.375rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#f0f0f0',
  },
  pageSubtitle: {
    margin: '0.25rem 0 0',
    fontSize: '0.8rem',
    color: '#6b7280',
  },

  /* ── Toolbar ── */
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },

  /* Primary button (Add) */
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 1.1rem',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    fontSize: '0.84rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.18s, transform 0.12s',
    boxShadow: '0 2px 12px rgba(34,197,94,0.30)',
    whiteSpace: 'nowrap',
  },

  /* Ghost button (Filters) */
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 1rem',
    borderRadius: 10,
    border: '1px solid #2e2e2e',
    background: 'transparent',
    color: '#9ca3af',
    fontSize: '0.84rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'border-color 0.18s, color 0.18s, background 0.18s',
    whiteSpace: 'nowrap',
  },

  /* Search wrapper */
  searchWrap: {
    position: 'relative',
    flex: 1,
    minWidth: 220,
    maxWidth: 380,
  },
  searchIcon: {
    position: 'absolute',
    left: 11,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#4b5563',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    background: '#111111',
    border: '1px solid #2e2e2e',
    borderRadius: 10,
    padding: '0.55rem 0.9rem 0.55rem 2.3rem',
    color: '#f0f0f0',
    fontSize: '0.84rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },

  /* ── Empty / loading states ── */
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    border: '1px dashed #2e2e2e',
    borderRadius: 16,
    textAlign: 'center',
    gap: '0.75rem',
    background: 'rgba(255,255,255,0.015)',
  },
  emptyTitle: { margin: 0, fontSize: '1rem', fontWeight: 600, color: '#e5e7eb' },
  emptyText:  { margin: 0, fontSize: '0.8rem', color: '#6b7280' },

  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '3rem 0',
    color: '#6b7280',
    fontSize: '0.875rem',
  },

  /* ── Table card ── */
  tableCard: {
    background: '#111111',
    border: '1px solid #222222',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thead: {
    background: 'rgba(0,0,0,0.3)',
  },
  th: {
    padding: '0.85rem 1.25rem',
    fontSize: '0.68rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#6b7280',
    borderBottom: '1px solid #222222',
    whiteSpace: 'nowrap',
  },
  thRight: {
    padding: '0.85rem 1.25rem',
    fontSize: '0.68rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#6b7280',
    borderBottom: '1px solid #222222',
    textAlign: 'right',
  },
  td: {
    padding: '0.9rem 1.25rem',
    borderBottom: '1px solid rgba(34,34,34,0.6)',
    verticalAlign: 'middle',
  },
  tdRight: {
    padding: '0.9rem 1.25rem',
    borderBottom: '1px solid rgba(34,34,34,0.6)',
    verticalAlign: 'middle',
    textAlign: 'right',
  },

  /* product thumbnail */
  thumb: {
    height: 44,
    width: 44,
    borderRadius: 10,
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid #2e2e2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbImg: { height: '100%', width: '100%', objectFit: 'cover' },

  productName: { fontWeight: 600, fontSize: '0.875rem', color: '#f0f0f0', marginBottom: 2 },
  productDesc: { fontSize: '0.73rem', color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  /* type badge */
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '0.2rem 0.6rem',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #2e2e2e',
    fontSize: '0.73rem',
    color: '#d1d5db',
    whiteSpace: 'nowrap',
  },

  priceMain: { fontSize: '0.875rem', fontWeight: 600, color: '#f0f0f0' },
  priceUnit: { fontSize: '0.68rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 },

  /* stock indicator */
  stockRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },

  /* action buttons */
  actionsWrap: { display: 'flex', justifyContent: 'flex-end', gap: 6 },
  actionBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.35rem', borderRadius: 8, border: 'none',
    background: 'transparent', cursor: 'pointer',
    color: '#6b7280', transition: 'background 0.15s, color 0.15s',
  },

  /* ── Modal overlay ── */
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'rgba(0,0,0,0.72)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    animation: 'fadeInOverlay 0.18s ease',
  },

  /* Modal card */
  modal: {
    background: '#111111',
    border: '1px solid #2e2e2e',
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
    animation: 'slideUpModal 0.22s cubic-bezier(0.16,1,0.3,1)',
  },

  /* Modal header */
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem 1rem',
    borderBottom: '1px solid #1e1e1e',
    position: 'sticky',
    top: 0,
    background: '#111111',
    zIndex: 2,
    borderRadius: '20px 20px 0 0',
  },
  modalTitle: { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f0f0f0' },
  modalSubtitle: { margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#6b7280' },
  closeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid #2e2e2e', background: 'transparent',
    color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s',
    flexShrink: 0,
  },

  /* Modal body */
  modalBody: { padding: '1.25rem 1.5rem 1.5rem' },

  /* Form group (label stacked above input) */
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: {
    fontSize: '0.75rem', fontWeight: 600,
    color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'flex', alignItems: 'center', gap: '0.35rem',
  },
  inputBase: {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    padding: '0.65rem 0.85rem',
    color: '#f0f0f0',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  selectBase: {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    padding: '0.65rem 0.85rem',
    color: '#f0f0f0',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    appearance: 'none',
    cursor: 'pointer',
  },
  selectWrap: { position: 'relative' },
  selectChevron: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    color: '#6b7280', pointerEvents: 'none',
  },
  textareaBase: {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    padding: '0.65rem 0.85rem',
    color: '#f0f0f0',
    fontSize: '0.875rem',
    outline: 'none',
    resize: 'vertical',
    minHeight: 88,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  /* Modal footer */
  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1rem 1.5rem 1.5rem',
  },
  btnCancel: {
    padding: '0.6rem 1.2rem',
    borderRadius: 10,
    border: '1px solid #2e2e2e',
    background: 'transparent',
    color: '#9ca3af',
    fontSize: '0.84rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  btnSave: {
    padding: '0.6rem 1.4rem',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    fontSize: '0.84rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.18s, transform 0.12s',
    boxShadow: '0 2px 12px rgba(34,197,94,0.28)',
  },
};

/* ─── Helper: stock badge ─── */
function StockBadge({ stock }) {
  const isLow = stock <= 10;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '0.2rem 0.65rem', borderRadius: 9999,
      fontSize: '0.73rem', fontWeight: 600,
      background: isLow ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.08)',
      border: `1px solid ${isLow ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
      color: isLow ? '#f87171' : '#4ade80',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: isLow ? '#f87171' : '#22c55e',
        boxShadow: isLow ? '0 0 5px #f87171' : '0 0 5px #22c55e',
      }} />
      {stock} units
    </span>
  );
}

/* ─── Focus style injection ─── */
const focusStyle = `
  @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUpModal {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)  scale(1); }
  }
  .pm-input:focus,
  .pm-select:focus,
  .pm-textarea:focus {
    border-color: rgba(34,197,94,0.55) !important;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.1) !important;
  }
  .pm-search:focus {
    border-color: rgba(34,197,94,0.4) !important;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.08) !important;
  }
  .pm-btn-primary:hover  { opacity: 0.88; transform: translateY(-1px); }
  .pm-btn-ghost:hover    { border-color: #3e3e3e; color: #d1d5db; background: rgba(255,255,255,0.04); }
  .pm-btn-cancel:hover   { border-color: #3e3e3e; color: #d1d5db; }
  .pm-btn-save:hover     { opacity: 0.88; transform: translateY(-1px); }
  .pm-close-btn:hover    { background: rgba(255,255,255,0.06); color: #d1d5db; border-color: #3e3e3e; }
  .pm-action-edit:hover  { background: rgba(96,165,250,0.12); color: #60a5fa; }
  .pm-action-del:hover   { background: rgba(239,68,68,0.12);  color: #f87171; }
  .pm-tr:hover td        { background: rgba(255,255,255,0.025); }
  .pm-tr:last-child td   { border-bottom: none; }
`;

/* ═══════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════ */
const ProductManagement = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '', type: 'Rib Type', description: '',
    price: '', unit: 'per meter', stock: '', imageUrl: ''
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/admin/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      if (editingProduct) {
        await axios.put(`${API_URL}/api/admin/products/${editingProduct.id}`, formData);
      } else {
        await axios.post(`${API_URL}/api/admin/products`, formData);
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('Are you sure you want to delete this product?'))) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        await axios.delete(`${API_URL}/api/admin/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, type: product.type,
        description: product.description || '', price: product.price,
        unit: product.unit, stock: product.stock, imageUrl: product.imageUrl || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', type: 'Rib Type', description: '', price: '', unit: 'per meter', stock: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingProduct(null); };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Inject keyframes + micro-interaction styles */}
      <style>{focusStyle}</style>

      <div style={S.page}>

        {/* ── Page Header ── */}
        <div style={S.pageHeader}>
          <div>
            <h1 style={S.pageTitle}>{t('Inventory Management')}</h1>
            <p style={S.pageSubtitle}>
              {t('Manage your products, stock levels and pricing.')}
            </p>
          </div>

          <button
            className="pm-btn-primary"
            onClick={() => openModal()}
            style={S.btnPrimary}
          >
            <Plus size={15} />
            {t('Add New Product')}
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div style={S.toolbar}>
          {/* Search */}
          <div style={S.searchWrap}>
            <Search size={15} style={S.searchIcon} />
            <input
              className="pm-search"
              type="text"
              placeholder={t('Search by name or category…')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={S.searchInput}
            />
          </div>

          {/* Filter ghost button */}
          <button className="pm-btn-ghost" style={S.btnGhost}>
            <Filter size={14} />
            {t('Filters')}
          </button>

          {/* Count pill */}
          {!loading && (
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.75rem', color: '#6b7280',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #2e2e2e',
              borderRadius: 9999, padding: '0.2rem 0.7rem',
              whiteSpace: 'nowrap',
            }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? t('product') : t('products')}
            </span>
          )}
        </div>

        {/* ── Content Area ── */}
        {loading ? (
          <div style={S.loadingBox}>
            <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', color: '#22c55e' }} />
            {t('Loading your inventory…')}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={S.emptyBox}>
            <Package size={44} strokeWidth={1.2} style={{ color: '#374151' }} />
            <h2 style={S.emptyTitle}>{t('No products found')}</h2>
            <p style={S.emptyText}>
              {searchTerm
                ? t('No results match your search. Try a different term.')
                : t('Add your first product to get started.')}
            </p>
            {!searchTerm && (
              <button
                className="pm-btn-primary"
                onClick={() => openModal()}
                style={{ ...S.btnPrimary, marginTop: '0.5rem' }}
              >
                <Plus size={14} /> {t('Add New Product')}
              </button>
            )}
          </div>
        ) : (
          <div style={S.tableCard}>
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead style={S.thead}>
                  <tr>
                    <th style={S.th}>{t('Product')}</th>
                    <th style={S.th}>{t('Type')}</th>
                    <th style={S.th}>{t('Price')}</th>
                    <th style={S.th}>{t('Stock')}</th>
                    <th style={S.thRight}>{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="pm-tr">
                      {/* Product details */}
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={S.thumb}>
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} style={S.thumbImg} />
                              : <Package size={18} style={{ color: '#374151' }} />
                            }
                          </div>
                          <div>
                            <div style={S.productName}>{p.name}</div>
                            <div style={S.productDesc}>{p.description || t('No description')}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td style={S.td}>
                        <span style={S.typeBadge}>
                          <Tag size={10} style={{ color: '#6b7280' }} />
                          {p.type}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={S.td}>
                        <div style={S.priceMain}>₱{Number(p.price).toLocaleString()}</div>
                        <div style={S.priceUnit}>{p.unit}</div>
                      </td>

                      {/* Stock */}
                      <td style={S.td}>
                        <StockBadge stock={p.stock} />
                      </td>

                      {/* Actions */}
                      <td style={S.tdRight}>
                        <div style={S.actionsWrap}>
                          <button
                            className="pm-action-edit"
                            title={t('Edit')}
                            onClick={() => openModal(p)}
                            style={S.actionBtn}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="pm-action-del"
                            title={t('Delete')}
                            onClick={() => handleDelete(p.id)}
                            style={S.actionBtn}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          Modal Overlay
      ══════════════════════════════════ */}
      {isModalOpen && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={S.modal}>

            {/* Modal Header */}
            <div style={S.modalHeader}>
              <div>
                <h2 style={S.modalTitle}>
                  {editingProduct ? t('Edit Product') : t('Add New Product')}
                </h2>
                <p style={S.modalSubtitle}>
                  {editingProduct
                    ? t('Update product details below.')
                    : t('Fill in the details to create a new product.')}
                </p>
              </div>
              <button
                className="pm-close-btn"
                onClick={closeModal}
                style={S.closeBtn}
                title={t('Close')}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div style={S.modalBody}>

                {/* Product Name */}
                <div style={S.formGroup}>
                  <label style={S.label}>
                    <Package size={11} /> {t('Product Name')}
                  </label>
                  <input
                    className="pm-input"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('e.g. Rib Type Blue')}
                    style={S.inputBase}
                  />
                </div>

                {/* Price + Unit */}
                <div style={S.formRow}>
                  <div style={S.formGroup}>
                    <label style={S.label}>
                      <DollarSign size={11} /> {t('Price (₱)')}
                    </label>
                    <input
                      className="pm-input"
                      name="price"
                      type="number"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="250"
                      style={S.inputBase}
                    />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>
                      <Layers size={11} /> {t('Unit')}
                    </label>
                    <input
                      className="pm-input"
                      name="unit"
                      type="text"
                      required
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder={t('per meter')}
                      style={S.inputBase}
                    />
                  </div>
                </div>

                {/* Stock + Type */}
                <div style={S.formRow}>
                  <div style={S.formGroup}>
                    <label style={S.label}>
                      <AlertTriangle size={11} /> {t('Stock Qty')}
                    </label>
                    <input
                      className="pm-input"
                      name="stock"
                      type="number"
                      required
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="100"
                      style={S.inputBase}
                    />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>
                      <Tag size={11} /> {t('Type')}
                    </label>
                    <div style={S.selectWrap}>
                      <select
                        className="pm-select"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        style={S.selectBase}
                      >
                        <option value="Rib Type">{t('Rib Type')}</option>
                        <option value="Spandrel">{t('Spandrel')}</option>
                        <option value="Flat Type">{t('Flat Type')}</option>
                        <option value="Accessories">{t('Accessories')}</option>
                      </select>
                      <ChevronDown size={13} style={S.selectChevron} />
                    </div>
                  </div>
                </div>

                {/* Image URL */}
                <div style={S.formGroup}>
                  <label style={S.label}>
                    <Link2 size={11} /> {t('Image URL')}
                  </label>
                  <input
                    className="pm-input"
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    style={S.inputBase}
                  />
                </div>

                {/* Description */}
                <div style={{ ...S.formGroup, marginBottom: 0 }}>
                  <label style={S.label}>
                    <AlignLeft size={11} /> {t('Description')}
                  </label>
                  <textarea
                    className="pm-textarea"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t('Tell customers more about this product…')}
                    style={S.textareaBase}
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div style={S.modalFooter}>
                <button
                  type="button"
                  className="pm-btn-cancel"
                  onClick={closeModal}
                  style={S.btnCancel}
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="pm-btn-save"
                  style={S.btnSave}
                >
                  {editingProduct ? t('Update Product') : t('Create Product')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default ProductManagement;
