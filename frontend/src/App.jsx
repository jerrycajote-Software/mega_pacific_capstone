import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductManagement from './pages/admin/ProductManagement';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/login" element={<LoginPage />} />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={<ProductManagement />} />
        <Route path="orders" element={<div className="p-8 text-center text-gray-500">Orders management coming soon...</div>} />
        <Route path="users" element={<div className="p-8 text-center text-gray-500">User management coming soon...</div>} />
        <Route path="settings" element={<div className="p-8 text-center text-gray-500">Settings coming soon...</div>} />
      </Route>

      {/* Redirect root to admin for now, or keep it for customer side later */}
      <Route path="/" element={<Navigate to="/admin/dashboard" />} />
      
      {/* 404 Page */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default App;
