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

  const logout = useCallback(() => {
    localStorage.removeItem('appToken');
    localStorage.removeItem('appUser');
    localStorage.removeItem('mega_pacific_cart');
    localStorage.removeItem('lastActivity');
    setToken(null);
    setUser(null);
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

      // 1. Intercept 401 Unauthorized responses globally
      const interceptor = axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && error.response.status === 401) {
            logout();
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

  const login = async (email, password) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
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
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
