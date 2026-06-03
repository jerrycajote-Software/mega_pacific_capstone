/**
 * buildProductOptions.js
 *
 * Utility that merges a product's base configuration with its variants
 * into a unified list of selectable options for the customer product view.
 *
 * The base product is represented as a "virtual" option with id: null and
 * isBaseProduct: true, which signals the checkout and order system to use
 * the base product price/stock (variantId = null).
 *
 * This follows the Extension-First approach: no existing variant or product
 * data structures are modified. We simply build a display-ready list.
 */

/**
 * Builds a unified array of selectable product options.
 *
 * @param {Object} product - The full product object from the API
 * @param {number} product.price - Base price
 * @param {number} product.stock - Base stock
 * @param {string} product.unit - Base unit (e.g. "per linear meter - 0.40mm")
 * @param {Array}  product.variants - Array of variant objects
 * @returns {Array} Merged list of options with a consistent shape:
 *   { id, name, price, stock, status, isBaseProduct, sku? }
 */
export function buildProductOptions(product) {
  if (!product) return [];

  const options = [];

  // Include the base product as the first option when it has meaningful data
  const hasBaseConfig = product.price > 0 || product.stock > 0;

  if (hasBaseConfig) {
    options.push({
      id: null,                         // null signals "base product" to the order system
      name: `${product.unit || 'Default'} (Default)`,
      price: product.price ?? 0,
      stock: product.stock ?? 0,
      status: (product.stock ?? 0) > 0 ? 'available' : 'out_of_stock',
      isBaseProduct: true,
    });
  }

  // Append all variants (already filtered by the API to status: "available")
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
