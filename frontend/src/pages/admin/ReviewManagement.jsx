import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { Rating, Avatar, Chip } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const ReviewManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spin, setSpin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('All');
  const [filterReplyStatus, setFilterReplyStatus] = useState('All');
  
  // Reply Modal/State
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [replyComment, setReplyComment] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const endpoint = isEmployee 
        ? `${API_URL}/api/employee/reviews` 
        : `${API_URL}/api/admin/reviews`;
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const refresh = () => {
    setSpin(true);
    fetchReviews().then(() => setTimeout(() => setSpin(false), 800));
  };

  const handleOpenReply = (review) => {
    setReplyReviewId(review.id);
    setReplyComment(review.reply ? review.reply.comment : '');
    setReplyError('');
    setReplySuccess('');
  };

  const handleCloseReply = () => {
    setReplyReviewId(null);
    setReplyComment('');
    setReplyError('');
    setReplySuccess('');
  };

  const handleSubmitReply = async () => {
    if (!replyComment.trim()) {
      setReplyError('Reply comment cannot be empty.');
      return;
    }

    setSubmittingReply(true);
    setReplyError('');
    setReplySuccess('');

    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(
        `${API_URL}/api/employee/reviews/${replyReviewId}/reply`,
        { comment: replyComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setReplySuccess('Reply saved successfully!');
        await fetchReviews();
        setTimeout(() => {
          handleCloseReply();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to save reply', err);
      setReplyError(err.response?.data?.message || 'Failed to submit reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const productName = review.product?.name || '';
    const customerName = review.user?.name || '';
    const comment = review.comment || '';
    
    const matchesSearch = 
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = filterRating === 'All' || review.rating === parseInt(filterRating);

    let matchesReplyStatus = true;
    if (filterReplyStatus === 'Replied') {
      matchesReplyStatus = review.reply !== null;
    } else if (filterReplyStatus === 'Unreplied') {
      matchesReplyStatus = review.reply === null;
    }

    return matchesSearch && matchesRating && matchesReplyStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#9ca3af' }}>
        <RefreshIcon sx={{ fontSize: 24, animation: 'spin 1s linear infinite', marginRight: '10px' }} />
        Loading Reviews...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Customer Reviews
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isAdmin ? 'Read customer feedback and employee replies.' : 'Read and reply to customer product feedback.'}
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 10,
            color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <RefreshIcon sx={{ fontSize: 15, animation: spin ? 'spin 0.8s linear infinite' : 'none', color: spin ? '#22c55e' : 'inherit' }} />
          Refresh Data
        </button>
      </div>

      {/* Filters & Search */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 16, border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px', minWidth: '200px' }}>
            <SearchIcon sx={{ fontSize: 16, color: 'var(--text-muted)', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by Product or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                padding: '10px 14px 10px 38px', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.85rem',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#22c55e'}
              onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <FilterListIcon sx={{ fontSize: 14, color: 'var(--text-muted)', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              style={{
                appearance: 'none', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                padding: '10px 32px', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.85rem',
                outline: 'none', cursor: 'pointer', minWidth: '130px'
              }}
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <FilterListIcon sx={{ fontSize: 14, color: 'var(--text-muted)', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <select
              value={filterReplyStatus}
              onChange={(e) => setFilterReplyStatus(e.target.value)}
              style={{
                appearance: 'none', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                padding: '10px 32px', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.85rem',
                outline: 'none', cursor: 'pointer', minWidth: '150px'
              }}
            >
              <option value="All">All Reply Status</option>
              <option value="Replied">Replied</option>
              <option value="Unreplied">Unreplied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RateReviewIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.5 }} />
          <div>No customer reviews found matching your search.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          {filteredReviews.map((review) => (
            <div key={review.id} style={{ 
              background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)',
              padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              {/* Product info & customer rating */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 60, height: 60, background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {review.product?.imageUrl ? (
                      <img src={review.product.imageUrl} alt={review.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <RateReviewIcon sx={{ opacity: 0.3 }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{review.product?.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', mt: 4 }}>
                      <Rating value={review.rating} size="small" readOnly />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({review.rating}.0)</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f772d', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{review.user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{review.user?.email}</div>
                  </div>
                </div>
              </div>

              {/* Review details */}
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                {review.title && (
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6, color: 'var(--text-primary)' }}>
                    {review.title}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {review.comment}
                </div>
                {review.imageUrls && review.imageUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, mt: 10 }}>
                    {review.imageUrls.map((img, idx) => (
                      <img key={idx} src={img} alt={`review-img-${idx}`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-light)' }} />
                    ))}
                  </div>
                )}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  Submitted on {new Date(review.createdAt).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* Nested Reply Block */}
              {review.reply ? (
                <div style={{ 
                  marginLeft: '2rem', background: 'rgba(34,197,94,0.03)', 
                  borderLeft: '3px solid #22c55e', padding: '1rem', borderRadius: '0 12px 12px 0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e' }}>{review.reply.user?.name}</span>
                      <Chip label={review.reply.user?.role} size="small" color="success" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', textTransform: 'uppercase', borderRadius: 1, fontWeight: 'bold' }} />
                    </div>
                    {isEmployee && (
                      <button 
                        onClick={() => handleOpenReply(review)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <EditIcon sx={{ fontSize: 13 }} /> Edit
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {review.reply.comment}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Replied on {new Date(review.reply.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ) : (
                isEmployee && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '2rem' }}>
                    <button
                      onClick={() => handleOpenReply(review)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 8, color: '#22c55e', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.color = '#000'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; e.currentTarget.style.color = '#22c55e'; }}
                    >
                      <ReplyIcon sx={{ fontSize: 14 }} /> Reply
                    </button>
                  </div>
                )
              )}

            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyReviewId !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 24, padding: '1.5rem', width: '100%', maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {reviews.find(r => r.id === replyReviewId)?.reply ? 'Edit Reply' : 'Post Reply'}
              </h3>
              <button 
                onClick={handleCloseReply}
                style={{ background: 'var(--bg-tertiary)', border: 'none', padding: 6, borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>
            </div>

            {replyError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{replyError}</Alert>
            )}

            {replySuccess && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>{replySuccess}</Alert>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Your Response
              </label>
              <textarea
                value={replyComment}
                onChange={(e) => setReplyComment(e.target.value)}
                placeholder="Write your customer support response here..."
                rows="5"
                style={{
                  width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                  padding: '12px', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.85rem',
                  outline: 'none', resize: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#22c55e'}
                onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                onClick={handleCloseReply}
                style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={submittingReply}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', 
                  borderRadius: 10, border: 'none', background: '#22c55e', color: '#000', 
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {submittingReply ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <>
                    <SendIcon sx={{ fontSize: 12 }} /> Save Reply
                  </>
                )}
              </button>
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

export default ReviewManagement;
