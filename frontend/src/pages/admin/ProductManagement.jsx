import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  UploadCloud,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Shuffle,
  Save,
  PlusCircle,
} from 'lucide-react';
import AddProductTypeModal from './AddProductTypeModal';
import { ProductStockCalculator } from '../../utils/ProductStockCalculator';

/* ─── Inline styles (scoped, no class conflicts) ─── */
const S = {
  page: { padding: '2rem 2.5rem', maxWidth: 1100, width: '100%', color: '#f0f0f0', fontFamily: "'Inter', system-ui, sans-serif" },
  pageHeader: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' },
  pageTitle: { margin: 0, fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f0f0' },
  pageSubtitle: { margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#6b7280' },
  toolbar: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.1rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.18s, transform 0.12s', boxShadow: '0 2px 12px rgba(34,197,94,0.30)', whiteSpace: 'nowrap' },
  btnGhost: { display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', borderRadius: 10, border: '1px solid #2e2e2e', background: 'transparent', color: '#9ca3af', fontSize: '0.84rem', fontWeight: 500, cursor: 'pointer', transition: 'border-color 0.18s, color 0.18s, background 0.18s', whiteSpace: 'nowrap' },
  searchWrap: { position: 'relative', flex: 1, minWidth: 220, maxWidth: 380 },
  searchIcon: { position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none' },
  searchInput: { width: '100%', background: '#111111', border: '1px solid #2e2e2e', borderRadius: 10, padding: '0.55rem 0.9rem 0.55rem 2.3rem', color: '#f0f0f0', fontSize: '0.84rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', border: '1px dashed #2e2e2e', borderRadius: 16, textAlign: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.015)' },
  emptyTitle: { margin: 0, fontSize: '1rem', fontWeight: 600, color: '#e5e7eb' },
  emptyText: { margin: 0, fontSize: '0.8rem', color: '#6b7280' },
  loadingBox: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '3rem 0', color: '#6b7280', fontSize: '0.875rem' },
  tableCard: { background: '#111111', border: '1px solid #222222', borderRadius: 16, overflow: 'hidden', marginBottom: '2rem' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thead: { background: 'rgba(0,0,0,0.3)' },
  th: { padding: '0.85rem 1.25rem', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', borderBottom: '1px solid #222222', whiteSpace: 'nowrap' },
  thRight: { padding: '0.85rem 1.25rem', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', borderBottom: '1px solid #222222', textAlign: 'right' },
  td: { padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(34,34,34,0.6)', verticalAlign: 'middle' },
  tdRight: { padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(34,34,34,0.6)', verticalAlign: 'middle', textAlign: 'right' },
  thumb: { height: 44, width: 44, borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid #2e2e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  thumbImg: { height: '100%', width: '100%', objectFit: 'cover' },
  productName: { fontWeight: 600, fontSize: '0.875rem', color: '#f0f0f0', marginBottom: 2 },
  productDesc: { fontSize: '0.73rem', color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  typeBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.6rem', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid #2e2e2e', fontSize: '0.73rem', color: '#d1d5db', whiteSpace: 'nowrap' },
  priceMain: { fontSize: '0.875rem', fontWeight: 600, color: '#f0f0f0' },
  priceUnit: { fontSize: '0.68rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 },
  stockRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  actionsWrap: { display: 'flex', justifyContent: 'flex-end', gap: 6 },
  actionBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.35rem', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', transition: 'background 0.15s, color 0.15s' },
  overlay: { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', animation: 'fadeInOverlay 0.18s ease' },
  modal: { background: '#111111', border: '1px solid #2e2e2e', borderRadius: 20, width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)', animation: 'slideUpModal 0.22s cubic-bezier(0.16,1,0.3,1)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, background: '#111111', zIndex: 2, borderRadius: '20px 20px 0 0' },
  modalTitle: { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f0f0f0' },
  modalSubtitle: { margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#6b7280' },
  closeBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid #2e2e2e', background: 'transparent', color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 },
  modalBody: { padding: '1.25rem 1.5rem 0' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' },
  inputBase: { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '0.65rem 0.85rem', color: '#f0f0f0', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box' },
  selectBase: { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '0.65rem 0.85rem', color: '#f0f0f0', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer' },
  selectWrap: { position: 'relative' },
  selectChevron: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' },
  textareaBase: { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '0.65rem 0.85rem', color: '#f0f0f0', fontSize: '0.875rem', outline: 'none', resize: 'vertical', minHeight: 88, transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box', fontFamily: "'Inter', system-ui, sans-serif" },
  modalFooter: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 1.5rem 1.5rem' },
  btnCancel: { padding: '0.6rem 1.2rem', borderRadius: 10, border: '1px solid #2e2e2e', background: 'transparent', color: '#9ca3af', fontSize: '0.84rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  btnSave: { padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.18s, transform 0.12s', boxShadow: '0 2px 12px rgba(34,197,94,0.28)' },
  uploadZone: { position: 'relative', border: '2px dashed #2e2e2e', borderRadius: 14, background: '#0a0a0a', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s' },
  uploadZoneDragging: { borderColor: 'rgba(34,197,94,0.7)', background: 'rgba(34,197,94,0.04)', boxShadow: '0 0 0 3px rgba(34,197,94,0.12)' },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem 1rem', textAlign: 'center', minHeight: 140 },
  uploadIconWrap: { width: 52, height: 52, borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem', transition: 'background 0.2s, border-color 0.2s' },
  uploadTitle: { fontSize: '0.875rem', fontWeight: 600, color: '#d1d5db', margin: 0 },
  uploadSub: { fontSize: '0.73rem', color: '#6b7280', margin: 0, lineHeight: 1.5 },
  uploadBrowse: { color: '#4ade80', fontWeight: 600, textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer' },
  uploadPreviewWrap: { position: 'relative', width: '100%', minHeight: 140, padding: '1rem' },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem', width: '100%' },
  galleryItem: { position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #2e2e2e', background: '#111' },
  uploadPreviewImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  uploadRemoveBtn: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 9999, border: 'none', background: 'rgba(239,68,68,0.85)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10, transition: 'background 0.15s, transform 0.12s', backdropFilter: 'blur(4px)', zIndex: 10 },
  uploadSuccessBar: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: 'rgba(34,197,94,0.08)', borderTop: '1px solid rgba(34,197,94,0.15)', fontSize: '0.72rem', color: '#4ade80', fontWeight: 500 },
  // Variant-specific styles
  variantSection: { margin: '1.25rem 0 0', borderTop: '1px solid #1e1e1e', paddingTop: '1.25rem' },
  variantHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' },
  variantTitle: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' },
  variantTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  variantTh: { padding: '0.5rem 0.6rem', fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', borderBottom: '1px solid #222', textAlign: 'left' },
  variantTd: { padding: '0.4rem 0.3rem', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' },
  variantInput: { width: '100%', background: '#0a0a0a', border: '1px solid #252525', borderRadius: 7, padding: '0.4rem 0.6rem', color: '#f0f0f0', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' },
  variantSelect: { width: '100%', background: '#0a0a0a', border: '1px solid #252525', borderRadius: 7, padding: '0.4rem 0.6rem', color: '#f0f0f0', fontSize: '0.8rem', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'border-color 0.15s' },
  variantDeleteBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', transition: 'background 0.15s' },
  variantSaveBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(34,197,94,0.12)', color: '#4ade80', cursor: 'pointer', transition: 'background 0.15s' },
  addVariantBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', borderRadius: 8, border: '1px dashed rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.04)', color: '#4ade80', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
};

/* ─── Helper: stock badge ─── */
function StockBadge({ stock }) {
  const isLow = stock <= 10;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.2rem 0.65rem', borderRadius: 9999, fontSize: '0.73rem', fontWeight: 600, background: isLow ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.08)', border: `1px solid ${isLow ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`, color: isLow ? '#f87171' : '#4ade80', whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isLow ? '#f87171' : '#22c55e', boxShadow: isLow ? '0 0 5px #f87171' : '0 0 5px #22c55e' }} />
      {stock} units
    </span>
  );
}

/* ─── Variant badge (count) ─── */
function VariantBadge({ count }) {
  if (count === 0) return <span style={{ fontSize: '0.73rem', color: '#4b5563', fontStyle: 'italic' }}>No variants</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.55rem', borderRadius: 6, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', fontSize: '0.73rem', fontWeight: 600, color: '#a78bfa' }}>
      <Shuffle size={10} />{count} variant{count !== 1 ? 's' : ''}
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
  @keyframes uploadPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  .pm-input:focus, .pm-select:focus, .pm-textarea:focus {
    border-color: rgba(34,197,94,0.55) !important;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.1) !important;
  }
  .pm-search:focus { border-color: rgba(34,197,94,0.4) !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.08) !important; }
  .pm-btn-primary:hover  { opacity: 0.88; transform: translateY(-1px); }
  .pm-btn-ghost:hover    { border-color: #3e3e3e; color: #d1d5db; background: rgba(255,255,255,0.04); }
  .pm-btn-cancel:hover   { border-color: #3e3e3e; color: #d1d5db; }
  .pm-btn-save:hover     { opacity: 0.88; transform: translateY(-1px); }
  .pm-close-btn:hover    { background: rgba(255,255,255,0.06); color: #d1d5db; border-color: #3e3e3e; }
  .pm-action-edit:hover  { background: rgba(96,165,250,0.12); color: #60a5fa; }
  .pm-action-del:hover   { background: rgba(239,68,68,0.12);  color: #f87171; }
  .pm-tr:hover td        { background: rgba(255,255,255,0.025); }
  .pm-tr:last-child td   { border-bottom: none; }
  .pm-upload-zone:hover  { border-color: rgba(34,197,94,0.45) !important; background: rgba(34,197,94,0.025) !important; }
  .pm-upload-zone:hover .pm-upload-icon-wrap { background: rgba(34,197,94,0.13) !important; border-color: rgba(34,197,94,0.3) !important; }
  .pm-upload-remove:hover { background: rgba(239,68,68,1) !important; transform: scale(1.1); }
  .pm-variant-input:focus { border-color: rgba(34,197,94,0.5) !important; }
  .pm-variant-del:hover   { background: rgba(239,68,68,0.22) !important; }
  .pm-variant-save:hover  { background: rgba(34,197,94,0.22) !important; }
  .pm-add-variant:hover   { border-color: rgba(34,197,94,0.7) !important; background: rgba(34,197,94,0.08) !important; }
  .pm-modal-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 1.5rem;
  }
  @media (max-width: 768px) {
    .pm-modal-grid { grid-template-columns: 1fr !important; }
  }
`;

const EMPTY_VARIANT = { name: '', price: '', stock: '', status: 'available' };

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', type: 'Rib Type', shortDescription: '', longDescription: '',
    price: '', unit: 'per meter', stock: '', imageUrl: '', imageUrls: []
  });

  // Variant state: list of existing + pending variants
  const [variants, setVariants] = useState([]);        // persisted variants (from DB)
  const [newVariant, setNewVariant] = useState({ ...EMPTY_VARIANT }); // "add row"
  const [savingVariant, setSavingVariant] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editingVariantData, setEditingVariantData] = useState({});

  // For new (not-yet-saved) products, queue variants locally
  const [pendingVariants, setPendingVariants] = useState([]);

  // Product Type state
  const [productTypes, setProductTypes] = useState([]);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => { fetchProducts(); fetchProductTypes(); }, []);

  /* ── Fetch product types from API ── */
  const fetchProductTypes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/product-types`);
      setProductTypes(res.data);
    } catch (error) {
      console.error('Error fetching product types:', error);
    }
  };

  /* ── Callback when a new type is created from the modal ── */
  const handleTypeCreated = (newType) => {
    setProductTypes(prev => [...prev, newType].sort((a, b) => a.name.localeCompare(b.name)));
    setFormData(prev => ({ ...prev, type: newType.name }));
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/products?t=${Date.now()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetch variants for the product being edited ── */
  const fetchVariants = async (productId) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/products/${productId}/variants`);
      if (res.data.success) {
        const mappedVariants = res.data.data.map(v => ({
          ...v,
          originalPrice: v.price,
          originalStock: v.stock,
          price: '',
          stock: ''
        }));
        setVariants(mappedVariants);
      }
    } catch (err) {
      console.error('Error fetching variants:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVariantChange = (id, field, value) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  /* ── Image upload helpers ── */
  const processImageFiles = useCallback(async (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;
    const readAsDataURL = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      const newUrls = await Promise.all(validFiles.map(readAsDataURL));
      setFormData(prev => {
        const currentUrls = prev.imageUrls || [];
        const remainingSlots = 12 - currentUrls.length;
        if (remainingSlots <= 0) { alert(t('Maximum of 12 images allowed.')); return prev; }
        const urlsToAdd = newUrls.slice(0, remainingSlots);
        if (newUrls.length > remainingSlots) alert(t('Maximum of 12 images allowed. Some images were not added.'));
        const uniqueUrlsToAdd = urlsToAdd.filter(url => !currentUrls.includes(url));
        return { ...prev, imageUrls: [...currentUrls, ...uniqueUrlsToAdd] };
      });
    } catch (err) { console.error("Error reading files", err); }
  }, [t]);

  const handleFileInputChange = (e) => { if (e.target.files) processImageFiles(e.target.files); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) processImageFiles(e.dataTransfer.files); };
  const handleRemoveImage = (e, index) => {
    e.stopPropagation();
    setFormData((prev) => { const newUrls = [...(prev.imageUrls || [])]; newUrls.splice(index, 1); return { ...prev, imageUrls: newUrls }; });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Product submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Fall back to original base price/stock if left empty
        const payload = { ...formData };
        if (payload.price === '' || payload.price === null) payload.price = editingProduct.price;
        if (payload.stock === '' || payload.stock === null) payload.stock = editingProduct.stock;
        
        let variantsPayload = [];
        if (variants && variants.length > 0) {
          variantsPayload = variants
            .filter((v) => v.price !== '' || v.stock !== '') // ONLY send variants the user explicitly edited inline
            .map((v) => {
              return {
                 id: v.id,
                 name: v.name,
                 price: (v.price !== '' && v.price !== null) ? v.price : v.originalPrice,
                 stock: (v.stock !== '' && v.stock !== null) ? v.stock : v.originalStock,
                 sku: v.sku || '',
                 status: v.status
              };
            });
          
          if (variantsPayload.length > 0) {
            payload.variants = variantsPayload;
          }
        }

        // Single transaction PUT
        const res = await axios.put(`${API_URL}/api/admin/products/${editingProduct.id}`, payload);
        const freshlyUpdatedProduct = res.data;

        // Deep Immutable Update directly from finalized database response
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? freshlyUpdatedProduct : p))
        );
      } else {
        // Pass pending variants in the create payload
        const payload = { ...formData, variants: pendingVariants };
        await axios.post(`${API_URL}/api/admin/products`, payload);
      }
      await fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('Are you sure you want to delete this product?'))) {
      try {
        await axios.delete(`${API_URL}/api/admin/products/${id}`);
        fetchProducts();
      } catch (error) { console.error('Error deleting product:', error); }
    }
  };

  /* ── Variant helpers (existing product) ── */
  const handleAddVariant = async () => {
    if (!newVariant.name || !newVariant.price || !newVariant.stock) return;
    setSavingVariant(true);
    try {
      await axios.post(`${API_URL}/api/admin/products/${editingProduct.id}/variants`, newVariant);
      await fetchVariants(editingProduct.id);
      setNewVariant({ ...EMPTY_VARIANT });
    } catch (err) { console.error('Error adding variant:', err); }
    setSavingVariant(false);
  };

  const handleStartEditVariant = (v) => {
    setEditingVariantId(v.id);
    setEditingVariantData({
      name: v.name,
      price: v.price !== '' ? v.price : v.originalPrice,
      stock: v.stock !== '' ? v.stock : v.originalStock,
      sku: v.sku || '',
      status: v.status
    });
  };

  const handleSaveEditVariant = async (variantId) => {
    setSavingVariant(true);
    try {
      await axios.put(`${API_URL}/api/admin/products/${editingProduct.id}/variants/${variantId}`, editingVariantData);
      await fetchVariants(editingProduct.id);
      setEditingVariantId(null);
    } catch (err) { console.error('Error updating variant:', err); }
    setSavingVariant(false);
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm(t('Delete this variant?'))) return;
    try {
      await axios.delete(`${API_URL}/api/admin/products/${editingProduct.id}/variants/${variantId}`);
      await fetchVariants(editingProduct.id);
    } catch (err) { console.error('Error deleting variant:', err); }
  };

  /* ── Pending variant helpers (new product, not yet saved) ── */
  const handleAddPendingVariant = () => {
    if (!newVariant.name || !newVariant.price || !newVariant.stock) return;
    setPendingVariants(prev => [...prev, { ...newVariant, _tempId: Date.now() }]);
    setNewVariant({ ...EMPTY_VARIANT });
  };

  const handleDeletePendingVariant = (tempId) => {
    setPendingVariants(prev => prev.filter(v => v._tempId !== tempId));
  };

  const openModal = (product = null) => {
    setNewVariant({ ...EMPTY_VARIANT });
    setEditingVariantId(null);
    setPendingVariants([]);
    if (product) {
      setEditingProduct(product);
      let initialImageUrls = product.imageUrls || [];
      if (initialImageUrls.length === 0 && product.imageUrl) initialImageUrls = [product.imageUrl];
      setFormData({ name: product.name, type: product.type, shortDescription: product.shortDescription || '', longDescription: product.longDescription || '', price: '', unit: product.unit, stock: '', imageUrl: product.imageUrl || '', imageUrls: initialImageUrls });
      fetchVariants(product.id);
    } else {
      setEditingProduct(null);
      setVariants([]);
      setFormData({ name: '', type: productTypes.length > 0 ? productTypes[0].name : '', shortDescription: '', longDescription: '', price: '', unit: 'per meter', stock: '', imageUrl: '', imageUrls: [] });
    }
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setIsDragging(false);
    setVariants([]);
    setPendingVariants([]);
    setNewVariant({ ...EMPTY_VARIANT });
    setEditingVariantId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ─── Variant Row (edit mode) ─── */
  const VariantEditRow = ({ v }) => (
    <tr>
      <td style={S.variantTd}>
        <input className="pm-variant-input" style={S.variantInput} value={editingVariantData.name} onChange={e => setEditingVariantData(p => ({ ...p, name: e.target.value }))} placeholder="Name" />
      </td>
      <td style={S.variantTd}>
        <input className="pm-variant-input" style={S.variantInput} type="number" value={editingVariantData.price} onChange={e => setEditingVariantData(p => ({ ...p, price: e.target.value }))} placeholder="0" />
      </td>
      <td style={S.variantTd}>
        <input className="pm-variant-input" style={S.variantInput} type="number" value={editingVariantData.stock} onChange={e => setEditingVariantData(p => ({ ...p, stock: e.target.value }))} placeholder="0" />
      </td>
      <td style={S.variantTd}>
        <select className="pm-variant-input" style={S.variantSelect} value={editingVariantData.status} onChange={e => setEditingVariantData(p => ({ ...p, status: e.target.value }))}>
          <option value="available">Available</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </td>
      <td style={{ ...S.variantTd, textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <button type="button" className="pm-variant-save" style={S.variantSaveBtn} onClick={() => handleSaveEditVariant(v.id)} disabled={savingVariant}><Save size={13} /></button>
          <button type="button" className="pm-variant-del" style={S.variantDeleteBtn} onClick={() => { setEditingVariantId(null); }}><X size={13} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <style>{focusStyle}</style>
      <div style={S.page}>

        {/* ── Page Header ── */}
        <div style={S.pageHeader}>
          <div>
            <h1 style={S.pageTitle}>{t('Inventory Management')}</h1>
            <p style={S.pageSubtitle}>{t('Manage your products, stock levels and pricing.')}</p>
          </div>
          <button className="pm-btn-primary" onClick={() => openModal()} style={S.btnPrimary}>
            <Plus size={15} />{t('Add New Product')}
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div style={S.toolbar}>
          <div style={S.searchWrap}>
            <Search size={15} style={S.searchIcon} />
            <input className="pm-search" type="text" placeholder={t('Search by name or category…')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={S.searchInput} />
          </div>
          <button className="pm-btn-ghost" style={S.btnGhost}><Filter size={14} />{t('Filters')}</button>
          {!loading && (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280', background: 'rgba(255,255,255,0.04)', border: '1px solid #2e2e2e', borderRadius: 9999, padding: '0.2rem 0.7rem', whiteSpace: 'nowrap' }}>
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
            <p style={S.emptyText}>{searchTerm ? t('No results match your search. Try a different term.') : t('Add your first product to get started.')}</p>
            {!searchTerm && (<button className="pm-btn-primary" onClick={() => openModal()} style={{ ...S.btnPrimary, marginTop: '0.5rem' }}><Plus size={14} /> {t('Add New Product')}</button>)}
          </div>
        ) : (
          <div style={S.tableCard}>
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead style={S.thead}>
                  <tr>
                    <th style={S.th}>{t('Product')}</th>
                    <th style={S.th}>{t('Type')}</th>
                    <th style={S.th}>{t('Price / Unit')}</th>
                    <th style={S.th}>{t('Stock')}</th>
                    <th style={S.th}>{t('Variants')}</th>
                    <th style={S.thRight}>{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="pm-tr">
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={S.thumb}>
                            {p.imageUrls && p.imageUrls.length > 0
                              ? <img src={p.imageUrls[0]} alt={p.name} style={S.thumbImg} />
                              : p.imageUrl
                                ? <img src={p.imageUrl} alt={p.name} style={S.thumbImg} />
                                : <Package size={18} style={{ color: '#374151' }} />
                            }
                          </div>
                          <div>
                            <div style={S.productName}>{p.name}</div>
                            <div style={S.productDesc}>{p.shortDescription || t('No description')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={S.typeBadge}><Tag size={10} style={{ color: '#6b7280' }} />{p.type}</span>
                      </td>
                      <td style={S.td}>
                        <div>
                          {p.variants && p.variants.length > 0 && <div style={{ fontSize: '0.73rem', color: '#6b7280', marginBottom: 2 }}>from</div>}
                          <div style={S.priceMain}>₱{Number(p.price).toLocaleString()}</div>
                          <div style={S.priceUnit}>{p.unit}</div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <StockBadge stock={ProductStockCalculator.calculateTotalStock(p)} />
                      </td>
                      <td style={S.td}>
                        <VariantBadge count={p.variants ? p.variants.length : 0} />
                      </td>
                      <td style={S.tdRight}>
                        <div style={S.actionsWrap}>
                          <button className="pm-action-del" title={t('Delete')} onClick={() => handleDelete(p.id)} style={S.actionBtn}><Trash2 size={15} /></button>
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
                <h2 style={S.modalTitle}>{editingProduct ? t('Update Inventory Item') : t('Add New Product')}</h2>
                <p style={S.modalSubtitle}>{editingProduct ? t('Update product details below.') : t('Fill in the details to create a new product.')}</p>
              </div>
              <button className="pm-close-btn" onClick={closeModal} style={S.closeBtn} title={t('Close')}><X size={15} /></button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div style={S.modalBody} className="pm-modal-grid">

                {/* ── Left Column: Images ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ ...S.formGroup, marginBottom: 0 }}>
                    <label style={S.label}><ImageIcon size={11} /> {t('Product Images')}</label>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileInputChange} />
                    <div
                      className="pm-upload-zone"
                      style={{ ...S.uploadZone, ...(isDragging ? S.uploadZoneDragging : {}), minHeight: 280, display: 'flex', flexDirection: 'column' }}
                      onClick={() => { if (!formData.imageUrls || formData.imageUrls.length < 12) fileInputRef.current?.click(); }}
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    >
                      {formData.imageUrls && formData.imageUrls.length > 0 ? (
                        <div style={{ ...S.uploadPreviewWrap, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ ...S.galleryGrid, gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            {formData.imageUrls.map((url, idx) => (
                              <div key={idx} style={S.galleryItem} onClick={(e) => e.stopPropagation()}>
                                <img src={url} alt={`Preview ${idx + 1}`} style={S.uploadPreviewImg} />
                                <button type="button" className="pm-upload-remove" style={S.uploadRemoveBtn} onClick={(e) => handleRemoveImage(e, idx)} title={t('Remove image')}><X size={12} /></button>
                              </div>
                            ))}
                            {formData.imageUrls.length < 12 && (
                              <div style={{ ...S.galleryItem, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed #3e3e3e', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                                <Plus size={20} style={{ color: '#6b7280' }} />
                              </div>
                            )}
                          </div>
                          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                            <div style={S.uploadSuccessBar} onClick={(e) => e.stopPropagation()}>
                              <CheckCircle2 size={12} /><span>{formData.imageUrls.length} / 12 {t('images')}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ ...S.uploadPlaceholder, flex: 1, justifyContent: 'center' }}>
                          <div className="pm-upload-icon-wrap" style={{ ...S.uploadIconWrap, ...(isDragging ? { background: 'rgba(34,197,94,0.18)', borderColor: 'rgba(34,197,94,0.5)', animation: 'uploadPulse 1s ease-in-out infinite' } : {}) }}>
                            <UploadCloud size={22} style={{ color: isDragging ? '#4ade80' : '#22c55e' }} />
                          </div>
                          <p style={S.uploadTitle}>{isDragging ? t('Drop images here…') : t('Drag & drop images')}</p>
                          <p style={S.uploadSub}>{t('or')} <span style={S.uploadBrowse}>{t('browse files')}</span><br /><span style={{ fontSize: '0.68rem', color: '#4b5563' }}>PNG, JPG, WEBP · max 5 MB · up to 12</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Right Column: Info ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {/* Product Name */}
                  <div style={{ ...S.formGroup, marginBottom: 0 }}>
                    <label style={S.label}><Package size={11} /> {t('Product Name')}</label>
                    <input className="pm-input" name="name" type="text" required value={formData.name} onChange={handleInputChange} placeholder={t('e.g. Rib Type Blue')} style={S.inputBase} />
                  </div>

                  {/* Price + Unit */}
                  <div style={{ ...S.formRow, gap: '0.8rem' }}>
                    <div style={{ ...S.formGroup, marginBottom: 0 }}>
                      <label style={S.label}>{t('ORIGINAL PRICE (₱)')}</label>
                      <input className="pm-input" name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder={editingProduct ? t("New Price") : "0"} style={S.inputBase} />
                    </div>
                    <div style={{ ...S.formGroup, marginBottom: 0 }}>
                      <label style={S.label}><Layers size={11} /> {t('Unit')}</label>
                      <input className="pm-input" name="unit" type="text" value={formData.unit} onChange={handleInputChange} placeholder={t('per meter')} style={S.inputBase} />
                    </div>
                  </div>

                  {/* Stock + Type */}
                  <div style={{ ...S.formRow, gap: '0.8rem' }}>
                    <div style={{ ...S.formGroup, marginBottom: 0 }}>
                      <label style={S.label}>{t('BASE STOCK QTY')}</label>
                      <input className="pm-input" name="stock" type="number" value={formData.stock} onChange={handleInputChange} placeholder={editingProduct ? t("New Stock") : "0"} style={S.inputBase} />
                    </div>
                    <div style={{ ...S.formGroup, marginBottom: 0 }}>
                      <label style={S.label}><Tag size={11} /> {t('Category Type')}</label>
                      <div style={S.selectWrap}>
                        <select className="pm-select" name="type" value={formData.type} onChange={handleInputChange} style={S.selectBase}>
                          {productTypes.length === 0 && (
                            <option value="">{t('Loading types…')}</option>
                          )}
                          {productTypes.map((pt) => (
                            <option key={pt.id} value={pt.name}>{pt.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={13} style={S.selectChevron} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddTypeModal(true)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.3rem 0.7rem', marginTop: '0.35rem',
                          borderRadius: 8, border: '1px dashed rgba(34,197,94,0.4)',
                          background: 'rgba(34,197,94,0.04)', color: '#4ade80',
                          fontSize: '0.73rem', fontWeight: 500, cursor: 'pointer',
                          transition: 'all 0.15s', alignSelf: 'flex-start',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.7)'; e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.background = 'rgba(34,197,94,0.04)'; }}
                      >
                        <PlusCircle size={12} /> {t('Add New Type')}
                      </button>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div style={{ ...S.formGroup, marginBottom: 0 }}>
                    <label style={S.label}><AlignLeft size={11} /> {t('Short Description')}</label>
                    <textarea className="pm-textarea" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} placeholder={t('Concise summary or spec overview…')} style={{ ...S.textareaBase, minHeight: 60 }} />
                  </div>
                  <div style={{ ...S.formGroup, marginBottom: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={S.label}><AlignLeft size={11} /> {t('Long Description')}</label>
                    <textarea className="pm-textarea" name="longDescription" value={formData.longDescription} onChange={handleInputChange} placeholder={t('Detailed product specifications and marketing copy…')} style={{ ...S.textareaBase, flex: 1, minHeight: 120 }} />
                  </div>
                </div>
              </div>

              {/* ══ Variants Section (full-width, below the grid) ══ */}
              <div style={{ padding: '0 1.5rem' }}>
                <div style={S.variantSection}>
                  <div style={S.variantHeader}>
                    <span style={S.variantTitle}><Shuffle size={13} />{t('Product Variants')}</span>
                    <span style={{ fontSize: '0.72rem', color: '#4b5563' }}>
                      {t('Leave empty if product has a single fixed price.')}
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={S.variantTable}>
                      <thead>
                        <tr>
                          <th style={S.variantTh}>{t('Variant Name')}</th>
                          <th style={S.variantTh}>{t('Price (₱)')}</th>
                          <th style={S.variantTh}>{t('Stock')}</th>
                          <th style={S.variantTh}>{t('Status')}</th>
                          <th style={{ ...S.variantTh, textAlign: 'right' }}>{t('Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Existing persisted variants */}
                        {variants.map((v) =>
                          editingVariantId === v.id ? (
                            <VariantEditRow key={v.id} v={v} />
                          ) : (
                            <tr key={v.id}>
                              <td style={S.variantTd}><span style={{ fontWeight: 600, color: '#e5e7eb' }}>{v.name}</span></td>
                              <td style={S.variantTd}>
                                <span style={{ color: '#e5e7eb', fontWeight: 500 }}>₱{Number(v.originalPrice).toLocaleString()}</span>
                              </td>
                              <td style={S.variantTd}>
                                <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{v.originalStock} units</span>
                              </td>
                              <td style={S.variantTd}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.15rem 0.5rem', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600, background: v.status === 'available' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: v.status === 'available' ? '#4ade80' : '#f87171' }}>
                                  {v.status === 'available' ? 'Available' : 'Out of Stock'}
                                </span>
                              </td>
                              <td style={{ ...S.variantTd, textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                  <button type="button" className="pm-variant-del" style={S.variantDeleteBtn} onClick={() => handleDeleteVariant(v.id)}><Trash2 size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}

                        {/* Pending variants (new product not saved yet) */}
                        {pendingVariants.map((v) => (
                          <tr key={v._tempId} style={{ background: 'rgba(34,197,94,0.03)' }}>
                            <td style={S.variantTd}><span style={{ fontWeight: 600, color: '#e5e7eb' }}>{v.name}</span></td>
                            <td style={S.variantTd}><span style={{ color: '#4ade80', fontWeight: 600 }}>₱{Number(v.price).toLocaleString()}</span></td>
                            <td style={S.variantTd}><StockBadge stock={parseInt(v.stock)} /></td>
                            <td style={S.variantTd}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.15rem 0.5rem', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>Available</span>
                            </td>
                            <td style={{ ...S.variantTd, textAlign: 'right' }}>
                              <button type="button" className="pm-variant-del" style={S.variantDeleteBtn} onClick={() => handleDeletePendingVariant(v._tempId)}><Trash2 size={12} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Add new variant input row */}
                        <tr style={{ background: 'rgba(255,255,255,0.015)' }}>
                          <td style={S.variantTd}>
                            <input className="pm-variant-input" style={S.variantInput} value={newVariant.name} onChange={e => setNewVariant(p => ({ ...p, name: e.target.value }))} placeholder={t('e.g. Per Meter')} />
                          </td>
                          <td style={S.variantTd}>
                            <input className="pm-variant-input" style={S.variantInput} type="number" value={newVariant.price} onChange={e => setNewVariant(p => ({ ...p, price: e.target.value }))} placeholder="0" />
                          </td>
                          <td style={S.variantTd}>
                            <input className="pm-variant-input" style={S.variantInput} type="number" value={newVariant.stock} onChange={e => setNewVariant(p => ({ ...p, stock: e.target.value }))} placeholder="0" />
                          </td>
                          <td style={S.variantTd}>
                            <select className="pm-variant-input" style={S.variantSelect} value={newVariant.status} onChange={e => setNewVariant(p => ({ ...p, status: e.target.value }))}>
                              <option value="available">Available</option>
                              <option value="out_of_stock">Out of Stock</option>
                            </select>
                          </td>
                          <td style={{ ...S.variantTd, textAlign: 'right' }}>
                            <button
                              type="button"
                              className="pm-add-variant"
                              style={S.addVariantBtn}
                              onClick={editingProduct ? handleAddVariant : handleAddPendingVariant}
                              disabled={savingVariant || !newVariant.name || !newVariant.price || !newVariant.stock}
                            >
                              {savingVariant ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <PlusCircle size={13} />}
                              {t('Add')}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={S.modalFooter}>
                <button type="button" className="pm-btn-cancel" onClick={closeModal} style={S.btnCancel}>{t('Cancel')}</button>
                <button type="submit" className="pm-btn-save" style={S.btnSave}>
                  {editingProduct ? t('Update Product') : t('Create Product')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── Add Product Type Modal ── */}
      <AddProductTypeModal
        isOpen={showAddTypeModal}
        onClose={() => setShowAddTypeModal(false)}
        onTypeCreated={handleTypeCreated}
      />
    </>
  );
};

export default ProductManagement;
