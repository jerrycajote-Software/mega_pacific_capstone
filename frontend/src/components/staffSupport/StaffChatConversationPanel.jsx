import React, { useState, useEffect, useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { compressChatImage } from '../../utils/chatImageHelper';
import {
  STATUS_OPTIONS,
  getCategoryMeta,
  getStatusMeta,
  getDepartmentMeta,
  formatRelativeChatTime
} from './staffSupportConstants';

const StaffChatConversationPanel = ({
  isAdminView = false,
  currentUserId = null,
  thread = null,
  loading = false,
  sending = false,
  updatingStatus = false,
  errorMessage = '',
  onSendReply,
  onUpdateStatus
}) => {
  const [replyText, setReplyText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [localError, setLocalError] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setReplyText('');
    setAttachedImage(null);
    setLocalError('');
  }, [thread?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages?.length]);

  const handleSelectReplyScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    setLocalError('');
    try {
      const compressed = await compressChatImage(file);
      setAttachedImage(compressed);
    } catch (err) {
      setLocalError(err.message || 'Unable to process that screenshot.');
    } finally {
      setCompressing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmitReplyMessage = async (e) => {
    e.preventDefault();
    if ((!replyText.trim() && !attachedImage) || sending || !thread?.id) {
      if (!replyText.trim() && !attachedImage) {
        setLocalError('Please type a message or attach a screenshot before sending.');
      }
      return;
    }
    setLocalError('');
    const sent = await onSendReply?.(thread.id, {
      content: replyText.trim(),
      image: attachedImage
    });
    if (sent) {
      setReplyText('');
      setAttachedImage(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 16, minHeight: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <CircularProgress size={30} sx={{ color: '#4f772d' }} />
        <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Loading conversation...</span>
      </div>
    );
  }

  if (!thread) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 16, minHeight: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {isAdminView ? 'Select a Staff Conversation' : 'No Conversation Selected'}
        </h3>
        <p style={{ margin: '8px 0 0', maxWidth: 380, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          {isAdminView
            ? 'Choose a conversation on the left to review the issue or feature request and reply directly to the staff member.'
            : 'Select a conversation on the left, or click "Start New Conversation" to send a message to the Administrator.'}
        </p>
      </div>
    );
  }

  const categoryMeta = getCategoryMeta(thread.category);
  const statusMeta = getStatusMeta(thread.status);
  const deptMeta = getDepartmentMeta(thread.staffRole);
  const messages = thread.messages ?? [];
  const shownError = localError || errorMessage;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 540,
        maxHeight: '76vh',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {thread.subject}
            </h3>
            <span style={{ padding: '3px 8px', borderRadius: 6, background: categoryMeta.bg, color: categoryMeta.color, fontSize: '0.7rem', fontWeight: 700 }}>
              {categoryMeta.label}
            </span>
            {thread.priority === 'urgent' && (
              <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(220,38,38,0.16)', color: '#dc2626', fontSize: '0.7rem', fontWeight: 800 }}>
                Urgent
              </span>
            )}
          </div>
          <div style={{ marginTop: 4, fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>{thread.staffName || thread.staffEmail}</span>
            <span style={{ padding: '2px 7px', borderRadius: 6, background: deptMeta.bg, color: deptMeta.color, fontSize: '0.68rem', fontWeight: 700 }}>
              {deptMeta.label}
            </span>
            <span>Started {formatRelativeChatTime(thread.createdAt)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAdminView ? (
            <select
              aria-label="Update conversation status"
              value={thread.status}
              disabled={updatingStatus}
              onChange={(e) => onUpdateStatus?.(thread.id, e.target.value)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 9,
                padding: '6px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: updatingStatus ? 'not-allowed' : 'pointer'
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Status: {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ padding: '4px 10px', borderRadius: 8, background: statusMeta.bg, color: statusMeta.color, fontSize: '0.76rem', fontWeight: 700 }}>
              {statusMeta.label}
            </span>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg) => {
          const isOwnMessage = Number(msg.senderId) === Number(currentUserId);
          const isAdminSender = ['admin', 'superadmin', 'super_admin'].includes(String(msg.senderRole || '').toLowerCase());

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', gap: 6 }}>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {isOwnMessage ? 'You' : (msg.senderName || (isAdminSender ? 'Administrator' : 'Staff'))}
                </strong>
                <span>({isAdminSender ? 'Admin' : getDepartmentMeta(msg.senderRole).label})</span>
                <span>{formatRelativeChatTime(msg.createdAt)}</span>
              </div>

              <div
                style={{
                  maxWidth: '78%',
                  padding: '0.75rem 1rem',
                  borderRadius: 14,
                  background: isOwnMessage ? '#1e3a8a' : 'var(--bg-primary)',
                  color: isOwnMessage ? '#ffffff' : 'var(--text-primary)',
                  border: isOwnMessage ? 'none' : '1px solid var(--border-light)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {msg.content && <div>{msg.content}</div>}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Conversation screenshot attachment"
                    onClick={() => setPreviewImageUrl(msg.imageUrl)}
                    style={{
                      marginTop: msg.content ? 8 : 0,
                      maxWidth: '100%',
                      maxHeight: 220,
                      borderRadius: 10,
                      cursor: 'pointer',
                      display: 'block'
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmitReplyMessage} style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shownError && (
          <div style={{ padding: '0.6rem 0.85rem', borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: '0.78rem', fontWeight: 600 }}>
            {shownError}
          </div>
        )}

        {attachedImage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={attachedImage} alt="Reply attachment preview" style={{ height: 58, borderRadius: 8, border: '1px solid var(--border-light)' }} />
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Remove Screenshot
            </button>
          </div>
        )}

        <textarea
          rows={2}
          maxLength={2000}
          value={replyText}
          onChange={(e) => {
            setReplyText(e.target.value);
            if (localError) setLocalError('');
          }}
          placeholder={
            isAdminView
              ? 'Write your reply to the staff member...'
              : 'Write a follow-up message to the Administrator...'
          }
          disabled={sending}
          style={{
            width: '100%',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 10,
            padding: '0.65rem 0.85rem',
            color: 'var(--text-primary)',
            fontSize: '0.84rem',
            resize: 'none',
            boxSizing: 'border-box'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            hidden
            onChange={handleSelectReplyScreenshot}
          />
          <button
            type="button"
            disabled={sending || compressing}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 9,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: sending || compressing ? 'not-allowed' : 'pointer'
            }}
          >
            {compressing ? 'Preparing Screenshot...' : 'Attach Screenshot'}
          </button>

          <button
            type="submit"
            disabled={sending || compressing}
            style={{
              padding: '0.6rem 1.35rem',
              borderRadius: 9,
              border: 'none',
              background: '#4f772d',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: sending || compressing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {sending ? (
              <>
                <CircularProgress size={14} sx={{ color: '#ffffff' }} />
                <span>Sending...</span>
              </>
            ) : (
              'Send Reply'
            )}
          </button>
        </div>
      </form>

      {previewImageUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1400,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              type="button"
              aria-label="Close screenshot preview"
              onClick={() => setPreviewImageUrl(null)}
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: 'none',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <img
              src={previewImageUrl}
              alt="Full-size screenshot preview"
              style={{ maxWidth: '88vw', maxHeight: '85vh', borderRadius: 12, display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffChatConversationPanel;
