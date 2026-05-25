import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Package, Search, Loader2, ArrowRight } from 'lucide-react';

const DashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Assuming the admin endpoint is accessible for fetching products 
      // If it requires admin token, we might need a public endpoint, 
      // but based on current backend routes it seems unprotected in server.js
      const response = await axios.get('http://localhost:5000/api/admin/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-3xl p-8 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Welcome back, {user?.name?.split(' ')[0] || 'Customer'}!
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Explore our premium selection of roofing materials. From durable Rib types to elegant Spandrel designs, find exactly what you need for your next project.
          </p>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Package className="text-blue-500" />
            Product Catalog
          </h2>
          <p className="text-gray-400 text-sm mt-1">Available materials from our inventory</p>
        </div>
        
        <div className="relative w-full sm:w-72 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111111] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading catalog...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl text-center">
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-12 text-center">
          <Package size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Check back later for new inventory.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group hover:shadow-lg hover:shadow-blue-500/10 flex flex-col h-full">
              {/* Image Container */}
              <div className="h-48 bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center border-b border-gray-800">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Package size={48} className="text-gray-700" />
                )}
                <div className="absolute top-3 right-3">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
                    {product.type}
                  </span>
                </div>
              </div>
              
              {/* Product Details */}
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{product.name}</h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                  {product.description || 'Premium roofing material built for durability and aesthetics.'}
                </p>
                
                <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-800/50">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white">₱{product.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400">/ {product.unit}</span>
                    </div>
                  </div>
                  
                  <button className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-blue-900/20">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
