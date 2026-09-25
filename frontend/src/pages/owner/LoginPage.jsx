import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MailIcon from '@mui/icons-material/Mail';
import LockIcon from '@mui/icons-material/Lock';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { useTranslation } from 'react-i18next';


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
  @keyframes lp-grid-drift {
    from { background-position: 0 0; }
    to   { background-position: 60px 60px; }
  }

  .lp-card   { animation: lp-fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .lp-card:nth-child(2) { animation-delay: 0.06s; }

  .lp-input-wrap:focus-within .lp-input-icon { color: #f59e0b !important; }
  .lp-input:focus {
    border-color: rgba(245,158,11,0.55) !important;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.10) !important;
  }
  .lp-btn:not(:disabled):hover {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(245,158,11,0.40) !important;
  }
  .lp-btn:not(:disabled):active  { transform: translateY(0) scale(0.98); }
  .lp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .lp-show-btn:hover { color: #d1d5db !important; }

  .lp-bg {
    background-color: #050505;
    background-image:
      radial-gradient(ellipse 80% 60% at 60% 10%, rgba(245,158,11,0.06) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 10% 80%, rgba(217,119,6,0.04) 0%, transparent 60%);
  }
  .lp-grid-overlay {
    background-image:
      linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: lp-grid-drift 18s linear infinite;
  }

  /* Floating blobs for Owner theme */
  .lp-blob-1 {
    animation: lp-float 8s ease-in-out infinite;
    animation-delay: 0s;
  }
  .lp-blob-2 {
    animation: lp-float 10s ease-in-out infinite;
    animation-delay: -3s;
  }
`;

const OwnerLoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp]           = useState('');
  const [msg, setMsg]           = useState('');

  const { login, logout }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password, requiresOtp ? otp : null, ['owner', 'super_admin', 'superadmin']);
    if (result.requiresOtp) {
      setRequiresOtp(true);
      setMsg(result.message || 'OTP sent to your email.');
    } else if (result.success) {
      if (result.user?.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        logout();
        setError('Access denied. Owner portal requires owner privileges.');
        setLoading(false);
        return;
      }
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{css}</style>
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
        <div
          className="lp-grid-overlay"
          style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        />

        <div className="lp-blob-1" style={{
          position: 'absolute', top: '-12%', right: '-8%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div className="lp-blob-2" style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,119,6,0.05) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}>

          <div
            className="lp-card"
            style={{ 
              textAlign: 'center', 
              animationDelay: '0s', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1rem',
              userSelect: 'none' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: '32px', letterSpacing: '0.05em', lineHeight: 1 }}>
              <span style={{ color: '#111b2e', WebkitTextStroke: '1px #f59e0b' }}>MEGA</span>
              <span style={{ color: '#111b2e', WebkitTextStroke: '1px #d97706' }}>PACIFIC</span>
            </div>
            
            <div style={{ 
              color: '#d97706', 
              fontSize: '11px', 
              fontWeight: 800, 
              letterSpacing: '0.2em', 
              marginTop: '6px',
              fontFamily: 'Arial, sans-serif'
            }}>
              OWNER PORTAL
            </div>
          </div>

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
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#f0f0f0',
                letterSpacing: '-0.01em',
              }}>
                {t("Secure Login")}
              </h2>
            </div>

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
                <ErrorOutlineIcon sx={{ fontSize: 15, flexShrink: 0 }} />
                {error}
              </div>
            )}

            {msg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.22)',
                borderRadius: 12,
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                color: '#fbbf24',
                fontSize: '0.82rem',
                lineHeight: 1.4,
              }}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}>
                  {t("Email")}
                </label>
                <div className="lp-input-wrap" style={{ position: 'relative' }}>
                  <MailIcon
                    sx={{ fontSize: 16 }}
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
                    placeholder="owner@megapacific.com"
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}>
                    {t("Password")}
                  </label>
                </div>
                <div className="lp-input-wrap" style={{ position: 'relative' }}>
                  <LockIcon
                    sx={{ fontSize: 16 }}
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
                  >
                    {showPw
                      ? <VisibilityIcon sx={{ fontSize: 15 }} />
                      : <VisibilityOffIcon sx={{ fontSize: 15 }} />
                    }
                  </button>
                </div>
              </div>

              {requiresOtp && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <label style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}>
                    {t("OTP Code")}
                  </label>
                  <div className="lp-input-wrap" style={{ position: 'relative' }}>
                    <input
                      className="lp-input"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: 12,
                        padding: '0.72rem 0.9rem',
                        color: '#f0f0f0',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box',
                        letterSpacing: '0.1em',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </div>
              )}

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
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.18s, transform 0.15s, box-shadow 0.18s',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.28)',
                  letterSpacing: '0.01em',
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={17} thickness={5} sx={{ color: '#fff', animation: 'none' }} />
                    {requiresOtp ? 'Verifying…' : 'Authenticating…'}
                  </>
                ) : (
                  requiresOtp ? 'Verify OTP & Login' : 'Login as Owner'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerLoginPage;
