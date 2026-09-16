import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('appToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      
      const savedUser = localStorage.getItem('appUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('appToken', token);
      localStorage.setItem('appUser', JSON.stringify(user));
      
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

  const logout = () => {
    localStorage.removeItem('appToken');
    localStorage.removeItem('appUser');
    localStorage.removeItem('mega_pacific_cart');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
