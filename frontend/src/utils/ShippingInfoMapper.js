class ShippingInfoMapper {
  /**
   * Maps raw order shipping data into a structured format for UI display.
   * @param {Object} order - The raw order data.
   * @returns {Object} Structured shipping information.
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
