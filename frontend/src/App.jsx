import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import axios from 'axios';
import io from 'socket.io-client';
import MaintenancePage from './pages/MaintenancePage';


import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';
import SalesLayout from './layouts/SalesLayout';
import FinanceLayout from './layouts/FinanceLayout';
import LogisticLayout from './layouts/LogisticLayout';
import OwnerLayout from './layouts/OwnerLayout';

import OwnerLoginPage from './pages/owner/LoginPage';
import OwnerDashboardPage from './pages/owner/DashboardPage';

import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import SalesManagement from './pages/admin/SalesManagement';
import ReviewManagement from './pages/admin/ReviewManagement';
import AdminSettingsPage from './pages/admin/SettingsPage';


import SalesLoginPage from './pages/sales/LoginPage';
import SalesDashboard from './pages/sales/DashboardPage';
import SalesOrders from './pages/sales/OrderManagement';
import SalesInventory from './pages/sales/InventoryPage';
import SalesCustomerService from './pages/sales/CustomerService';
import SalesReviews from './pages/sales/ReviewManagement';

import FinanceLoginPage from './pages/finance/LoginPage';
import FinanceDashboardPage from './pages/finance/FinanceDashboardPage';
import FinanceExpensesPage from './pages/finance/ExpensesPage';
import FinancePaymentsPage from './pages/finance/PaymentsPage';
import FinanceReportsPage from './pages/finance/ReportsPage';

import LogisticLoginPage from './pages/logistic/LoginPage';
import LogisticDashboardPage from './pages/logistic/LogisticDashboardPage';
import LogisticDeliveriesPage from './pages/logistic/DeliveriesPage';
import LogisticShipmentsPage from './pages/logistic/ShipmentsPage';
import LogisticProductsPage from './pages/logistic/ProductsPage';

import SuperAdminLoginPage from './pages/superadmin/LoginPage';
import SuperAdminDashboardPage from './pages/superadmin/DashboardPage';


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

