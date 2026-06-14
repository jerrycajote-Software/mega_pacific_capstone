import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { LogOut, User, Home, Package, ShoppingBag, ShoppingBasket, X, Minus, Plus } from 'lucide-react';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { cartItems, cartCount, updateQuantity, removeFromCart, updateCartValidation, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState([]);

 
  const validItems = cartItems.filter(item => !item.isDeleted && !item.isOutOfStock);
  const outOfStockItems = cartItems.filter(item => !item.isDeleted && item.isOutOfStock);
  const deletedItems = cartItems.filter(item => item.isDeleted);

  const checkedItems = validItems.filter(item => selectedItemIds.includes(item.id));
  const validTotal = checkedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const toggleSelection = (id) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedItemIds.length === validItems.length && validItems.length > 0) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(validItems.map(item => item.id));
    }
  };

 
  React.useEffect(() => {
    if (isCartOpen) {
      const validate = async () => {
        setIsValidating(true);
        if (updateCartValidation) {
          await updateCartValidation();
        }
        setIsValidating(false);
      };
      validate();
    }
    
  }, [isCartOpen]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  const getProductImage = (product) => {
    if (!product) return null;
    if (product.imageUrls && product.imageUrls.length > 0) return product.imageUrls[0];
    if (product.imageUrl) return product.imageUrl;
    return null;
  };

  const handleSingleCheckout = (item) => {
    setIsCartOpen(false);
    navigate('/checkout', {
      state: { isSingle: true, item }
    });
  };

  const handleBulkCheckout = () => {
    if (checkedItems.length === 0) return;
    setIsCartOpen(false);
    navigate('/checkout', {
      state: { isBulk: true, items: checkedItems, total: validTotal }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--customer-bg-main)] font-sans text-gray-900">
    
      <nav className="border-b border-gray-800 sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#162035' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            
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

            <div className="hidden md:flex flex-1 justify-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-baseline space-x-2">
                {/* <Link to="/dashboard" className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                  <Home size={16} className="mr-2" /> Home
                </Link> */}
                
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

                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors group">
                  <ShoppingBasket size={16} className="mr-2 group-hover:text-white transition-colors" />
                  <span className="group-hover:text-white transition-colors">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>

              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <User size={16} className="text-blue-400" />
                  <span className="font-medium tracking-wide">Hello, {user?.name?.split(' ')[0]}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white hover:bg-red-500/20 p-2 rounded-full transition-all group"
                  title="Logout"
                >
                  <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-h-[calc(100vh-160px)]">
        <Outlet />
      </main>

      
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm font-medium">
          <p>© 2026 Mega Pacific Roofing Systems. Providing Quality Roofing Since 1998.</p>
        </div>
      </footer>

      
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity" 
          onClick={() => setIsCartOpen(false)}
        />
      )}

      
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-[110] transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBasket className="text-blue-600" />
            Your Cart
            <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full ml-1">{cartCount}</span>
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin relative">
          {isValidating && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-2"></div>
              <p className="text-sm font-bold text-gray-600">Checking inventory...</p>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <ShoppingBasket size={48} className="text-gray-300 mb-4" />
              <p className="font-bold text-gray-900 mb-1">Your cart is empty</p>
              <p className="text-sm">Looks like you haven't added anything yet.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Valid Items */}
              {validItems.length > 0 && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 mb-1 pb-3 border-b border-gray-100">
                    <input 
                      type="checkbox" 
                      checked={selectedItemIds.length === validItems.length && validItems.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-gray-700 cursor-pointer" onClick={toggleAll}>Select All</span>
                  </div>
                  {validItems.map(item => (
                    <div key={item.id} className="flex gap-3 group items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer flex-shrink-0"
                      />
                      <div 
                        className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden cursor-pointer"
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate(`/product/${item.product.id}`);
                        }}
                      >
                        {getProductImage(item.product) ? (
                          <img src={getProductImage(item.product)} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 
                              className="font-bold text-gray-900 text-sm leading-tight cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                              onClick={() => {
                                setIsCartOpen(false);
                                navigate(`/product/${item.product.id}`);
                              }}
                            >
                              {item.product.name}
                            </h3>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                              title="Remove item"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          
                          {item.variant && !item.variant.isBaseProduct && (
                            <p className="text-xs text-gray-500 mt-1">{item.variant.name}</p>
                          )}
                          {!item.variant && (
                            <p className="text-xs text-gray-500 mt-1">Default</p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5 font-medium">₱{Number(item.price).toLocaleString()}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                            <button 
                              disabled={item.quantity <= 1}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                            <button 
                              disabled={item.quantity >= (item.variant ? item.variant.stock : item.product.stock)}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          
                          <button
                            onClick={() => handleSingleCheckout(item)}
                            className="bg-white border border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            Buy Now
                          </button>
                        </div>
                        <div className="mt-1 text-right">
                          <span className="font-extrabold text-gray-900 text-sm">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Out of Stock Section */}
              {outOfStockItems.length > 0 && (
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-sm font-bold text-amber-600 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Out of stock items
                  </h3>
                  <div className="flex flex-col gap-4">
                    {outOfStockItems.map(item => (
                      <div key={item.id} className="flex gap-3 opacity-60">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <span className="bg-amber-500 text-white text-[9px] font-bold px-1 rounded-sm uppercase tracking-wider">Out of Stock</span>
                          </div>
                          {getProductImage(item.product) ? (
                            <img src={getProductImage(item.product)} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-gray-300 m-auto mt-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-gray-700 text-xs leading-tight line-clamp-2">{item.product.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">{item.variant ? item.variant.name : 'Default'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deleted Items Section */}
              {deletedItems.length > 0 && (
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Deleted Items
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">These items are no longer available in the store.</p>
                  <div className="flex flex-col gap-4">
                    {deletedItems.map(item => (
                      <div key={item.id} className="flex gap-3 opacity-50 grayscale">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                          {getProductImage(item.product) ? (
                            <img src={getProductImage(item.product)} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-gray-300 m-auto mt-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-gray-700 text-xs leading-tight line-clamp-2 strike line-through">{item.product.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-gray-900">
              <span className="font-bold">Subtotal</span>
              <span className="font-extrabold text-xl">₱{validTotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">Shipping and taxes calculated at checkout.</p>
            <button 
              onClick={handleBulkCheckout}
              disabled={checkedItems.length === 0}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 font-bold py-3.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now ({checkedItems.length})
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerLayout;
