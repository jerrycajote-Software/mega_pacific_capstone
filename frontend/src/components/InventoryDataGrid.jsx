import React, { useMemo, useState } from 'react';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import {
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Rating,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory2 as InventoryIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { ProductStockCalculator } from '../utils/ProductStockCalculator';

const InventoryDataGrid = ({
  products,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  isAdmin,
  loading,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  // Prepare rows with computed values
  const rows = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    return products.map((product, index) => {
      let totalStock = 0;
      try {
        totalStock = ProductStockCalculator.calculateTotalStock(product);
      } catch (e) {
        console.error('Error calculating total stock:', e);
        totalStock = product.stock || 0;
      }
      
      let status = 'in_stock';
      let statusColor = 'success';
      let statusLabel = 'In Stock';
      
      if (totalStock === 0) {
        status = 'out_of_stock';
        statusColor = 'error';
        statusLabel = 'Out of Stock';
      } else if (totalStock <= 10) {
        status = 'low_stock';
        statusColor = 'warning';
        statusLabel = 'Restocking';
      }

      let updatedDate;
      try {
        updatedDate = product.updatedAt ? new Date(product.updatedAt) : new Date();
      } catch (e) {
        updatedDate = new Date();
      }

      return {
        id: product.id || `temp-${index}`,
        name: product.name || '',
        type: product.type || '',
        unit: product.unit || '',
        price: product.price || 0,
        stock: product.stock || 0,
        imageUrl: product.imageUrl || '',
        imageUrls: product.imageUrls || [],
        averageRating: product.averageRating || 0,
        reviewCount: product.reviewCount || 0,
        totalSales: product.totalSales || 0,
        variants: product.variants || [],
        updatedAt: updatedDate,
        totalStock,
        status,
        statusColor,
        statusLabel,
        _original: product,
      };
    });
  }, [products]);

  // Apply filters and search
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      // Filter by status
      let passesFilter = true;
      if (filter === 'in_stock') {
        passesFilter = row.status === 'in_stock';
      } else if (filter === 'out_of_stock') {
        passesFilter = row.status === 'out_of_stock';
      } else if (filter === 'restocking') {
        passesFilter = row.status === 'low_stock';
      }

      // Apply search
      let passesSearch = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        passesSearch = 
          row.name.toLowerCase().includes(query) ||
          row.type.toLowerCase().includes(query) ||
          (row.unit && row.unit.toLowerCase().includes(query));
      }

      return passesFilter && passesSearch;
    });
  }, [rows, filter, searchQuery]);

  const hasVariants = (row) => {
    return row.variants && row.variants.length > 0;
  };

  const handleExpandedRowsChange = (newExpandedRows) => {
    setExpandedRows(newExpandedRows);
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'expand',
        headerName: '',
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const isExpanded = expandedRows[params.id];
          if (!hasVariants(params.row)) {
            return <Box sx={{ width: 50 }} />;
          }
          
          return (
            <IconButton
              size="small"
              onClick={() => {
                const newExpanded = { ...expandedRows };
                if (newExpanded[params.id]) {
                  delete newExpanded[params.id];
                } else {
                  newExpanded[params.id] = true;
                }
                setExpandedRows(newExpanded);
              }}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          );
        },
      },
      {
        field: 'image',
        headerName: 'Product',
        minWidth: 150,
        flex: 2,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          if (!params || !params.row) return <Box />;
          const product = params.row._original || params.row;
          const imageUrl = product.imageUrls?.[0] || product.imageUrl;
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={imageUrl}
                variant="rounded"
                sx={{ width: 36, height: 36, bgcolor: 'background.paper' }}
              >
                <InventoryIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              </Avatar>
              <Tooltip title={product.name || ''} arrow>
                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem'
                    }}
                  >
                    {product.name || ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    {product.type || ''}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          );
        },
      },
      {
        field: 'category',
        headerName: 'Category',
        minWidth: 80,
        flex: 0.8,
        renderCell: (params) => (
          <Chip
            label={params.row.type || ''}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        ),
      },
      {
        field: 'type',
        headerName: 'Unit',
        minWidth: 60,
        flex: 0.5,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{params.row.unit || ''}</Typography>
        ),
      },
      {
        field: 'price',
        headerName: 'Price',
        minWidth: 80,
        flex: 0.7,
        type: 'number',
        renderCell: (params) => (
          <Box sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            ₱{Number(params.row.price || 0).toLocaleString()}
          </Box>
        ),
      },
      {
        field: 'totalStock',
        headerName: 'Stock',
        minWidth: 70,
        flex: 0.5,
        type: 'number',
        renderCell: (params) => (
          <Chip
            label={`${params.row.totalStock || 0}`}
            size="small"
            color={params.row.statusColor || 'default'}
            variant="filled"
          />
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 80,
        flex: 0.7,
        renderCell: (params) => (
          <Chip
            label={params.row.statusLabel}
            size="small"
            color={params.row.statusColor}
            variant="outlined"
          />
        ),
      },
      {
        field: 'rating',
        headerName: 'Rating',
        minWidth: 90,
        flex: 0.7,
        sortable: true,
        renderCell: (params) => {
          const ratingValue = params.row.averageRating || 0;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating
                value={ratingValue}
                readOnly
                size="small"
                precision={0.5}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary', ml: 0.25, fontSize: '0.75rem' }}>
                ({params.row._original?.reviews?.length || 0})
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'totalSales',
        headerName: 'Sales',
        minWidth: 50,
        flex: 0.4,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {params.row.totalSales || 0}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        minWidth: 100,
        flex: 0.8,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          if (!params || !params.row) return <Box />;
          const product = params.row._original || params.row;
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => onViewProduct(product)}
                  color="primary"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {!isAdmin && (
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => onEditProduct(product)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {!isAdmin && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => onDeleteProduct(product)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        },
      },
    ];

    // Adjust columns for small screens
    if (isSmallScreen) {
      return baseColumns.filter((col) =>
        ['expand', 'image', 'price', 'totalStock', 'status', 'actions'].includes(col.field)
      );
    }

    return baseColumns;
  }, [isAdmin, onViewProduct, onEditProduct, onDeleteProduct, isSmallScreen, expandedRows]);

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'space-between', p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={filter}
        onChange={(_, newFilter) => setFilter(newFilter)}
        sx={{ minHeight: 'auto', '& .MuiTabs-indicator': { display: 'none' } }}
      >
        <Tab 
          label="All" 
          value="all" 
          sx={{ 
            py: 0.5, 
            minHeight: 'auto', 
            textTransform: 'none',
            fontWeight: filter === 'all' ? 600 : 400,
            color: filter === 'all' ? 'primary.main' : 'text.secondary'
          }} 
        />
        <Tab 
          label="In Stock" 
          value="in_stock" 
          sx={{ 
            py: 0.5, 
            minHeight: 'auto', 
            textTransform: 'none',
            fontWeight: filter === 'in_stock' ? 600 : 400,
            color: filter === 'in_stock' ? 'primary.main' : 'text.secondary'
          }} 
        />
        <Tab 
          label="Out of Stock" 
          value="out_of_stock" 
          sx={{ 
            py: 0.5, 
            minHeight: 'auto', 
            textTransform: 'none',
            fontWeight: filter === 'out_of_stock' ? 600 : 400,
            color: filter === 'out_of_stock' ? 'primary.main' : 'text.secondary'
          }} 
        />
        <Tab 
          label="Restocking" 
          value="restocking" 
          sx={{ 
            py: 0.5, 
            minHeight: 'auto', 
            textTransform: 'none',
            fontWeight: filter === 'restocking' ? 600 : 400,
            color: filter === 'restocking' ? 'primary.main' : 'text.secondary'
          }} 
        />
      </Tabs>
      <GridToolbarQuickFilter 
        placeholder="Search products..." 
        value={searchQuery}
        onFilterChange={(newValue) => setSearchQuery(newValue)}
        sx={{ minWidth: 250 }}
      />
    </GridToolbarContainer>
  );

  const getDetailPanelContent = ({ row }) => {
    if (!hasVariants(row)) return null;
    
    return (
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Variants ({row.variants.length})
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {row.variants.map((variant, index) => {
            let variantStatusColor = 'success';
            let variantStatusLabel = 'Available';
            if (variant.stock === 0) {
              variantStatusColor = 'error';
              variantStatusLabel = 'Out of Stock';
            } else if (variant.stock <= 10) {
              variantStatusColor = 'warning';
              variantStatusLabel = 'Low Stock';
            }
            
            return (
              <Box 
                key={variant.id || index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 1.5, 
                  border: 1, 
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {variant.name || 'Variant'}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                  <Typography variant="body2">{row.unit}</Typography>
                </Box>
                <Box sx={{ minWidth: 100, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ₱{Number(variant.price || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                  <Chip 
                    label={variant.stock} 
                    size="small" 
                    color={variantStatusColor}
                    variant="filled"
                  />
                </Box>
                <Box sx={{ minWidth: 100, textAlign: 'center' }}>
                  <Chip 
                    label={variantStatusLabel} 
                    size="small" 
                    color={variantStatusColor}
                    variant="outlined"
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25, 50]}
        slots={{
          toolbar: CustomToolbar,
        }}
        getRowId={(row) => row.id}
        initialState={{
          sorting: {
            sortModel: [{ field: 'updatedAt', sort: 'desc' }],
          },
        }}
        sx={{
          border: 'none',
          height: 600,
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      />
      {/* Render expanded variants manually for free version */}
      <Box sx={{ mt: 2 }}>
        {Object.keys(expandedRows).map((rowId) => {
          const row = filteredRows.find((r) => String(r.id) === String(rowId));
          if (!row || !hasVariants(row)) return null;

          return (
            <Box
              key={rowId}
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                {row.name} - Variants ({row.variants.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {row.variants.map((variant, index) => {
                  let variantStatusColor = 'success';
                  let variantStatusLabel = 'Available';
                  if (variant.stock === 0) {
                    variantStatusColor = 'error';
                    variantStatusLabel = 'Out of Stock';
                  } else if (variant.stock <= 10) {
                    variantStatusColor = 'warning';
                    variantStatusLabel = 'Low Stock';
                  }

                  return (
                    <Box
                      key={variant.id || index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.default',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {variant.name || 'Variant'}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                        <Typography variant="body2">{row.unit}</Typography>
                      </Box>
                      <Box sx={{ minWidth: 100, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₱{Number(variant.price || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                        <Chip
                          label={variant.stock}
                          size="small"
                          color={variantStatusColor}
                          variant="filled"
                        />
                      </Box>
                      <Box sx={{ minWidth: 100, textAlign: 'center' }}>
                        <Chip
                          label={variantStatusLabel}
                          size="small"
                          color={variantStatusColor}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default InventoryDataGrid;