import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Rating,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useAuth } from '../../context/AuthContext';

const QUICK_REPLY_TEMPLATES = [
  { label: 'Gratitude', text: 'Thank you for your 5-star review! We are delighted to supply premium roofing materials for your project.' },
  { label: 'Quality Guarantee', text: 'Thank you for choosing Mega Pacific! We take immense pride in delivering top-grade durability and service.' },
  { label: 'Issue Follow-up', text: 'Thank you for your feedback. We apologize for the inconvenience and our support team will reach out directly to resolve this.' },
  { label: 'Appreciation', text: 'We truly appreciate your review! Please feel free to reach out to us if you need any further materials or assistance.' },
];

const ReviewManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isSales = user?.role === 'sales';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Unreplied' | 'Replied' | '5Stars' | 'Critical'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'
  
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [replyComment, setReplyComment] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

  const [activeLightbox, setActiveLightbox] = useState(null); // { images: [], index: 0, title: '' }

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const endpoint = isSales 
        ? `${API_URL}/api/sales/reviews` 
        : `${API_URL}/api/admin/reviews`;
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReviews(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    const syncInterval = setInterval(fetchReviews, 10000);
    const handleFocus = () => fetchReviews();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
        `${API_URL}/api/sales/reviews/${replyReviewId}/reply`,
        { comment: replyComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setReplySuccess('Reply saved successfully!');
        await fetchReviews();
        setTimeout(() => {
          handleCloseReply();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to save reply', err);
      setReplyError(err.response?.data?.message || 'Failed to submit reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const metrics = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        average: 0,
        unreplied: 0,
        replied: 0,
        positivePct: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const average = (sum / total).toFixed(1);
    const unreplied = reviews.filter(r => !r.reply).length;
    const replied = reviews.filter(r => Boolean(r.reply)).length;
    const positiveCount = reviews.filter(r => Number(r.rating) >= 4).length;
    const positivePct = Math.round((positiveCount / total) * 100);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rating = Math.round(Number(r.rating) || 0);
      if (distribution[rating] !== undefined) {
        distribution[rating] += 1;
      }
    });

    return { total, average, unreplied, replied, positivePct, distribution };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    let list = reviews.filter(review => {
      const productName = review.product?.name || '';
      const customerName = review.user?.customerProfile?.name || review.user?.name || '';
      const customerEmail = review.user?.email || '';
      const comment = review.comment || '';
      const title = review.title || '';
      
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        productName.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query) ||
        comment.toLowerCase().includes(query) ||
        title.toLowerCase().includes(query);

      let matchesTab = true;
      if (activeTab === 'Unreplied') {
        matchesTab = !review.reply;
      } else if (activeTab === 'Replied') {
        matchesTab = Boolean(review.reply);
      } else if (activeTab === '5Stars') {
        matchesTab = Number(review.rating) === 5;
      } else if (activeTab === 'Critical') {
        matchesTab = Number(review.rating) <= 2;
      }

      return matchesSearch && matchesTab;
    });

    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'lowest') return (a.rating || 0) - (b.rating || 0);
      return 0;
    });

    return list;
  }, [reviews, searchTerm, activeTab, sortBy]);

  const getCustomerName = (review) => {
    return review.user?.customerProfile?.name || review.user?.name || review.user?.email?.split('@')[0] || 'Customer';
  };

  const getStaffName = (reply) => {
    return reply?.user?.salesProfile?.name || reply?.user?.adminProfile?.name || reply?.user?.name || 'Mega Pacific Sales Team';
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 30) {
      return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return { bg: 'rgba(34, 197, 94, 0.12)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' };
    if (rating >= 3.5) return { bg: 'rgba(59, 130, 246, 0.12)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.3)' };
    if (rating >= 2.5) return { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', border: 'rgba(245, 158, 11, 0.3)' };
    return { bg: 'rgba(239, 68, 68, 0.12)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 16, color: 'var(--text-muted)' }}>
        <CircularProgress size={32} sx={{ color: 'var(--green)' }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Loading Customer Feedback & Reviews...</span>
      </div>
    );
  }

  const replyingReview = reviews.find(r => r.id === replyReviewId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Customer Reviews
            </h2>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: '0.75rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20,
              background: 'rgba(34,197,94,0.12)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.25)'
            }}>
              <RateReviewIcon sx={{ fontSize: 13 }} />
              {metrics.total} Submissions
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isAdmin ? 'Supervise verified customer feedback and sales support communications.' : 'Monitor product quality ratings, address inquiries, and post official sales replies.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div style={{
          background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Overall Rating
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {metrics.average}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 5.0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Rating value={Number(metrics.average) || 0} precision={0.1} readOnly size="small" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({metrics.total})</span>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Awaiting Reply
            </span>
            <PendingActionsIcon sx={{ fontSize: 18, color: metrics.unreplied > 0 ? '#f59e0b' : 'var(--green)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: metrics.unreplied > 0 ? '#f59e0b' : 'var(--text-primary)', lineHeight: 1 }}>
              {metrics.unreplied}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>reviews pending</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: metrics.unreplied > 0 ? '#f59e0b' : 'var(--green)', fontWeight: 600 }}>
            {metrics.unreplied > 0 ? 'Requires attention' : 'All caught up!'}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Satisfaction Score
            </span>
            <ThumbUpOutlinedIcon sx={{ fontSize: 18, color: 'var(--green)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {metrics.positivePct}%
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>4 & 5 stars</span>
          </div>
          <div style={{ width: '100%', height: 6, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
            <div style={{ width: `${metrics.positivePct}%`, height: '100%', background: 'linear-gradient(90deg, #16a34a, #22c55e)', borderRadius: 4 }} />
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sales Resolution Rate
            </span>
            <CheckCircleIcon sx={{ fontSize: 18, color: 'var(--green)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {metrics.total > 0 ? Math.round((metrics.replied / metrics.total) * 100) : 0}%
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{metrics.replied} of {metrics.total} resolved</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Official representative replies
          </div>
        </div>

      </div>

      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)', padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'All', label: 'All Reviews', count: metrics.total },
              { id: 'Unreplied', label: 'Needs Reply', count: metrics.unreplied, highlight: metrics.unreplied > 0 },
              { id: 'Replied', label: 'Replied', count: metrics.replied },
              { id: '5Stars', label: '5 Stars', count: metrics.distribution[5] },
              { id: 'Critical', label: 'Critical (1-2★)', count: (metrics.distribution[1] || 0) + (metrics.distribution[2] || 0) },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.18s ease',
                    background: isActive ? 'var(--green)' : 'var(--bg-tertiary)',
                    color: isActive ? '#000000' : 'var(--text-primary)',
                    border: isActive ? '1px solid var(--green)' : '1px solid var(--border-light)',
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    padding: '1px 6px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700,
                    background: isActive ? 'rgba(0,0,0,0.18)' : tab.highlight ? 'rgba(245,158,11,0.18)' : 'var(--border)',
                    color: isActive ? '#000000' : tab.highlight ? '#d97706' : 'var(--text-muted)'
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            
            <div style={{ position: 'relative', minWidth: 260 }}>
              <SearchIcon sx={{ fontSize: 17, color: 'var(--text-muted)', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search product, customer, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                  padding: '9px 34px 9px 36px', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.84rem',
                  outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  <ClearIcon sx={{ fontSize: 15 }} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                  padding: '8px 12px', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.82rem',
                  outline: 'none', cursor: 'pointer', fontWeight: 500
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div style={{
          padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-secondary)',
          borderRadius: 20, border: '1px dashed var(--border)', color: 'var(--text-muted)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RateReviewIcon sx={{ fontSize: 32, opacity: 0.4 }} />
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No reviews found matching your criteria
          </div>
          <div style={{ fontSize: '0.85rem', maxWidth: 400 }}>
            {searchTerm ? 'Try adjusting your search keywords or clear the filter to see more customer feedback.' : 'Customer product reviews will appear here as orders are completed.'}
          </div>
          {(searchTerm || activeTab !== 'All') && (
            <button
              onClick={() => { setSearchTerm(''); setActiveTab('All'); }}
              style={{
                marginTop: 8, padding: '7px 16px', borderRadius: 10, background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-light)', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          {filteredReviews.map((review) => {
            const customerName = getCustomerName(review);
            const ratingStyle = getRatingColor(Number(review.rating) || 5);
            const hasImages = review.imageUrls && review.imageUrls.length > 0;

            return (
              <div
                key={review.id}
                style={{
                  background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)',
                  padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 12, background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-light)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {review.product?.imageUrl ? (
                        <img src={review.product.imageUrl} alt={review.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Inventory2OutlinedIcon sx={{ fontSize: 24, color: 'var(--text-muted)', opacity: 0.5 }} />
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {review.product?.name || 'Roofing Product'}
                        </span>
                        {review.product?.type && (
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                            background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border-light)'
                          }}>
                            {review.product.type}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 8,
                          background: ratingStyle.bg, color: ratingStyle.text, border: `1px solid ${ratingStyle.border}`
                        }}>
                          <StarIcon sx={{ fontSize: 13, color: ratingStyle.text }} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{(Number(review.rating) || 5).toFixed(1)}</span>
                        </div>
                        <Rating value={Number(review.rating) || 5} precision={0.5} size="small" readOnly />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {customerName}
                        </span>
                        <Tooltip title="Verified Customer Purchase">
                          <VerifiedIcon sx={{ fontSize: 15, color: 'var(--green)' }} />
                        </Tooltip>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {review.user?.email}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>
                        {formatRelativeTime(review.createdAt)}
                      </div>
                    </div>

                    <Avatar 
                      src={review.user?.avatarUrl || review.user?.customerProfile?.avatarUrl || '/default-profile.png'}
                      alt={customerName}
                      sx={{
                        width: 40, height: 40, borderRadius: 12,
                        bgcolor: 'background.default',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>

                </div>

                <div style={{
                  background: 'var(--bg-primary)', padding: '1.15rem', borderRadius: 14,
                  border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 8
                }}>
                  {review.title && (
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {review.title}
                    </div>
                  )}

                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {review.comment || 'No written comment provided.'}
                  </div>

                  {hasImages && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                        <PhotoLibraryOutlinedIcon sx={{ fontSize: 14 }} />
                        Customer Attached Photos ({review.imageUrls.length}):
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {review.imageUrls.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveLightbox({ images: review.imageUrls, index: idx, title: `${customerName}'s Review Photos` })}
                            style={{
                              width: 80, height: 80, borderRadius: 10, overflow: 'hidden',
                              border: '1px solid var(--border-light)', cursor: 'pointer', position: 'relative',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            <img src={img} alt={`review-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Submitted on {new Date(review.createdAt).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                {review.reply ? (
                  <div style={{
                    background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)',
                    borderLeft: '4px solid var(--green)', padding: '1rem 1.25rem', borderRadius: '0 14px 14px 0',
                    display: 'flex', flexDirection: 'column', gap: 6, position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--green)' }}>
                          {getStaffName(review.reply)}
                        </span>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                          background: 'rgba(34,197,94,0.15)', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.04em'
                        }}>
                          Official Staff Response
                        </span>
                      </div>

                      {isSales && (
                        <button
                          onClick={() => handleOpenReply(review)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: '0.78rem', fontWeight: 600, padding: '4px 8px', borderRadius: 6,
                            transition: 'color 0.18s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <EditIcon sx={{ fontSize: 13 }} /> Edit Reply
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {review.reply.comment}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Replied on {new Date(review.reply.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No staff response recorded yet.
                    </span>

                    {isSales && (
                      <button
                        onClick={() => handleOpenReply(review)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px',
                          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                          borderRadius: 10, color: 'var(--green)', fontSize: '0.82rem', fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = '#000000'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; e.currentTarget.style.color = 'var(--green)'; }}
                      >
                        <ReplyIcon sx={{ fontSize: 15 }} />
                        Reply to Review
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {replyReviewId !== null && replyingReview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 580,
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {replyingReview.reply ? 'Edit Sales Reply' : 'Post Sales Reply'}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Replying to <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{getCustomerName(replyingReview)}</span> on <span style={{ fontWeight: 600 }}>{replyingReview.product?.name}</span>
                </div>
              </div>
              <button
                onClick={handleCloseReply}
                style={{
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
                  padding: 8, borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>
            </div>

            <div style={{
              background: 'var(--bg-primary)', padding: '0.9rem 1.1rem', borderRadius: 12,
              border: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Rating value={Number(replyingReview.rating) || 5} size="small" readOnly />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>"{replyingReview.title || 'Customer Review'}"</span>
              </div>
              <div style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>
                "{replyingReview.comment}"
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Quick Response Templates
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {QUICK_REPLY_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyComment(tpl.text)}
                    style={{
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
                      borderRadius: 8, padding: '5px 10px', fontSize: '0.74rem', color: 'var(--text-primary)',
                      cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {replyError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{replyError}</Alert>
            )}

            {replySuccess && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>{replySuccess}</Alert>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Official Response
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {replyComment.length} characters
                </span>
              </div>
              <textarea
                value={replyComment}
                onChange={(e) => setReplyComment(e.target.value)}
                placeholder="Type a polite, professional reply to the customer..."
                rows={5}
                style={{
                  width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                  padding: '12px 14px', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.88rem',
                  outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
                  fontFamily: 'inherit', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button
                type="button"
                onClick={handleCloseReply}
                disabled={submittingReply}
                style={{
                  padding: '9px 18px', borderRadius: 12, border: '1px solid var(--border-light)',
                  background: 'transparent', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReply}
                disabled={submittingReply || !replyComment.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 24px',
                  borderRadius: 12, border: 'none', background: 'var(--green)', color: '#000000',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  opacity: (!replyComment.trim() || submittingReply) ? 0.6 : 1,
                  boxShadow: '0 4px 14px rgba(34,197,94,0.3)', transition: 'all 0.2s'
                }}
              >
                {submittingReply ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <>
                    <SendIcon sx={{ fontSize: 14 }} /> Publish Reply
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1300, background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative', maxWidth: '90vw', maxHeight: '90vh',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: '#ffffff', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activeLightbox.title}</span>
              <button
                onClick={() => setActiveLightbox(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', padding: 8, borderRadius: 8, cursor: 'pointer', display: 'flex' }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <img
              src={activeLightbox.images[activeLightbox.index]}
              alt="lightbox preview"
              style={{
                maxWidth: '85vw', maxHeight: '78vh', objectFit: 'contain',
                borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
              }}
            />

            {activeLightbox.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {activeLightbox.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`thumb-${i}`}
                    onClick={() => setActiveLightbox(prev => ({ ...prev, index: i }))}
                    style={{
                      width: 50, height: 50, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                      border: i === activeLightbox.index ? '2px solid var(--green)' : '1px solid rgba(255,255,255,0.3)',
                      opacity: i === activeLightbox.index ? 1 : 0.6
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ReviewManagement;
