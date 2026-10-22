const prisma = require("../config/db");

/**
 *  @param {Array|Object} orders 
 @returns {Array|Object} The mutated orders with updated estimatedDeliveryDate values
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
