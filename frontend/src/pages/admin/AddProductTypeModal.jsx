import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  X,
  Tag,
  AlignLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

/* Inline styles matching ProductManagement theme */
const M = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem', animation: 'fadeInOverlay 0.18s ease',
  },
  modal: {
    background: '#111111', border: '1px solid #2e2e2e', borderRadius: 20,
    width: '100%', maxWidth: 460,
    boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
    animation: 'slideUpModal 0.22s cubic-bezier(0.16,1,0.3,1)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid #1e1e1e',
  },
  title: { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f0f0f0' },
  subtitle: { margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#6b7280' },
  closeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 8, border: '1px solid #2e2e2e',
    background: 'transparent', color: '#6b7280', cursor: 'pointer',
    transition: 'all 0.15s', flexShrink: 0,
  },
  body: { padding: '1.25rem 1.5rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' },
  label: {
    fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'flex', alignItems: 'center', gap: '0.35rem',
  },
  input: {
    width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a',
    borderRadius: 10, padding: '0.65rem 0.85rem', color: '#f0f0f0',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  textarea: {
    width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a',
    borderRadius: 10, padding: '0.65rem 0.85rem', color: '#f0f0f0',
    fontSize: '0.875rem', outline: 'none', resize: 'vertical', minHeight: 80,
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    gap: '0.75rem', padding: '0 1.5rem 1.5rem',
  },
  btnCancel: {
    padding: '0.6rem 1.2rem', borderRadius: 10, border: '1px solid #2e2e2e',
    background: 'transparent', color: '#9ca3af', fontSize: '0.84rem',
    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
  },
  btnCreate: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer',
    transition: 'opacity 0.18s, transform 0.12s',
    boxShadow: '0 2px 12px rgba(34,197,94,0.28)',
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 0.85rem', borderRadius: 10, marginBottom: '1rem',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    fontSize: '0.8rem', color: '#f87171', fontWeight: 500,
  },
  successBanner: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 0.85rem', borderRadius: 10, marginBottom: '1rem',
    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
    fontSize: '0.8rem', color: '#4ade80', fontWeight: 500,
  },
};

/* Focus styles */
const modalFocusStyle = `
  .ptm-input:focus, .ptm-textarea:focus {
    border-color: rgba(34,197,94,0.55) !important;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.1) !important;
  }
  .ptm-close:hover { background: rgba(255,255,255,0.06); color: #d1d5db; border-color: #3e3e3e; }
  .ptm-cancel:hover { border-color: #3e3e3e; color: #d1d5db; }
  .ptm-create:hover { opacity: 0.88; transform: translateY(-1px); }
  .ptm-create:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

/**
 * AddProductTypeModal
 *
 * Self-contained modal for creating a new ProductType.
 * Props:
 *   - isOpen: boolean
 *   - onClose: () => void
 *   - onTypeCreated: (newType) => void  — called after successful creation
 */

const AddProductTypeModal = ({ isOpen, onClose, onTypeCreated }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const resetForm = () => {
    setName('');
    setDescription('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('Type name is required.'));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(`${API_URL}/api/admin/product-types`, {
        name: name.trim(),
        description: description.trim() || null,
      });

      setSuccess(t('Product type created successfully!'));

      // Notify parent with the newly created type
      if (onTypeCreated) {
        onTypeCreated(res.data);
      }

      // Brief delay so the user sees the success message, then close
      setTimeout(() => {
        handleClose();
      }, 600);
    } catch (err) {
      if (err.response?.status === 409) {
        setError(t('A product type with this name already exists.'));
      } else {
        setError(t('Failed to create product type. Please try again.'));
      }
      console.error('Error creating product type:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{modalFocusStyle}</style>
      <div style={M.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <div style={M.modal}>

          {/* Header */}
          <div style={M.header}>
            <div>
              <h2 style={M.title}>{t('Add New Product Type')}</h2>
              <p style={M.subtitle}>{t('Create a new product type for your inventory.')}</p>
            </div>
            <button className="ptm-close" onClick={handleClose} style={M.closeBtn} title={t('Close')}>
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div style={M.body}>

              {/* Error banner */}
              {error && (
                <div style={M.errorBanner}>
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div style={M.successBanner}>
                  <CheckCircle2 size={14} />
                  {success}
                </div>
              )}

              {/* Type Name */}
              <div style={M.formGroup}>
                <label style={M.label}><Tag size={11} /> {t('Type Name')} *</label>
                <input
                  className="ptm-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('e.g. Mega Standing Seam')}
                  style={M.input}
                  autoFocus
                  required
                />
              </div>

              {/* Description */}
              <div style={{ ...M.formGroup, marginBottom: 0 }}>
                <label style={M.label}><AlignLeft size={11} /> {t('Description')} ({t('optional')})</label>
                <textarea
                  className="ptm-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('Brief description of this product type…')}
                  style={M.textarea}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={M.footer}>
              <button type="button" className="ptm-cancel" onClick={handleClose} style={M.btnCancel}>
                {t('Cancel')}
              </button>
              <button type="submit" className="ptm-create" style={M.btnCreate} disabled={saving || !name.trim()}>
                {saving ? (
                  <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> {t('Creating…')}</>
                ) : (
                  t('Create Type')
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default AddProductTypeModal;
