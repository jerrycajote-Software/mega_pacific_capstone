import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Rating,
  Tooltip,
  Divider,
} from '@mui/material';
import { buildProductOptions, getDefaultOption } from '../../pages/customer/buildProductOptions';
import { ROOFING_COLORS, getColorHex } from '../../constants/roofingSpecs';
import { isCoilInStock, hasCoilStockForThickness } from '../../utils/coilAvailability';
import { hasAny3DModel } from '../../services/roofModelRegistry';
import { sanitizeProductHtml, getProductImageList } from '../../utils/productTextHelper';

const DEFAULT_SPEC_HELP = {
  effectiveWidth: 'Actual roof width covered after overlapping adjacent sheets.',
  nominalWidth: 'Full edge-to-edge width of the metal sheet before overlapping.',
  ribHeight: 'Height of the raised waves or ribs that strengthen the sheet and direct rainwater.',
};

// Format width specs cleanly in millimeters or meters
const formatWidthSpec = (value) => {
  const numeric = parseFloat(value);
  if (Number.isNaN(numeric)) return String(value);
  return numeric > 10 ? `${value} mm` : `${value} m`;
};

// Sticky footer actions shared by both desktop quick-view popover and mobile bottom sheet
export const ProductPreviewActions = ({
  product,
  onNavigateToProduct,
  onOpen3DViewer,
}) => {
  if (!product) return null;

  const is3DSupported = hasAny3DModel(product?.name);

  const handleNavigateToProductPage = (event) => {
    event?.stopPropagation();
    if (onNavigateToProduct) {
      onNavigateToProduct(product);
    }
  };

  const handleOpenProduct3DView = (event) => {
    event?.stopPropagation();
    if (onOpen3DViewer) {
      onOpen3DViewer(product);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        p: 1.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}
    >
      {is3DSupported && (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleOpenProduct3DView}
          sx={{
            flex: 1,
            borderRadius: 2,
            py: 0.9,
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'none',
            borderWidth: 1.5,
            '&:hover': { borderWidth: 1.5 },
          }}
        >
          View in 3D
        </Button>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigateToProductPage}
        sx={{
          flex: is3DSupported ? 1.35 : 1,
          borderRadius: 2,
          py: 0.9,
          fontWeight: 800,
          fontSize: '0.82rem',
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.28)',
        }}
      >
        Order &amp; Customize
      </Button>
    </Box>
  );
};

