

/**
 * Builds a unified array of selectable product options.
 *
 * @param {Object} product 
 * @param {number} product.price 
 * @param {number} product.stock 
 * @param {string} product.unit 
 * @param {Array}  product.variants 
 * @returns {Array} 
 */
export function buildProductOptions(product) {
  if (!product) return [];

  const options = [];

  
  const isPreOrder = product.isPreOrder ?? true;
  const hasVariants = product.variants && product.variants.length > 0;
  const baseThickness = product.thickness || '0.35mm';
  const baseName = product.thickness ? `${product.thickness} Thickness` : (product.unit || 'per meter');

  const baseCoveredByVariant = hasVariants && product.variants.some(v => 
    (v.thickness && v.thickness.toLowerCase().trim() === baseThickness.toLowerCase().trim()) ||
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
 * Returns the first available option from the list,
 * preferring the base product option.
 *
 * @param {Array} options - From buildProductOptions()
 * @returns {Object|null}
 */
export function getDefaultOption(options) {
  if (!options || options.length === 0) return null;
  return options.find((o) => o.status === 'available' || o.stock > 0) || options[0] || null;
}
