import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('appToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Decode or verify token if needed, for now just set user from storage
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('appToken', token);
      localStorage.setItem('appUser', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error.response?.data?.error || error.message);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/auth/register`, { 
        name, 
        email, 
        password,
        role: 'customer'
      });
      return { success: true, userId: response.data.userId };
    } catch (error) {
      console.error('Registration error:', error.response?.data?.error || error.message);
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('appToken');
    localStorage.removeItem('appUser');
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
