import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, parseJwt } from '../context/AuthContext';

export const getDashboardForRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'owner':
      return '/owner/dashboard';
    case 'sales':
      return '/sales/dashboard';
    case 'finance':
      return '/finance/dashboard';
    case 'logistic':
      return '/logistic/dashboard';
    case 'superadmin':
    case 'super_admin':
      return '/superadmin/dashboard';
    case 'customer':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

export const LOGIN_ROUTES = [
  '/login',
  '/admin-1megapacific/login',
  '/sales-1megapacific/login',
  '/finance-1megapacific/login',
  '/logistic-1megapacific/login',
  '/owner-1megapacific/login',
  '/superadmin-0megapacific/login',
  '/admin/login',
  '/sales/login',
  '/finance/login',
  '/logistic/login',
  '/owner/login',
  '/superadmin/login',
  '/employee/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email'
];


export const usePreventBackToLogin = () => {
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    let role = user?.role;
    if (!role && token) {
      const decoded = parseJwt(token);
      role = decoded?.role;
    }
    const dashboardPath = getDashboardForRole(role);
    const isRootDashboard = location.pathname === dashboardPath;

    
    if (isRootDashboard) {
      window.history.pushState(null, '', window.location.href);
    }

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (LOGIN_ROUTES.includes(currentPath)) {
        
        navigate(dashboardPath, { replace: true });
      } else if (isRootDashboard && window.location.pathname === dashboardPath) {
        
        window.history.pushState(null, '', window.location.href);
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted && localStorage.getItem('appToken')) {
        const currentPath = window.location.pathname;
        if (LOGIN_ROUTES.includes(currentPath)) {
          navigate(dashboardPath, { replace: true });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [token, user?.role, location.pathname, navigate]);
};
