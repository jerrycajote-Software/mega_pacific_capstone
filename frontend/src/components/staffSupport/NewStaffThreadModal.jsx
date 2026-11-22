import React, { useState, useEffect, useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { compressChatImage } from '../../utils/chatImageHelper';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from './staffSupportConstants';

const NewStaffThreadModal = ({ open, submitting, serverError, onCloseModal, onCreateThread }) => {
  const [category, setCategory] = useState('system_problem');
  const [priority, setPriority] = useState('normal');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [compressingImage, setCompressingImage] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setCategory('system_problem');
      setPriority('normal');
      setSubject('');
      setMessage('');
      setAttachedImage(null);
      setLocalError('');
    }
  }, [open]);

  if (!open) return null;

  const handleSelectScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingImage(true);
    setLocalError('');
    try {
      const compressed = await compressChatImage(file);
      setAttachedImage(compressed);
    } catch (err) {
      setLocalError(err.message || 'Unable to attach that image. Please pick a PNG, JPG, or WEBP file.');
    } finally {
      setCompressingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmitNewThread = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setLocalError('Please enter a short subject describing your concern or idea.');
      return;
    }
    if (!message.trim() && !attachedImage) {
      setLocalError('Please write a message or attach a screenshot before sending.');
      return;
    }
    setLocalError('');
    onCreateThread?.({
      category,
      priority,
      subject: subject.trim(),
      message: message.trim(),
      image: attachedImage
    });
  };

  const displayedError = localError || serverError;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-staff-thread-title"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 18,
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '1.35rem 1.5rem',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div>
            <h3 id="new-staff-thread-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Message the Administrator
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Report a system problem, suggest a new feature, or ask for help.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close message Admin dialog"
            disabled={submitting}
            onClick={onCloseModal}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)',
              width: 34,
              height: 34,
              borderRadius: 10,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 700
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmitNewThread} style={{ padding: '1.35rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayedError && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>
              {displayedError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label htmlFor="staff-support-category" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Topic Category
              </label>
              <select
                id="staff-support-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 10,
                  padding: '0.65rem 0.85rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: 600
                }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="staff-support-priority" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Urgency Level
              </label>
              <select
                id="staff-support-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 10,
                  padding: '0.65rem 0.85rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: 600
                }}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="staff-support-subject" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Subject
            </label>
            <input
              id="staff-support-subject"
              type="text"
              maxLength={140}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (localError) setLocalError('');
              }}
              placeholder="ex. Delivery status button is not saving, or Request for weekly PDF export"
              disabled={submitting}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 10,
                padding: '0.7rem 0.85rem',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label htmlFor="staff-support-message" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Details
            </label>
            <textarea
              id="staff-support-message"
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (localError) setLocalError('');
              }}
              placeholder="ex. Describe the steps that caused the issue, or explain how the new feature would help your daily work."
              disabled={submitting}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 10,
                padding: '0.75rem 0.85rem',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              hidden
              onChange={handleSelectScreenshot}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                disabled={submitting || compressingImage}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: 9,
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: submitting || compressingImage ? 'not-allowed' : 'pointer'
                }}
              >
                {compressingImage ? 'Preparing Screenshot...' : attachedImage ? 'Replace Screenshot' : 'Attach Screenshot (Optional)'}
              </button>

              {attachedImage && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setAttachedImage(null)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 8,
                    border: '1px solid rgba(239,68,68,0.35)',
                    background: 'rgba(239,68,68,0.08)',
                    color: '#ef4444',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Remove Attachment
                </button>
              )}
            </div>

            {attachedImage && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={attachedImage}
                  alt="Attached screenshot preview"
                  style={{ maxHeight: 150, borderRadius: 10, border: '1px solid var(--border-light)', display: 'block' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border-light)' }}>
            <button
              type="submit"
              disabled={submitting || compressingImage}
              style={{
                padding: '0.7rem 1.5rem',
                borderRadius: 10,
                border: 'none',
                background: '#4f772d',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: submitting || compressingImage ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={15} sx={{ color: '#ffffff' }} />
                  <span>Sending Message...</span>
                </>
              ) : (
                'Send Message to Admin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewStaffThreadModal;
