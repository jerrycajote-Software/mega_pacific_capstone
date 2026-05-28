import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

/* ─── Keyframes & micro-interactions ─── */
const css = `
  @keyframes lp-fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lp-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-18px) rotate(1.5deg); }
    66%       { transform: translateY(-9px)  rotate(-1deg); }
  }
  @keyframes lp-pulse-ring {
    0%   { transform: scale(0.92); opacity: 0.6; }
    50%  { transform: scale(1.08); opacity: 0.15; }
    100% { transform: scale(0.92); opacity: 0.6; }
  }
  @keyframes lp-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes lp-grid-drift {
    from { background-position: 0 0; }
    to   { background-position: 60px 60px; }
  }

  /* Animated dot on the brand badge */
  @keyframes lp-dot-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
    50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }

  .lp-card   { animation: lp-fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .lp-card:nth-child(2) { animation-delay: 0.06s; }

  .lp-input-wrap:focus-within .lp-input-icon { color: #22c55e !important; }
  .lp-input:focus {
    border-color: rgba(34,197,94,0.55) !important;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.10) !important;
  }
  .lp-btn:not(:disabled):hover {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(34,197,94,0.40) !important;
  }
  .lp-btn:not(:disabled):active  { transform: translateY(0) scale(0.98); }
  .lp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .lp-show-btn:hover { color: #d1d5db !important; }

  .lp-bg {
    background-color: #050505;
    background-image:
      radial-gradient(ellipse 80% 60% at 60% 10%, rgba(34,197,94,0.06) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 10% 80%, rgba(16,163,74,0.04) 0%, transparent 60%);
  }
  .lp-grid-overlay {
    background-image:
      linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: lp-grid-drift 18s linear infinite;
  }

  /* Floating blobs */
  .lp-blob-1 {
    animation: lp-float 8s ease-in-out infinite;
    animation-delay: 0s;
  }
  .lp-blob-2 {
    animation: lp-float 10s ease-in-out infinite;
    animation-delay: -3s;
  }
  .lp-blob-3 {
    animation: lp-float 7s ease-in-out infinite;
    animation-delay: -6s;
  }
  .lp-live-dot {
    animation: lp-dot-pulse 2s ease-in-out infinite;
  }
`;

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{css}</style>

      {/* ── Full-screen shell ── */}
      <div
        className="lp-bg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Animated grid overlay */}
        <div
          className="lp-grid-overlay"
          style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        />

        {/* Floating ambient blobs */}
        <div className="lp-blob-1" style={{
          position: 'absolute', top: '-12%', right: '-8%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div className="lp-blob-2" style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,163,74,0.05) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div className="lp-blob-3" style={{
          position: 'absolute', top: '40%', left: '50%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.03) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
          transform: 'translate(-50%, -50%)',
        }} />

        {/* ── Content column ── */}
        <div style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}>

          {/* ── Brand header ── */}
          <div
            className="lp-card"
            style={{ textAlign: 'center', animationDelay: '0s' }}
          >
            {/* Logo mark */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60, height: 60,
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,163,74,0.08) 100%)',
              border: '1px solid rgba(34,197,94,0.25)',
              marginBottom: '1rem',
              boxShadow: '0 0 40px rgba(34,197,94,0.12)',
            }}>
              <ShieldCheck size={28} style={{ color: '#22c55e' }} />
            </div>

            <h1 style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              MEGA PACIFIC
            </h1>
            <p style={{
              margin: '0.35rem 0 0',
              fontSize: '0.7rem',
              color: '#4b5563',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontWeight: 600,
            }}>
              Admin Portal
            </p>
          </div>

          {/* ── Login card ── */}
          <div
            className="lp-card"
            style={{
              background: 'rgba(17,17,17,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 24,
              padding: '2rem',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)',
              animationDelay: '0.08s',
            }}
          >
            {/* Card heading */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#f0f0f0',
                letterSpacing: '-0.01em',
              }}>
                Login As Admin
              </h2>
              {/* <p style={{
                margin: '0.3rem 0 0',
                fontSize: '0.8rem',
                color: '#6b7280',
              }}>
                Enter your credentials to access the dashboard
              </p> */}
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
                borderRadius: 12,
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                color: '#f87171',
                fontSize: '0.82rem',
                lineHeight: 1.4,
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}>
                  Email
                </label>
                <div className="lp-input-wrap" style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    className="lp-input-icon"
                    style={{
                      position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#4b5563',
                      transition: 'color 0.18s',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    className="lp-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@megapacific.com"
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 12,
                      padding: '0.72rem 0.9rem 0.72rem 2.4rem',
                      color: '#f0f0f0',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}>
                    Password
                  </label>
                </div>
                <div className="lp-input-wrap" style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    className="lp-input-icon"
                    style={{
                      position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#4b5563',
                      transition: 'color 0.18s',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    className="lp-input"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 12,
                      padding: '0.72rem 2.6rem 0.72rem 2.4rem',
                      color: '#f0f0f0',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box',
                    }}
                  />
                  {/* Show/Hide toggle */}
                  <button
                    type="button"
                    className="lp-show-btn"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute', right: 11, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#4b5563',
                      padding: 4, display: 'flex',
                      transition: 'color 0.15s',
                    }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw
                      ? <EyeOff size={15} />
                      : <Eye size={15} />
                    }
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="lp-btn"
                disabled={loading}
                style={{
                  marginTop: '0.35rem',
                  width: '100%',
                  padding: '0.78rem',
                  borderRadius: 13,
                  border: 'none',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.18s, transform 0.15s, box-shadow 0.18s',
                  boxShadow: '0 4px 20px rgba(34,197,94,0.28)',
                  letterSpacing: '0.01em',
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      style={{ animation: 'lp-spin 0.9s linear infinite' }}
                    />
                    Signing in…
                  </>
                ) : (
                  'Login Admin'
                )}
              </button>
            </form>
          </div>

          {/* ── Footer ── */}
          <div
            className="lp-card"
            style={{
              textAlign: 'center',
              animationDelay: '0.18s',
            }}
          >
            {/* Status badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(34,197,94,0.07)',
              border: '1px solid rgba(34,197,94,0.18)',
              borderRadius: 9999,
              padding: '0.25rem 0.75rem',
              marginBottom: '0.9rem',
            }}>
              <span
                className="lp-live-dot"
                style={{
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 600, letterSpacing: '0.06em' }}>
                SYSTEM ONLINE
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.73rem', color: '#374151' }}>
              © 2026 Mega Pacific Roofing Systems · All rights reserved
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default LoginPage;
