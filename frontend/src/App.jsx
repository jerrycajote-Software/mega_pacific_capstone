import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';


import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';
import EmployeeLayout from './layouts/EmployeeLayout';


import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import ReviewManagement from './pages/admin/ReviewManagement';


import EmployeeLoginPage from './pages/employee/LoginPage';
import EmployeeDashboard from './pages/employee/DashboardPage';
import EmployeeOrders from './pages/employee/OrderManagement';
import EmployeeInventory from './pages/employee/InventoryPage';
import EmployeeCustomerService from './pages/employee/CustomerService';
import EmployeeReviews from './pages/employee/ReviewManagement';


import RegisterPage from './pages/customer/RegisterPage';
import CustomerLoginPage from './pages/customer/LoginPage';
import VerifyEmailPage from './pages/customer/VerifyEmailPage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
import ResetPasswordPage from './pages/customer/ResetPasswordPage';
import CustomerDashboardPage from './pages/customer/DashboardPage';
import ProductDetails from './pages/customer/ProductDetails';
import Checkout from './pages/customer/Checkout';
import OrderDetails from './pages/customer/OrderDetails';
import OrdersPage from './pages/customer/OrdersPage';
import ProfilePage from './pages/customer/ProfilePage';


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


  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

const App = () => {
  const { user, token } = useAuth();
  return (
    <CartProvider userId={user?.id} token={token}>
      <Routes>
       
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<CustomerLoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

      
        <Route path="/" element={
          <ProtectedRoute redirectTo="/login" requiredRole="customer">
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<CustomerDashboardPage showHero={true} />} />
          <Route path="products" element={<CustomerDashboardPage showHero={false} />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="order/:id" element={<OrderDetails />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

       
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
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="settings" element={<div className="p-8 text-center text-gray-500">Settings coming soon...</div>} />
        </Route>

        {/* Employee routes */}
        <Route path="/employee/login" element={<EmployeeLoginPage />} />
        <Route path="/employee" element={
          <ProtectedRoute redirectTo="/employee/login" requiredRole="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/employee/dashboard" />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="orders" element={<EmployeeOrders />} />
          <Route path="inventory" element={<EmployeeInventory />} />
          <Route path="reviews" element={<EmployeeReviews />} />
          <Route path="customer-service" element={<EmployeeCustomerService />} />
        </Route>

       
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">404 - Page Not Found</div>} />
      </Routes>
    </CartProvider>
  );
};

export default App;
