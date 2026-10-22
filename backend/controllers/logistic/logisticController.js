const prisma = require('../../config/db');

const getDashboardData = async (req, res) => {
  try {
    const readyToShip = await prisma.order.count({
      where: { status: 'processing', fulfillmentType: 'Delivery' },
    });

    const outForDelivery = await prisma.order.count({
      where: { status: 'shipped', fulfillmentType: 'Delivery' },
    });

    const completedToday = await prisma.order.count({
      where: { 
        status: 'delivered',
        statusUpdatedAt: {
          gte: new Date(new Date().setHours(0,0,0,0))
        }
      },
    });

    const pendingPickups = await prisma.order.count({
      where: {
        status: { in: ['processing', 'finance_verified', 'ready_for_pickup'] },
        fulfillmentType: 'Pickup'
      },
    });

    const readyForPickupCount = await prisma.order.count({
      where: { status: 'ready_for_pickup', fulfillmentType: 'Pickup' },
    });

    const recentOrders = await prisma.order.findMany({
      take: 8,
      where: {
        status: { in: ['finance_verified', 'processing', 'shipped', 'out_for_delivery', 'ready_for_pickup', 'completed', 'delivered'] }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        statusUpdatedAt: true,
        status: true,
        fulfillmentType: true,
        customerName: true,
        shippingAddress: true,
        shippingName: true
      }
    });

    const recentDeliveries = recentOrders.map(o => ({
      id: `#ORD-${o.id.toString().padStart(4, '0')}`,
      rawId: o.id,
      customer: o.shippingName || o.customerName || 'Customer',
      address: o.fulfillmentType === 'Pickup' ? 'Plant Store Pick-up' : (o.shippingAddress || 'Jobsite Delivery'),
      fulfillmentType: o.fulfillmentType || 'Delivery',
      status: o.status,
      date: (o.statusUpdatedAt || o.createdAt).toISOString().split('T')[0]
    }));

    const totalDeliveries = await prisma.order.count({
      where: { fulfillmentType: 'Delivery' }
    });
    const totalPickups = await prisma.order.count({
      where: { fulfillmentType: 'Pickup' }
    });

    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = dayNames[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = { day: dayKey, date: dateStr, deliveries: 0, pickups: 0, total: 0 };
    }

    const pastWeekOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        createdAt: true,
        fulfillmentType: true,
        status: true
      }
    });

    pastWeekOrders.forEach(o => {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      if (trendMap[dateStr]) {
        if (o.fulfillmentType === 'Pickup') {
          trendMap[dateStr].pickups += 1;
        } else {
          trendMap[dateStr].deliveries += 1;
        }
        trendMap[dateStr].total += 1;
      }
    });

    const fulfillmentTrend = Object.values(trendMap);

    const fulfillmentDistribution = [
      { name: 'Standard Delivery', value: totalDeliveries || 1, count: totalDeliveries, color: '#2563EB' },
      { name: 'Store Pickup', value: totalPickups || 1, count: totalPickups, color: '#8B5CF6' }
    ];

    const alerts = [];
    if (readyToShip > 0) {
      alerts.push({
        id: 'ready-to-ship',
        type: 'warning',
        title: 'Orders Ready for Dispatch',
        message: `${readyToShip} package(s) packaged and awaiting carrier pickup.`,
        action: 'View Packages'
      });
    }
    if (outForDelivery > 0) {
      alerts.push({
        id: 'out-for-delivery',
        type: 'info',
        title: 'Active In-Transit Fleet',
        message: `${outForDelivery} order(s) currently with drivers on delivery routes.`,
        action: 'Monitor Live'
      });
    }
    if (pendingPickups > 0) {
      alerts.push({
        id: 'pending-pickups',
        type: 'primary',
        title: 'Customer Store Pickups',
        message: `${pendingPickups} order(s) staged at the pickup dock awaiting customer retrieval.`,
        action: 'Pickup Counter'
      });
    }
    if (alerts.length === 0) {
      alerts.push({
        id: 'all-clear',
        type: 'success',
        title: 'Dispatch Fleet On Schedule',
        message: 'All scheduled shipments and store counter handoffs are up to date.',
        action: 'Operations Nominal'
      });
    }

    res.json({
      success: true,
      data: {
        kpi: {
          readyToShip,
          outForDelivery,
          completedToday,
          pendingPickups,
          readyForPickup: readyForPickupCount,
          totalDeliveries,
          totalPickups,
          onTimeRate: '98.8%'
        },
        fulfillmentTrend,
        fulfillmentDistribution,
        alerts,
        recentDeliveries
      }
    });
  } catch (error) {
    console.error('Logistic Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getDashboardData
};
