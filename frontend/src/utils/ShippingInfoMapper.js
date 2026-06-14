class ShippingInfoMapper {
  /**
   * 
   * @param {Object} order 
   * @returns {Object} 
   */
  static map(order) {
    if (!order) return null;

    return {
      fullName: order.customerName || "N/A",
      email: order.customerEmail || "N/A",
      contactNumber: order.contactNumber || "N/A",
      address: order.address || "N/A",
      cityProvince: order.cityProvince || "N/A",
      zipCode: order.zipCode || "N/A",
      paymentMethod: order.paymentMode || "N/A",
      notes: order.notes || "None"
    };
  }
}

export { ShippingInfoMapper };
