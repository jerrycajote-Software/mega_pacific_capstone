import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Home, Package } from 'lucide-react';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-gray-200">
      {/* Navigation Bar */}
      <nav className="bg-[#111111] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0">
                <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                  Mega Pacific
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-4">
                  <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <Home size={16} className="mr-2" /> Home
                  </Link>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                    <Package size={16} className="mr-2" /> Products
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-[#1a1a1a] px-3 py-1.5 rounded-full border border-gray-800">
                  <User size={14} className="text-blue-500" />
                  <span>{user?.name || 'Customer'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-colors"
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
      <footer className="bg-[#111111] border-t border-gray-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2026 Mega Pacific Roofing Systems. Providing Quality Roofing Since 1995.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
