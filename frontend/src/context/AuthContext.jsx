import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('appToken'));
  const [loading, setLoading] = useState(true);
  const [suspendedModal, setSuspendedModal] = useState(false);

  const logout = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('appToken');
      if (currentToken) {
        const API_URL = import.meta.env.VITE_API_URL || '';
        await axios.post(`${API_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
      }
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      localStorage.removeItem('appToken');
      localStorage.removeItem('appUser');
      localStorage.removeItem('mega_pacific_cart');
      localStorage.removeItem('lastActivity');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let activityInterval;
    let tokenExpiryTimeout;

    if (token) {
      
      const savedUser = localStorage.getItem('appUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 1. Intercept 401 Unauthorized globally and 503 Maintenance Mode
      const interceptor = axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && error.response.status === 401) {
            logout();
          }
          if (error.response && error.response.status === 403 && error.response.data?.error === 'account_suspended') {
            setSuspendedModal(true);
          }
          if (error.response && error.response.status === 503 && error.response.data?.error === 'maintenance') {
            window.location.reload();
          }
          return Promise.reject(error);
        }
      );

      // 2. Check token expiration
      const decoded = parseJwt(token);
      if (decoded && decoded.exp) {
        const expiresIn = (decoded.exp * 1000) - Date.now();
        if (expiresIn <= 0) {
          logout();
        } else {
          // Set a timeout to log out when the token expires
          tokenExpiryTimeout = setTimeout(() => {
            logout();
          }, expiresIn);
        }
      }

      // 3. Track inactivity (24 hours = 24 * 60 * 60 * 1000 ms)
      const INACTIVITY_LIMIT = 24 * 60 * 60 * 1000;
      
      if (!localStorage.getItem('lastActivity')) {
        localStorage.setItem('lastActivity', Date.now().toString());
      }

      const updateActivity = () => {
        localStorage.setItem('lastActivity', Date.now().toString());
      };

      // Throttle to update at most once per minute
      let lastUpdate = Date.now();
      const handleActivity = () => {
        const now = Date.now();
        if (now - lastUpdate > 60000) {
          updateActivity();
          lastUpdate = now;
        }
      };

      const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, handleActivity));

      // Check every minute if the user has been inactive for 24 hours
      activityInterval = setInterval(() => {
        const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0', 10);
        if (Date.now() - lastActivity > INACTIVITY_LIMIT) {
          logout();
        }
      }, 60000);

      setLoading(false);

      return () => {
        axios.interceptors.response.eject(interceptor);
        clearTimeout(tokenExpiryTimeout);
        clearInterval(activityInterval);
        events.forEach(event => window.removeEventListener(event, handleActivity));
      };
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token, logout]);

  const login = async (email, password, otp = null, expectedRoles = null) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password, otp, expectedRoles });

      if (response.data.requiresOtp) {
        return { requiresOtp: true, message: response.data.message };
      }

      const { token, user } = response.data;
      
      localStorage.setItem('appToken', token);
      localStorage.setItem('appUser', JSON.stringify(user));
      localStorage.setItem('lastActivity', Date.now().toString());
      
      setToken(token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error.response?.data?.error || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed',
        email: error.response?.data?.email || null
      };
    }
  };

  const register = async (name, email, password, contactNumber, address, city, province, zipCode) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${API_URL}/api/auth/register`, { 
        name, 
        email, 
        password,
        contactNumber,
        address,
        city,
        province,
        zipCode,
        role: 'customer'
      });
      return { 
        success: true, 
        userId: response.data.userId, 
        email: response.data.email,
        isRestoration: response.data.isRestoration,
        message: response.data.message 
      };
    } catch (error) {
      console.error('Registration error:', error.response?.data?.error || error.message);
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
      {suspendedModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary, #1a1a1a)', border: '1px solid var(--border, #333)', borderRadius: 20, width: '100%', maxWidth: 400, padding: '2rem', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#fff', fontSize: '1.25rem' }}>
              Account Disabled
            </h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.5 }}>
              Your account has been disabled by the administrator. You will be logged out.
            </p>
            <button 
              onClick={() => {
                setSuspendedModal(false);
                logout();
                window.location.href = user?.role === 'customer' ? '/login' : '/admin/login';
              }}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
