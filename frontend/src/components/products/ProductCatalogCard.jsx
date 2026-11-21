import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { buildProductOptions, getDefaultOption } from '../../pages/customer/buildProductOptions';
import { useLongPress } from '../../hooks/useLongPress';
import { extractPlainProductText } from '../../utils/productTextHelper';

// Product catalog card supporting desktop hover quick-view and mobile long-press preview
const ProductCatalogCard = ({
  product,
  isPreviewActive = false,
  onNavigateToProduct,
  onHoverEnter,
  onHoverLeave,
  onMobileLongPress,
}) => {
  const { t } = useTranslation();
  const cardRef = useRef(null);
  const lastTouchTimestampRef = useRef(0);

  const options = buildProductOptions(product);
  const defaultOpt = getDefaultOption(options);
  const discountPct = defaultOpt?.discountPercent ?? product.discountPercent ?? 30;
  const displayPrice = defaultOpt ? defaultOpt.price : product.price;
  const displayOrigPrice = discountPct > 0
    ? (defaultOpt
        ? defaultOpt.originalPrice || Math.round((defaultOpt.price / (1 - discountPct / 100)) * 100) / 100
        : product.originalPrice || Math.round((product.price / (1 - discountPct / 100)) * 100) / 100)
    : displayPrice;
  const displayUnit = defaultOpt ? defaultOpt.name : product.unit;
  const hasDiscount = discountPct > 0 && displayOrigPrice > displayPrice;
  const plainDescription = extractPlainProductText(product.description, t('No description'));

  const handleTriggerMobileLongPress = () => {
    if (onMobileLongPress) {
      onMobileLongPress(product);
    }
  };

  const { isPressing, longPressTriggeredRef, handlers: longPressHandlers } = useLongPress(
    handleTriggerMobileLongPress,
    { delay: 450, moveThreshold: 10, enabled: true }
  );

  const handleCardTouchStart = (event) => {
    lastTouchTimestampRef.current = Date.now();
    longPressHandlers.onTouchStart(event);
  };

  const handleCardMouseEnter = () => {
    // Skip desktop hover popovers triggered by synthetic touch mouse events
    if (Date.now() - lastTouchTimestampRef.current < 700) return;
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: none)').matches
    ) {
      return;
    }

    if (onHoverEnter && cardRef.current) {
      onHoverEnter(product, cardRef.current);
    }
  };

  const handleCardMouseLeave = () => {
    if (Date.now() - lastTouchTimestampRef.current < 700) return;
    if (onHoverLeave) {
      onHoverLeave();
    }
  };

  const handleOpenProductPage = () => {
    // Do not navigate away when the user just opened the mobile long-press preview
    if (longPressTriggeredRef.current) {
      return;
    }
    if (onNavigateToProduct) {
      onNavigateToProduct(product);
    }
  };

  const handleOrderProductClick = (event) => {
    event.stopPropagation();
    if (onNavigateToProduct) {
      onNavigateToProduct(product);
    }
  };

  return (
    <Card
      ref={cardRef}
      elevation={0}
      onClick={handleOpenProductPage}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      onTouchStart={handleCardTouchStart}
      onTouchMove={longPressHandlers.onTouchMove}
      onTouchEnd={longPressHandlers.onTouchEnd}
      onTouchCancel={longPressHandlers.onTouchCancel}
      onContextMenu={longPressHandlers.onContextMenu}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: { xs: 260, sm: 320 },
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        borderRadius: { xs: 2.5, sm: 3 },
        bgcolor: '#ffffff',
        border: '1.5px solid',
        borderColor: isPressing || isPreviewActive ? 'primary.main' : 'divider',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        transform: isPressing ? 'scale(0.975)' : isPreviewActive ? 'translateY(-4px)' : 'none',
        boxShadow: isPreviewActive
          ? '0 14px 30px rgba(30, 58, 138, 0.16)'
          : isPressing
          ? '0 4px 14px rgba(30, 58, 138, 0.18)'
          : 'none',
        transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s ease, border-color 0.22s ease',
        '@media (hover: hover)': {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
            borderColor: 'primary.light',
          },
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
        {product.imageUrls?.[0] || product.imageUrl ? (
          <CardMedia
            component="img"
            image={product.imageUrls?.[0] || product.imageUrl}
            alt={product.name}
            draggable={false}
            sx={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              transition: 'transform 0.4s ease',
              '@media (hover: hover)': {
                '&:hover': { transform: 'scale(1.04)' },
              },
            }}
          />
        ) : (
          <i className="fi fi-rr-box" style={{ fontSize: '44px', color: '#94a3b8' }}></i>
        )}

        {hasDiscount && (
          <Chip
            label={`Less ${discountPct}%`}
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

        {product.isBestSeller && (
          <Chip
            label={product.salesRank ? `#${product.salesRank} Best Seller` : 'Best Seller'}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              fontWeight: 800,
              bgcolor: '#f59e0b',
              color: '#ffffff',
              fontSize: '0.65rem',
              height: 22,
              boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
              '& .MuiChip-label': { px: 1 },
            }}
          />
        )}

        {product.imageUrls?.length > 1 && !product.isBestSeller && (
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
          {plainDescription}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: { xs: 1, sm: 1.5 },
            color: '#f59e0b',
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            fontWeight: 700,
          }}
        >
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
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
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
                  label={`-${discountPct}% OFF`}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.65rem',
                    letterSpacing: '0.04em',
                    fontWeight: 400,
                    bgcolor: 'rgba(239,68,68,0.1)',
                    color: '#dc2626',
                    borderRadius: '4px',
                    px: 0.3,
                  }}
                />
              </Box>
            )}
          </Box>

          <Button
            size="small"
            onClick={handleOrderProductClick}
            sx={{
              flexShrink: 0,
              bgcolor: 'primary.main',
              color: '#ffffff',
              borderRadius: 2,
              px: { xs: 1, sm: 1.5 },
              py: { xs: 0.5, sm: 0.75 },
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
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
};

export default ProductCatalogCard;
