import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Home, Package, ShoppingBag, ShoppingBasket } from 'lucide-react';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--customer-bg-main)] font-sans text-gray-900">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#162035' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0">
                <Link to="/dashboard" className="flex flex-col justify-center select-none" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '0.05em', lineHeight: 1 }}>
                    <span style={{ 
                      color: '#111b2e', 
                      WebkitTextStroke: '1px #3a4fd4'
                    }}>MEGA</span>
                    <span style={{ 
                      color: '#111b2e', 
                      WebkitTextStroke: '1px #5b6ee8'
                    }}>PACIFIC</span>
                  </div>
                  <div style={{ 
                    color: '#7a90e8', 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    letterSpacing: '0.2em', 
                    marginTop: '4px',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    METAL AND STEEL CORP
                  </div>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-2">
                  <Link to="/dashboard" className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <Home size={16} className="mr-2" /> Home
                  </Link>
                  
                  <Link to="/dashboard" className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <Package size={16} className="mr-2" /> Products
                  </Link>

                  <Link
                    to="/orders"
                    className="relative text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors group"
                  >
                    <ShoppingBag size={16} className="mr-2 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">Order View</span>
                  </Link>

                  <Link to="/cart"
                    className="relative text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors group">
                    <ShoppingBasket size={16} className="mr-2 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">Cart</span>
                  </Link>

                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <User size={14} className="text-gray-400" />
                  <span className="font-medium">{user?.name || 'Customer'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm font-medium">
          <p>© 2026 Mega Pacific Roofing Systems. Providing Quality Roofing Since 1995.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
