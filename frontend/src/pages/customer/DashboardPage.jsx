import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Container,
  Grid, 
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
  IconButton,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import HeroSection from '../../components/HeroSection';
import { buildProductOptions, getDefaultOption } from './buildProductOptions';

const DashboardPage = ({ showHero = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Hero Section — no container wrapping so it bleeds full-width */}
      {showHero && <HeroSection />}

      {/* Product Catalog — wrapped in Container for consistent page margins */}
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {!showHero && (
          <>
            {/* Section Title — Phase 4: 20px left padding */}
            <Box sx={{ mb: 3, pl: '20px' }}>
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
                {/* <Inventory2Icon color="primary" /> */}
                {t('PRODUCT AVAILABLE')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Browse our full catalog of quality materials')}
              </Typography>
            </Box>
          </>
        )}

        {/* Search and Filters — Phase 4: 20px left padding */}
        <Box sx={{ mb: 4, pl: '20px', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder={t('Search products...')}
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ borderRadius: 3, px: 2.5, fontWeight: 700 }}
            >
              {t('All Products')}
            </Button>
          </Box>
        </Box>

        {/* Content */}
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
            <Inventory2Icon sx={{ fontSize: 64, color: 'text.disabled', opacity: 0.4, mb: 2 }} />
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
              /* All columns equal width; auto-fill packs as many 220px cols as fit */
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 2,
            }}
          >
            {filteredProducts.map((product) => {
              const options = buildProductOptions(product);
              const defaultOpt = getDefaultOption(options);
              const displayPrice = defaultOpt ? defaultOpt.price : product.price;
              const displayUnit = defaultOpt ? defaultOpt.name : product.unit;

              return (
                <Card
                  key={product.id}
                  elevation={0}
                  onClick={() => navigate(`/product/${product.id}`)}
                  sx={{
                    /* CSS grid already controls column width; card fills the cell */
                    width: '100%',
                    height: 300,   /* every card is exactly 300px tall */
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: 3,
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
                  {/* Image area — fixed height */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 150,
                      minHeight: 150,
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
                      <Inventory2Icon sx={{ fontSize: 56, color: 'text.disabled' }} />
                    )}

                    {/* Type chip */}
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

                    {/* Multi-image indicator */}
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

                  {/* Card Content */}
                  <CardContent
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      p: 1.5,
                      '&:last-child': { pb: 1.5 },
                    }}
                  >
                    {/* Product name — 2-line clamp */}
                    <Typography
                      variant="subtitle2"
                      component="h3"
                      fontWeight={800}
                      title={product.name}
                      sx={{
                        color: '#1a2027',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.02em',
                        mb: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 36,
                        lineHeight: '18px',
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* Short description — 2-line clamp */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6b7280',
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 32,
                        lineHeight: '16px',
                      }}
                    >
                      {product.shortDescription || t('No description')}
                    </Typography>

                    {/* Price + Arrow */}
                    <Box
                      sx={{
                        mt: 'auto',
                        pt: 1,
                        borderTop: '1px solid #f0f4f8',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                        <Typography
                          variant="overline"
                          sx={{
                            color: '#9ca3af',
                            display: 'block',
                            lineHeight: 1,
                            mb: 0.75,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            fontSize: '0.65rem',
                          }}
                        >
                          PRICE
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'nowrap', overflow: 'hidden' }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={900}
                            sx={{ color: '#1a2027', lineHeight: 1, flexShrink: 0, fontSize: '0.85rem' }}
                          >
                            ₱{(displayPrice || 0).toLocaleString()}
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
                            }}
                          >
                            / {displayUnit || 'Default'}
                          </Typography>
                        </Box>
                      </Box>

                      <IconButton
                        size="small"
                        sx={{
                          flexShrink: 0,
                          bgcolor: 'primary.main',
                          color: '#ffffff',
                          borderRadius: 2,
                          p: 1,
                          boxShadow: '0 4px 12px rgba(79,119,45,0.35)',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ArrowForwardIcon fontSize="small" />
                      </IconButton>
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
