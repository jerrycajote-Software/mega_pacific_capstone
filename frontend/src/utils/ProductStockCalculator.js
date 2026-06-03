export class ProductStockCalculator {
  /**
   * Calculates the total stock for a product, combining base stock and variant stocks.
   * @param {Object} product - The product object containing stock and variants.
   * @returns {number} The total aggregated stock.
   */
  static calculateTotalStock(product) {
    if (!product) return 0;

    const baseStock = Number(product.stock) || 0;

    let variantStock = 0;
    if (product.variants && Array.isArray(product.variants)) {
      variantStock = product.variants.reduce((total, variant) => {
        return total + (Number(variant.stock) || 0);
      }, 0);
    }

    return baseStock + variantStock;
  }
}
