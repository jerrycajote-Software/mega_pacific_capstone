import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import {
  Typography,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  IconButton,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LayersIcon from '@mui/icons-material/Layers';
import StraightenIcon from '@mui/icons-material/Straighten';
import PaletteIcon from '@mui/icons-material/Palette';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import SaveIcon from '@mui/icons-material/Save';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';

import { ROOFING_COLORS, STANDARD_THICKNESSES, DECKING_THICKNESSES } from '../../constants/roofingSpecs';
import { isCoilInStock, getAvailableColorsForThickness, hasCoilStockForThickness } from '../../utils/coilAvailability';
import { isCustomLengthProfile } from '../customer/buildProductOptions';
import { io } from 'socket.io-client';

const normalizeThickness = (val) => {
  if (!val) return '';
  let str = String(val).trim();
  if (/^\d+(\.\d+)?$/.test(str)) {
    str = `${str}mm`;
  } else if (/^\d+(\.\d+)?\s*mm$/i.test(str)) {
    str = str.replace(/\s*mm$/i, 'mm');
  }
  return str.toLowerCase();
};

const formatDisplayThickness = (val) => {
  if (!val) return '';
  let str = String(val).trim();
  if (/^\d+(\.\d+)?$/.test(str)) {
    return `${str}mm`;
  }
  if (/^\d+(\.\d+)?\s*mm$/i.test(str)) {
    return str.replace(/\s*mm$/i, 'mm').toLowerCase();
  }
  return str;
};

const EMPTY_FORM = {
  name: '',
  type: 'Rib Type',
  originalPrice: '',
  unit: 'per meter',
  thickness: '0.35mm',
  effectiveWidth: '',
  nominalWidth: '',
  ribHeight: '',
  description: '',
  colors: ROOFING_COLORS.map(c => c.name),
  maxMeters: 21.0,
  imageUrls: [],
  isActive: true
};


const PreOrderProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [coilSummary, setCoilSummary] = useState(null);
  const [coils, setCoils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [togglingId, setTogglingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [variants, setVariants] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [isDragging, setIsDragging] = useState(false);

  const [customThicknesses, setCustomThicknesses] = useState(() => {
    try {
      const stored = localStorage.getItem('mega_custom_thicknesses');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [newThicknessModalOpen, setNewThicknessModalOpen] = useState(false);
  const [newThicknessInput, setNewThicknessInput] = useState('');
  const [newThicknessTarget, setNewThicknessTarget] = useState(null);
  const [newThicknessError, setNewThicknessError] = useState('');

  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchProducts = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/sales/pre-order-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setProducts(prev => {
          const next = Array.isArray(res.data.data) ? res.data.data : [];
          if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to load pre-order products:', err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  const fetchCoilSummary = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/logistic/coils/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setCoilSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load coil summary:', err);
    }
  };

  const fetchCoils = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/logistic/coils`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setCoils(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error('Failed to load coils for color availability:', err);
    }
  };

  const availableThicknesses = useMemo(() => {
    const map = new Map();

    const addThick = (raw) => {
      if (!raw) return;
      const formatted = formatDisplayThickness(raw);
      const norm = normalizeThickness(raw);
      if (norm && !map.has(norm)) {
        map.set(norm, formatted);
      }
    };

    (STANDARD_THICKNESSES || []).forEach(addThick);
    (DECKING_THICKNESSES || []).forEach(addThick);
    (Array.isArray(customThicknesses) ? customThicknesses : []).forEach(addThick);

    (Array.isArray(products) ? products : []).forEach(p => {
      if (p?.thickness) addThick(p.thickness);
      (Array.isArray(p?.variants) ? p.variants : []).forEach(v => {
        if (v?.thickness) addThick(v.thickness);
      });
    });

    if (formData?.thickness) addThick(formData.thickness);
    (Array.isArray(variants) ? variants : []).forEach(v => {
      if (v?.thickness) addThick(v.thickness);
    });

    return Array.from(map.values()).sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB;
    });
  }, [customThicknesses, products, formData?.thickness, variants]);

  const baseNorm = normalizeThickness(formData?.thickness || '0.35mm');
  const safeVariants = Array.isArray(variants) ? variants : [];
  const baseConflictVariantIndex = safeVariants.findIndex(
    v => normalizeThickness(v?.thickness) === baseNorm
  );

  const variantThicknessConflicts = useMemo(() => {
    const conflicts = {};
    const seen = new Map();

    safeVariants.forEach((v, idx) => {
      const vNorm = normalizeThickness(v?.thickness);
      if (!vNorm) return;

      if (vNorm === baseNorm) {
        conflicts[idx] = `Duplicates Base Thickness (${formData?.thickness || 'base'}). Each variant must have a unique thickness different from the base.`;
        return;
      }

      if (seen.has(vNorm)) {
        const firstIdx = seen.get(vNorm);
        conflicts[idx] = `Duplicates Variant #${firstIdx + 1} (${v?.thickness}). Duplicate thicknesses are not allowed.`;
        if (!conflicts[firstIdx]) {
          conflicts[firstIdx] = `Duplicates Variant #${idx + 1} (${v?.thickness}). Duplicate thicknesses are not allowed.`;
        }
      } else {
        seen.set(vNorm, idx);
      }
    });

    return conflicts;
  }, [baseNorm, safeVariants, formData?.thickness]);

  const availableColorsForThickness = useMemo(() => {
    return getAvailableColorsForThickness(coils, formData?.thickness);
  }, [coils, formData?.thickness]);

  useEffect(() => {
    fetchProducts(true);
    fetchCoilSummary();
    fetchCoils();

    const socket = io(API_URL);
    socket.on('coil_inventory_updated', () => {
      fetchCoils();
      fetchCoilSummary();
    });
    socket.on('product_catalog_updated', () => {
      fetchProducts(false);
    });

    const syncInterval = setInterval(() => {
      fetchProducts(false);
      fetchCoilSummary();
      fetchCoils();
    }, 10000);

    const handleFocus = () => {
      fetchProducts(false);
      fetchCoilSummary();
      fetchCoils();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
      socket.disconnect();
    };
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    const initialThick = '0.35mm';
    const inStockSet = getAvailableColorsForThickness(coils, initialThick);
    const initialColors = ROOFING_COLORS.map(c => c.name).filter(c => inStockSet.has(c));

    setFormData({
      ...EMPTY_FORM,
      isActive: true,
      thickness: initialThick,
      colors: initialColors
    });
    setVariants([
      { name: '0.40mm Thickness', thickness: '0.40mm', originalPrice: '', status: 'available' },
      { name: '0.50mm Thickness', thickness: '0.50mm', originalPrice: '', status: 'available' },
      { name: '0.60mm Thickness', thickness: '0.60mm', originalPrice: '', status: 'available' }
    ]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    const rawThick = p.thickness || '0.35mm';
    const inStockSet = getAvailableColorsForThickness(coils, rawThick);
    const existingColors = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [];
    const validColors = existingColors.filter(c => inStockSet.has(c));

    setFormData({
      name: p.name || '',
      type: p.type || 'Rib Type',
      originalPrice: p.originalPrice ?? p.price ?? '',
      unit: p.unit || 'per meter',
      thickness: rawThick,
      effectiveWidth: p.effectiveWidth ?? '',
      nominalWidth: p.nominalWidth ?? '',
      ribHeight: p.ribHeight ?? '',
      description: p.description || '',
      colors: validColors,
      maxMeters: p.maxMeters ?? 21.0,
      imageUrls: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : (p.imageUrl ? [p.imageUrl] : []),
      isActive: p.isActive !== false
    });
    setVariants(p.variants ? p.variants.map(v => ({
      id: v.id,
      name: v.name,
      thickness: v.thickness || '0.40mm',
      originalPrice: v.originalPrice ?? v.price ?? '',
      status: v.status || 'available'
    })) : []);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (product) => {
    try {
      setTogglingId(product.id);
      const token = localStorage.getItem('appToken');
      const nextActive = product.isActive === false ? true : false;

      // Optimistic UI update
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: nextActive } : p));

      const res = await axios.patch(`${API_URL}/api/sales/pre-order-products/${product.id}/status`, {
        isActive: nextActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setToast({
          open: true,
          message: res.data.message || `Product ${nextActive ? 'enabled' : 'disabled'} successfully.`,
          severity: nextActive ? 'success' : 'info'
        });
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      fetchProducts();
      setToast({
        open: true,
        message: err.response?.data?.error || 'Failed to update product status.',
        severity: 'error'
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleColorToggle = (colorName) => {
    if (!availableColorsForThickness.has(colorName)) {
      return;
    }
    setFormData(prev => {
      const exists = prev.colors.includes(colorName);
      if (exists) {
        return { ...prev, colors: prev.colors.filter(c => c !== colorName) };
      } else {
        return { ...prev, colors: [...prev.colors, colorName] };
      }
    });
  };

  const handleSelectAllColors = () => {
    const availableOnly = ROOFING_COLORS
      .map(c => c.name)
      .filter(name => availableColorsForThickness.has(name));
    setFormData(prev => ({ ...prev, colors: availableOnly }));
  };

  const handleClearAllColors = () => {
    setFormData(prev => ({ ...prev, colors: [] }));
  };

  const handleImageFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      if (formData.imageUrls.length >= 12) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => {
          if (prev.imageUrls.length >= 12) return prev;
          return { ...prev, imageUrls: [...prev.imageUrls, e.target.result] };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== idx)
    }));
  };

  const openNewThicknessModal = (target = { type: 'base' }) => {
    setNewThicknessTarget(target);
    setNewThicknessInput('');
    setNewThicknessError('');
    setNewThicknessModalOpen(true);
  };

  const handleCreateNewThickness = (e) => {
    if (e) e.preventDefault();
    const raw = (newThicknessInput || '').trim();
    if (!raw) {
      setNewThicknessError('Please enter a thickness number (0.45 or 0.75).');
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(raw)) {
      setNewThicknessError('Only numbers can be entered (0.45 or 0.75).');
      return;
    }

    const num = parseFloat(raw);
    if (isNaN(num) || num <= 0) {
      setNewThicknessError('Please enter a valid positive number greater than 0.');
      return;
    }

    const formatted = formatDisplayThickness(raw);
    const normalized = normalizeThickness(raw);

    const isUsedInBase = baseNorm === normalized;
    const isUsedInVariant = variants.some(v => normalizeThickness(v.thickness) === normalized);

    if (newThicknessTarget?.type === 'base' && isUsedInVariant) {
      setNewThicknessError(`Thickness "${formatted}" is already assigned to a variant on this product. Duplicate thicknesses are not allowed.`);
      return;
    }

    if (newThicknessTarget?.type === 'variant' && isUsedInBase) {
      setNewThicknessError(`Thickness "${formatted}" is already used as the Base Product thickness. A variant cannot duplicate the Base thickness.`);
      return;
    }

    if (newThicknessTarget?.type === 'variant' && isUsedInVariant) {
      const dupIdx = variants.findIndex(v => normalizeThickness(v.thickness) === normalized);
      if (dupIdx !== newThicknessTarget.index) {
        setNewThicknessError(`Thickness "${formatted}" is already assigned to Variant #${dupIdx + 1}. Each variant must have a unique thickness.`);
        return;
      }
    }

    if (newThicknessTarget?.type === 'newVariantRow' && (isUsedInBase || isUsedInVariant)) {
      setNewThicknessError(`Thickness "${formatted}" is already in use on this product. Each variant must have a unique thickness.`);
      return;
    }

    if (!customThicknesses.some(t => normalizeThickness(t) === normalized)) {
      const updated = [...customThicknesses, formatted];
      setCustomThicknesses(updated);
      try {
        localStorage.setItem('mega_custom_thicknesses', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save custom thickness:', err);
      }
    }

    if (newThicknessTarget?.type === 'base') {
      setFormData(prev => ({ ...prev, thickness: formatted }));
    } else if (newThicknessTarget?.type === 'variant') {
      const idx = newThicknessTarget.index;
      setVariants(prev => {
        const copy = [...prev];
        const oldName = copy[idx]?.name || '';
        const isDefault = !oldName || oldName.endsWith('Thickness');
        copy[idx] = {
          ...copy[idx],
          thickness: formatted,
          name: isDefault ? `${formatted} Thickness` : oldName
        };
        return copy;
      });
    } else if (newThicknessTarget?.type === 'newVariantRow') {
      setVariants(prev => [
        ...prev,
        {
          name: `${formatted} Thickness`,
          thickness: formatted,
          originalPrice: '',
          status: 'available'
        }
      ]);
    }

    setToast({
      open: true,
      message: `Thickness "${formatted}" added and selected.`,
      severity: 'success'
    });

    setNewThicknessModalOpen(false);
    setNewThicknessInput('');
    setNewThicknessError('');
  };

  const handleVariantChange = (index, field, value) => {
    if (field === 'thickness' && value === '__ADD_NEW__') {
      openNewThicknessModal({ type: 'variant', index });
      return;
    }
    setVariants(prev => {
      const copy = [...prev];
      if (field === 'thickness') {
        const oldName = copy[index]?.name || '';
        const isDefault = !oldName || oldName.endsWith('Thickness');
        copy[index] = {
          ...copy[index],
          thickness: value,
          name: isDefault ? `${value} Thickness` : oldName
        };
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const handleAddVariantRow = () => {
    const usedNorms = new Set([
      baseNorm,
      ...variants.map(v => normalizeThickness(v.thickness)).filter(Boolean)
    ]);

    const availableThick = availableThicknesses.find(th => !usedNorms.has(normalizeThickness(th)));

    if (availableThick) {
      setVariants(prev => [
        ...prev,
        {
          name: `${availableThick} Thickness`,
          thickness: availableThick,
          originalPrice: '',
          status: 'available'
        }
      ]);
    } else {
      openNewThicknessModal({ type: 'newVariantRow' });
    }
  };

  const handleRemoveVariantRow = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Product Name is required.');
      return;
    }
    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      setErrorMsg('Please provide a valid price per meter.');
      return;
    }
    if (!hasCoilStockForThickness(coils, formData.thickness)) {
      setErrorMsg(`Cannot save pre-order product: Base thickness "${formData.thickness}" has no raw coils in Coil Inventory. Steel coils must be stocked in inventory before products can be created.`);
      return;
    }
    const validColors = formData.colors.filter(c => availableColorsForThickness.has(c));
    if (validColors.length === 0) {
      setErrorMsg(`Please select at least one available color with physical coil stock in inventory for ${formData.thickness}.`);
      return;
    }
    if (formData.colors.some(c => !availableColorsForThickness.has(c))) {
      setErrorMsg(`One or more selected colors are not available in Coil Inventory for ${formData.thickness}.`);
      return;
    }

    if (baseConflictVariantIndex >= 0) {
      setErrorMsg(`Variant #${baseConflictVariantIndex + 1} uses the same thickness (${formData.thickness}) as the Base Product. Each variant must have a unique thickness different from the base.`);
      return;
    }

    const firstConflictRow = Object.keys(variantThicknessConflicts)[0];
    if (firstConflictRow !== undefined) {
      setErrorMsg(variantThicknessConflicts[firstConflictRow]);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('appToken');
      const payload = {
        ...formData,
        colors: validColors,
        isActive: formData.isActive !== false,
        imageUrl: formData.imageUrls && formData.imageUrls.length > 0 ? formData.imageUrls[0] : null,
        originalPrice: parseFloat(formData.originalPrice),
        variants: variants.filter(v => v.originalPrice !== '' && !isNaN(parseFloat(v.originalPrice))).map(v => ({
          id: v.id,
          name: v.name || `${v.thickness} Thickness`,
          thickness: v.thickness,
          originalPrice: parseFloat(v.originalPrice),
          status: v.status || 'available'
        }))
      };

      if (editingProduct) {
        await axios.put(`${API_URL}/api/sales/pre-order-products/${editingProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/sales/pre-order-products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Save error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.delete(`${API_URL}/api/sales/pre-order-products/${deleteConfirmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteConfirmId(null);
      setToast({
        open: true,
        message: res.data?.message || 'Pre-order product deleted successfully.',
        severity: res.data?.archived ? 'info' : 'success'
      });
      fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteError(err.response?.data?.error || 'Failed to delete pre-order product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.type && p.type.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'ALL' || p.type === selectedType;
    const isProdActive = p.isActive !== false;
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isProdActive) ||
      (statusFilter === 'DISABLED' && !isProdActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.type).filter(Boolean)))];

  return (
    <div style={{ padding: '2rem 2.5rem', color: 'var(--text-primary)', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Pre-Order Products
            </h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.65rem', borderRadius: 9999, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#3b82f6', fontSize: '0.72rem', fontWeight: 700 }}>
              Made-to-Order Catalog
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage roll-forming roofing profiles available for customer pre-order. Customers specify length per meter (up to 21m max) with 14 standard coil finishes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>


          <button
            onClick={openAddModal}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
            }}
          >
            <AddCircleIcon sx={{ fontSize: 18 }} /> Add New Pre-Order Product
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Catalog Profiles
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {products.length}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: 4, display: 'flex', gap: 8 }}>
            <span style={{ color: '#10b981', fontWeight: 600 }}>
              {products.filter(p => p.isActive !== false).length} Active
            </span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ color: products.filter(p => p.isActive === false).length > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
              {products.filter(p => p.isActive === false).length} Disabled
            </span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Thickness Options
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6', marginTop: 4 }}>
            0.35 – 0.60mm
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Standard industrial gauges
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Standard Finishes
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>
            14 Colors
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Marshall Gray to New Guinea Brown
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Raw Coil Stock Health
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: coilSummary?.criticalCount > 0 ? '#ef4444' : '#10b981' }}>
              {coilSummary ? (
                `${(coilSummary.totalRolls ?? coilSummary.totalCoils ?? 0).toLocaleString()} Rolls`
              ) : 'Loading...'}
            </span>
            {coilSummary?.totalMeters > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                ({coilSummary.totalMeters.toLocaleString()}m)
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {coilSummary ? `${coilSummary.optimalCount} Optimal · ${coilSummary.lowCount} Low · ${coilSummary.criticalCount} Critical` : 'Telemetry synced'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 320, maxWidth: '100%' }}>
            <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18, pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search profile or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.4rem',
                borderRadius: 10,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'inline-flex', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: 3 }}>
            <button
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 7,
                fontSize: '0.76rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'ALL' ? '#3b82f6' : 'transparent',
                color: statusFilter === 'ALL' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 7,
                fontSize: '0.76rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'ACTIVE' ? '#10b981' : 'transparent',
                color: statusFilter === 'ACTIVE' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              Active ({products.filter(p => p.isActive !== false).length})
            </button>
            <button
              onClick={() => setStatusFilter('DISABLED')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 7,
                fontSize: '0.76rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'DISABLED' ? '#ef4444' : 'transparent',
                color: statusFilter === 'DISABLED' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              Disabled ({products.filter(p => p.isActive === false).length})
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedType === cat ? '1px solid #3b82f6' : '1px solid var(--border-light)',
                background: selectedType === cat ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: selectedType === cat ? '#60a5fa' : 'var(--text-muted)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CircularProgress size={32} />
            <div style={{ marginTop: 12, fontSize: '0.85rem' }}>Loading pre-order profiles...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <WarehouseIcon sx={{ fontSize: 44, color: 'var(--text-muted)', opacity: 0.5, marginBottom: 1 }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>No Pre-Order Products Found</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.35rem 0 1.25rem' }}>
              Create your first made-to-order roofing product profile with selectable thicknesses and colors.
            </p>
            <button
              onClick={openAddModal}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none',
                background: '#2563eb', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <AddCircleIcon sx={{ fontSize: 18 }} /> Add Pre-Order Product
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.06)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Product Profile</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Customer Status</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Dimensions</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Base Thickness & Price</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Colors Offered</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Variants</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const displayImg = (p.imageUrls && p.imageUrls[0]) || p.imageUrl;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {displayImg ? (
                              <img src={displayImg} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <LayersIcon sx={{ fontSize: 22, color: 'var(--text-muted)' }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{p.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: 4, background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
                                {p.type || 'Rib Type'}
                              </span>
                              {isCustomLengthProfile(p.type) ? (
                                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                                  Custom up to {p.maxMeters || 21}m
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                  Fixed standard unit
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          disabled={togglingId === p.id}
                          title={p.isActive !== false ? "Click to disable (hide from customer catalog)" : "Click to enable (show in customer catalog)"}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '0.35rem 0.75rem',
                            borderRadius: 9999,
                            border: p.isActive !== false ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(239,68,68,0.35)',
                            background: p.isActive !== false ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: p.isActive !== false ? '#10b981' : '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: togglingId === p.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease',
                            outline: 'none'
                          }}
                        >
                          {togglingId === p.id ? (
                            <CircularProgress size={12} sx={{ color: p.isActive !== false ? '#10b981' : '#ef4444' }} />
                          ) : (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: p.isActive !== false ? '#10b981' : '#ef4444',
                                boxShadow: p.isActive !== false ? '0 0 6px #10b981' : 'none'
                              }}
                            />
                          )}
                          <span>{p.isActive !== false ? 'Active' : 'Disabled'}</span>
                        </button>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          {p.isActive !== false ? 'Visible to customer' : 'Hidden from customer'}
                        </div>
                        {(() => {
                          const hasCoilStock = hasCoilStockForThickness(coils, p.thickness);
                          const inStockCount = (p.colors || []).filter(c => isCoilInStock(coils, p.thickness, c)).length;
                          if (!hasCoilStock || inStockCount === 0) {
                            return (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: '0.68rem', fontWeight: 700, border: '1px solid rgba(239,68,68,0.25)' }}>
                                ⛔ Unavailable in Sales (0 Coils)
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </td>

                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                          <div>Effective: <strong>{p.effectiveWidth ? `${p.effectiveWidth}m` : '—'}</strong></div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>
                            Nominal: {p.nominalWidth ? `${p.nominalWidth}m` : '—'} · Rib: {p.ribHeight ? `${p.ribHeight}mm` : '—'}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div>
                          <span style={{ display: 'inline-flex', padding: '0.15rem 0.45rem', borderRadius: 6, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 700, fontSize: '0.75rem', marginBottom: 4 }}>
                            {p.thickness || '0.35mm'}
                          </span>
                          <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.92rem' }}>
                            ₱{((p.originalPrice || p.price) * 0.70).toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>/{p.unit || 'm'}</span>
                          </div>
                          {p.originalPrice && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              Orig: ₱{parseFloat(p.originalPrice).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        {(() => {
                          const productColors = (p.colors && p.colors.length > 0 ? p.colors : ROOFING_COLORS.map(c => c.name));
                          const inStockCount = productColors.filter(c => isCoilInStock(coils, p.thickness, c)).length;
                          const totalColors = productColors.length;

                          return (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', maxWidth: 220 }}>
                                {productColors.slice(0, 6).map(colorName => {
                                  const spec = ROOFING_COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase());
                                  const inStock = isCoilInStock(coils, p.thickness, colorName);

                                  return (
                                    <Tooltip key={colorName} title={inStock ? colorName : `${colorName} (Unavailable in Coil Inventory)`}>
                                      <div style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: '50%',
                                        background: spec?.hex || '#64748b',
                                        border: inStock ? '1px solid rgba(0,0,0,0.2)' : '1.5px dashed #ef4444',
                                        opacity: inStock ? 1 : 0.35,
                                        position: 'relative',
                                        overflow: 'hidden'
                                      }}>
                                        {!inStock && (
                                          <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: -2,
                                            right: -2,
                                            height: 1.5,
                                            background: '#ef4444',
                                            transform: 'rotate(-45deg)'
                                          }} />
                                        )}
                                      </div>
                                    </Tooltip>
                                  );
                                })}
                                {totalColors > 6 && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    +{totalColors - 6} more
                                  </span>
                                )}
                              </div>
                              <div style={{ marginTop: 4 }}>
                                {inStockCount === 0 ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#ef4444', fontSize: '0.68rem', fontWeight: 700 }}>
                                    ⛔ 0 of {totalColors} finishes in coil stock
                                  </span>
                                ) : inStockCount < totalColors ? (
                                  <span style={{ color: '#f59e0b', fontSize: '0.68rem', fontWeight: 600 }}>
                                    ⚠️ {inStockCount}/{totalColors} finishes in stock
                                  </span>
                                ) : (
                                  <span style={{ color: '#10b981', fontSize: '0.68rem', fontWeight: 600 }}>
                                    ✓ All {totalColors} finishes in coil stock
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.55rem', borderRadius: 6, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', fontSize: '0.74rem', fontWeight: 600, color: '#a78bfa' }}>
                          {p.variants?.length || 0} thickness variant{p.variants?.length !== 1 ? 's' : ''}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-light)',
                              background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer'
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Product"
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                              background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer'
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
            borderRadius: 20, width: '100%', maxWidth: 940, maxHeight: '92vh', overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)', boxSizing: 'border-box'
          }}>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border-light)',
              position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {editingProduct ? 'Update Pre-Order Product' : 'Add New Pre-Order Product'}
                </h2>
                <div style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Fill in the details to create or update a customizable pre-order roofing profile.
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-light)',
                  background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: '1.75rem' }}>
              {errorMsg && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                  {errorMsg}
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.15rem',
                borderRadius: 12,
                background: formData.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: formData.isActive ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: formData.isActive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: formData.isActive ? '#10b981' : '#ef4444' }} />
                    Customer Catalog Visibility: {formData.isActive ? 'Active (Displayed to Customers)' : 'Disabled (Hidden from Customers)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {formData.isActive
                      ? 'Customers can browse this product, view specs, specify custom lengths, and place pre-orders.'
                      : 'This product is hidden from customer browsing and cannot be ordered until re-enabled.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: 8,
                    border: 'none',
                    background: formData.isActive ? '#ef4444' : '#10b981',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {formData.isActive ? 'Disable Product' : 'Enable Product'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.75rem', marginBottom: '1.5rem' }}>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                    Product Images (Max 12)
                  </label>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImageFiles(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? '#3b82f6' : 'var(--border-light)'}`,
                      borderRadius: 14,
                      background: isDragging ? 'rgba(59,130,246,0.06)' : 'var(--bg-primary)',
                      padding: '1.5rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.18s'
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageFiles(e.target.files)}
                    />
                    <CloudUploadIcon sx={{ fontSize: 32, color: '#3b82f6', marginBottom: 1 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Drag & drop images
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      or <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>browse files</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      PNG, JPG, WEBP · max 5 MB
                    </div>
                  </div>

                  {formData.imageUrls.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
                      {formData.imageUrls.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                          <img src={url} alt={`upload-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                            style={{
                              position: 'absolute', top: 3, right: 3, width: 20, height: 20,
                              borderRadius: '50%', background: 'rgba(239,68,68,0.85)', color: '#fff',
                              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: 10
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Pico Rib"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10,
                        background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                        Original Price (₱)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="340.00"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        style={{
                          width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10,
                          background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                      {formData.originalPrice && (
                        <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                          Selling: ₱{(parseFloat(formData.originalPrice) * 0.70).toFixed(2)} (Less 30% Auto Discount)
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                        Unit
                      </label>
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="per meter"
                        style={{
                          width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10,
                          background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: '0.7rem', color: isCustomLengthProfile(formData.type) ? '#16a34a' : 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
                        {isCustomLengthProfile(formData.type)
                          ? 'Customizable cut length by customer (up to 21m)'
                          : 'Fixed standard unit (No custom cut length for this profile)'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Effective Width (m)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="1.013"
                        value={formData.effectiveWidth}
                        onChange={(e) => setFormData({ ...formData, effectiveWidth: e.target.value })}
                        style={{
                          width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8,
                          background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Nominal Width (m)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="1.120"
                        value={formData.nominalWidth}
                        onChange={(e) => setFormData({ ...formData, nominalWidth: e.target.value })}
                        style={{
                          width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8,
                          background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Rib Height (mm)
                      </label>
                      <input
                        type="number"
                        step="1"
                        placeholder="28"
                        value={formData.ribHeight}
                        onChange={(e) => setFormData({ ...formData, ribHeight: e.target.value })}
                        style={{
                          width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8,
                          background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Base Thickness
                        </label>
                        <button
                          type="button"
                          onClick={() => openNewThicknessModal({ type: 'base' })}
                          style={{
                            background: 'none', border: 'none', color: '#2563eb', fontSize: '0.72rem',
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0
                          }}
                        >
                          <AddCircleOutlineIcon sx={{ fontSize: 13 }} /> Add New Thickness
                        </button>
                      </div>
                      <select
                        value={formData.thickness}
                        onChange={(e) => {
                          if (e.target.value === '__ADD_NEW__') {
                            openNewThicknessModal({ type: 'base' });
                            return;
                          }
                          const newThick = e.target.value;
                          const newAvailableSet = getAvailableColorsForThickness(coils, newThick);

                          setFormData(prev => ({
                            ...prev,
                            thickness: newThick,
                            colors: prev.colors.filter(c => newAvailableSet.has(c))
                          }));
                        }}
                        style={{
                          width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10,
                          background: 'var(--bg-primary)',
                          border: baseConflictVariantIndex >= 0 ? '1px solid #ef4444' : '1px solid var(--border-light)',
                          color: baseConflictVariantIndex >= 0 ? '#ef4444' : 'var(--text-primary)',
                          fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      >
                        {availableThicknesses.map(t => {
                          const isUsedInVar = variants.findIndex(v => normalizeThickness(v.thickness) === normalizeThickness(t));
                          const hasStock = hasCoilStockForThickness(coils, t);
                          const finishesSet = getAvailableColorsForThickness(coils, t);
                          return (
                            <option key={t} value={t}>
                              {t} {!hasStock ? '(No Coil Stock in Inventory)' : `(${finishesSet.size} finishes in stock)`} {isUsedInVar >= 0 ? `(⚠️ Used in Variant #${isUsedInVar + 1})` : ''}
                            </option>
                          );
                        })}
                        <option value="__ADD_NEW__" style={{ color: '#2563eb', fontWeight: 700 }}>
                          + Add New Thickness...
                        </option>
                      </select>
                      {!hasCoilStockForThickness(coils, formData.thickness) && (
                        <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ErrorOutlineIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                          <span>No coils available in Coil Inventory for thickness "{formData.thickness}". Raw steel coils must be stocked in Logistics before creating or updating pre-order products with this gauge.</span>
                        </div>
                      )}
                      {baseConflictVariantIndex >= 0 && (
                        <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ErrorOutlineIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                          <span>Conflict: Thickness "{formData.thickness}" is also used in Variant #{baseConflictVariantIndex + 1}. Base and variants must have different thicknesses.</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                          Category Profile Type
                        </label>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: isCustomLengthProfile(formData.type) ? 'rgba(34, 197, 94, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                          color: isCustomLengthProfile(formData.type) ? '#16a34a' : '#64748b'
                        }}>
                          {isCustomLengthProfile(formData.type) ? 'Custom Cut Length (0.5m – 21m)' : 'Standard Piece / Fixed Unit'}
                        </span>
                      </div>
                      <select
                        value={formData.type}
                        onChange={(e) => {
                          const nextType = e.target.value;
                          const willSupportLength = isCustomLengthProfile(nextType);
                          const wasSupportingLength = isCustomLengthProfile(formData.type);
                          let updatedUnit = formData.unit;
                          if (!willSupportLength && wasSupportingLength && (formData.unit === 'per meter' || !formData.unit)) {
                            updatedUnit = 'per piece';
                          } else if (willSupportLength && !wasSupportingLength && (formData.unit === 'per piece' || formData.unit === 'pc')) {
                            updatedUnit = 'per meter';
                          }
                          setFormData({ ...formData, type: nextType, unit: updatedUnit });
                        }}
                        style={{
                          width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10,
                          background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      >
                        <option value="Rib Type">Rib Type</option>
                        <option value="Corrugated">Corrugated</option>
                        <option value="Tile Profile">Tile Profile</option>
                        <option value="Bended Accessories">Bended Accessories</option>
                        <option value="Steel Decking">Steel Decking</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 14, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PaletteIcon sx={{ fontSize: 16 }} /> Available Coil Colors for {formData.thickness || 'Selected Gauge'} ({formData.colors.length} of {availableColorsForThickness.size} available selected)
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleSelectAllColors}
                      disabled={availableColorsForThickness.size === 0}
                      style={{
                        fontSize: '0.72rem',
                        color: availableColorsForThickness.size === 0 ? 'var(--text-muted)' : '#3b82f6',
                        background: 'none', border: 'none',
                        cursor: availableColorsForThickness.size === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        opacity: availableColorsForThickness.size === 0 ? 0.5 : 1
                      }}
                    >
                      Select All Available
                    </button>
                    <span style={{ color: 'var(--border-light)' }}>·</span>
                    <button
                      type="button"
                      onClick={handleClearAllColors}
                      style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {availableColorsForThickness.size === 0 ? (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 10,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <ErrorOutlineIcon sx={{ fontSize: 18 }} />
                    <span>No coil stock is available in Coil Inventory for thickness "{formData.thickness}". You cannot create or save a Pre-Order Product with this material until steel coils are restocked.</span>
                  </div>
                ) : (
                  availableColorsForThickness.size < ROOFING_COLORS.length && (
                    <div style={{ fontSize: '0.73rem', color: '#f59e0b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>⚠️ {ROOFING_COLORS.length - availableColorsForThickness.size} color finish(es) have no physical coil stock for {formData.thickness} and cannot be selected.</span>
                    </div>
                  )
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 8 }}>
                  {ROOFING_COLORS.map(color => {
                    const isAvailable = availableColorsForThickness.has(color.name);
                    const isSelected = formData.colors.includes(color.name);

                    return (
                      <div
                        key={color.name}
                        onClick={() => {
                          if (isAvailable) {
                            handleColorToggle(color.name);
                          }
                        }}
                        title={!isAvailable ? `${color.name} is not available in ${formData.thickness || 'this thickness'} coil inventory` : color.name}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                          padding: '0.45rem 0.65rem', borderRadius: 8,
                          border: `1px solid ${isSelected ? '#3b82f6' : (isAvailable ? 'var(--border-light)' : 'rgba(239,68,68,0.25)')}`,
                          background: isSelected
                            ? 'rgba(59,130,246,0.1)'
                            : (!isAvailable ? 'rgba(239,68,68,0.03)' : 'var(--bg-secondary)'),
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          opacity: isAvailable ? 1 : 0.45,
                          transition: 'all 0.15s', userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%',
                            background: color.hex, border: `1px solid ${color.border}`,
                            flexShrink: 0,
                            filter: !isAvailable ? 'grayscale(40%)' : 'none',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {!isAvailable && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: -2,
                                right: -2,
                                height: 1.5,
                                background: '#ef4444',
                                transform: 'rotate(-45deg)'
                              }} />
                            )}
                          </div>
                          <span style={{
                            fontSize: '0.76rem',
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>
                            {color.name}
                          </span>
                        </div>
                        {!isAvailable && (
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            color: '#ef4444',
                            background: 'rgba(239,68,68,0.12)',
                            padding: '1px 5px',
                            borderRadius: 4,
                            flexShrink: 0,
                            letterSpacing: '0.02em'
                          }}>
                            No Coil Stock
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                  Product Description
                </label>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    style={{ minHeight: 120 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Product Variants (Thickness Pricing)
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Configure pricing for other thickness gauges from the official price list.
                    </div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.04)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Thickness</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Variant Name</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Orig. Price (₱/m)</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Selling Price</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => {
                      const vSelling = v.originalPrice ? (parseFloat(v.originalPrice) * 0.70).toFixed(2) : '0.00';
                      const rowConflict = variantThicknessConflicts[idx];
                      return (
                        <tr key={idx} style={{
                          borderBottom: '1px solid var(--border-light)',
                          background: rowConflict ? 'rgba(239,68,68,0.04)' : 'transparent'
                        }}>
                          <td style={{ padding: '0.5rem 0.8rem' }}>
                            <select
                              value={v.thickness}
                              onChange={(e) => handleVariantChange(idx, 'thickness', e.target.value)}
                              style={{
                                padding: '0.4rem 0.6rem', borderRadius: 6,
                                background: 'var(--bg-primary)',
                                border: rowConflict ? '1px solid #ef4444' : '1px solid var(--border-light)',
                                color: rowConflict ? '#ef4444' : 'var(--text-primary)',
                                fontSize: '0.8rem',
                                fontWeight: rowConflict ? 700 : 400
                              }}
                            >
                              {availableThicknesses.map(th => {
                                const isBase = normalizeThickness(th) === baseNorm;
                                const otherVarIdx = variants.findIndex((o, oIdx) => oIdx !== idx && normalizeThickness(o.thickness) === normalizeThickness(th));
                                const hasStock = hasCoilStockForThickness(coils, th);
                                const isDisabled = isBase || otherVarIdx >= 0;

                                let note = '';
                                if (isBase) note = ' — (Base Thickness: Duplicate Not Allowed)';
                                else if (otherVarIdx >= 0) note = ` — (Used in Variant #${otherVarIdx + 1}: Duplicate Not Allowed)`;
                                else if (!hasStock) note = ' — (No Coil Stock in Inventory)';

                                return (
                                  <option key={th} value={th} disabled={isDisabled}>
                                    {th}{note}
                                  </option>
                                );
                              })}
                              <option value="__ADD_NEW__" style={{ color: '#2563eb', fontWeight: 700 }}>
                                + Add New Thickness...
                              </option>
                            </select>
                            {!hasCoilStockForThickness(coils, v.thickness) && (
                              <div style={{ color: '#f59e0b', fontSize: '0.68rem', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <span>⚠️ No coil stock in inventory</span>
                              </div>
                            )}
                            {rowConflict && (
                              <div style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <ErrorOutlineIcon sx={{ fontSize: 13, flexShrink: 0 }} />
                                <span>{rowConflict}</span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.5rem 0.8rem' }}>
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                              placeholder={`${v.thickness} Thickness`}
                              style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                            />
                          </td>
                          <td style={{ padding: '0.5rem 0.8rem' }}>
                            <input
                              type="number"
                              step="0.01"
                              value={v.originalPrice}
                              onChange={(e) => handleVariantChange(idx, 'originalPrice', e.target.value)}
                              placeholder="368.00"
                              style={{ width: 110, padding: '0.4rem 0.6rem', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.5rem 0.8rem', color: '#16a34a', fontWeight: 600 }}>
                            ₱{vSelling}
                          </td>
                          <td style={{ padding: '0.5rem 0.8rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              style={{ padding: '0.3rem 0.6rem', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '0.45rem 0.85rem', borderRadius: 8, border: '1px dashed #3b82f6',
                      background: 'rgba(59,130,246,0.06)', color: '#3b82f6', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <AddCircleIcon sx={{ fontSize: 16 }} /> Add Thickness Variant Row
                  </button>
                  <button
                    type="button"
                    onClick={() => openNewThicknessModal({ type: 'newVariantRow' })}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '0.45rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-light)',
                      background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <AddCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a' }} /> New Thickness Gauge
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: '2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-light)',
                    background: 'transparent', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '0.65rem 1.6rem', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
                  }}
                >
                  
                  {editingProduct ? 'Update Pre-Order Product' : 'Create Pre-Order Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {newThicknessModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1400, padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border-light)',
            width: '100%', maxWidth: 440, padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <StraightenIcon sx={{ fontSize: 18 }} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Add New Thickness Gauge
                </h3>
              </div>
              <IconButton size="small" onClick={() => setNewThicknessModalOpen(false)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </div>

            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Enter a numerical thickness gauge (ex. <code>0.45</code>, <code>0.75</code>). Only numbers are allowed; the <code>mm</code> unit will be added automatically.
            </p>

            <form onSubmit={handleCreateNewThickness}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                  Thickness Value (Numbers Only)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoFocus
                    placeholder="0.45"
                    value={newThicknessInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setNewThicknessInput(val);
                        if (newThicknessError) setNewThicknessError('');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                        return;
                      }
                      
                      if (e.ctrlKey || e.metaKey) {
                        return;
                      }
                      
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                        return;
                      }
                      
                      if (e.key === '.' && newThicknessInput.includes('.')) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasteText = e.clipboardData.getData('text');
                      const digitsOnly = pasteText.replace(/[^0-9.]/g, '');
                      const parts = digitsOnly.split('.');
                      const validNum = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : digitsOnly;
                      if (validNum) {
                        setNewThicknessInput(validNum);
                        if (newThicknessError) setNewThicknessError('');
                      }
                    }}
                    style={{
                      width: '100%', padding: '0.65rem 2.8rem 0.65rem 0.85rem', borderRadius: 10,
                      background: 'var(--bg-primary)', border: newThicknessError ? '1px solid #ef4444' : '1px solid var(--border-light)',
                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  <span style={{
                    position: 'absolute', right: 12, fontSize: '0.82rem', fontWeight: 700,
                    color: 'var(--text-muted)', pointerEvents: 'none', userSelect: 'none'
                  }}>
                    mm
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                  Quick presets:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['0.28', '0.30', '0.45', '0.55', '0.65', '0.75', '0.85', '1.00'].map(preset => {
                    const presetWithUnit = `${preset}mm`;
                    const isAlreadyAdded = availableThicknesses.some(t => normalizeThickness(t) === normalizeThickness(presetWithUnit));
                    return (
                      <button
                        key={preset}
                        type="button"
                        disabled={isAlreadyAdded}
                        onClick={() => {
                          setNewThicknessInput(preset);
                          if (newThicknessError) setNewThicknessError('');
                        }}
                        style={{
                          padding: '0.25rem 0.55rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                          border: isAlreadyAdded ? '1px solid var(--border-light)' : '1px solid #3b82f6',
                          background: isAlreadyAdded ? 'rgba(0,0,0,0.03)' : 'rgba(59,130,246,0.08)',
                          color: isAlreadyAdded ? 'var(--text-muted)' : '#2563eb',
                          cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                          opacity: isAlreadyAdded ? 0.45 : 1
                        }}
                      >
                        {presetWithUnit} {isAlreadyAdded ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {newThicknessError && (
                <div style={{
                  padding: '0.6rem 0.8rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.76rem',
                  marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <ErrorOutlineIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                  <span>{newThicknessError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setNewThicknessModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem', borderRadius: 8, border: '1px solid var(--border-light)',
                    background: 'transparent', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newThicknessInput.trim() || isNaN(parseFloat(newThicknessInput)) || parseFloat(newThicknessInput) <= 0}
                  style={{
                    padding: '0.55rem 1.25rem', borderRadius: 8, border: 'none',
                    background: (newThicknessInput.trim() && !isNaN(parseFloat(newThicknessInput)) && parseFloat(newThicknessInput) > 0) ? '#2563eb' : 'var(--border-light)',
                    color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                    cursor: (newThicknessInput.trim() && !isNaN(parseFloat(newThicknessInput)) && parseFloat(newThicknessInput) > 0) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Add Thickness
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <Dialog open={true} onClose={() => { if (!isDeleting) { setDeleteConfirmId(null); setDeleteError(''); } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            {deleteError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {deleteError}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete this pre-order profile? Customers will no longer be able to pre-order this item.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Note: If this product has existing customer orders, it will be safely archived to preserve historical order records.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => { setDeleteConfirmId(null); setDeleteError(''); }} color="inherit" disabled={isDeleting}>Cancel</Button>
            <Button onClick={handleDeleteProduct} color="error" variant="contained" disabled={isDeleting}>
              {isDeleting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default PreOrderProductsPage;
