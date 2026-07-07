const prisma = require("../config/db");

/**
 * Checks a list of orders and automatically extends the estimated delivery date to the next day
 * if the date has passed and the order is not yet delivered, cancelled, or completed.
 * @param {Array|Object} orders - An array of orders or a single order object
 * @returns {Array|Object} The mutated orders with updated estimatedDeliveryDate values
 */
const checkAndExtendDeliveryDates = async (orders) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isArray = Array.isArray(orders);
  const orderList = isArray ? orders : [orders];

  for (const order of orderList) {
    if (order.estimatedDeliveryDate && order.status) {
      const statusLower = order.status.toLowerCase();
      if (!['delivered', 'cancelled', 'completed'].includes(statusLower)) {
        let estDate = new Date(order.estimatedDeliveryDate);
        estDate.setHours(0, 0, 0, 0);

        if (estDate < today) {
          // Increment estimated delivery date day-by-day until it is equal to or greater than today
          let newEstDate = new Date(estDate);
          while (newEstDate < today) {
            newEstDate.setDate(newEstDate.getDate() + 1);
          }

          await prisma.order.update({
            where: { id: order.id },
            data: { estimatedDeliveryDate: newEstDate }
          });

          order.estimatedDeliveryDate = newEstDate;
        }
      }
    }
  }

  return isArray ? orderList : orderList[0];
};

module.exports = { checkAndExtendDeliveryDates };
