import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Assuming the admin endpoint is accessible for fetching products 
      // If it requires admin token, we might need a public endpoint, 
      // but based on current backend routes it seems unprotected in server.js
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/admin/products`);
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
      <div className="bg-[hsl(220,40%,12%)] rounded-3xl p-10 mb-10 relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            {/* <div className="w-10 h-[1px] bg-[#27a358]"></div> */}
            <span className="text-[#27a358] text-xs font-bold tracking-[0.2em] uppercase">
              {t("Catalog")}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
            {t("Product Catalog")}
          </h1>
          <p className="text-gray-400 text-base max-w-2xl font-normal">
            {t("Roofing, ceiling, and structural steel solutions for every application.")}
          </p>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-[#111b2e] flex items-center gap-3 tracking-tight">
          {/* {!iconError ? (
            <img 
              src="/roof_product.png" 
              alt="Product Catalog" 
              className="w-8 h-8 object-contain"
              onError={() => setIconError(true)}
            />
          ) : (
            <Package className="text-[#111b2e]" size={28} />
          )} */}
          {t("PRODUCT AVAILABLE")}
        </h2>
        {/* <p className="text-[#3b4758] text-sm mt-1 font-medium">{t("Available materials from our inventory")}</p> */}
      </div>

      {/* Search and Categories */}
      <div className="mb-8">
        <div className="relative w-full mb-4 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-700 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder={t("Search products...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400/50 transition-all placeholder-gray-400 shadow-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button className="bg-[#27a358] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#208a48] transition-colors cursor-pointer border border-[#27a358]">
            {t("All Products")}
          </button>
          {/* Temporary unclickable categories */}
          <div className="bg-white border border-gray-200 text-[#111b2e] px-4 py-2 rounded-md text-sm font-semibold cursor-default">
            {t("Roofing Sheets")} <span className="text-gray-400 font-normal ml-1">(9)</span>
          </div>
          <div className="bg-white border border-gray-200 text-[#111b2e] px-4 py-2 rounded-md text-sm font-semibold cursor-default">
            {t("Ceiling & Cladding")} <span className="text-gray-400 font-normal ml-1">(2)</span>
          </div>
          <div className="bg-white border border-gray-200 text-[#111b2e] px-4 py-2 rounded-md text-sm font-semibold cursor-default">
            {t("Structural Steel")} <span className="text-gray-400 font-normal ml-1">(1)</span>
          </div>
          <div className="bg-white border border-gray-200 text-[#111b2e] px-4 py-2 rounded-md text-sm font-semibold cursor-default">
            {t("Decking Systems")} <span className="text-gray-400 font-normal ml-1">(3)</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600">{t("Loading catalog...")}</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-12 text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{t("No products found")}</h3>
          <p className="text-gray-500">
            {searchTerm ? t("Try adjusting your search criteria.") : t("Check back later for new inventory.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-all group shadow-sm hover:shadow-md flex flex-col h-full cursor-pointer"
            >
              {/* Image Container */}
              <div className="h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                {(product.imageUrls?.[0] || product.imageUrl) ? (
                  <img
                    src={product.imageUrls?.[0] || product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Package size={48} className="text-gray-300" />
                )}
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 text-gray-800 border border-gray-200 shadow-sm text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                    {product.type}
                  </span>
                </div>
                {/* Image count badge */}
                {product.imageUrls?.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-white/90 shadow-sm text-gray-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-gray-200 backdrop-blur-sm">
                    1/{product.imageUrls.length}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-gray-600 transition-colors line-clamp-1 tracking-tight">{product.name}</h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow font-medium">
                  {product.description || t("Premium roofing material built for durability and aesthetics.")}
                </p>

                <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t("Price")}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-gray-900">₱{product.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 font-medium">/ {product.unit}</span>
                    </div>
                  </div>

                  <button className="bg-gray-900 hover:bg-gray-800 text-white p-2.5 rounded-xl transition-colors shadow-sm">
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
