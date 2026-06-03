class EstimatedDeliveryValidator {
  /**
   * Checks if the estimated delivery date can be edited based on the order status.
   * @param {string} status - The current order status.
   * @returns {boolean} True if the date can be edited, false otherwise.
   */
  static canEditDate(status) {
    if (!status) return true;
    const s = status.toLowerCase();
    return !['out_for_delivery', 'delivered', 'cancelled', 'completed'].includes(s);
  }

  /**
   * Gets the minimum selectable date string (today in YYYY-MM-DD).
   * @returns {string} The minimum date string.
   */
  static getMinDate() {
    const today = new Date();
    // Adjust for timezone offset to get local YYYY-MM-DD correctly
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  }
}

export { EstimatedDeliveryValidator };
