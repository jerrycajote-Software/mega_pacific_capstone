/**
 * @param {Object} product
 * @param {number} [product.price]
 * @param {number} [product.stock]
 * @param {string} [product.unit]
 * @param {Array}  [product.variants]
 * @returns {Array}
 */
export function buildProductOptions(product) {
  if (!product) return [];

  const options = [];

  const isPreOrder = product.isPreOrder ?? true;
  const hasVariants = product.variants && product.variants.length > 0;
  const isProfileEligible = isCustomLengthProfile(product?.type);
  const baseThickness = product.thickness || (isProfileEligible ? '0.35mm' : null);
  const baseName = product.thickness ? `${product.thickness} Thickness` : (product.unit || (isProfileEligible ? 'per meter' : 'per piece'));

  const baseCoveredByVariant = hasVariants && product.variants.some(v => 
    (baseThickness && v.thickness && v.thickness.toLowerCase().trim() === baseThickness.toLowerCase().trim()) ||
    (v.name && v.name.toLowerCase().replace(/\s+/g, '') === baseName.toLowerCase().replace(/\s+/g, ''))
  );

  if (!baseCoveredByVariant && (product.price > 0 || product.stock > 0 || isPreOrder)) {
    options.push({
      id: null,
      name: baseName,
      thickness: baseThickness,
      price: product.price ?? 0,
      originalPrice: product.originalPrice ?? (product.price ? Math.round((product.price / 0.70) * 100) / 100 : 0),
      discountPercent: product.discountPercent ?? 30,
      stock: isPreOrder ? 9999 : (product.stock ?? 0),
      status: 'available',
      color: product.color || null,
      isBaseProduct: true,
    });
  }

  if (hasVariants) {
    product.variants.forEach((v) => {
      options.push({
        id: v.id,
        name: v.name,
        thickness: v.thickness || v.name,
        price: v.price,
        originalPrice: v.originalPrice ?? (v.price ? Math.round((v.price / 0.70) * 100) / 100 : 0),
        discountPercent: v.discountPercent ?? 30,
        stock: isPreOrder ? 9999 : v.stock,
        status: isPreOrder ? 'available' : v.status,
        sku: v.sku || null,
        color: v.color || null,
        isBaseProduct: false,
      });
    });
  }

  return options;
}

/**
 * @param {Array} options
 * @returns {Object|null}
 */
export function getDefaultOption(options) {
  if (!options || options.length === 0) return null;
  return options.find((o) => o.status === 'available' || o.stock > 0) || options[0] || null;
}

export const CUSTOM_LENGTH_PROFILE_TYPES = ['Rib Type', 'Corrugated', 'Tile Profile'];

export function isCustomLengthProfile(typeOrProduct) {
  const type = typeof typeOrProduct === 'string'
    ? typeOrProduct
    : (typeOrProduct?.type || typeOrProduct?.category || '');
  if (!type || typeof type !== 'string') return false;
  const normalized = type.trim().toLowerCase();
  return (
    normalized === 'rib type' ||
    normalized === 'corrugated' ||
    normalized === 'tile profile'
  );
}
