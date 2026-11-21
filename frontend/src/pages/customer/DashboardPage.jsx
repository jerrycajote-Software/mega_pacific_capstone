import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import HeroSection from '../../components/HeroSection';
import Home3DModelsShowcase from '../../components/Home3DModelsShowcase';
import Home3DCustomizationBanner from '../../components/Home3DCustomizationBanner';
import ProductCatalogCard from '../../components/products/ProductCatalogCard';
import ProductQuickViewPopover from '../../components/products/ProductQuickViewPopover';
import ProductQuickViewDrawer from '../../components/products/ProductQuickViewDrawer';
import { useIsMobileBrowser } from '../../hooks/useDeviceDetect';
import { buildProductOptions } from './buildProductOptions';
import { io } from 'socket.io-client';
import {
  isPicoRib1220,
  isMegaCurvedRoof,
  isHermosaTile,
  isAguaCorr1220,
  getAvailable3DModelsForProduct,
} from '../../services/roofModelRegistry';

const Product3DViewerModal = lazy(() => import('../../components/Product3DViewerModal'));

const HOVER_OPEN_DELAY_MS = 300;
const HOVER_CLOSE_DELAY_MS = 180;

const DashboardPage = ({ showHero = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobileBrowser = useIsMobileBrowser();
  const [products, setProducts] = useState([]);
  const [coilInventory, setCoilInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selected3DModel, setSelected3DModel] = useState(null);
  const [is3DViewerModalOpen, setIs3DViewerModalOpen] = useState(false);

  // Desktop hover quick-view and mobile long-press preview states
  const [hoveredPreview, setHoveredPreview] = useState({ product: null, anchorEl: null });
  const [mobilePreviewProduct, setMobilePreviewProduct] = useState(null);
  const hoverOpenTimerRef = useRef(null);
  const hoverCloseTimerRef = useRef(null);

  const clearHoverTimers = useCallback(() => {
    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearHoverTimers();
  }, [clearHoverTimers]);

  const handleCloseHoverPreview = useCallback(() => {
    clearHoverTimers();
    setHoveredPreview({ product: null, anchorEl: null });
  }, [clearHoverTimers]);

  const handleCardHoverEnter = useCallback(
    (product, anchorEl) => {
      if (hoverCloseTimerRef.current) {
        clearTimeout(hoverCloseTimerRef.current);
        hoverCloseTimerRef.current = null;
      }
      if (hoverOpenTimerRef.current) {
        clearTimeout(hoverOpenTimerRef.current);
      }

      // Open immediately when already inspecting another card, or after a brief delay on first hover
      const delay = hoveredPreview.product ? 140 : HOVER_OPEN_DELAY_MS;
      hoverOpenTimerRef.current = setTimeout(() => {
        setHoveredPreview({ product, anchorEl });
      }, delay);
    },
    [hoveredPreview.product]
  );

  const handleCardHoverLeave = useCallback(() => {
    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
    }

    hoverCloseTimerRef.current = setTimeout(() => {
      setHoveredPreview({ product: null, anchorEl: null });
    }, HOVER_CLOSE_DELAY_MS);
  }, []);

  const handlePopoverMouseEnter = useCallback(() => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }, []);

  const handleOpenMobilePreview = useCallback(
    (product) => {
      handleCloseHoverPreview();
      setMobilePreviewProduct(product);
    },
    [handleCloseHoverPreview]
  );

  const handleCloseMobilePreview = useCallback(() => {
    setMobilePreviewProduct(null);
  }, []);

  const fetchCatalogData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const [prodRes, coilRes] = await Promise.all([
        axios.get(`${API_URL}/api/customer/products`),
        axios.get(`${API_URL}/api/customer/products/coil-availability`).catch(() => ({ data: { data: [] } })),
      ]);
      const prodData = Array.isArray(prodRes.data)
        ? prodRes.data
        : prodRes.data?.products || prodRes.data?.data || [];
      const coilData = Array.isArray(coilRes.data)
        ? coilRes.data
        : coilRes.data?.coils || coilRes.data?.data || [];

      setProducts(prodData);
      setCoilInventory(coilData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch catalog data:', err);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL);

    socket.on('product_catalog_updated', () => {
      fetchCatalogData();
    });

    return () => {
      socket.close();
    };
  }, []);

  const safeProducts = Array.isArray(products)
    ? products.filter((p) => p.isPreOrder !== false && p.isActive !== false)
    : [];

  const findProductFor3DProfile = (profileName) => {
    if (!profileName) return null;
    if (isMegaCurvedRoof(profileName)) return safeProducts.find((p) => isMegaCurvedRoof(p.name)) || null;
    if (isHermosaTile(profileName)) return safeProducts.find((p) => isHermosaTile(p.name)) || null;
    if (isAguaCorr1220(profileName)) return safeProducts.find((p) => isAguaCorr1220(p.name)) || null;
    return safeProducts.find((p) => isPicoRib1220(p.name)) || null;
  };

  const active3DProduct = findProductFor3DProfile(selected3DModel?.profileName);

  const handleCustomizeIn3D = (houseModel) => {
    setSelected3DModel(houseModel);
    setIs3DViewerModalOpen(true);
  };

  const handleClose3DViewer = () => {
    setIs3DViewerModalOpen(false);
    setSelected3DModel(null);
  };

  const handleNavigateToFullCatalog = () => {
    handleCloseHoverPreview();
    navigate('/products');
  };

  const handleOpen3DCustomization = () => {
    handleCloseHoverPreview();
    handleCloseMobilePreview();
    navigate('/3d-customization');
  };

  const handleNavigateToProductDetail = useCallback(
    (product) => {
      if (!product?.id) return;
      handleCloseHoverPreview();
      handleCloseMobilePreview();
      navigate(`/product/${product.id}`);
    },
    [handleCloseHoverPreview, handleCloseMobilePreview, navigate]
  );

  const handleOpenProduct3DPreview = useCallback(
    (product) => {
      if (!product) return;
      handleCloseHoverPreview();
      handleCloseMobilePreview();

      const availableModels = getAvailable3DModelsForProduct(product.name);
      if (availableModels.length > 0) {
        setSelected3DModel(availableModels[0]);
        setIs3DViewerModalOpen(true);
      } else if (product.id) {
        navigate(`/product/${product.id}`, { state: { autoOpen3D: true } });
      }
    },
    [handleCloseHoverPreview, handleCloseMobilePreview, navigate]
  );

  const previewGestureHint = isMobileBrowser
    ? 'Press and hold any product card to view full details without leaving this page.'
    : 'Hover over any product card to view full details without leaving this page.';

  const displayedProducts = showHero
    ? safeProducts.filter((p) => p.isBestSeller)
    : safeProducts;

  const categories = ['All', ...new Set(safeProducts.map((p) => p.type).filter(Boolean))];

  const filteredProducts = displayedProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.type === selectedCategory;
    return matchesCategory;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {showHero && <HeroSection />}

      <Container id="customer-product-catalog" maxWidth="xl" disableGutters sx={{ px: { xs: 1.5, sm: 3, md: 4 } }}>
        {/* Dedicated 3D Customization Portal Spotlight directly below Hero Section */}
        {showHero && (
          <Home3DCustomizationBanner
            availableProducts={safeProducts}
            onOpen3DCustomization={handleOpen3DCustomization}
          />
        )}

        {/* Available 3D Models Showcase on Home Page */}
        {showHero && !loading && (
          <Home3DModelsShowcase
            availableProducts={safeProducts}
            onCustomizeIn3D={handleCustomizeIn3D}
          />
        )}

        {/* Catalog Section Header */}
        {showHero ? (
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label="Top Selling"
                  size="small"
                  sx={{
                    bgcolor: '#f59e0b',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: 22,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'text.primary',
                  }}
                >
                  Best Sellers
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Our highest-rated and most requested roofing profiles and construction materials.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'primary.dark', fontWeight: 600 }}>
                {previewGestureHint}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleNavigateToFullCatalog}
              sx={{
                borderRadius: 2.5,
                px: 2.5,
                py: 0.8,
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                borderWidth: 1.5,
                '&:hover': { borderWidth: 1.5 },
              }}
            >
              View All Products
            </Button>
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5,
                color: 'text.primary',
              }}
            >
              {t('PRODUCT AVAILABLE')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('Browse our full catalog of quality materials')}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'primary.dark', fontWeight: 600 }}>
              {previewGestureHint}
            </Typography>
          </Box>
        )}

        {/* Category Filters (Product Catalog View) */}
        {!showHero && (
          <Box
            sx={{
              mb: 3.5,
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 0.5,
              maxWidth: '100%',
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <Button
                  key={category}
                  variant={isSelected ? 'contained' : 'outlined'}
                  color="primary"
                  size="small"
                  onClick={() => {
                    handleCloseHoverPreview();
                    setSelectedCategory(category);
                  }}
                  sx={{
                    borderRadius: 3,
                    px: 2,
                    py: 0.6,
                    fontWeight: 700,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    fontSize: '0.8rem',
                    textTransform: 'none',
                  }}
                >
                  {category === 'All' ? t('All Products') : category}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Product Cards Grid / States */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
            <CircularProgress color="primary" size={48} sx={{ mb: 2 }} />
            <Typography color="text.secondary">{t('Loading catalog...')}</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        ) : filteredProducts.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <i
              className="fi fi-rr-box-open"
              style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px', display: 'block' }}
            ></i>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
              {showHero ? t('No best sellers found') : t('No products found')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: showHero ? 2 : 0 }}>
              {selectedCategory !== 'All' ? t('Try selecting another category.') : t('Check back later for new inventory.')}
            </Typography>
            {showHero && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNavigateToFullCatalog}
                sx={{
                  borderRadius: 2.5,
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  textTransform: 'none',
                  mt: 1,
                }}
              >
                Browse Full Catalog &gt;
              </Button>
            )}
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fill, minmax(210px, 1fr))' },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCatalogCard
                key={product.id}
                product={product}
                isPreviewActive={
                  hoveredPreview.product?.id === product.id ||
                  mobilePreviewProduct?.id === product.id
                }
                onNavigateToProduct={handleNavigateToProductDetail}
                onHoverEnter={handleCardHoverEnter}
                onHoverLeave={handleCardHoverLeave}
                onMobileLongPress={handleOpenMobilePreview}
              />
            ))}
          </Box>
        )}

        {/* Desktop Hover Quick-View Popover */}
        <ProductQuickViewPopover
          open={Boolean(hoveredPreview.product && hoveredPreview.anchorEl)}
          product={hoveredPreview.product}
          anchorEl={hoveredPreview.anchorEl}
          coilInventory={coilInventory}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handleCardHoverLeave}
          onClose={handleCloseHoverPreview}
          onNavigateToProduct={handleNavigateToProductDetail}
          onOpen3DViewer={handleOpenProduct3DPreview}
        />

        {/* Mobile Long-Press Bottom Sheet */}
        <ProductQuickViewDrawer
          open={Boolean(mobilePreviewProduct)}
          product={mobilePreviewProduct}
          coilInventory={coilInventory}
          onClose={handleCloseMobilePreview}
          onNavigateToProduct={handleNavigateToProductDetail}
          onOpen3DViewer={handleOpenProduct3DPreview}
        />

        {/* 3D Visualizer Modal (Embedded Standalone for Direct 3D Customization) */}
        {is3DViewerModalOpen && active3DProduct && (
          <Suspense fallback={null}>
            <Product3DViewerModal
              open={is3DViewerModalOpen}
              onClose={handleClose3DViewer}
              product={active3DProduct}
              productOptions={buildProductOptions(active3DProduct)}
              coilInventory={coilInventory}
              availableColors={active3DProduct.colors || []}
              initialColor={active3DProduct.colors?.[0] || 'Marshall Dark Gray'}
              initialLength={selected3DModel?.recommendedLength || 3.8}
              initialQuantity={selected3DModel?.totalSheets || 16}
              initialHouseModelId={selected3DModel?.id}
              onNavigateToProduct={(prod, config) => {
                handleClose3DViewer();
                navigate(`/product/${prod.id}`, { state: config });
              }}
            />
          </Suspense>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;