const RoofDesignerPage = React.lazy(() => import('./pages/customer/roof-designer/RoofDesignerPage'));


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
    if (user?.role === 'owner') {
      return <Navigate to="/owner/dashboard" replace />;
    }
    if (user?.role === 'sales') {
      return <Navigate to="/sales/dashboard" replace />;
    }
    if (user?.role === 'finance') {
      return <Navigate to="/finance/dashboard" replace />;
    }
    if (user?.role === 'logistic') {
      return <Navigate to="/logistic/dashboard" replace />;
    }
    if (user?.role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (token) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'owner') {
      return <Navigate to="/owner/dashboard" replace />;
    }
    if (user?.role === 'sales') {
      return <Navigate to="/sales/dashboard" replace />;
    }
    if (user?.role === 'finance') {
      return <Navigate to="/finance/dashboard" replace />;
    }
    if (user?.role === 'logistic') {
      return <Navigate to="/logistic/dashboard" replace />;
    }
    if (user?.role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [systemStatuses, setSystemStatuses] = React.useState({
    admin_portal_status: 'online',
    sales_portal_status: 'online',
    customer_portal_status: 'online'
  });
  const [systemLoading, setSystemLoading] = React.useState(true);

  React.useEffect(() => {
    let socket;
    const fetchSystemStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/system/status`);
        if (res.data.success) {
          setSystemStatuses(res.data.data);
        }

        socket = io(API_URL, {
          auth: {
            user: JSON.parse(localStorage.getItem('appUser'))
          }
        });
        socket.on("system_status_updated", (data) => {
          setSystemStatuses((prev) => ({
            ...prev,
            [data.key]: data.value
          }));
        });
      } catch (err) {
        console.error("Could not fetch system statuses");
      } finally {
        setSystemLoading(false);
      }
    };
    fetchSystemStatus();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  if (authLoading || systemLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <CartProvider userId={user?.id} token={token}>
      <Routes>
       
        <Route path="/register" element={
          systemStatuses.customer_portal_status === 'offline' ? <MaintenancePage /> : <GuestRoute><RegisterPage /></GuestRoute>
        } />
        <Route path="/login" element={
          systemStatuses.customer_portal_status === 'offline' ? <MaintenancePage /> : <GuestRoute><CustomerLoginPage /></GuestRoute>
        } />
        <Route path="/verify-email" element={<GuestRoute><VerifyEmailPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

      
        <Route path="/" element={
          systemStatuses.customer_portal_status === 'offline' ? <MaintenancePage /> : (
            <ProtectedRoute redirectTo="/login" requiredRole="customer">
              <CustomerLayout />
            </ProtectedRoute>
          )
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

        {/* 3D Roof Designer — standalone full-screen (no header/footer/FABs) */}
        <Route path="/roof-designer" element={
          systemStatuses.customer_portal_status === 'offline' ? <MaintenancePage /> : (
            <ProtectedRoute redirectTo="/login" requiredRole="customer">
              <Suspense fallback={
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#4f772d', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <span>Loading 3D Roof Designer…</span>
                </div>
              </div>
            }>
              <RoofDesignerPage />
            </Suspense>
          </ProtectedRoute>
        )} />

       
        <Route path="/admin/login" element={
          systemStatuses.admin_portal_status === 'offline' ? <MaintenancePage /> : <GuestRoute><AdminLoginPage /></GuestRoute>
        } />
        
        {/* Owner routes */}
        <Route path="/owner/login" element={<GuestRoute><OwnerLoginPage /></GuestRoute>} />
        <Route path="/owner" element={
          <ProtectedRoute redirectTo="/owner/login" requiredRole="owner">
            <OwnerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/owner/dashboard" />} />
          <Route path="dashboard" element={<OwnerDashboardPage />} />
        </Route>

        <Route path="/admin" element={
          systemStatuses.admin_portal_status === 'offline' ? <MaintenancePage /> : (
            <ProtectedRoute redirectTo="/admin/login" requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          )
        }>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="inventory" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="accounts" element={<SalesManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Legacy / Alias routes for Employee */}
        <Route path="/employee/login" element={<Navigate to="/sales/login" replace />} />
        <Route path="/employee/*" element={<Navigate to="/sales" replace />} />

        {/* Sales routes */}
        <Route path="/sales/login" element={
          systemStatuses.sales_portal_status === 'offline' ? <MaintenancePage /> : <GuestRoute><SalesLoginPage /></GuestRoute>
        } />
        <Route path="/sales" element={
          systemStatuses.sales_portal_status === 'offline' ? <MaintenancePage /> : (
            <ProtectedRoute redirectTo="/sales/login" requiredRole="sales">
              <SalesLayout />
            </ProtectedRoute>
          )
        }>
          <Route index element={<Navigate to="/sales/dashboard" />} />
          <Route path="dashboard" element={<SalesDashboard />} />
          <Route path="orders" element={<SalesOrders />} />
          <Route path="inventory" element={<SalesInventory />} />
          <Route path="reviews" element={<SalesReviews />} />
          <Route path="customer-service" element={<SalesCustomerService />} />
        </Route>

        {/* Finance routes */}
        <Route path="/finance/login" element={<GuestRoute><FinanceLoginPage /></GuestRoute>} />
        <Route path="/finance" element={
          <ProtectedRoute redirectTo="/finance/login" requiredRole="finance">
            <FinanceLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/finance/dashboard" />} />
          <Route path="dashboard" element={<FinanceDashboardPage />} />
          <Route path="expenses" element={<FinanceExpensesPage />} />
          <Route path="payments" element={<FinancePaymentsPage />} />
          <Route path="reports" element={<FinanceReportsPage />} />
        </Route>

        {/* Logistic routes */}
        <Route path="/logistic/login" element={<GuestRoute><LogisticLoginPage /></GuestRoute>} />
        <Route path="/logistic" element={
          <ProtectedRoute redirectTo="/logistic/login" requiredRole="logistic">
            <LogisticLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/logistic/dashboard" />} />
          <Route path="dashboard" element={<LogisticDashboardPage />} />
          <Route path="deliveries" element={<LogisticDeliveriesPage />} />
          <Route path="shipments" element={<LogisticShipmentsPage />} />
          <Route path="products" element={<LogisticProductsPage />} />
        </Route>

        {/* Super Admin routes */}
        <Route path="/superadmin/login" element={<GuestRoute><SuperAdminLoginPage /></GuestRoute>} />
        <Route path="/superadmin/dashboard" element={
          <ProtectedRoute redirectTo="/superadmin/login" requiredRole="superadmin">
            <SuperAdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
       
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">404 - Page Not Found</div>} />
      </Routes>
    </CartProvider>
  );
};

export default App;
