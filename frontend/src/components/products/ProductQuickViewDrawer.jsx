import React from 'react';
import { Drawer, Box, Typography, IconButton } from '@mui/material';
import ProductPreviewContent, { ProductPreviewActions } from './ProductPreviewContent';

// Mobile bottom sheet opened via long-press on a product card
const ProductQuickViewDrawer = ({
  open,
  product,
  coilInventory = [],
  onClose,
  onNavigateToProduct,
  onOpen3DViewer,
}) => {
  // Prevent accidental dismissal on outside backdrop tap so users can read and scroll safely
  const handleDrawerClose = (_event, reason) => {
    if (reason === 'backdropClick') {
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCloseButtonClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={Boolean(open && product)}
      onClose={handleDrawerClose}
      ModalProps={{
        keepMounted: false,
      }}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 -12px 36px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      {/* Sticky header with single designated X close control */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#f8fafc',
          flexShrink: 0,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            fontSize: '0.9rem',
          }}
        >
          Product Details
        </Typography>
        <IconButton
          size="small"
          aria-label="Close product details"
          onClick={handleCloseButtonClick}
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'rgba(15, 23, 42, 0.06)',
            color: 'text.primary',
            '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.12)' },
          }}
        >
          <i className="fi fi-rr-cross-small" style={{ fontSize: '18px', lineHeight: 1 }}></i>
        </IconButton>
      </Box>

      {/* Scrollable full specifications body */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          p: 2,
        }}
      >
        <ProductPreviewContent product={product} coilInventory={coilInventory} />
      </Box>

      {/* Sticky bottom actions without redundant close controls */}
      <Box sx={{ pb: 'env(safe-area-inset-bottom, 0px)', bgcolor: 'background.paper' }}>
        <ProductPreviewActions
          product={product}
          onNavigateToProduct={onNavigateToProduct}
          onOpen3DViewer={onOpen3DViewer}
        />
      </Box>
    </Drawer>
  );
};

export default ProductQuickViewDrawer;