// Full product specification and media preview rendered inside quick-view containers
const ProductPreviewContent = ({ product, coilInventory = [] }) => {
  const productOptions = useMemo(() => buildProductOptions(product), [product]);
  const defaultOption = useMemo(() => getDefaultOption(productOptions), [productOptions]);
  const productImages = useMemo(() => getProductImageList(product), [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(defaultOption);

  // Reset image and thickness selection whenever a different product is previewed
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedOption(defaultOption);
  }, [product?.id, defaultOption]);

  if (!product) return null;

  const activeOption = selectedOption || defaultOption;
  const discountPct = activeOption?.discountPercent ?? product.discountPercent ?? 30;
  const displayPrice = activeOption?.price ?? product.price ?? 0;
  const displayOrigPrice = discountPct > 0
    ? (activeOption?.originalPrice ??
        product.originalPrice ??
        (displayPrice ? Math.round((displayPrice / (1 - discountPct / 100)) * 100) / 100 : 0))
    : displayPrice;
  const displayUnit = activeOption?.name || product.unit || 'pc';
  const hasDiscount = discountPct > 0 && displayOrigPrice > displayPrice;
  const unitSavings = hasDiscount ? Math.max(0, displayOrigPrice - displayPrice) : 0;

  const isPreOrder = product.isPreOrder ?? true;
  const activeStock = activeOption?.stock ?? product.stock ?? 0;
  const activeThickness = activeOption?.thickness || activeOption?.name || product.thickness || '0.35mm';

  const availableColorsList =
    Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors
      : ROOFING_COLORS.map((colorItem) => colorItem.name);

  const hasCoilData = Array.isArray(coilInventory) && coilInventory.length > 0;
  const inStockColorCount = hasCoilData
    ? availableColorsList.filter((colorName) =>
        isCoilInStock(coilInventory, activeThickness, colorName)
      ).length
    : availableColorsList.length;

  const currentImage = productImages[activeImageIndex] || productImages[0] || null;
  const sanitizedDescription = sanitizeProductHtml(product.description);
  const hasSpecs = Boolean(product.effectiveWidth || product.nominalWidth || product.ribHeight);

  const handleSelectPreviewImage = (index) => {
    setActiveImageIndex(index);
  };

  const handleSelectThicknessOption = (option) => {
    setSelectedOption(option);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      {/* Product image header with gallery switcher */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 190, sm: 175 },
          borderRadius: 2.5,
          bgcolor: '#f8fafc',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {currentImage ? (
          <Box
            component="img"
            src={currentImage}
            alt={product.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              bgcolor: '#ffffff',
            }}
          />
        ) : (
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <i className="fi fi-rr-box" style={{ fontSize: '36px', color: '#94a3b8' }}></i>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              No product image available
            </Typography>
          </Box>
        )}

        {hasDiscount && (
          <Chip
            label={`Less ${discountPct}%`}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 800,
              bgcolor: '#dc2626',
              color: '#ffffff',
              fontSize: '0.68rem',
              height: 22,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        )}

        {product.type && (
          <Chip
            label={product.type}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.94)',
              color: '#0f172a',
              fontSize: '0.68rem',
              height: 22,
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)',
              '& .MuiChip-label': { px: 1.1 },
            }}
          />
        )}

        {product.isBestSeller && (
          <Chip
            label={product.salesRank ? `#${product.salesRank} Best Seller` : 'Best Seller'}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              fontWeight: 800,
              bgcolor: '#f59e0b',
              color: '#ffffff',
              fontSize: '0.65rem',
              height: 21,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        )}
      </Box>

      {/* Thumbnail selector when multiple product photos are uploaded */}
      {productImages.length > 1 && (
        <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.25 }}>
          {productImages.map((imgUrl, index) => {
            const isSelectedImg = index === activeImageIndex;
            return (
              <Box
                key={`${product.id}-thumb-${index}`}
                component="button"
                type="button"
                aria-label={`View image ${index + 1} of ${product.name}`}
                onClick={() => handleSelectPreviewImage(index)}
                sx={{
                  p: 0,
                  width: 48,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  bgcolor: '#ffffff',
                  border: '2px solid',
                  borderColor: isSelectedImg ? 'primary.main' : 'divider',
                  opacity: isSelectedImg ? 1 : 0.65,
                  transition: 'opacity 0.15s ease, border-color 0.15s ease',
                  '&:hover': { opacity: 1 },
                }}
              >
                <Box
                  component="img"
                  src={imgUrl}
                  alt={`${product.name} preview ${index + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            );
          })}
        </Box>
      )}

      {/* Product title, ratings, and availability status */}
      <Box>
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            lineHeight: 1.25,
            fontSize: '1.02rem',
            letterSpacing: '-0.015em',
            mb: 0.6,
          }}
        >
          {product.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Rating
              value={Number(product.averageRating) || 0}
              precision={0.1}
              readOnly
              size="small"
              sx={{ fontSize: '0.95rem' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {product.averageRating ? Number(product.averageRating).toFixed(1) : '0.0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({product.reviewCount || 0} {product.reviewCount === 1 ? 'review' : 'reviews'})
            </Typography>
          </Box>

          <Chip
            label={isPreOrder ? 'Pre-Order • Made to Order' : `${activeStock} units available`}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.67rem',
              fontWeight: 700,
              bgcolor: isPreOrder || activeStock > 0 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
              color: isPreOrder || activeStock > 0 ? '#15803d' : '#b91c1c',
            }}
          />
        </Box>
      </Box>

      {/* Active pricing and automatic discount summary */}
      <Box
        sx={{
          p: 1.25,
          borderRadius: 2,
          bgcolor: '#f8fafc',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.85, flexWrap: 'wrap' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: '#16a34a',
              lineHeight: 1.1,
              fontSize: '1.15rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ₱{Number(displayPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            / {displayUnit}
          </Typography>
          {hasDiscount && (
            <>
              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  textDecoration: 'line-through',
                  fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                ₱{Number(displayOrigPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Chip
                label={`-${discountPct}% OFF`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(220, 38, 38, 0.1)',
                  color: '#dc2626',
                  borderRadius: 1,
                }}
              />
            </>
          )}
        </Box>
        {hasDiscount && unitSavings > 0 && (
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600, display: 'block', mt: 0.4 }}>
            Save ₱{unitSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per unit with our automatic {discountPct}% discount.
          </Typography>
        )}
      </Box>

      {/* Profile dimensions and structural specifications */}
      {hasSpecs && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.67rem',
              mb: 0.75,
            }}
          >
            Profile Dimensions
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
            {product.effectiveWidth && (
              <Tooltip title={product.effectiveWidthDesc || DEFAULT_SPEC_HELP.effectiveWidth} arrow placement="top">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.75,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>
                    Effective Width
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'text.primary', mt: 0.2 }}>
                    {formatWidthSpec(product.effectiveWidth)}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            {product.nominalWidth && (
              <Tooltip title={product.nominalWidthDesc || DEFAULT_SPEC_HELP.nominalWidth} arrow placement="top">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.75,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>
                    Nominal Width
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'text.primary', mt: 0.2 }}>
                    {formatWidthSpec(product.nominalWidth)}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            {product.ribHeight && (
              <Tooltip title={product.ribHeightDesc || DEFAULT_SPEC_HELP.ribHeight} arrow placement="top">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.75,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>
                    Rib Height
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'text.primary', mt: 0.2 }}>
                    {product.ribHeight} mm
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}

      {/* Available thickness variants and prices */}
      {productOptions.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.67rem',
              mb: 0.75,
            }}
          >
            Thickness Options
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {productOptions.map((opt) => {
              const optionKey = opt.id !== null ? opt.id : '_base';
              const isSelected =
                activeOption?.id === opt.id && activeOption?.isBaseProduct === opt.isBaseProduct;
              const optThickness = opt.thickness || opt.name;
              const thicknessHasStock = !hasCoilData || hasCoilStockForThickness(coilInventory, optThickness);

              return (
                <Box
                  key={optionKey}
                  component="button"
                  type="button"
                  onClick={() => handleSelectThicknessOption(opt)}
                  sx={{
                    textAlign: 'left',
                    px: 1.15,
                    py: 0.65,
                    borderRadius: 1.75,
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'rgba(30, 58, 138, 0.08)' : 'background.paper',
                    opacity: thicknessHasStock ? 1 : 0.55,
                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: 700,
                      color: isSelected ? 'primary.dark' : 'text.primary',
                      fontSize: '0.72rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {opt.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: 800,
                      color: '#16a34a',
                      fontSize: '0.72rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    ₱{Number(opt.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Available color finishes with live coil stock indicators */}
      {availableColorsList.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.67rem',
              }}
            >
              Color Finishes
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
              {hasCoilData
                ? `${inStockColorCount} of ${availableColorsList.length} in stock (${activeThickness})`
                : `${availableColorsList.length} colors`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {availableColorsList.map((colorName) => {
              const hex = getColorHex(colorName);
              const inStock = !hasCoilData || isCoilInStock(coilInventory, activeThickness, colorName);

              return (
                <Tooltip
                  key={colorName}
                  title={inStock ? `${colorName} (In Stock)` : `${colorName} (Out of Stock for ${activeThickness})`}
                  arrow
                  placement="top"
                >
                  <Box
                    aria-label={inStock ? `${colorName} in stock` : `${colorName} out of stock`}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: hex,
                      border: '1.5px solid rgba(15, 23, 42, 0.2)',
                      opacity: inStock ? 1 : 0.3,
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {!inStock && (
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '140%',
                          height: '2px',
                          bgcolor: '#ef4444',
                          transform: 'rotate(-45deg)',
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}

      <Divider />

      {/* Full formatted product description */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 800,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.67rem',
            mb: 0.75,
          }}
        >
          Full Product Details
        </Typography>
        <Box
          sx={{
            fontSize: '0.82rem',
            lineHeight: 1.65,
            color: 'text.secondary',
            wordBreak: 'break-word',
            '& p': { mt: 0, mb: 1 },
            '& p:last-child': { mb: 0 },
            '& ul': { pl: 2.5, mt: 0, mb: 1, listStyleType: 'disc' },
            '& ol': { pl: 2.5, mt: 0, mb: 1, listStyleType: 'decimal' },
            '& li': { mb: 0.35 },
            '& h1, & h2, & h3, & h4': {
              mt: 1.25,
              mb: 0.5,
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'text.primary',
            },
            '& strong, & b': { color: 'text.primary', fontWeight: 700 },
          }}
          dangerouslySetInnerHTML={{
            __html:
              sanitizedDescription ||
              '<p>Detailed specifications and features will appear here once updated by our team.</p>',
          }}
        />
      </Box>
    </Box>
  );
};

export default ProductPreviewContent;
