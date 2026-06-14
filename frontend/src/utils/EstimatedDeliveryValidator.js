class EstimatedDeliveryValidator {
  /**
   * 
   * @param {string} status 
   * @returns {boolean} 
   */
  static canEditDate(status) {
    if (!status) return true;
    const s = status.toLowerCase();
    return !['out_for_delivery', 'delivered', 'cancelled', 'completed'].includes(s);
  }

  /**
   * 
   * @returns {string} 
   */
  static getMinDate() {
    const today = new Date();
  
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  }
}

export { EstimatedDeliveryValidator };
