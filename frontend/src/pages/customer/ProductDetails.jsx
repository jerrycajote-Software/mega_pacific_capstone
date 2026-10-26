import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { buildProductOptions, getDefaultOption, isCustomLengthProfile } from './buildProductOptions';
import AddProductToOrderModal from '../../components/AddProductToOrderModal';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Chip,
  Rating,
  Avatar,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Modal,
  Stack,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StraightenIcon from '@mui/icons-material/Straighten';
import PaletteIcon from '@mui/icons-material/Palette';
import {
  ROOFING_COLORS,
  getColorHex,
  MAX_PREORDER_LENGTH_METERS,
  MIN_PREORDER_LENGTH_METERS
} from '../../constants/roofingSpecs';
import { isCoilInStock, getFirstInStockColor } from '../../utils/coilAvailability';

const extractShortDesc = (htmlStr) => {
  if (!htmlStr) return 'Premium quality material designed for long-lasting durability.';
  
  const cleanText = htmlStr.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, ' ').trim();
  const words = cleanText.split(/\s+/);
  if (words.length > 12) {
    return words.slice(0, 12).join(' ') + '...';
  }
  return cleanText;
};

const ZOOM_SCALE = 2.5;

const ImageGallery = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [imageError, setImageError] = useState(false);
  const imageContainerRef = useRef(null);

  const imgs = useMemo(() => {
    if (!images) return [];
    const list = Array.isArray(images) ? images : [images];
    return list.filter((img) => typeof img === 'string' && img.trim().length > 0);
  }, [images]);

  useEffect(() => {
    setActiveIndex(0);
    setImageError(false);
  }, [images]);

  const hasImages = imgs.length > 0 && !imageError;
  const currentImg = imgs[activeIndex] || imgs[0] || null;

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % imgs.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + imgs.length) % imgs.length);
  };

  const handleMouseMove = useCallback((e) => {
    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  const handleMouseEnter = useCallback(() => setIsZooming(true), []);
  const handleMouseLeave = useCallback(() => setIsZooming(false), []);

  if (!hasImages || !currentImg) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          height: { xs: 280, sm: 400, md: 520 }, 
          width: '100%',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderRadius: { xs: 3, md: 4 }, 
          bgcolor: '#f8fafc',
          border: '1px dashed #cbd5e1',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Box 
          sx={{ 
            width: 64, 
            height: 64, 
            borderRadius: '50%', 
            bgcolor: '#e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 2 
          }}
        >
          <i className="fi fi-rr-picture" style={{ fontSize: '30px', color: '#64748b' }}></i>
        </Box>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          No Image Available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260, mt: 0.5 }}>
          Product image will appear once uploaded by the staff.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        ref={imageContainerRef}
        elevation={0}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setLightboxOpen(true)}
        sx={{ 
          position: 'relative', 
          width: '100%',
          height: { xs: 280, sm: 420, md: 540 },
          minHeight: { xs: 280, sm: 420, md: 540 },
          flexShrink: 0,
          borderRadius: { xs: 3, md: 4 }, 
          bgcolor: '#ffffff',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'zoom-in',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.45)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3Cpath d='M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z'/%3E%3C/svg%3E")`,
            backgroundSize: '20px 20px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: isZooming ? 0 : 0.7,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
            zIndex: 2,
          }
        }}
      >
        <Box 
          component="img" 
          src={currentImg} 
          alt={`${productName} image ${activeIndex + 1}`} 
          onError={() => setImageError(true)}
          draggable={false}
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '100%', 
            maxWidth: '100%', 
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            transition: 'opacity 0.2s ease',
            opacity: isZooming ? 0 : 1,
            pointerEvents: 'none',
          }} 
        />

        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${currentImg})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${ZOOM_SCALE * 100}%`,
            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            opacity: isZooming ? 1 : 0,
            transition: isZooming ? 'none' : 'opacity 0.25s ease',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </Paper>

      {}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          mt: 2, 
          overflowX: 'auto', 
          pb: 1, 
          height: 92, 
          minHeight: 92, 
          flexShrink: 0, 
          visibility: imgs.length > 1 ? 'visible' : 'hidden',
        }}
      >
        {imgs.length > 1 && imgs.map((url, i) => (
            <Box 
              key={i} 
              onClick={() => setActiveIndex(i)}
              sx={{ 
                width: 84, 
                height: 84, 
                flexShrink: 0, 
                borderRadius: 2, 
                border: '2px solid', 
                borderColor: i === activeIndex ? 'primary.main' : 'transparent',
                cursor: 'pointer',
                opacity: i === activeIndex ? 1 : 0.6,
                transition: 'opacity 0.2s, border-color 0.2s',
                '&:hover': { opacity: 1 }
              }}
            >
              <Box component="img" src={url} alt={`Thumbnail ${i + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }} />
            </Box>
          ))}
      </Stack>

      {}
      <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', width: '90vw', height: '90vh', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={() => setLightboxOpen(false)} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
            <i className="fi fi-rr-cross" style={{ fontSize: '16px' }}></i>
          </IconButton>
          <Box component="img" src={imgs[activeIndex]} alt={`${productName} full size`} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          {imgs.length > 1 && (
            <>
              <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                <i className="fi fi-rr-angle-left" style={{ fontSize: '20px' }}></i>
              </IconButton>
              <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                <i className="fi fi-rr-angle-right" style={{ fontSize: '20px' }}></i>
              </IconButton>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

const VariantSelector = ({ options, selectedOption, onSelect, selectedColor, coilInventory }) => {
  if (!options || options.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Select Option (Thickness)
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {options.map((opt) => {
          const optKey = opt.id !== null ? opt.id : '_base';
          const isSelected = selectedOption?.id === opt.id && selectedOption?.isBaseProduct === opt.isBaseProduct;
          const optThickness = opt.thickness || opt.name;
          const isCoilStockOut = !isCoilInStock(coilInventory, optThickness, selectedColor);
          const isOutOfStock = opt.status === 'out_of_stock' || opt.stock === 0 || isCoilStockOut;

          return (
            <Tooltip
              key={optKey}
              title={isCoilStockOut ? `${opt.name} is out of stock in ${selectedColor} (Coil roll: 0)` : ''}
              arrow
            >
              <span>
                <Button
                  variant={isSelected ? 'contained' : 'outlined'}
                  color={isSelected ? 'primary' : 'inherit'}
                  onClick={() => !isOutOfStock && onSelect(opt)}
                  disabled={isOutOfStock}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    p: 1.5,
                    minWidth: 120,
                    bgcolor: isSelected ? 'primary.main' : 'background.paper',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    opacity: isCoilStockOut ? 0.45 : 1
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {opt.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    ₱{Number(opt.price).toLocaleString()}
                  </Typography>
                  {isCoilStockOut ? (
                    <Typography variant="caption" color="error" sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                      Out of Stock ({selectedColor})
                    </Typography>
                  ) : isOutOfStock ? (
                    <Typography variant="caption" color="error">Out of Stock</Typography>
                  ) : null}
                </Button>
              </span>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [fetchingReviews, setFetchingReviews] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [customLength, setCustomLength] = useState(3.0);
  const [selectedColor, setSelectedColor] = useState('Marshall Dark Gray');
  const [coilInventory, setCoilInventory] = useState([]);

  const longDescRef = useRef(null);

  const fetchReviews = useCallback(async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/customer/reviews/product/${id}`);
      if (res.data.success) setReviews(res.data.data);
    } catch (err) {
      console.error('Failed to fetch product reviews', err);
    } finally {
      setFetchingReviews(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/customer/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const productData = res.data.data;
          if (productData.isActive === false) {
            setError('This pre-order product has been disabled by sales and is unavailable for ordering.');
            setProduct(null);
            return;
          }
          setProduct(productData);

          if (productData.coilInventory && Array.isArray(productData.coilInventory)) {
            setCoilInventory(productData.coilInventory);
          } else {
            axios.get(`${API_URL}/api/customer/products/coil-availability`)
              .then(coilRes => {
                if (coilRes.data?.success) setCoilInventory(coilRes.data.data);
              })
              .catch(err => console.warn('Coil availability fallback warning:', err));
          }

          if (productData.colors && productData.colors.length > 0) {
            setSelectedColor(productData.colors[0]);
          } else if (productData.color) {
            setSelectedColor(productData.color);
          }
        
          const options = buildProductOptions(productData);
          const defaultOpt = getDefaultOption(options);
          if (defaultOpt) {
            setSelectedOption(defaultOpt);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product details', err);
        setError(err.response?.data?.error || err.response?.data?.message || 'Could not load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id, token, fetchReviews]);

  useEffect(() => {
    const fetchCoilAvailability = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/customer/products/coil-availability`);
        if (res.data?.success) {
          setCoilInventory(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load coil availability:', err);
      }
    };
    fetchCoilAvailability();
  }, []);

  const [additionalItems, setAdditionalItems] = useState([]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  const handleAddAdditionalProduct = (newItem) => {
    setAdditionalItems(prev => [
      ...prev,
      {
        ...newItem,
        orderItemId: `added-${newItem.product?.id || Date.now()}-${Date.now()}`
      }
    ]);
  };

  const handleRemoveAdditionalProduct = (indexToRemove) => {
    setAdditionalItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const productOptions = useMemo(() => buildProductOptions(product), [product]);
  const availableColorsList = useMemo(() => {
    return product?.colors && product.colors.length > 0 ? product.colors : ROOFING_COLORS.map(c => c.name);
  }, [product]);

  const productImages = useMemo(() => {
    if (!product) return [];
    let urls = [];
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      urls = [...product.imageUrls];
    } else if (typeof product.imageUrls === 'string' && product.imageUrls.trim()) {
      try {
        const parsed = JSON.parse(product.imageUrls);
        if (Array.isArray(parsed)) urls = parsed;
        else urls = [product.imageUrls];
      } catch {
        urls = [product.imageUrls];
      }
    }
    if (product.imageUrl && !urls.includes(product.imageUrl)) {
      urls = [product.imageUrl, ...urls];
    }
    return urls.filter((url) => typeof url === 'string' && url.trim().length > 0);
  }, [product]);
  const hasOptions = productOptions.length > 0;
  const isPreOrder = product?.isPreOrder ?? true;
  const isCustomLengthEligible = isCustomLengthProfile(product?.type);
  const isPerMeter = isCustomLengthEligible && (product?.unit === 'per meter' || !product?.unit || product?.unit?.toLowerCase().includes('meter'));
  const numLength = isPerMeter ? Math.max(MIN_PREORDER_LENGTH_METERS, Math.min(MAX_PREORDER_LENGTH_METERS, parseFloat(customLength) || 1.0)) : 1.0;

  const activePrice = selectedOption?.price ?? product?.price ?? 0;
  const activeOrigPrice = selectedOption?.originalPrice ?? product?.originalPrice ?? (activePrice ? Math.round((activePrice / 0.70) * 100) / 100 : 0);
  const activeDiscountPct = selectedOption?.discountPercent ?? product?.discountPercent ?? 30;
  const hasDiscount = activeOrigPrice > activePrice;
  const unitSavings = Math.max(0, activeOrigPrice - activePrice);

  const totalCalculatedPrice = activePrice * numLength * (parseInt(quantity, 10) || 1);
  const totalOrigCalculatedPrice = activeOrigPrice * numLength * (parseInt(quantity, 10) || 1);
  const totalSavings = (totalOrigCalculatedPrice - totalCalculatedPrice) > 0 ? (totalOrigCalculatedPrice - totalCalculatedPrice) : 0;
  const activeStock = selectedOption?.stock ?? product?.stock ?? 9999;

  const handleOptionSelect = (opt) => {
    setSelectedOption(opt);
    setQuantity(1); 
    const newThickness = opt?.thickness || opt?.name;
    if (!isCoilInStock(coilInventory, newThickness, selectedColor)) {
      const fallbackColor = getFirstInStockColor(coilInventory, newThickness, availableColorsList, selectedColor);
      if (fallbackColor && fallbackColor !== selectedColor) {
        setSelectedColor(fallbackColor);
      }
    }
  };


  useEffect(() => {
    if (coilInventory && coilInventory.length > 0) {
      const activeThick = selectedOption?.thickness || selectedOption?.name || product?.thickness || '0.35mm';
      if (!isCoilInStock(coilInventory, activeThick, selectedColor)) {
        const fallback = getFirstInStockColor(coilInventory, activeThick, availableColorsList, selectedColor);
        if (fallback && fallback !== selectedColor) {
          setSelectedColor(fallback);
        }
      }
    }
  }, [coilInventory, selectedOption, availableColorsList, selectedColor, product]);

  const buildCurrentItem = () => {
    let variantForCheckout = null;
    if (selectedOption && !selectedOption.isBaseProduct) {
      variantForCheckout = product?.variants?.find(v => v.id === selectedOption.id) || null;
    }

    return {
      orderItemId: `prod-${product?.id}-${variantForCheckout?.id || 'base'}-${isPerMeter ? numLength : '1'}-${selectedColor || 'def'}-${Date.now()}`,
      name: product?.name,
      type: product?.type,
      product,
      variant: variantForCheckout,
      variantId: variantForCheckout?.id || null,
      quantity,
      customLength: isPerMeter ? numLength : null,
      thickness: selectedOption?.thickness || product?.thickness || '0.35mm',
      color: selectedColor || selectedOption?.color || product?.color || null,
      total: totalCalculatedPrice,
      price: activePrice,
      originalPrice: activeOrigPrice
    };
  };

  const handleProceedToCheckout = () => {
    if (hasOptions && !selectedOption) {
      alert('Please select a product option before proceeding.');
      return;
    }
    const currentThick = selectedOption?.thickness || selectedOption?.name || product?.thickness || '0.35mm';
    if (!isCoilInStock(coilInventory, currentThick, selectedColor)) {
      alert(`The color finish "${selectedColor}" in ${currentThick} thickness is currently out of stock in coil raw inventory. Please choose another thickness or color.`);
      return;
    }
    if (quantity > 0 && product) {
      const primaryItem = buildCurrentItem();

      if (additionalItems.length > 0) {
        const allItems = [primaryItem, ...additionalItems];
        const combinedTotal = allItems.reduce((acc, itm) => acc + (itm.total || 0), 0);

        navigate('/checkout', {
          state: {
            isBulk: true,
            items: allItems,
            total: combinedTotal
          }
        });
      } else {
        navigate('/checkout', {
          state: primaryItem
        });
      }
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleIncrease = () => {
    if (activeStock > 0 && quantity < activeStock) {
      setQuantity(q => q + 1);
    }
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (activeStock === 0) {
        setQuantity(0);
      } else if (num > activeStock) {
        setQuantity(activeStock);
      } else {
        setQuantity(num);
      }
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === '' || quantity < 1) {
      setQuantity(activeStock === 0 ? 0 : 1);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">Loading product details...</Typography>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error" sx={{ display: 'inline-flex', mb: 3 }}>{error || 'Product not found.'}</Alert>
        <br />
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  const currentThickness = selectedOption?.thickness || selectedOption?.name || product?.thickness || '0.35mm';
  const isCurrentCoilInStock = isCoilInStock(coilInventory, currentThickness, selectedColor);
  const canBuy = (isPreOrder ? isCurrentCoilInStock : activeStock > 0) && (!hasOptions || selectedOption !== null) && isCurrentCoilInStock;

  return (
    <Container maxWidth="lg" sx={{ animation: 'fadeIn 0.5s ease-in-out', pb: { xs: 12, md: 10 }, pt: { xs: 2, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
      <Button 
        onClick={() => {
          if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
          } else {
            navigate('/products');
          }
        }} 
        sx={{ mb: { xs: 2, md: 4 }, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <i className="fi fi-rr-arrow-left" style={{ fontSize: '14px' }}></i>
        BROWSE ANOTHER PRODUCT
      </Button>

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 4, md: 6, lg: 7 },
          alignItems: 'start',
          mb: { xs: 4, md: 8 },
          width: '100%'
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', minWidth: 0 }}>
          {product.type && (
            <Chip 
              label={product.type} 
              sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16, 
                zIndex: 2, 
                fontWeight: 700, 
                bgcolor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }} 
            />
          )}
          <ImageGallery images={productImages} productName={product.name} />
        </Box>

        <Box sx={{ width: '100%', minWidth: 0 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color="text.primary" sx={{ fontSize: { xs: '1.4rem', sm: '2rem', md: '2.5rem' }, lineHeight: 1.25 }}>
            {product.name}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Rating value={product.averageRating || 0} precision={0.1} readOnly size="small" />
            <Typography variant="subtitle2" fontWeight="bold">
              {product.averageRating ? Number(product.averageRating).toFixed(1) : '0.0'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({product.reviewCount || 0} reviews)
            </Typography>
          </Stack>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" fontWeight="900" sx={{ color: '#16a34a' }}>
                ₱{activePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              {hasDiscount && (
                <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 500 }}>
                  ₱{activeOrigPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              )}
              {hasDiscount && (
                <Chip
                  label={`LESS ${activeDiscountPct}% OFF`}
                  size="small"
                  sx={{
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.06em',
                    fontWeight: 400,
                    bgcolor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    height: 24,
                    boxShadow: '0 2px 8px rgba(220,38,38,0.3)'
                  }}
                />
              )}
              {selectedOption && (
                <Typography variant="subtitle1" color="text.secondary">
                  — {selectedOption.name}
                  {selectedOption.color && ` (${selectedOption.color})`}
                </Typography>
              )}
              {!hasOptions && <Typography variant="subtitle1" color="text.secondary">/ {product.unit}</Typography>}
            </Box>
            {hasDiscount && (
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, mt: 0.5, display: 'block' }}>
                ✨ Save ₱{unitSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per unit with automatic 30% discount on every quantity!
              </Typography>
            )}
          </Box>

          <Typography variant="body1" color="text.secondary" mb={3} sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' }, lineHeight: 1.6 }} onClick={() => longDescRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            {extractShortDesc(product.description)}
          </Typography>

            {(product.effectiveWidth || product.nominalWidth || product.ribHeight) && (
              <Box sx={{ mb: 3, p: 2, borderRadius: 3, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <StraightenIcon sx={{ fontSize: 15 }} /> Profile Dimensions & Specifications
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  {product.effectiveWidth && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Effective Width</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {parseFloat(product.effectiveWidth) > 10 ? `${product.effectiveWidth} mm` : `${product.effectiveWidth} m`}
                      </Typography>
                    </Box>
                  )}
                  {product.nominalWidth && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Nominal Width</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {parseFloat(product.nominalWidth) > 10 ? `${product.nominalWidth} mm` : `${product.nominalWidth} m`}
                      </Typography>
                    </Box>
                  )}
                  {product.ribHeight && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Rib Height</Typography>
                      <Typography variant="body2" fontWeight="bold">{product.ribHeight} mm</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            <VariantSelector
              options={productOptions}
              selectedOption={selectedOption}
              onSelect={handleOptionSelect}
              selectedColor={selectedColor}
              coilInventory={coilInventory}
            />

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PaletteIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  Choose Color Finish: <span style={{ color: 'var(--text-primary)', marginLeft: 4 }}>{selectedColor}</span>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {availableColorsList.length} {availableColorsList.length === 1 ? 'Coil Color' : 'Coil Colors'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableColorsList.map((colorName) => {
                  const hex = getColorHex(colorName);
                  const isColorSelected = selectedColor === colorName;
                  const inStock = isCoilInStock(coilInventory, currentThickness, colorName);

                  return (
                    <Tooltip 
                      key={colorName} 
                      title={inStock ? colorName : `${colorName} (Out of Stock for ${currentThickness})`}
                      arrow
                    >
                      <Box
                        onClick={() => {
                          if (inStock) {
                            setSelectedColor(colorName);
                          }
                        }}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: hex,
                          border: isColorSelected ? '3px solid #2563eb' : '2px solid rgba(0,0,0,0.15)',
                          boxShadow: isColorSelected ? '0 0 0 2px rgba(37,99,235,0.4), 0 2px 6px rgba(0,0,0,0.2)' : 'none',
                          cursor: inStock ? 'pointer' : 'not-allowed',
                          opacity: inStock ? 1 : 0.28,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.18s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          filter: inStock ? 'none' : 'grayscale(50%)',
                          '&:hover': {
                            transform: inStock ? 'scale(1.12)' : 'none'
                          }
                        }}
                      >
                        {!inStock && (
                          <Box
                            sx={{
                              position: 'absolute',
                              width: '140%',
                              height: '2.5px',
                              bgcolor: '#ef4444',
                              transform: 'rotate(-45deg)',
                              boxShadow: '0 0 2px rgba(0,0,0,0.6)'
                            }}
                          />
                        )}
                        {isColorSelected && inStock && (
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>

            {isPerMeter && (
              <Box sx={{ mb: 3, p: 2, borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Custom Cut Length (Meters)
                  </Typography>
                  <Chip
                    label="Max Limit: 21.0m"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold', fontSize: '0.72rem' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Box
                    component="input"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="21.0"
                    value={customLength}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') setCustomLength('');
                      else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) setCustomLength(Math.min(21.0, Math.max(0.5, num)));
                      }
                    }}
                    onBlur={() => {
                      if (!customLength || parseFloat(customLength) < 0.5) setCustomLength(0.5);
                    }}
                    sx={{
                      width: 100,
                      py: 1,
                      px: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    meters per sheet ({((parseFloat(customLength) || 1) * 3.28084).toFixed(1)} feet)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[2.0, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 12.0, 18.0, 21.0].map((len) => (
                    <Button
                      key={len}
                      size="small"
                      variant={parseFloat(customLength) === len ? 'contained' : 'outlined'}
                      onClick={() => setCustomLength(len)}
                      sx={{ py: 0.3, px: 1, minWidth: 46, fontSize: '0.75rem', borderRadius: 1.5 }}
                    >
                      {len}m
                    </Button>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  💡 Custom cut-to-length manufactured from raw coils. Roll-forming limit: 21.0m.
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">Availability</Typography>
              {isPreOrder ? (
                <Chip 
                  label="Pre-Order Available • Made to Order" 
                  color="success" 
                  size="small" 
                  sx={{ fontWeight: 'bold' }} 
                />
              ) : (
                <Chip 
                  label={`${activeStock} units`} 
                  color={activeStock > 10 ? 'success' : activeStock > 0 ? 'warning' : 'error'} 
                  size="small" 
                  sx={{ fontWeight: 'bold' }} 
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {isPerMeter ? 'Quantity of Sheets' : 'Quantity'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <IconButton onClick={handleDecrease} disabled={quantity <= 1} size="small"><i className="fi fi-rr-minus" style={{ fontSize: '12px' }}></i></IconButton>
                <Box 
                  component="input"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                  sx={{ 
                    width: 48,
                    textAlign: 'center', 
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    color: 'text.primary',
                    border: 'none',
                    outline: 'none',
                    bgcolor: 'transparent',
                    fontFamily: 'inherit',
                    MozAppearance: 'textfield',
                    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0
                    }
                  }} 
                />
                <IconButton onClick={handleIncrease} size="small"><i className="fi fi-rr-plus" style={{ fontSize: '12px' }}></i></IconButton>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {!isCurrentCoilInStock && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5, fontWeight: 700 }}>
                Out of Stock: The {selectedColor} color finish is currently out of stock for {currentThickness} coil roll inventory. Please select another thickness or color.
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  Total Order Price ({isPerMeter ? `${numLength}m × ` : ''}{quantity} {quantity === 1 ? (isPerMeter ? 'sheet' : 'pc') : (isPerMeter ? 'sheets' : 'pcs')})
                </Typography>
                <Typography variant="h5" fontWeight="900" sx={{ color: '#16a34a', fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
                  ₱{totalCalculatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                {hasDiscount && (
                  <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700, display: 'block' }}>
                    Total Saved: ₱{totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (30% OFF)
                  </Typography>
                )}
              </Box>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={handleProceedToCheckout}
                disabled={!canBuy}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  minHeight: 48, 
                  borderRadius: 2.5, 
                  py: 1.4, 
                  px: { xs: 3, sm: 5 }, 
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(79,119,45,0.3)',
                  '&:hover': {
                    boxShadow: '0 12px 28px rgba(79,119,45,0.45)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {additionalItems.length > 0 ? `Pre-Order All Items (${1 + additionalItems.length})` : 'Pre-Order Now'}
              </Button>
            </Box>
          </Box>
        </Box>

      <Box sx={{ mt: 5 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: additionalItems.length > 0 ? 'primary.light' : 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.04)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 1.5, mb: additionalItems.length > 0 ? 2 : 0 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              
                Need to add another product to this order?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You can combine other roofing profiles, flashings, gutters, or trims into a single manufacturing order.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="primary"
              onClick={() => setIsAddProductModalOpen(true)}
              
              sx={{
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'none',
                px: 2.5,
                py: 0.9,
                borderStyle: 'dashed',
                borderWidth: '1.5px',
                bgcolor: 'rgba(79, 119, 45, 0.04)',
                '&:hover': {
                  borderStyle: 'solid',
                  bgcolor: 'rgba(79, 119, 45, 0.1)'
                }
              }}
            >
              Add Another Product
            </Button>
          </Box>

          {additionalItems.length > 0 && (
            <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                Additional Products in this Order ({additionalItems.length}):
              </Typography>

              <Stack spacing={1.5}>
                {additionalItems.map((item, idx) => (
                  <Paper
                    key={item.orderItemId || idx}
                    variant="outlined"
                    sx={{
                      p: 1.75,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: '#fff',
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {item.product?.imageUrls?.[0] || item.product?.imageUrl ? (
                          <Box component="img" src={item.product?.imageUrls?.[0] || item.product?.imageUrl} alt={item.product?.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <i className="fi fi-rr-box" style={{ fontSize: 18, color: '#94a3b8' }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={800} sx={{ color: 'text.primary' }}>
                          {item.product?.name || item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.thickness} • {item.color || 'Standard finish'} {item.customLength ? `• ${item.customLength}m` : ''} • Qty: {item.quantity}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#16a34a' }}>
                        ₱{item.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveAdditionalProduct(idx)}
                        sx={{ color: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.08)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.16)' } }}
                        title="Remove product"
                      >
                        <i className="fi fi-rr-trash" style={{ fontSize: 13 }} />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Combined Order Total ({1 + additionalItems.length} products):
                </Typography>
                <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#16a34a' }}>
                  ₱{(totalCalculatedPrice + additionalItems.reduce((acc, itm) => acc + (itm.total || 0), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <Box ref={longDescRef} sx={{ mt: 8, scrollMarginTop: 100 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
           Product Details
          </Typography>
          <Box 
            sx={{ 
              lineHeight: 1.8, 
              color: 'text.secondary',
              '& ul': { pl: 4, mb: 2, listStyleType: 'disc' },
              '& ol': { pl: 4, mb: 2, listStyleType: 'decimal' },
              '& h1, & h2, & h3, & h4': { mt: 3, mb: 1.5, color: 'text.primary', fontWeight: 'bold' },
              '& p': { mb: 2 },
              '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }
            }}
            dangerouslySetInnerHTML={{ __html: product.description ? product.description.replace(/&nbsp;/g, ' ') : '<p>Detailed specifications and descriptions will appear here.</p>' }}
          />
        </Paper>
      </Box>

      <Box sx={{ mt: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
          <i className="fi fi-rr-comment-alt" style={{ fontSize: '20px', color: '#64748b' }}></i>
          <Typography variant="h5" fontWeight="bold" color="text.primary">Customer Reviews</Typography>
          <Chip label={reviews.length || product.reviewCount || 0} size="small" sx={{ fontWeight: 'bold' }} />
        </Box>

        {fetchingReviews ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : reviews.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <i className="fi fi-rr-comment-alt" style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '16px', display: 'block' }}></i>
            <Typography variant="h6" fontWeight="bold" gutterBottom>No reviews yet</Typography>
            <Typography color="text.secondary">Customer reviews will appear here once this product has been purchased and rated by our community.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {reviews.map((review) => (
              <Box key={review.id} sx={{ minWidth: 0 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%', boxSizing: 'border-box' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        src={(review.user?.id && user?.id && review.user.id === user.id)
                          ? (user?.avatarUrl || review.user?.avatarUrl || review.user?.customerProfile?.avatarUrl || '/default-profile.png')
                          : (review.user?.avatarUrl || review.user?.customerProfile?.avatarUrl || '/default-profile.png')} 
                        alt={review.user?.name || 'Customer'}
                        sx={{ bgcolor: 'grey.200', color: 'text.primary', fontWeight: 'bold' }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{review.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                      </Box>
                    </Stack>
                    <Rating value={review.rating} size="small" readOnly />
                  </Box>
                  {review.title && <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{review.title}</Typography>}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: review.imageUrls?.length ? 2 : 0 }}>
                    {review.comment}
                  </Typography>
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mb: review.reply ? 2 : 0 }}>
                      {review.imageUrls.map((img, idx) => (
                        <Box key={idx} component="img" src={img} sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1 }} />
                      ))}
                    </Stack>
                  )}
                  {review.reply && (
                    <Box sx={{ mt: 2, pl: 2, borderLeft: '3px solid', borderColor: 'primary.main', bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }}>
                          {review.reply.user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
                          {review.reply.user?.name}
                        </Typography>
                        <Chip 
                          label={review.reply.user?.role} 
                          size="small" 
                          color="primary" 
                          variant="filled" 
                          sx={{ height: 18, fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 'bold', borderRadius: 1 }} 
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.reply.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.primary">
                        {review.reply.comment}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <AddProductToOrderModal
        open={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddAdditionalProduct}
        currentItems={[buildCurrentItem(), ...additionalItems]}
        initialProductId={null}
      />
    </Container>
  );
};

export default ProductDetails;
