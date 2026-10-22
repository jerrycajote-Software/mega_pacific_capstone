import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import HeroSection from '../../components/HeroSection';
import { buildProductOptions, getDefaultOption } from './buildProductOptions';
import { io } from 'socket.io-client';

const DashboardPage = ({ showHero = true }) => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProducts = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${API_URL}/api/customer/products`);
      const data = Array.isArray(response.data) ? response.data : (response.data?.products || response.data?.data || []);
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL);

    socket.on('product_catalog_updated', () => {
      fetchProducts();
    });

    return () => {
      socket.close();
    };
  }, []);

  const safeProducts = Array.isArray(products)
    ? products.filter(p => p.isPreOrder !== false && p.isActive !== false)
    : [];

  const filteredProducts = safeProducts.filter(product => {
    const matchesSearch = 
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.type || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {}
      {showHero && <HeroSection />}

      {}
      <Container id="customer-product-catalog" maxWidth="xl" disableGutters sx={{ px: { xs: 1.5, sm: 3, md: 4 } }}>
        {!showHero && (
          <>
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
            </Box>
          </>
        )}

        <Box sx={{ mb: 3.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
          <TextField
            placeholder={t('Search products...')}
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 300 },
              flexShrink: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="fi fi-rr-search" style={{ fontSize: '18px', color: '#94a3b8' }}></i>
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
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
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
              }}
              sx={{ 
                borderRadius: 3, 
                px: 2,
                py: 0.6,
                fontWeight: 700,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                fontSize: '0.8rem',
                color: 'white',
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              {t('All Products')}
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
            <CircularProgress color="primary" size={48} sx={{ mb: 2 }} />
            <Typography color="text.secondary">{t('Loading catalog...')}</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
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
            <i className="fi fi-rr-box-open" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px', display: 'block' }}></i>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
              {t('No products found')}
            </Typography>
            <Typography color="text.secondary">
              {searchTerm
                ? t('Try adjusting your search criteria.')
                : t('Check back later for new inventory.')}
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fill, minmax(210px, 1fr))' },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {filteredProducts.map((product) => {
              const options = buildProductOptions(product);
              const defaultOpt = getDefaultOption(options);
              const displayPrice = defaultOpt ? defaultOpt.price : product.price;
              const displayOrigPrice = defaultOpt ? (defaultOpt.originalPrice || Math.round((defaultOpt.price / 0.7) * 100) / 100) : (product.originalPrice || Math.round((product.price / 0.7) * 100) / 100);
              const displayUnit = defaultOpt ? defaultOpt.name : product.unit;
              const hasDiscount = displayOrigPrice && displayOrigPrice > displayPrice;
              const discountPct = defaultOpt?.discountPercent || product.discountPercent || 30;

              return (
                <Card
                  key={product.id}
                  elevation={0}
                  onClick={() => navigate(`/product/${product.id}`)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: { xs: 260, sm: 320 },
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: { xs: 2.5, sm: 3 },
                    bgcolor: '#ffffff',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                      borderColor: 'transparent',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      height: { xs: 125, sm: 150 },
                      minHeight: { xs: 125, sm: 150 },
                      bgcolor: 'grey.50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {(product.imageUrls?.[0] || product.imageUrl) ? (
                      <CardMedia
                        component="img"
                        image={product.imageUrls?.[0] || product.imageUrl}
                        alt={product.name}
                        sx={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                          transition: 'transform 0.4s ease',
                          '&:hover': { transform: 'scale(1.04)' },
                        }}
                      />
                    ) : (
                      <i className="fi fi-rr-box" style={{ fontSize: '44px', color: '#94a3b8' }}></i>
                    )}

                    {hasDiscount && (
                      <Chip
                        label="Less 30%"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          fontWeight: 800,
                          bgcolor: '#dc2626',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          height: 22,
                          boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    )}

                    <Chip
                      label={product.type}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontWeight: 700,
                        bgcolor: 'rgba(255,255,255,0.92)',
                        color: '#1a2027',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(4px)',
                        '& .MuiChip-label': { px: 1.5 },
                      }}
                    />

                    {product.imageUrls?.length > 1 && (
                      <Chip
                        label={`1/${product.imageUrls.length}`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          height: 22,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: 'none',
                        }}
                      />
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      p: { xs: 1.25, sm: 1.5 },
                      '&:last-child': { pb: { xs: 1.25, sm: 1.5 } },
                    }}
                  >
                    {}
                    <Typography
                      variant="subtitle2"
                      component="h3"
                      fontWeight={800}
                      title={product.name}
                      sx={{
                        color: '#1a2027',
                        textTransform: 'uppercase',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        letterSpacing: '0.02em',
                        mb: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: { xs: 32, sm: 36 },
                        lineHeight: { xs: '16px', sm: '18px' },
                      }}
                    >
                      {product.name}
                    </Typography>

                    {}
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6b7280',
                        mb: 1,
                        display: { xs: 'none', sm: '-webkit-box' },
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 32,
                        lineHeight: '16px',
                      }}
                    >
                      {product.description ? product.description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : t('No description')}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: { xs: 1, sm: 1.5 }, color: '#f59e0b', fontSize: { xs: '0.7rem', sm: '0.75rem' }, fontWeight: 700 }}>
                      <i className="fi fi-sr-star" style={{ fontSize: '11px' }}></i>
                      {product.averageRating ? Number(product.averageRating).toFixed(1) : '0.0'} 
                      <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.65rem' }}>
                        ({product.reviewCount || 0})
                      </span>
                    </Box>

                    <Box
                      sx={{
                        mt: 'auto',
                        pt: 1,
                        borderTop: '1px solid #f0f4f8',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="overline"
                          sx={{
                            color: '#9ca3af',
                            display: 'block',
                            lineHeight: 1,
                            mb: 0.5,
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            fontSize: '0.6rem',
                          }}
                        >
                          PRICE
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.3, flexWrap: 'nowrap', overflow: 'hidden' }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={900}
                            sx={{ color: '#16a34a', lineHeight: 1, flexShrink: 0, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                          >
                            ₱{(displayPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                          <Typography
                            variant="caption"
                            title={displayUnit || 'Default'}
                            sx={{
                              color: '#6b7280',
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: { xs: '0.65rem', sm: '0.75rem' }
                            }}
                          >
                            /{displayUnit || 'pc'}
                          </Typography>
                        </Box>
                        {hasDiscount && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#9ca3af',
                                textDecoration: 'line-through',
                                fontSize: '0.65rem',
                                fontWeight: 500,
                                lineHeight: 1,
                              }}
                            >
                              ₱{Number(displayOrigPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                            <Chip
                              label={`-${discountPct}%`}
                              size="small"
                              sx={{
                                height: 14,
                                fontSize: '0.55rem',
                                fontWeight: 800,
                                bgcolor: 'rgba(239,68,68,0.1)',
                                color: '#dc2626',
                                borderRadius: '3px',
                                px: 0.2,
                              }}
                            />
                          </Box>
                        )}
                      </Box>

                      <Button
                        size="small"
                        sx={{
                          flexShrink: 0,
                          bgcolor: 'primary.main',
                          color: '#ffffff',
                          borderRadius: 2,
                          px: { xs: 1, sm: 1.5 },
                          py: { xs: 0.5, sm: 0.75 },
                          boxShadow: '0 4px 12px rgba(79,119,45,0.3)',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s ease',
                          fontSize: { xs: '0.68rem', sm: '0.75rem' },
                          fontWeight: 'bold',
                          textTransform: 'none',
                          minWidth: 'auto',
                        }}
                      >
                        Order
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;
