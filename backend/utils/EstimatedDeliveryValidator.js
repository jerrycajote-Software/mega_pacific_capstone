class EstimatedDeliveryValidator {
  
  /**
   * @param {string} currentStatus 
   @param {string} newDateString 
   @returns {Object} 
   */

  static validateUpdate(currentStatus, newDateString) {
    if (!currentStatus) return { isValid: true };

    const nonEditableStatuses = ['out_for_delivery', 'delivered', 'cancelled', 'completed'];
    if (nonEditableStatuses.includes(currentStatus.toLowerCase())) {
      return { 
        isValid: false, 
        message: "Estimated delivery date can no longer be modified for this order status." 
      };
    }

    if (newDateString) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const deliveryDate = new Date(newDateString);
      deliveryDate.setHours(0, 0, 0, 0);

      if (deliveryDate < today) {
        return { 
          isValid: false, 
          message: "Estimated delivery date cannot be in the past." 
        };
      }
    }

    return { isValid: true };
  }
}

module.exports = EstimatedDeliveryValidator;
