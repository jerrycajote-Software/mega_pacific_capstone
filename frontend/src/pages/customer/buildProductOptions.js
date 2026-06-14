

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

  
  const hasBaseConfig = product.price > 0 || product.stock > 0;

  if (hasBaseConfig) {
    options.push({
      id: null,                         
      name: `${product.unit || 'Default'} (Default)`,
      price: product.price ?? 0,
      stock: product.stock ?? 0,
      status: (product.stock ?? 0) > 0 ? 'available' : 'out_of_stock',
      isBaseProduct: true,
    });
  }

 
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((v) => {
      options.push({
        id: v.id,
        name: v.name,
        price: v.price,
        stock: v.stock,
        status: v.status,
        sku: v.sku || null,
        isBaseProduct: false,
      });
    });
  }

  return options;
}

/**
 * Returns the first available (in-stock) option from the list,
 * preferring the base product option.
 *
 * @param {Array} options - From buildProductOptions()
 * @returns {Object|null}
 */
export function getDefaultOption(options) {
  if (!options || options.length === 0) return null;
  return options.find((o) => o.status === 'available' && o.stock > 0) || null;
}
