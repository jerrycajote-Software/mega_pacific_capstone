import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const CartContext = createContext();

// Build the localStorage key for a given user (or guest)
const getCartKey = (userId) =>
  userId ? `mega_pacific_cart_${userId}` : 'mega_pacific_cart_guest';

export const CartProvider = ({ userId, children }) => {
  const cartKey = getCartKey(userId);

  // Load cart from the correct per-user key
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(cartKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
      return [];
    }
  });

  // Track the previous cartKey so we can detect user switches
  const prevCartKeyRef = useRef(cartKey);

  // When the user changes (login / logout / switch), load that user's cart
  useEffect(() => {
    if (prevCartKeyRef.current !== cartKey) {
      prevCartKeyRef.current = cartKey;
      try {
        const saved = localStorage.getItem(cartKey);
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch (e) {
        console.error('Failed to load cart on user switch', e);
        setCartItems([]);
      }
    }
  }, [cartKey]);

  // Persist cart to the correct per-user key whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems, cartKey]);

  const updateCartValidation = async () => {
    if (cartItems.length === 0) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  const addToCart = (product, variant, quantity) => {
    setCartItems(prev => {
      const variantId = variant ? variant.id : null;
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
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
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
