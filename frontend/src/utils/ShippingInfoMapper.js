class ShippingInfoMapper {
  /**
   * 
   * @param {Object} order 
   * @returns {Object} 
   */
  static map(order) {
    if (!order) return null;

    return {
      fullName: order.shippingName || order.customerName || "N/A", // fallback to customerName if old data
      email: order.customerEmail || "N/A",
      contactNumber: order.shippingContactNumber || order.contactNumber || "N/A",
      address: order.shippingAddress || order.address || "N/A",
      city: order.shippingCity || order.cityProvince || "N/A",
      province: order.shippingProvince || "N/A",
      zipCode: order.shippingZipCode || order.zipCode || "N/A",
      paymentMethod: order.paymentMode || "N/A",
      notes: order.notes || "None"
    };
  }
}

export { ShippingInfoMapper };
