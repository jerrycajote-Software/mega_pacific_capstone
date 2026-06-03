import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

//Layouts
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

//Admin Pages
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';

//Customer
import RegisterPage from './pages/customer/RegisterPage';
import CustomerLoginPage from './pages/customer/LoginPage';
import CustomerDashboardPage from './pages/customer/DashboardPage';
import ProductDetails from './pages/customer/ProductDetails';
import Checkout from './pages/customer/Checkout';
import OrderDetails from './pages/customer/OrderDetails';
import OrdersPage from './pages/customer/OrdersPage';

// Protected Route Component
const ProtectedRoute = ({ children, redirectTo = "/login", requiredRole }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to={redirectTo} />;
  }

  // If a required role is specified and the user's role doesn't match, redirect them
  if (requiredRole && user?.role !== requiredRole) {
    // Admin trying to access customer area → send to admin panel
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Customer trying to access admin area → send to customer login
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Customer Auth Routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<CustomerLoginPage />} />

      {/* Customer Interface Routes */}
      <Route path="/" element={
        <ProtectedRoute redirectTo="/login" requiredRole="customer">
          <CustomerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<CustomerDashboardPage />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="order/:id" element={<OrderDetails />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      <Route path="/admin" element={
        <ProtectedRoute redirectTo="/admin/login" requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="inventory" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<div className="p-8 text-center text-gray-500">Settings coming soon...</div>} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default App;
