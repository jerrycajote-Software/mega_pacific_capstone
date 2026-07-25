import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { buildProductOptions, getDefaultOption } from './buildProductOptions';
import {
  Box,
  Container,
  Grid,
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
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CategoryIcon from '@mui/icons-material/Category';

const ZOOM_SCALE = 2.5;

const ImageGallery = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef(null);

  const imgs = images && images.length > 0 ? images : [];
  const hasImages = imgs.length > 0;

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

  if (!hasImages) {
    return (
      <Paper elevation={1} sx={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 4, bgcolor: 'background.paper' }}>
        <ImageNotSupportedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography color="text.secondary">No images uploaded for this product</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%', height: { xs: 'auto', md: 660 }, display: 'flex', flexDirection: 'column' }}>
      {/* Main image with hover zoom */}
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
          height: { xs: 350, sm: 450, md: 550 },
          minHeight: { xs: 350, sm: 450, md: 550 },
          flexShrink: 0,
          borderRadius: 4, 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
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
        {/* Normal image layer — absolutely positioned so it never affects layout */}
        <Box 
          component="img" 
          src={imgs[activeIndex]} 
          alt={`${productName} image ${activeIndex + 1}`} 
          draggable={false}
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '100%', 
            maxWidth: '100%', 
            objectFit: 'contain',
            transition: 'opacity 0.2s ease',
            opacity: isZooming ? 0 : 1,
            pointerEvents: 'none',
          }} 
        />

        {/* Zoomed image layer */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${imgs[activeIndex]})`,
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

      {/* Thumbnail strip — always reserve space for layout stability */}
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

      {/* Lightbox Modal — keeps navigation arrows for full-screen browsing */}
      <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', width: '90vw', height: '90vh', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={() => setLightboxOpen(false)} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
            <CloseIcon />
          </IconButton>
          <Box component="img" src={imgs[activeIndex]} alt={`${productName} full size`} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          {imgs.length > 1 && (
            <>
              <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                <ChevronLeftIcon fontSize="large" />
              </IconButton>
              <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                <ChevronRightIcon fontSize="large" />
              </IconButton>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

const VariantSelector = ({ options, selectedOption, onSelect }) => {
  if (!options || options.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Select Option
      </Typography>
      <Grid container spacing={1}>
        {options.map((opt) => {
          const optKey = opt.id !== null ? opt.id : '_base';
          const isSelected = selectedOption?.id === opt.id && selectedOption?.isBaseProduct === opt.isBaseProduct;
          const isOutOfStock = opt.status === 'out_of_stock' || opt.stock === 0;

          return (
            <Grid item key={optKey}>
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
                  borderColor: isSelected ? 'primary.main' : 'divider'
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {opt.name}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  ₱{Number(opt.price).toLocaleString()}
                </Typography>
                {isOutOfStock && <Typography variant="caption" color="error">Out of Stock</Typography>}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [fetchingReviews, setFetchingReviews] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);

  const { addToCart } = useCart();
  const longDescRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/customer/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const productData = res.data.data;
          setProduct(productData);
        
          const options = buildProductOptions(productData);
          const defaultOpt = getDefaultOption(options);
          if (defaultOpt) {
            setSelectedOption(defaultOpt);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product details', err);
        setError('Could not load product details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/customer/reviews/product/${id}`);
        if (res.data.success) setReviews(res.data.data);
      } catch (err) {
        console.error('Failed to fetch product reviews', err);
      } finally {
        setFetchingReviews(false);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id, token]);

  const productOptions = useMemo(() => buildProductOptions(product), [product]);
  const hasOptions = productOptions.length > 0;
  const activePrice = selectedOption?.price ?? product?.price ?? 0;
  const activeStock = selectedOption?.stock ?? product?.stock ?? 0;

  const handleOptionSelect = (opt) => {
    setSelectedOption(opt);
    setQuantity(1); 
  };

  const handleProceedToCheckout = () => {
    if (hasOptions && !selectedOption) {
      alert('Please select a product option before proceeding.');
      return;
    }
    if (quantity > 0 && quantity <= activeStock) {
      let variantForCheckout = null;
      if (selectedOption && !selectedOption.isBaseProduct) {
        variantForCheckout = product.variants.find(v => v.id === selectedOption.id) || null;
      }
      navigate('/checkout', {
        state: {
          product,
          variant: variantForCheckout,
          quantity,
          total: activePrice * quantity
        }
      });
    }
  };

  const handleAddToCart = () => {
    if (hasOptions && !selectedOption) {
      alert('Please select a product option before adding to cart.');
      return;
    }
    if (quantity > 0 && quantity <= activeStock) {
      let variantForCart = null;
      if (selectedOption && !selectedOption.isBaseProduct) {
        variantForCart = product.variants.find(v => v.id === selectedOption.id) || null;
      }
      addToCart(product, variantForCart, quantity);
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

  const productImages = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []);
  const canBuy = activeStock > 0 && (!hasOptions || selectedOption !== null);

  return (
    <Container maxWidth="lg" sx={{ animation: 'fadeIn 0.5s ease-in-out', pb: 10, pt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4, color: 'text.secondary' }}>
        BACK TO PRODUCT
      </Button>

      <Grid container spacing={6} mb={8} alignItems="flex-start">
        {/* Left: Images */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            <Chip label={product.type} sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1, fontWeight: 'bold', bgcolor: 'rgba(255,255,255,0.9)' }} />
            <ImageGallery images={productImages} productName={product.name} />
          </Box>
        </Grid>

        {/* Right: Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color="text.primary">
            {product.name}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Rating value={product.averageRating || 0} precision={0.1} readOnly size="small" />
            <Typography variant="subtitle2" fontWeight="bold">
              {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({product.reviewCount || 0} reviews)
            </Typography>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 3 }}>
            <Typography variant="h4" fontWeight="900" color="text.primary">
              ₱{activePrice.toLocaleString()}
            </Typography>
            {selectedOption && (
              <Typography variant="subtitle1" color="text.secondary">
                — {selectedOption.name}
              </Typography>
            )}
            {!hasOptions && <Typography variant="subtitle1" color="text.secondary">/ {product.unit}</Typography>}
          </Box>

          <Typography variant="body1" color="text.secondary" mb={4} sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => longDescRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            {product.description ? 
              (product.description.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length > 15 
                ? product.description.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).slice(0, 15).join(' ') + '...' 
                : product.description.replace(/<[^>]+>/g, ' ').trim())
              : 'Premium quality material designed for long-lasting durability.'}
          </Typography>

          <Stack direction="row" spacing={3} mb={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', width: 32, height: 32 }}><ShieldIcon fontSize="small" /></Avatar>
              <Typography variant="body2" fontWeight="bold">Quality Guaranteed</Typography>
            </Box>
          </Stack>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <VariantSelector
              options={productOptions}
              selectedOption={selectedOption}
              onSelect={handleOptionSelect}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">Available Stock</Typography>
              <Chip 
                label={`${activeStock} units`} 
                color={activeStock > 10 ? 'success' : activeStock > 0 ? 'warning' : 'error'} 
                size="small" 
                sx={{ fontWeight: 'bold' }} 
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="subtitle2" fontWeight="bold">Quantity</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <IconButton onClick={handleDecrease} disabled={quantity <= 1} size="small"><RemoveIcon /></IconButton>
                <Typography sx={{ px: 2, fontWeight: 'bold' }}>{quantity}</Typography>
                <IconButton onClick={handleIncrease} disabled={quantity >= activeStock || activeStock === 0} size="small"><AddIcon /></IconButton>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">Total Price</Typography>
                <Typography variant="h5" fontWeight="900" color="text.primary">
                  ₱{(activePrice * quantity).toLocaleString()}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  startIcon={<ShoppingCartIcon />} 
                  onClick={handleAddToCart}
                  disabled={!canBuy}
                  sx={{ borderRadius: 2, py: 1.5, px: 3, fontWeight: 'bold' }}
                >
                  Add
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleProceedToCheckout}
                  disabled={!canBuy}
                  sx={{ borderRadius: 2, py: 1.5, px: 4, fontWeight: 'bold' }}
                >
                  Buy Now
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* <CategoryIcon color="primary" /> */}

      {/* Long Description */}
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
            dangerouslySetInnerHTML={{ __html: product.description || '<p>Detailed specifications and descriptions will appear here.</p>' }}
          />
        </Paper>
      </Box>

      {/* Reviews Section */}
      <Box sx={{ mt: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
          <ChatBubbleOutlineIcon color="action" />
          <Typography variant="h5" fontWeight="bold" color="text.primary">Customer Reviews</Typography>
          <Chip label={product.reviewCount || 0} size="small" sx={{ fontWeight: 'bold' }} />
        </Box>

        {fetchingReviews ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : reviews.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>No reviews yet</Typography>
            <Typography color="text.secondary">Customer reviews will appear here once this product has been purchased and rated by our community.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {reviews.map((review) => (
              <Grid item xs={12} md={6} key={review.id}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'grey.200', color: 'text.primary', fontWeight: 'bold' }}>
                        {review.user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
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
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetails;
