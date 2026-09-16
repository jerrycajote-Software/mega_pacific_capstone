import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ userId, token, children }) => {
  const [cartItems, setCartItems] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || '';

  const mapBackendCartToFrontend = (backendCart) => {
    return backendCart.map(item => {
      return {
        id: `${item.productId}-${item.variantId || 'base'}`, // Keep string ID for UI consistency
        dbId: item.id, // Store DB ID for removal/updates
        product: item.product,
        variant: item.variant,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.variant ? item.variant.price : item.product.price,
        isDeleted: false,
        isOutOfStock: false
      };
    });
  };

  // Load and sync cart whenever auth state changes
  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        try {
          const guestCartJson = localStorage.getItem('mega_pacific_cart_guest');
          let guestCart = [];
          if (guestCartJson) {
             guestCart = JSON.parse(guestCartJson);
          }
          
          if (guestCart.length > 0) {
             // Sync guest cart to backend
             const syncPayload = guestCart.map(item => ({
               productId: item.product.id,
               variantId: item.variant?.id || null,
               quantity: item.quantity
             }));
             const res = await axios.put(`${API_URL}/api/customer/cart/sync`, { items: syncPayload }, {
               headers: { Authorization: `Bearer ${token}` }
             });
             setCartItems(mapBackendCartToFrontend(res.data.data));
             localStorage.removeItem('mega_pacific_cart_guest'); // Clear guest cart after successful sync
          } else {
             // Just fetch backend cart
             const res = await axios.get(`${API_URL}/api/customer/cart`, {
               headers: { Authorization: `Bearer ${token}` }
             });
             setCartItems(mapBackendCartToFrontend(res.data.data));
          }
        } catch (e) {
          console.error("Failed to load/sync remote cart", e);
        }
      } else {
        // Guest mode: load from localStorage
        try {
          const saved = localStorage.getItem('mega_pacific_cart_guest');
          setCartItems(saved ? JSON.parse(saved) : []);
        } catch (e) {
          console.error("Failed to load guest cart", e);
        }
      }
    };
    loadCart();
  }, [token]); // Run when token changes

  // Persist to local storage for guests only, whenever cartItems changes
  useEffect(() => {
    if (!token) {
      try {
        localStorage.setItem('mega_pacific_cart_guest', JSON.stringify(cartItems));
      } catch (e) {
        console.error('Failed to save guest cart to localStorage', e);
      }
    }
  }, [cartItems, token]);

  const updateCartValidation = async () => {
    if (cartItems.length === 0) return;
    try {
      const validatedItems = await Promise.all(cartItems.map(async (item) => {
        try {
          const res = await axios.get(`${API_URL}/api/customer/products/${item.product.id}`);
          if (res.data.success) {
            const product = res.data.data;
            let isOutOfStock = false;
            let latestPrice = item.price;

            if (item.variant) {
              const variant = product.variants.find(v => v.id === item.variant.id);
              if (!variant || variant.status === 'out_of_stock' || variant.stock === 0) {
                isOutOfStock = true;
              }
              if (variant) {
                latestPrice = variant.price;
                item.variant = variant;
              }
            } else {
              if (product.stock === 0) {
                isOutOfStock = true;
              }
              latestPrice = product.price;
            }
            item.product = product;
            return { ...item, price: latestPrice, isDeleted: false, isOutOfStock };
          }
          return { ...item, isDeleted: true };
        } catch (error) {
          if (error.response && error.response.status === 404) {
            return { ...item, isDeleted: true };
          }
          return item;
        }
      }));

      setCartItems(validatedItems);
    } catch (error) {
      console.error('Cart validation failed', error);
    }
  };

  const addToCart = async (product, variant, quantity) => {
    const variantId = variant ? variant.id : null;
    
    if (token) {
      // API Call
      try {
        const res = await axios.post(`${API_URL}/api/customer/cart`, {
          productId: product.id,
          variantId,
          quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // After adding, we should refetch the cart to ensure consistency
        const fetchRes = await axios.get(`${API_URL}/api/customer/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(mapBackendCartToFrontend(fetchRes.data.data));
      } catch (e) {
        console.error("Failed to add to remote cart", e);
      }
    } else {
      // Local state update
      setCartItems(prev => {
        const existingItemIndex = prev.findIndex(
          item => item.product.id === product.id && item.variantId === variantId
        );

        if (existingItemIndex > -1) {
          const updated = [...prev];
          updated[existingItemIndex] = {
            ...updated[existingItemIndex],
            quantity: updated[existingItemIndex].quantity + quantity
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `${product.id}-${variantId || 'base'}`,
              product,
              variant,
              variantId,
              quantity,
              price: variant ? variant.price : product.price,
              isDeleted: false,
              isOutOfStock: false
            }
          ];
        }
      });
    }
  };

  const removeFromCart = async (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    if (token && item.dbId) {
      try {
        await axios.delete(`${API_URL}/api/customer/cart/${item.dbId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Failed to remove from remote cart", e);
      }
    }
    // Update local state in either case
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    if (token && item.dbId) {
      try {
        await axios.put(`${API_URL}/api/customer/cart/${item.dbId}`, {
          quantity: newQuantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Failed to update remote cart quantity", e);
      }
    }
    
    setCartItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i)
    );
  };

  const clearCart = async () => {
    if (token) {
      try {
        await axios.delete(`${API_URL}/api/customer/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Failed to clear remote cart", e);
      }
    }
    setCartItems([]);
  };

  const validItems = cartItems.filter(item => !item.isDeleted && !item.isOutOfStock);
  const cartTotal = validItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = validItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      updateCartValidation
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
