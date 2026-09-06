import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import HeroSectionV2 from '../../components/HeroSectionV2';
import { useCart } from '../../context/CartContext';
import { buildProductOptions, getDefaultOption } from './buildProductOptions';

const DashboardPageV2 = ({ showHero = true }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const fetchProducts = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${API_URL}/api/admin/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load industrial product catalog. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Extract unique categories/types
  const categories = ['All', ...new Set(products.map((p) => p.type).filter(Boolean))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || product.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-in-out', bgcolor: '#f8fafc', minHeight: '100vh', pb: 6 }}>
      {/* V2 Industrial Hero Banner */}
      {showHero && <HeroSectionV2 />}

      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Catalog Control Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="900" color="#0f172a" sx={{ display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '-0.01em' }}>
                <i className="fi fi-rr-apps" style={{ color: '#1e3a8a' }}></i>
                INDUSTRIAL PRODUCTS CATALOG
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                Showing {filteredProducts.length} verified items with direct mill pricing & stock availability
              </Typography>
            </Box>

            {/* View Switcher (Grid Cards vs Spec Table) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '10px', display: 'flex', border: '1px solid #e2e8f0' }}>
                <Tooltip title="Modern Visual Cards">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('grid')}
                    sx={{
                      bgcolor: viewMode === 'grid' ? '#1e3a8a' : 'transparent',
                      color: viewMode === 'grid' ? '#ffffff' : '#64748b',
                      borderRadius: '8px',
                      p: 0.8,
                      '&:hover': { bgcolor: viewMode === 'grid' ? '#1d4ed8' : '#e2e8f0' },
                    }}
                  >
                    <i className="fi fi-rr-grid" style={{ fontSize: '15px' }}></i>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Technical Spec Table">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('table')}
                    sx={{
                      bgcolor: viewMode === 'table' ? '#1e3a8a' : 'transparent',
                      color: viewMode === 'table' ? '#ffffff' : '#64748b',
                      borderRadius: '8px',
                      p: 0.8,
                      '&:hover': { bgcolor: viewMode === 'table' ? '#1d4ed8' : '#e2e8f0' },
                    }}
                  >
                    <i className="fi fi-rr-list-check" style={{ fontSize: '15px' }}></i>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Search + Category Filter Bar */}
          <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            <TextField
              placeholder="Search by steel grade, ASTM spec, product type, thickness..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flexGrow: 1,
                minWidth: { xs: '100%', sm: 320 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#cbd5e1' },
                  '&:hover fieldset': { borderColor: '#1e3a8a' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="fi fi-rr-search" style={{ fontSize: '16px', color: '#64748b' }}></i>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  clickable
                  size="small"
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    py: 1.8,
                    px: 0.5,
                    borderRadius: '10px',
                    bgcolor: selectedCategory === cat ? '#1e3a8a' : '#f1f5f9',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    border: selectedCategory === cat ? '1px solid #1e3a8a' : '1px solid #e2e8f0',
                    '&:hover': {
                      bgcolor: selectedCategory === cat ? '#1d4ed8' : '#e2e8f0',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Content Area */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
            <CircularProgress size={44} sx={{ color: '#1e3a8a', mb: 2 }} />
            <Typography color="#64748b" fontWeight="700">
              Loading Products Catalog...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        ) : filteredProducts.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
            }}
          >
            <Box sx={{ fontSize: '48px', color: '#cbd5e1', mb: 2 }}>
              <i className="fi fi-rr-box-open"></i>
            </Box>
            <Typography variant="h6" fontWeight="800" gutterBottom color="#0f172a">
              No matching steel specifications found
            </Typography>
            <Typography variant="body2" color="#64748b">
              Try adjusting your search query or material category filter.
            </Typography>
          </Paper>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode — Modern E-Commerce Cards */
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 3,
            }}
          >
            {filteredProducts.map((product) => {
              const options = buildProductOptions(product);
              const defaultOpt = getDefaultOption(options);
              const displayPrice = defaultOpt ? defaultOpt.price : product.price;
              const displayUnit = defaultOpt ? defaultOpt.name : product.unit;

              return (
                <Paper
                  key={product.id}
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                      borderColor: '#93c5fd',
                    },
                  }}
                >
                  {/* Card Image Area */}
                  <Box
                    sx={{
                      height: 175,
                      bgcolor: '#f8fafc',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.imageUrls?.[0] || product.imageUrl ? (
                      <Box
                        component="img"
                        src={product.imageUrls?.[0] || product.imageUrl}
                        alt={product.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <i className="fi fi-rr-box" style={{ fontSize: '48px', color: '#94a3b8' }}></i>
                    )}

                    <Chip
                      label={product.type}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '6px',
                      }}
                    />

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        left: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        px: 1,
                        py: 0.3,
                        borderRadius: '6px',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        color: '#15803d',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }}
                    >
                      <i className="fi fi-sr-shield-check" style={{ fontSize: '11px', color: '#16a34a' }}></i>
                      ISO Certified Grade
                    </Box>
                  </Box>

                  {/* Body Content */}
                  <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      sx={{
                        color: '#0f172a',
                        fontSize: '0.925rem',
                        mb: 0.5,
                        cursor: 'pointer',
                        lineHeight: 1.3,
                        '&:hover': { color: '#1d4ed8' },
                      }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: '#64748b',
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 32,
                        lineHeight: 1.4,
                      }}
                    >
                      {product.shortDescription || 'Commercial metal standard supplied directly per mill specs.'}
                    </Typography>

                    {/* Stock & Rating Indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#d97706', fontSize: '0.75rem', fontWeight: 700 }}>
                        <i className="fi fi-sr-star" style={{ color: '#f59e0b', fontSize: '12px' }}></i>
                        4.9 <span style={{ color: '#94a3b8', fontWeight: 500 }}>(Direct Stock)</span>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                        ● Depot Ready
                      </Typography>
                    </Box>

                    {/* Price & Action Button Footer */}
                    <Box
                      sx={{
                        mt: 'auto',
                        pt: 1.75,
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>
                          DIRECT MILL PRICE
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#0f172a', lineHeight: 1.1 }}>
                          ₱{(displayPrice || 0).toLocaleString()}{' '}
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                            / {displayUnit || 'unit'}
                          </span>
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/product/${product.id}`)}
                        sx={{
                          bgcolor: '#1e3a8a',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '10px',
                          px: 1.75,
                          py: 0.8,
                          textTransform: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#1d4ed8' },
                        }}
                      >
                        View Specs
                        <i className="fi fi-rr-arrow-right" style={{ fontSize: '11px' }}></i>
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : (
          /* Technical Spec Table View Mode */
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              overflow: 'hidden',
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: '#0f172a' }}>
                <TableRow>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', py: 1.5 }}>Product Spec & Description</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', py: 1.5 }}>Category</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', py: 1.5 }}>Stock Depot</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', py: 1.5 }}>Unit Price</TableCell>
                  <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 'bold', py: 1.5 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => {
                  const options = buildProductOptions(product);
                  const defaultOpt = getDefaultOption(options);
                  const displayPrice = defaultOpt ? defaultOpt.price : product.price;
                  const displayUnit = defaultOpt ? defaultOpt.name : product.unit;

                  return (
                    <TableRow
                      key={product.id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: '#f8fafc' },
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell onClick={() => navigate(`/product/${product.id}`)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '8px',
                              bgcolor: '#f1f5f9',
                              overflow: 'hidden',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {product.imageUrls?.[0] || product.imageUrl ? (
                              <Box
                                component="img"
                                src={product.imageUrls?.[0] || product.imageUrl}
                                alt={product.name}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <i className="fi fi-rr-box" style={{ fontSize: '18px', color: '#94a3b8' }}></i>
                            )}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="bold" color="#0f172a">
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="#64748b">
                              {product.shortDescription || 'Commercial metal standard'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell onClick={() => navigate(`/product/${product.id}`)}>
                        <Chip
                          label={product.type}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#e2e8f0', color: '#334155', borderRadius: '6px' }}
                        />
                      </TableCell>

                      <TableCell onClick={() => navigate(`/product/${product.id}`)}>
                        <Chip
                          label="Valenzuela Depot"
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.675rem', bgcolor: '#eff6ff', color: '#1d4ed8', borderRadius: '6px' }}
                        />
                      </TableCell>

                      <TableCell onClick={() => navigate(`/product/${product.id}`)}>
                        <Typography variant="body2" fontWeight="bold" color="#0f172a">
                          ₱{(displayPrice || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          per {displayUnit || 'unit'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => navigate(`/product/${product.id}`)}
                          sx={{
                            bgcolor: '#1e3a8a',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#1d4ed8' },
                          }}
                        >
                          Inspect Specs
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPageV2;
