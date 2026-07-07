import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import CustomerServiceWidget from '../components/CustomerServiceWidget';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Button,
  Checkbox,
  Stack,
  Divider,
  CircularProgress,
  Fab,
  Badge,
  Tooltip,
} from '@mui/material';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

/* ─── Floating Cart Pulse Keyframe ─────────────────────────────────────── */
const pulseKeyframes = `
  @keyframes cartPulse {
    0%   { box-shadow: 0 0 0 0   rgba(79,119,45,0.55); }
    70%  { box-shadow: 0 0 0 12px rgba(79,119,45,0); }
    100% { box-shadow: 0 0 0 0   rgba(79,119,45,0); }
  }
`;

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Inject pulse keyframe once */}
      <style>{pulseKeyframes}</style>

      <CustomerHeader />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 4 },
        }}
      >
        <Outlet />
      </Box>

      <Footer />

      {/* ─── Floating Cart FAB (Phase 3) ───────────────────────────────── */}
      <Tooltip title={`Your Cart${cartCount > 0 ? ` (${cartCount} items)` : ' — empty'}`} placement="left" arrow>
        <Fab
          color="primary"
          aria-label="Open cart"
          onClick={() => setIsCartOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 28,
            zIndex: 1200,
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #4f772d 0%, #3d5c22 100%)',
            boxShadow: '0 8px 24px rgba(79,119,45,0.4)',
            animation: cartCount > 0 ? 'cartPulse 2s ease-in-out infinite' : 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 12px 32px rgba(79,119,45,0.55)',
            },
          }}
        >
          <Badge
            badgeContent={cartCount}
            color="error"
            overlap="circular"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontWeight: 700,
                fontSize: '0.7rem',
                minWidth: 20,
                height: 20,
                border: '2px solid white',
              },
            }}
          >
            <ShoppingBasketIcon sx={{ fontSize: 26, color: '#ffffff' }} />
          </Badge>
        </Fab>
      </Tooltip>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#ffffff',
          }
        }}
        zIndex={1300}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #4f772d 0%, #3d5c22 100%)',
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ffffff' }}>
            
            Your Cart
            <Box
              component="span"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                px: 1.5,
                py: 0.25,
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {cartCount}
            </Box>
          </Typography>
          <IconButton onClick={() => setIsCartOpen(false)} size="small" sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, position: 'relative' }}>
          {isValidating && (
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.8)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
              <CircularProgress size={32} sx={{ mb: 1 }} color="primary" />
              <Typography variant="body2" fontWeight="bold" color="text.secondary">Checking inventory...</Typography>
            </Box>
          )}

          {cartItems.length === 0 ? (
            <Box sx={{ height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'text.secondary', py: 6 }}>
              
              <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>Your cart is empty</Typography>
              <Typography variant="body2">Looks like you haven't added anything yet.</Typography>
              <Button variant="outlined" color="primary" sx={{ mt: 3, borderRadius: 2 }} onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </Button>
            </Box>
          ) : (
            <Stack spacing={3}>
              {validItems.length > 0 && (
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                    <Checkbox
                      checked={selectedItemIds.length === validItems.length && validItems.length > 0}
                      onChange={toggleAll}
                      size="small"
                      color="primary"
                    />
                    <Typography variant="body2" fontWeight="bold" sx={{ cursor: 'pointer' }} onClick={toggleAll}>
                      Select All
                    </Typography>
                  </Box>

                  {validItems.map(item => (
                    <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Checkbox
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        size="small"
                        color="primary"
                        sx={{ p: 0, mt: 0.5 }}
                      />
                      <Box
                        onClick={() => { setIsCartOpen(false); navigate(`/product/${item.product.id}`); }}
                        sx={{
                          width: 80,
                          height: 80,
                          flexShrink: 0,
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getProductImage(item.product) ? (
                          <Box component="img" src={getProductImage(item.product)} alt={item.product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Inventory2Icon color="disabled" />
                        )}
                      </Box>
                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            onClick={() => { setIsCartOpen(false); navigate(`/product/${item.product.id}`); }}
                          >
                            {item.product.name}
                          </Typography>
                          <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ p: 0.5, color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {item.variant && !item.variant.isBaseProduct ? item.variant.name : 'Default'}
                        </Typography>
                        <Typography variant="caption" color="primary.main" fontWeight="bold">
                          ₱{Number(item.price).toLocaleString()}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
                            <IconButton size="small" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="caption" fontWeight="bold" sx={{ width: 28, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton size="small" disabled={item.quantity >= (item.variant ? item.variant.stock : item.product.stock)} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Button size="small" variant="outlined" color="primary" sx={{ py: 0.5, textTransform: 'none', borderRadius: 2 }} onClick={() => handleSingleCheckout(item)}>
                            Buy Now
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Out of Stock */}
              {outOfStockItems.length > 0 && (
                <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight="bold" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    Out of stock items
                  </Typography>
                  <Stack spacing={2}>
                    {outOfStockItems.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', gap: 2, opacity: 0.6 }}>
                        <Box sx={{ width: 64, height: 64, bgcolor: 'grey.100', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.5)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box component="span" sx={{ bgcolor: 'warning.main', color: 'white', fontSize: '0.6rem', fontWeight: 'bold', px: 0.5, borderRadius: 0.5, textTransform: 'uppercase' }}>
                              Out of Stock
                            </Box>
                          </Box>
                          <Box component="img" src={getProductImage(item.product)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.product.name}
                            </Typography>
                            <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ p: 0.5 }}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.variant ? item.variant.name : 'Default'}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Deleted Items */}
              {deletedItems.length > 0 && (
                <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight="bold" color="error.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                    Deleted Items
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    These items are no longer available in the store.
                  </Typography>
                  <Stack spacing={2}>
                    {deletedItems.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', gap: 2, opacity: 0.5, filter: 'grayscale(100%)' }}>
                        <Box sx={{ width: 64, height: 64, bgcolor: 'grey.100', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                          <Box component="img" src={getProductImage(item.product)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ textDecoration: 'line-through' }}>
                              {item.product.name}
                            </Typography>
                            <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ p: 0.5 }}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </Box>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary">Subtotal</Typography>
              <Typography variant="h6" fontWeight={900} color="text.primary">
                ₱{validTotal.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mb={2}>
              Shipping and taxes calculated at checkout.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={checkedItems.length === 0}
              onClick={handleBulkCheckout}
              sx={{ borderRadius: 2, fontWeight: 'bold', py: 1.5 }}
            >
              Buy Now ({checkedItems.length})
            </Button>
          </Box>
        )}
      </Drawer>
      <CustomerServiceWidget />
    </Box>
  );
};

export default CustomerLayout;
