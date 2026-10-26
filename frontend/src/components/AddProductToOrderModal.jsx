import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ROOFING_COLORS,
  getColorHex,
  MAX_PREORDER_LENGTH_METERS,
  MIN_PREORDER_LENGTH_METERS
} from '../constants/roofingSpecs';
import { buildProductOptions, getDefaultOption, isCustomLengthProfile } from '../pages/customer/buildProductOptions';
import { isCoilInStock, getFirstInStockColor } from '../utils/coilAvailability';


const cleanHtmlDescription = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const AddProductToOrderModal = ({
  open,
  onClose,
  onAddProduct,
  currentItems = [],
  initialProductId = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [mobileTab, setMobileTab] = useState('catalog'); // 'catalog' | 'configure'

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedColor, setSelectedColor] = useState(ROOFING_COLORS[0].name);
  const [customLength, setCustomLength] = useState(6.0);
  const [quantity, setQuantity] = useState(1);
  const [addedAlert, setAddedAlert] = useState(null);
  const [coilInventory, setCoilInventory] = useState([]);

  const availableColorsList = useMemo(() => {
    if (!selectedProduct) return ROOFING_COLORS.map(c => c.name);
    return selectedProduct.colors && selectedProduct.colors.length > 0
      ? selectedProduct.colors
      : ROOFING_COLORS.map(c => c.name);
  }, [selectedProduct]);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const fetchCatalog = async () => {
      setLoading(true);
      setError('');
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/customer/products`);

        try {
          const coilRes = await axios.get(`${API_URL}/api/customer/products/coil-availability`);
          if (coilRes.data?.success && isMounted) {
            setCoilInventory(coilRes.data.data);
          }
        } catch (coilErr) {
          console.warn('Failed to load coil availability in modal:', coilErr);
        }

        const data = Array.isArray(res.data) ? res.data : (res.data?.products || res.data?.data || []);
        if (isMounted) {
          const activeOnly = data.filter(p => p.isActive !== false && p.isPreOrder !== false);
          setProducts(activeOnly);

          if (initialProductId) {
            const pre = activeOnly.find(p => p.id === Number(initialProductId));
            if (pre) {
              selectProductForConfig(pre, false);
            } else if (activeOnly.length > 0) {
              selectProductForConfig(activeOnly[0], false);
            }
          } else if (activeOnly.length > 0) {
            selectProductForConfig(activeOnly[0], false);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load products for order add-on modal:', err);
        if (isMounted) {
          setError('Unable to load catalog products. Please check connection and try again.');
          setLoading(false);
        }
      }
    };

    fetchCatalog();

    return () => {
      isMounted = false;
    };
  }, [open, initialProductId]);

  const selectProductForConfig = (prod, switchTabOnMobile = true) => {
    setSelectedProduct(prod);
    setAddedAlert(null);
    const options = buildProductOptions(prod);
    const defOpt = getDefaultOption(options);
    setSelectedOption(defOpt);

    const availableColors = prod.colors && prod.colors.length > 0 ? prod.colors : ROOFING_COLORS.map(c => c.name);
    const chosenColor = getFirstInStockColor(coilInventory, defOpt?.thickness || defOpt?.name || prod.thickness || '0.35mm', availableColors, prod.color || availableColors[0]);
    setSelectedColor(chosenColor);
    setCustomLength(6.0);
    setQuantity(1);

    if (isMobile && switchTabOnMobile) {
      setMobileTab('configure');
    }
  };

  const handleOptionChange = (opt) => {
    setSelectedOption(opt);
    const newThickness = opt?.thickness || opt?.name;
    if (!isCoilInStock(coilInventory, newThickness, selectedColor)) {
      const fallbackColor = getFirstInStockColor(coilInventory, newThickness, availableColorsList, selectedColor);
      if (fallbackColor && fallbackColor !== selectedColor) {
        setSelectedColor(fallbackColor);
      }
    }
  };

  useEffect(() => {
    if (coilInventory && coilInventory.length > 0 && selectedOption) {
      const activeThick = selectedOption.thickness || selectedOption.name || selectedProduct?.thickness || '0.35mm';
      if (!isCoilInStock(coilInventory, activeThick, selectedColor)) {
        const fallback = getFirstInStockColor(coilInventory, activeThick, availableColorsList, selectedColor);
        if (fallback && fallback !== selectedColor) {
          setSelectedColor(fallback);
        }
      }
    }
  }, [coilInventory, selectedOption, availableColorsList, selectedColor, selectedProduct]);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.type) set.add(p.type);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.type || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'All' || p.type === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const productOptions = useMemo(() => {
    if (!selectedProduct) return [];
    return buildProductOptions(selectedProduct);
  }, [selectedProduct]);

  const isCustomLengthEligible = isCustomLengthProfile(selectedProduct?.type);
  const isPerMeter = isCustomLengthEligible && (selectedProduct?.unit === 'per meter' || selectedProduct?.unit?.toLowerCase().includes('meter') || !selectedProduct?.unit);
  const numLength = isPerMeter
    ? Math.max(MIN_PREORDER_LENGTH_METERS, Math.min(MAX_PREORDER_LENGTH_METERS, parseFloat(customLength) || 1.0))
    : 1.0;

  const activePrice = selectedOption?.price ?? selectedProduct?.price ?? 0;
  const activeOrigPrice = selectedOption?.originalPrice ?? selectedProduct?.originalPrice ?? (activePrice ? Math.round((activePrice / 0.70) * 100) / 100 : 0);
  const qtyNumber = quantity === '' ? 0 : (parseInt(quantity, 10) || 1);
  const calculatedLineTotal = activePrice * numLength * qtyNumber;
  const calculatedOrigTotal = activeOrigPrice * numLength * qtyNumber;
  const calculatedSavings = Math.max(0, calculatedOrigTotal - calculatedLineTotal);

  const handleAddCurrentToOrder = () => {
    if (!selectedProduct) return;

    let variantObj = null;
    if (selectedOption && !selectedOption.isBaseProduct && selectedProduct.variants) {
      variantObj = selectedProduct.variants.find(v => v.id === selectedOption.id) || null;
    }

    const finalQty = Math.max(1, parseInt(quantity, 10) || 1);

    const newItem = {
      orderItemId: `${selectedProduct.id}-${variantObj?.id || 'base'}-${isPerMeter ? numLength : '1'}-${selectedColor || 'def'}-${Date.now()}`,
      product: selectedProduct,
      variant: variantObj,
      variantId: variantObj?.id || null,
      quantity: finalQty,
      customLength: isPerMeter ? numLength : null,
      thickness: selectedOption?.thickness || selectedProduct.thickness || '0.35mm',
      color: selectedColor || null,
      price: activePrice,
      originalPrice: activeOrigPrice,
      total: activePrice * numLength * finalQty
    };

    onAddProduct(newItem);
    setAddedAlert({
      name: selectedProduct.name,
      qty: newItem.quantity,
      spec: `${newItem.thickness || ''} ${isPerMeter ? `${numLength}m` : ''} ${newItem.color || ''}`.trim()
    });
  };

  const selectedProductImg = selectedProduct?.imageUrls?.[0] || selectedProduct?.imageUrl;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          maxHeight: { xs: '100vh', sm: '92vh' },
          height: { xs: '100vh', sm: 'auto' },
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          bgcolor: 'background.paper'
        }
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 2.5 }, pb: 1.5, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ pr: 2 }}>
            <Typography variant="h6" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'text.primary', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              
              Add Products to Your Order
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              Choose complementary roofing profiles, accessories, or add custom lengths before checkout.
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', bgcolor: 'grey.100', flexShrink: 0 }}>
            <i className="fi fi-rr-cross" style={{ fontSize: 13 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {isMobile && (
        <Box sx={{ px: 2, pt: 1.25, pb: 1.25, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: 'grey.200', borderRadius: 2.5 }}>
            <Button
              fullWidth
              size="small"
              variant={mobileTab === 'catalog' ? 'contained' : 'text'}
              color={mobileTab === 'catalog' ? 'primary' : 'inherit'}
              onClick={() => setMobileTab('catalog')}
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                fontSize: '0.78rem',
                textTransform: 'none',
                py: 0.75,
                boxShadow: mobileTab === 'catalog' ? '0 2px 8px rgba(79, 119, 45, 0.25)' : 'none'
              }}
            >
              <i className="fi fi-rr-apps" style={{ fontSize: 13, marginRight: 6 }} />
              1. Catalog ({filteredProducts.length})
            </Button>
            <Button
              fullWidth
              size="small"
              variant={mobileTab === 'configure' ? 'contained' : 'text'}
              color={mobileTab === 'configure' ? 'primary' : 'inherit'}
              onClick={() => setMobileTab('configure')}
              disabled={!selectedProduct}
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                fontSize: '0.78rem',
                textTransform: 'none',
                py: 0.75,
                boxShadow: mobileTab === 'configure' ? '0 2px 8px rgba(79, 119, 45, 0.25)' : 'none'
              }}
            >
              <i className="fi fi-rr-settings-sliders" style={{ fontSize: 13, marginRight: 6 }} />
              2. Configure {selectedProduct ? `(${selectedProduct.name.split(' ')[0]})` : ''}
            </Button>
          </Box>
        </Box>
      )}

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={44} color="primary" sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">Loading catalog products...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 3, borderRadius: 2 }}>{error}</Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '340px minmax(0, 1fr)' },
              gap: 3,
              minHeight: 480,
              width: '100%',
              maxWidth: '100%',
              overflowX: 'hidden'
            }}
          >
            {(!isMobile || mobileTab === 'catalog') && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', minWidth: 0 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search products or profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <i className="fi fi-rr-search" style={{ fontSize: 15, color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5, bgcolor: 'background.paper' }
                  }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.75,
                    overflowX: 'auto',
                    pb: 0.5,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' }
                  }}
                >
                  {categories.map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      size="small"
                      clickable
                      color={selectedCategory === cat ? 'primary' : 'default'}
                      variant={selectedCategory === cat ? 'filled' : 'outlined'}
                      onClick={() => setSelectedCategory(cat)}
                      sx={{ fontWeight: 700, fontSize: '0.72rem', borderRadius: 2, flexShrink: 0 }}
                    />
                  ))}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    maxHeight: { xs: 'none', md: 480 },
                    overflowY: { xs: 'visible', md: 'auto' },
                    pr: { md: 0.5 }
                  }}
                >
                  {filteredProducts.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'grey.50' }}>
                      <Typography variant="body2" color="text.secondary">No matching products found.</Typography>
                    </Paper>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isSelected = selectedProduct?.id === prod.id;
                      const startingPrice = prod.price || (prod.variants?.[0]?.price ?? 0);
                      const prodImg = prod.imageUrls?.[0] || prod.imageUrl;

                      return (
                        <Paper
                          key={prod.id}
                          elevation={0}
                          onClick={() => selectProductForConfig(prod, true)}
                          sx={{
                            p: 1.5,
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'rgba(79, 119, 45, 0.05)' : 'background.paper',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: isSelected ? 'primary.main' : 'primary.light',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: 54,
                              height: 54,
                              borderRadius: 2,
                              bgcolor: 'grey.100',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            {prodImg ? (
                              <Box component="img" src={prodImg} alt={prod.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <i className="fi fi-rr-box" style={{ fontSize: 22, color: '#94a3b8' }} />
                            )}
                          </Box>

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={800} noWrap sx={{ color: isSelected ? 'primary.dark' : 'text.primary' }}>
                              {prod.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                              {prod.type} {prod.unit ? `• ${prod.unit}` : ''}
                            </Typography>
                            <Typography variant="caption" fontWeight={800} sx={{ color: '#16a34a' }}>
                              ₱{startingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {prod.unit === 'per meter' ? '/m' : ''}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                            {isMobile ? (
                              <Button
                                size="small"
                                variant={isSelected ? 'contained' : 'outlined'}
                                color={isSelected ? 'primary' : 'inherit'}
                                sx={{ borderRadius: 2, fontSize: '0.72rem', py: 0.3, px: 1, minWidth: 60, textTransform: 'none', fontWeight: 700 }}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </Button>
                            ) : (
                              <i
                                className={`fi ${isSelected ? 'fi-rr-check-circle' : 'fi-rr-angle-small-right'}`}
                                style={{
                                  fontSize: 18,
                                  color: isSelected ? '#16a34a' : '#cbd5e1'
                                }}
                              />
                            )}
                          </Box>
                        </Paper>
                      );
                    })
                  )}
                </Box>
              </Box>
            )}

            {(!isMobile || mobileTab === 'configure') && (
              selectedProduct ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    width: '100%',
                    minWidth: 0,
                    overflowX: 'hidden'
                  }}
                >
                  {isMobile && (
                    <Button
                      size="small"
                      onClick={() => setMobileTab('catalog')}
                      startIcon={<i className="fi fi-rr-arrow-left" style={{ fontSize: 13 }} />}
                      sx={{
                        alignSelf: 'flex-start',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        color: 'text.secondary',
                        mb: -1
                      }}
                    >
                      ← Browse other products
                    </Button>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: 2.5,
                        bgcolor: 'grey.100',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      {selectedProductImg ? (
                        <Box component="img" src={selectedProductImg} alt={selectedProduct.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="fi fi-rr-box" style={{ fontSize: 24, color: '#94a3b8' }} />
                      )}
                    </Box>

                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={selectedProduct.type || 'Profile'} size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: 'grey.100' }} />
                        <Chip label="30% OFF Applied" size="small" sx={{ bgcolor: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', fontWeight: 800, fontSize: '0.68rem' }} />
                      </Box>
                      <Typography variant="h6" fontWeight={900} sx={{ color: 'text.primary', lineHeight: 1.25, wordBreak: 'break-word' }}>
                        {selectedProduct.name}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedProduct.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {cleanHtmlDescription(selectedProduct.description)}
                    </Typography>
                  )}

                  {addedAlert && (
                    <Alert severity="success" sx={{ borderRadius: 2.5, py: 0.5 }}>
                      ✓ Added <strong>{addedAlert.qty}x {addedAlert.name}</strong> ({addedAlert.spec}) to your order!
                    </Alert>
                  )}

                  {productOptions.length > 0 && (
                    <Box sx={{ width: '100%', minWidth: 0 }}>
                      <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1 }}>
                        1. Select Thickness / Variant
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {productOptions.map((opt, idx) => {
                          const isMatch = selectedOption?.name === opt.name || selectedOption?.thickness === opt.thickness;
                          const optThick = opt.thickness || opt.name;
                          const isCoilStockOut = !isCoilInStock(coilInventory, optThick, selectedColor);

                          return (
                            <Tooltip
                              key={idx}
                              title={isCoilStockOut ? `${opt.name || opt.thickness} is out of stock in ${selectedColor}` : ''}
                              arrow
                            >
                              <span>
                                <Button
                                  variant={isMatch ? 'contained' : 'outlined'}
                                  color={isMatch ? 'primary' : 'inherit'}
                                  onClick={() => !isCoilStockOut && handleOptionChange(opt)}
                                  disabled={isCoilStockOut}
                                  size="small"
                                  sx={{
                                    borderRadius: 2,
                                    px: { xs: 1.5, sm: 2 },
                                    py: 0.75,
                                    textTransform: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    borderColor: isMatch ? 'primary.main' : 'divider',
                                    boxShadow: isMatch ? '0 4px 12px rgba(79, 119, 45, 0.25)' : 'none',
                                    opacity: isCoilStockOut ? 0.45 : 1
                                  }}
                                >
                                  <span>{opt.name || opt.thickness}</span>
                                  <Typography component="span" sx={{ ml: 1, fontSize: '0.72rem', opacity: isMatch ? 0.95 : 0.75, fontWeight: 800 }}>
                                    ₱{opt.price?.toFixed(2)}
                                  </Typography>
                                  {isCoilStockOut && (
                                    <Typography component="span" color="error" sx={{ ml: 1, fontSize: '0.65rem', fontWeight: 800 }}>
                                      Out of stock
                                    </Typography>
                                  )}
                                </Button>
                              </span>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ width: '100%', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        2. Profile Color
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="primary.main">
                        {selectedColor}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
                      {availableColorsList.map((colorName) => {
                        const hex = getColorHex(colorName);
                        const isSelected = selectedColor === colorName;
                        const activeThick = selectedOption?.thickness || selectedOption?.name || selectedProduct?.thickness || '0.35mm';
                        const inStock = isCoilInStock(coilInventory, activeThick, colorName);

                        return (
                          <Tooltip 
                            key={colorName} 
                            title={inStock ? colorName : `${colorName} (Out of Stock for ${activeThick})`} 
                            arrow
                          >
                            <Box
                              onClick={() => {
                                if (inStock) {
                                  setSelectedColor(colorName);
                                }
                              }}
                              sx={{
                                width: { xs: 32, sm: 30 },
                                height: { xs: 32, sm: 30 },
                                borderRadius: '50%',
                                bgcolor: hex,
                                cursor: inStock ? 'pointer' : 'not-allowed',
                                opacity: inStock ? 1 : 0.28,
                                position: 'relative',
                                overflow: 'hidden',
                                border: isSelected ? '3px solid #16a34a' : '2px solid #e2e8f0',
                                boxShadow: isSelected ? '0 0 0 3px rgba(22, 163, 74, 0.4)' : 'none',
                                transition: 'all 0.15s ease',
                                filter: inStock ? 'none' : 'grayscale(50%)',
                                '&:hover': { transform: inStock ? 'scale(1.15)' : 'none' }
                              }}
                            >
                              {!inStock && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    width: '140%',
                                    height: '2px',
                                    bgcolor: '#ef4444',
                                    transform: 'rotate(-45deg)',
                                    boxShadow: '0 0 2px rgba(0,0,0,0.6)'
                                  }}
                                />
                              )}
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Section 3: Custom Cut Length (Meters) — Touch-friendly Stepper & Presets, NO SLIDER */}
                  {isPerMeter && (
                    <Box
                      sx={{
                        p: { xs: 2, sm: 2.25 },
                        borderRadius: 3,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        width: '100%',
                        minWidth: 0
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                            3. Custom Cut Length
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Manufactured from coil ({MIN_PREORDER_LENGTH_METERS}m – {MAX_PREORDER_LENGTH_METERS}m)
                          </Typography>
                        </Box>
                        <Chip
                          label={`${((numLength || 1) * 3.28084).toFixed(1)} feet`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 800, fontSize: '0.75rem', height: 24 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                        <IconButton
                          size="medium"
                          onClick={() => setCustomLength(prev => Math.max(MIN_PREORDER_LENGTH_METERS, Math.round((Number(prev || 1) - 0.5) * 10) / 10))}
                          disabled={numLength <= MIN_PREORDER_LENGTH_METERS}
                          sx={{
                            bgcolor: 'background.paper',
                            border: '1.5px solid',
                            borderColor: 'divider',
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            color: 'text.primary',
                            '&:hover': { bgcolor: 'grey.100' }
                          }}
                        >
                          <i className="fi fi-rr-minus" style={{ fontSize: 13 }} />
                        </IconButton>

                        <TextField
                          value={customLength}
                          type="number"
                          inputProps={{
                            step: 0.1,
                            min: MIN_PREORDER_LENGTH_METERS,
                            max: MAX_PREORDER_LENGTH_METERS,
                            style: { textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' }
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') setCustomLength('');
                            else {
                              const num = parseFloat(val);
                              if (!isNaN(num)) {
                                setCustomLength(Math.min(MAX_PREORDER_LENGTH_METERS, Math.max(0, num)));
                              }
                            }
                          }}
                          onBlur={() => {
                            if (!customLength || parseFloat(customLength) < MIN_PREORDER_LENGTH_METERS) {
                              setCustomLength(MIN_PREORDER_LENGTH_METERS);
                            } else if (parseFloat(customLength) > MAX_PREORDER_LENGTH_METERS) {
                              setCustomLength(MAX_PREORDER_LENGTH_METERS);
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography variant="body2" fontWeight={800} color="text.secondary">
                                  meters
                                </Typography>
                              </InputAdornment>
                            ),
                            sx: {
                              borderRadius: 2.5,
                              bgcolor: 'background.paper',
                              height: 44,
                              maxWidth: { xs: '100%', sm: 190 },
                              flexGrow: 1
                            }
                          }}
                          size="small"
                        />

                        <IconButton
                          size="medium"
                          onClick={() => setCustomLength(prev => Math.min(MAX_PREORDER_LENGTH_METERS, Math.round((Number(prev || 1) + 0.5) * 10) / 10))}
                          disabled={numLength >= MAX_PREORDER_LENGTH_METERS}
                          sx={{
                            bgcolor: 'background.paper',
                            border: '1.5px solid',
                            borderColor: 'divider',
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            color: 'text.primary',
                            '&:hover': { bgcolor: 'grey.100' }
                          }}
                        >
                          <i className="fi fi-rr-plus" style={{ fontSize: 13 }} />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                        {[2.0, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 12.0].map((preset) => (
                          <Chip
                            key={preset}
                            label={`${preset}m`}
                            size="small"
                            clickable
                            onClick={() => setCustomLength(preset)}
                            color={Number(customLength) === preset ? 'primary' : 'default'}
                            variant={Number(customLength) === preset ? 'filled' : 'outlined'}
                            sx={{
                              height: 28,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: 2,
                              transition: 'all 0.15s ease'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'grey.50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2,
                      mt: 'auto',
                      width: '100%',
                      minWidth: 0
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                        Quantity ({isPerMeter ? 'Sheets' : 'Units'}):
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75 }}>
                        <IconButton
                          size="small"
                          onClick={() => setQuantity(q => Math.max(1, (parseInt(q, 10) || 1) - 1))}
                          disabled={Number(quantity) <= 1}
                          aria-label="Decrease quantity"
                          sx={{
                            bgcolor: 'background.paper',
                            border: '1.5px solid',
                            borderColor: 'divider',
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            color: 'text.primary',
                            '&:hover': { bgcolor: 'action.hover' },
                            '&.Mui-disabled': { opacity: 0.4 }
                          }}
                        >
                          <i className="fi fi-rr-minus" style={{ fontSize: 12 }} />
                        </IconButton>

                        <Box
                          component="input"
                          type="number"
                          value={quantity}
                          min={1}
                          max={99999}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              setQuantity('');
                              return;
                            }
                            const num = parseInt(val, 10);
                            if (!isNaN(num) && num >= 0) {
                              setQuantity(Math.min(99999, num));
                            }
                          }}
                          onBlur={() => {
                            if (!quantity || parseInt(quantity, 10) < 1) {
                              setQuantity(1);
                            }
                          }}
                          aria-label="Quantity of sheets"
                          sx={{
                            width: 68,
                            height: 36,
                            textAlign: 'center',
                            fontWeight: 900,
                            fontSize: '1rem',
                            color: 'text.primary',
                            border: '1.5px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            outline: 'none',
                            bgcolor: 'background.paper',
                            fontFamily: 'inherit',
                            MozAppearance: 'textfield',
                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0
                            },
                            '&:focus': {
                              borderColor: 'primary.main',
                              boxShadow: '0 0 0 2px rgba(79, 119, 45, 0.15)'
                            }
                          }}
                        />

                        <IconButton
                          size="small"
                          onClick={() => setQuantity(q => Math.min(99999, (parseInt(q, 10) || 0) + 1))}
                          disabled={Number(quantity) >= 99999}
                          aria-label="Increase quantity"
                          sx={{
                            bgcolor: 'background.paper',
                            border: '1.5px solid',
                            borderColor: 'divider',
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            color: 'text.primary',
                            '&:hover': { bgcolor: 'action.hover' },
                            '&.Mui-disabled': { opacity: 0.4 }
                          }}
                        >
                          <i className="fi fi-rr-plus" style={{ fontSize: 12 }} />
                        </IconButton>
                      </Stack>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Line Total:
                      </Typography>
                      <Typography variant="h6" fontWeight={900} sx={{ color: '#16a34a', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                        ₱{calculatedLineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      {calculatedSavings > 0 && (
                        <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 800, display: 'block' }}>
                          Save ₱{calculatedSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (30% OFF)
                        </Typography>
                      )}
                    </Box>
                  </Paper>

                  {(() => {
                    const activeThick = selectedOption?.thickness || selectedOption?.name || selectedProduct?.thickness || '0.35mm';
                    const isModalCoilInStock = isCoilInStock(coilInventory, activeThick, selectedColor);

                    return (
                      <>
                        {!isModalCoilInStock && (
                          <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, fontWeight: 700, fontSize: '0.8rem' }}>
                            Out of Stock: {selectedColor} is out of stock in {activeThick} coil raw inventory.
                          </Alert>
                        )}

                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          size="large"
                          onClick={handleAddCurrentToOrder}
                          disabled={!selectedProduct || (quantity !== '' && parseInt(quantity, 10) < 1) || !isModalCoilInStock}
                          sx={{
                            py: 1.6,
                            borderRadius: 3,
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                            boxShadow: '0 8px 20px -6px rgba(79, 119, 45, 0.4)',
                            '&:hover': {
                              boxShadow: '0 12px 24px -6px rgba(79, 119, 45, 0.5)'
                            }
                          }}
                        >
                          
                          {isModalCoilInStock ? 'Add to Current Order' : 'Combination Out of Stock'}
                        </Button>
                      </>
                    );
                  })()}
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6 }}>
                  <Typography variant="body2" color="text.secondary">Select a product on the left to configure.</Typography>
                </Box>
              )
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1.5
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {currentItems.length} {currentItems.length === 1 ? 'item' : 'items'} in your active checkout
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 800,
            px: { xs: 2.5, sm: 3.5 },
            py: 1,
            bgcolor: '#0f172a',
            color: '#fff',
            '&:hover': { bgcolor: '#1e293b' }
          }}
        >
          Done & Review Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductToOrderModal;
