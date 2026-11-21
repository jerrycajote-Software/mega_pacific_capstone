import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Box, Typography, IconButton } from '@mui/material';
import ProductPreviewContent, { ProductPreviewActions } from './ProductPreviewContent';

const POPOVER_WIDTH = 420;
const POPOVER_MAX_HEIGHT = 560;
const VIEWPORT_PADDING = 16;
const ANCHOR_GAP = 12;

// Floating desktop quick-view card anchored beside the hovered product card
const ProductQuickViewPopover = ({
  open,
  product,
  anchorEl,
  coilInventory = [],
  onMouseEnter,
  onMouseLeave,
  onClose,
  onNavigateToProduct,
  onOpen3DViewer,
}) => {
  const [position, setPosition] = useState(null);
  const popoverRef = useRef(null);

  const computePopoverPosition = useCallback(() => {
    if (!anchorEl || typeof window === 'undefined') return null;

    const rect = anchorEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const effectiveWidth = Math.min(POPOVER_WIDTH, viewportWidth - VIEWPORT_PADDING * 2);
    const effectiveMaxHeight = Math.min(POPOVER_MAX_HEIGHT, viewportHeight - VIEWPORT_PADDING * 2);

    const spaceOnRight = viewportWidth - rect.right - VIEWPORT_PADDING;
    const spaceOnLeft = rect.left - VIEWPORT_PADDING;

    let left;
    let placement = 'right';

    if (spaceOnRight >= effectiveWidth + ANCHOR_GAP) {
      left = rect.right + ANCHOR_GAP;
      placement = 'right';
    } else if (spaceOnLeft >= effectiveWidth + ANCHOR_GAP) {
      left = rect.left - effectiveWidth - ANCHOR_GAP;
      placement = 'left';
    } else {
      left = Math.max(
        VIEWPORT_PADDING,
        Math.min(
          rect.left + rect.width / 2 - effectiveWidth / 2,
          viewportWidth - effectiveWidth - VIEWPORT_PADDING
        )
      );
      placement = 'center';
    }

    const idealTop = rect.top - 12;
    const top = Math.max(
      VIEWPORT_PADDING,
      Math.min(idealTop, viewportHeight - effectiveMaxHeight - VIEWPORT_PADDING)
    );

    return {
      top,
      left,
      width: effectiveWidth,
      maxHeight: effectiveMaxHeight,
      placement,
    };
  }, [anchorEl]);

  useEffect(() => {
    if (!open || !anchorEl) {
      setPosition(null);
      return undefined;
    }

    const updatePosition = () => {
      const nextPos = computePopoverPosition();
      setPosition(nextPos);
    };

    updatePosition();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    const handleWindowScroll = (event) => {
      // Allow scrolling inside the popover without dismissing it
      if (popoverRef.current && popoverRef.current.contains(event.target)) {
        return;
      }
      if (onClose) {
        onClose();
      }
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleWindowScroll, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleWindowScroll, true);
    };
  }, [open, anchorEl, computePopoverPosition, onClose]);

  if (!open || !product || !position || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <Box
      ref={popoverRef}
      role="dialog"
      aria-label={`Quick product details for ${product.name}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        maxHeight: `${position.maxHeight}px`,
        zIndex: 1350,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3.5,
        bgcolor: 'background.paper',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 22px 48px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
        animation: 'quickViewPopoverIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        '@keyframes quickViewPopoverIn': {
          from: {
            opacity: 0,
            transform:
              position.placement === 'left'
                ? 'translateX(8px) scale(0.985)'
                : position.placement === 'right'
                ? 'translateX(-8px) scale(0.985)'
                : 'translateY(8px) scale(0.985)',
          },
          to: {
            opacity: 1,
            transform: 'translate(0, 0) scale(1)',
          },
        },
      }}
    >
      {/* Compact sticky popover header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.15,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#f8fafc',
          flexShrink: 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: 'text.secondary',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '0.68rem',
          }}
        >
          Product Details Preview
        </Typography>
        <IconButton
          size="small"
          aria-label="Close product details preview"
          onClick={onClose}
          sx={{
            width: 26,
            height: 26,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.06)', color: 'text.primary' },
          }}
        >
          <i className="fi fi-rr-cross-small" style={{ fontSize: '15px', lineHeight: 1 }}></i>
        </IconButton>
      </Box>

      {/* Scrollable full product specifications */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(100, 116, 139, 0.28)',
            borderRadius: 99,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: 'rgba(100, 116, 139, 0.45)',
          },
        }}
      >
        <ProductPreviewContent product={product} coilInventory={coilInventory} />
      </Box>

      {/* Pinned action buttons */}
      <ProductPreviewActions
        product={product}
        onNavigateToProduct={onNavigateToProduct}
        onOpen3DViewer={onOpen3DViewer}
      />
    </Box>,
    document.body
  );
};

export default ProductQuickViewPopover;
