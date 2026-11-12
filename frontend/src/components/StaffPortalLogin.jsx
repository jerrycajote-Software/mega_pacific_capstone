import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import {
  CustomMailIcon as MailIcon,
  CustomLockIcon as LockIcon,
  CustomVisibilityIcon as VisibilityIcon,
  CustomVisibilityOffIcon as VisibilityOffIcon,
  CustomErrorOutlineIcon as ErrorOutlineIcon
} from './icons';
import { useTranslation } from 'react-i18next';

const portalLoginCss = `
  @keyframes spl-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .spl-card {
    animation: spl-fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .spl-input-wrap:focus-within .spl-input-icon {
    color: var(--spl-accent) !important;
  }

  .spl-input:focus {
    border-color: var(--spl-accent) !important;
    box-shadow: 0 0 0 3px var(--spl-accent-ring) !important;
  }

  .spl-input::-ms-reveal,
  .spl-input::-ms-clear {
    display: none;
  }

  .spl-btn:not(:disabled):hover {
    opacity: 0.94;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px var(--spl-accent-shadow) !important;
  }

  .spl-btn:not(:disabled):active {
    transform: translateY(0) scale(0.99);
  }

  .spl-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .spl-show-btn:hover {
    color: #334155 !important;
  }
`;

const ACCENT_PALETTES = {
  green: {
    solid: '#16a34a',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    ring: 'rgba(22, 163, 74, 0.14)',
    shadow: 'rgba(22, 163, 74, 0.28)',
    infoBg: '#f0fdf4',
    infoBorder: '#bbf7d0',
    infoText: '#15803d',
  },
  amber: {
    solid: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    ring: 'rgba(217, 119, 6, 0.14)',
    shadow: 'rgba(217, 119, 6, 0.28)',
    infoBg: '#fffbeb',
    infoBorder: '#fde68a',
    infoText: '#b45309',
  },
};

/**
 * Shared light-themed login view for internal staff portals on a plain white background.
 */
const StaffPortalLogin = ({
  portalTitle,
  portalSubtitle = 'Sign in with your staff account to continue.',
  allowedRoles,
  authenticatedRoles,
  redirectPath,
  accessDeniedMessage,
  signInButtonLabel,
  signingInText = 'Signing in…',
  accentTheme = 'green',
  portalId = 'staff',
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const { login, logout, token, user } = useAuth();
  const navigate = useNavigate();

  const palette = ACCENT_PALETTES[accentTheme] ?? ACCENT_PALETTES.green;
  const isAuthorizedUser = authenticatedRoles.includes(user?.role);

  React.useEffect(() => {
    if (token && isAuthorizedUser) {
      navigate(redirectPath, { replace: true });
    }
  }, [token, isAuthorizedUser, navigate, redirectPath]);

  if (token && isAuthorizedUser) {
    return null;
  }

  const handlePortalLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let cleanOtp = null;
    if (requiresOtp && otp) {
      const trimmed = otp.trim().toUpperCase();
      cleanOtp = trimmed.startsWith('LOG-')
        ? trimmed
        : (/^\d{6}$/.test(trimmed) ? `LOG-${trimmed}` : trimmed);
    }

    const result = await login(email, password, cleanOtp, allowedRoles);
    if (result.requiresOtp) {
      setRequiresOtp(true);
      setInfoMessage(result.message || 'Verification code sent to your email.');
    } else if (result.success) {
      if (authenticatedRoles.includes(result.user?.role)) {
        navigate(redirectPath, { replace: true });
      } else {
        logout();
        setError(accessDeniedMessage);
        setLoading(false);
        return;
      }
    } else {
      setError(result.error || 'Invalid email or password. Please check your credentials and try again.');
    }
    setLoading(false);
  };

  const emailInputId = `${portalId}-login-email`;
  const passwordInputId = `${portalId}-login-password`;
  const otpInputId = `${portalId}-login-otp`;

  return (
    <>
      <style>{portalLoginCss}</style>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          '--spl-accent': palette.solid,
          '--spl-accent-ring': palette.ring,
          '--spl-accent-shadow': palette.shadow,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div
            className="spl-card"
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 900,
                fontSize: '32px',
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              <span style={{ color: '#1e3a8a' }}>MEGA</span>
              <span style={{ color: '#0f172a' }}>PACIFIC</span>
            </div>

            <div
              style={{
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.2em',
                marginTop: '6px',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              METAL AND STEEL CORP
            </div>
          </div>

          <div
            className="spl-card"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '2.25rem 2rem',
              boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
              animationDelay: '0.05s',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.015em',
                }}
              >
                {t(portalTitle)}
              </h1>
              <p
                style={{
                  margin: '0.35rem 0 0',
                  fontSize: '0.85rem',
                  color: '#64748b',
                  lineHeight: 1.45,
                }}
              >
                {portalSubtitle}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  color: '#b91c1c',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div
                role="status"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  backgroundColor: palette.infoBg,
                  border: `1px solid ${palette.infoBorder}`,
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  color: palette.infoText,
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                }}
              >
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handlePortalLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label
                  htmlFor={emailInputId}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {t('Email')}
                </label>
                <div className="spl-input-wrap" style={{ position: 'relative' }}>
                  <MailIcon
                    sx={{ fontSize: 16 }}
                    className="spl-input-icon"
                    style={{
                      position: 'absolute',
                      left: 13,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      transition: 'color 0.18s',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id={emailInputId}
                    className="spl-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="@gmail.com"
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 10,
                      padding: '0.72rem 0.9rem 0.72rem 2.4rem',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label
                  htmlFor={passwordInputId}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {t('Password')}
                </label>
                <div className="spl-input-wrap" style={{ position: 'relative' }}>
                  <LockIcon
                    sx={{ fontSize: 16 }}
                    className="spl-input-icon"
                    style={{
                      position: 'absolute',
                      left: 13,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      transition: 'color 0.18s',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id={passwordInputId}
                    className="spl-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 10,
                      padding: '0.72rem 2.6rem 0.72rem 2.4rem',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box',
                    }}
                  />

                  <button
                    type="button"
                    className="spl-show-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 4,
                      display: 'flex',
                      transition: 'color 0.15s',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <VisibilityIcon sx={{ fontSize: 16 }} /> : <VisibilityOffIcon sx={{ fontSize: 16 }} />}
                  </button>
                </div>
              </div>

              {requiresOtp && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <label
                    htmlFor={otpInputId}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {t('Login OTP')}
                  </label>
                  <div className="spl-input-wrap" style={{ position: 'relative' }}>
                    <input
                      id={otpInputId}
                      className="spl-input"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.toUpperCase())}
                      placeholder="ex. 123456"
                      required
                      style={{
                        width: '100%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 10,
                        padding: '0.72rem 0.9rem',
                        color: '#0f172a',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box',
                        letterSpacing: '0.12em',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="spl-btn"
                disabled={loading}
                style={{
                  marginTop: '0.4rem',
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 10,
                  border: 'none',
                  background: palette.gradient,
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.18s, transform 0.15s, box-shadow 0.18s',
                  boxShadow: `0 4px 14px ${palette.shadow}`,
                  letterSpacing: '0.01em',
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={17} thickness={5} sx={{ color: '#ffffff' }} />
                    <span>{requiresOtp ? 'Verifying…' : signingInText}</span>
                  </>
                ) : (
                  requiresOtp ? 'Verify Code & Sign In' : signInButtonLabel
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffPortalLogin;

