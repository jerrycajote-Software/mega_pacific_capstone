const prisma = require("../../config/db");
const { sendOrderReceiptEmail } = require("../../utils/emailService");
const { calculateDeliveryFee } = require("../../services/deliveryFeeService");
const { validateRealisticEmail } = require("../../utils/emailValidator");

const HARDCODED_SHIPPING_FEE = 100;

const resolvePaymentInfo = (paymentMode, cardDetails, gcashNumber, paymentPlan, paymentChannel) => {
  const mode = (paymentMode || '').trim();
  const plan = paymentPlan || (mode.toLowerCase().includes('50%') || mode.toLowerCase().includes('cash on delivery') ? 'COD_50' : 'FULL_PAYMENT');
  const channel = paymentChannel || (cardDetails && cardDetails.cardNumber ? 'Card' : gcashNumber ? 'GCash' : (mode.toLowerCase().includes('card') ? 'Card' : 'Card'));

  let channelDetails = '';
  if (channel === 'Card' || (cardDetails && cardDetails.cardNumber)) {
    const rawNumber = (cardDetails?.cardNumber || '').replace(/\D/g, '');
    let brand = 'Card';
    if (/^4/.test(rawNumber)) brand = 'Visa';
    else if (/^(5[1-5]|2[2-7])/.test(rawNumber)) brand = 'Mastercard';
    else if (/^3[47]/.test(rawNumber)) brand = 'American Express';
    else if (/^(?:2131|1800|35)/.test(rawNumber)) brand = 'JCB';

    const last4 = rawNumber.slice(-4) || '••••';
    channelDetails = `Bank Card (${brand} ending in ${last4})`;
  } else if (channel === 'GCash' || gcashNumber) {
    const cleanGcash = (gcashNumber || '').trim();
    channelDetails = `GCash (${cleanGcash || 'Verified'})`;
  } else {
    channelDetails = 'Bank Transfer';
  }

  if (plan === 'COD_50') {
    return {
      paymentMode: `Cash on Delivery (50% Downpayment via ${channelDetails}, 50% on Delivery)`,
      paymentStatus: '50% Downpayment Paid'
    };
  }

  return {
    paymentMode: `Bank Transfer - Full Payment (${channelDetails})`,
    paymentStatus: 'paid'
  };
};

const createOrder = async (req, res) => {
  const {
    userId,
    productId,
    variantId,      
    quantity,
    paymentMode,
    paymentPlan,
    paymentChannel,
    cardDetails,
    gcashNumber,
    fulfillmentType,
    customerEmail,
    shippingName,
    shippingContactNumber,
    shippingAddress,
    shippingCity,
    shippingProvince,
    shippingZipCode,
    notes,
    color
  } = req.body;

  if (customerEmail) {
    const emailCheck = validateRealisticEmail(customerEmail);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, error: emailCheck.error });
    }
  }

  if (shippingContactNumber && String(shippingContactNumber).trim()) {
    const cleanPhone = String(shippingContactNumber).trim();
    if (!/^09[0-9]{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "Contact number must be an 11-digit Philippine mobile number starting with 09 (ex. 09171234567)."
      });
    }
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    let unitPrice;
    let variantName = null;
    const parsedVariantId = variantId ? parseInt(variantId) : null;
    const isPreOrder = product.isPreOrder ?? true;
    const customLength = req.body.customLength ? Math.min(21.0, Math.max(0.5, parseFloat(req.body.customLength))) : null;
    const thickness = req.body.thickness || null;

    if (parsedVariantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: parsedVariantId }
      });

      if (!variant) {
        return res.status(404).json({ success: false, error: "Product variant not found" });
      }

      if (!isPreOrder && (variant.status === "out_of_stock" || variant.stock < parseInt(quantity))) {
        return res.status(400).json({ success: false, error: "Insufficient stock for selected variant" });
      }

      unitPrice = variant.price;
      variantName = variant.name; 
    } else {
      if (!isPreOrder && product.stock < parseInt(quantity)) {
        return res.status(400).json({ success: false, error: "Insufficient stock" });
      }
      unitPrice = product.price;
    }

    
    if (color) {
      const effThickness = thickness || (parsedVariantId ? variantName : null) || product.thickness || "0.35mm";
      const thickMatch = String(effThickness).match(/0\.\d+/);
      const cleanThick = thickMatch ? `${thickMatch[0]}mm` : String(effThickness).trim();

      const coil = await prisma.coilInventory.findFirst({
        where: {
          thickness: { contains: cleanThick, mode: "insensitive" },
          color: { equals: color.trim(), mode: "insensitive" }
        }
      });

      if (!coil || coil.coilCount <= 0) {
        return res.status(409).json({
          success: false,
          error: `The material ${cleanThick} with color finish "${color}" is not available in Coil Inventory.`,
          details: { type: 'STOCK_ERROR', itemName: `${product.name} (${cleanThick} • ${color})`, available: 0, requested: quantity }
        });
      }
    }

    const isPerMeter = product.unit === "per meter" || product.unit === "meter" || isPreOrder;
    const lengthMultiplier = (customLength && isPerMeter) ? customLength : 1;
    const itemsTotal = Math.round(unitPrice * lengthMultiplier * parseInt(quantity) * 100) / 100;
    let shippingFee = 0;
    if (fulfillmentType !== 'Pickup') {
      if (req.body.shippingFee !== undefined && !isNaN(parseFloat(req.body.shippingFee))) {
        shippingFee = parseFloat(req.body.shippingFee);
      } else if (shippingProvince && shippingCity) {
        const feeCalc = await calculateDeliveryFee({
          province: shippingProvince,
          city: shippingCity,
          items: [{ productId, variantId, quantity }]
        });
        shippingFee = feeCalc.totalDeliveryCharge;
      } else {
        shippingFee = HARDCODED_SHIPPING_FEE;
      }
    }
    const total = itemsTotal + shippingFee;

    const { paymentMode: finalPaymentMode, paymentStatus: finalPaymentStatus } = resolvePaymentInfo(
      paymentMode,
      cardDetails,
      gcashNumber,
      paymentPlan,
      paymentChannel
    );

    
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: parseInt(userId),
          total,
          status: "pending",
          paymentStatus: finalPaymentStatus,
          paymentMode: finalPaymentMode,
          fulfillmentType: fulfillmentType || "Delivery",
          customerName: shippingName || req.body.customerName || null,
          customerEmail,
          shippingName,
          shippingContactNumber,
          shippingAddress,
          shippingCity,
          shippingProvince,
          shippingZipCode,
          notes,
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          items: {
            create: {
              productId: parseInt(productId),
              variantId: parsedVariantId,
              variantName,       
              quantity: parseInt(quantity),
              price: unitPrice,
              color: color || null,
              customLength: customLength,
              thickness: thickness
            }
          }
        }
      });

      
      if (!isPreOrder) {
        if (parsedVariantId) {
          const updated = await tx.productVariant.updateMany({
            where: { id: parsedVariantId, stock: { gte: parseInt(quantity) } },
            data: { stock: { decrement: parseInt(quantity) } }
          });
          if (updated.count === 0) {
            const current = await tx.productVariant.findUnique({ where: { id: parsedVariantId } });
            throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: quantity };
          }
        } else {
          const updated = await tx.product.updateMany({
            where: { id: parseInt(productId), stock: { gte: parseInt(quantity) } },
            data: { stock: { decrement: parseInt(quantity) } }
          });
          if (updated.count === 0) {
            const current = await tx.product.findUnique({ where: { id: parseInt(productId) } });
            throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: quantity };
          }
        }
      }

      return order;
    });

    
    let fullOrder = null;
    try {
      fullOrder = await prisma.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, type: true } },
              variant: { select: { id: true, name: true, price: true } }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              customerProfile: { select: { name: true } }
            }
          }
        }
      });

      const targetEmail = customerEmail || fullOrder?.user?.email;
      if (targetEmail && fullOrder) {
        sendOrderReceiptEmail(targetEmail, fullOrder).catch((err) => {
          console.error("[RECEIPT EMAIL DISPATCH ERROR]:", err.message);
        });
      }
    } catch (postErr) {
      console.warn("[POST-ORDER RECEIPT NON-FATAL WARNING]:", postErr.message);
    }

    res.status(201).json({ success: true, data: fullOrder || newOrder });
  } catch (error) {
    console.error("Failed to create order:", error);
    if (error.type === 'STOCK_ERROR') {
      return res.status(409).json({ success: false, error: 'Out of Stock', details: error });
    }
    res.status(500).json({ success: false, error: error.message || "Failed to create order" });
  }
};


const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, type: true, imageUrl: true, imageUrls: true }
            },
            variant: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    
    if (req.user && req.user.role !== 'admin') {
      const requestingUserId = req.user.userId ?? req.user.id;
      if (order.userId !== parseInt(requestingUserId)) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }
    }

    
  
    const customerReviews = await prisma.review.findMany({
      where: {
        userId: order.userId,
        productId: { in: order.items.map(i => i.productId) }
      },
      include: {
        reply: {
          include: {
            user: {
              select: {
                id: true,
                role: true,
                salesProfile: { select: { name: true } },
                adminProfile: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    
    const itemsWithReviewStatus = order.items.map(item => {
      let matchingReview = customerReviews.find(r => r.productId === item.productId && r.orderId === order.id);

      
      if (!matchingReview) {
        matchingReview = customerReviews.find(r => 
          r.productId === item.productId && 
          (r.orderId === null || r.orderId === undefined) &&
          new Date(order.createdAt) <= new Date(r.createdAt)
        );
      }

      const formattedReview = matchingReview ? {
        id: matchingReview.id,
        rating: matchingReview.rating,
        title: matchingReview.title,
        comment: matchingReview.comment,
        imageUrls: matchingReview.imageUrls || [],
        createdAt: matchingReview.createdAt,
        orderId: matchingReview.orderId,
        reply: matchingReview.reply ? {
          id: matchingReview.reply.id,
          comment: matchingReview.reply.comment,
          createdAt: matchingReview.reply.createdAt,
          user: {
            role: matchingReview.reply.user?.role || "Staff",
            name: matchingReview.reply.user?.salesProfile?.name || matchingReview.reply.user?.adminProfile?.name || "Mega Pacific Team"
          }
        } : null
      } : null;

      return {
        ...item,
        isReviewed: Boolean(matchingReview),
        review: formattedReview
      };
    });

    const orderWithReviews = {
      ...order,
      items: itemsWithReviewStatus
    };

    const { checkAndExtendDeliveryDates } = require("../../utils/deliveryHelper");
    const updatedOrder = await checkAndExtendDeliveryDates(orderWithReviews);

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    res.status(500).json({ success: false, error: "Failed to fetch order details" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: user ID not found in token" });
    }

    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, type: true, imageUrl: true, imageUrls: true }
            },
            variant: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const customerReviews = await prisma.review.findMany({
      where: { userId: parseInt(userId) },
      select: { productId: true, orderId: true, createdAt: true }
    });

    const ordersWithReviews = orders.map(ord => ({
      ...ord,
      items: (ord.items || []).map(itm => {
        const isReviewed = customerReviews.some(r => 
          r.productId === itm.productId && (
            r.orderId === ord.id ||
            ((r.orderId === null || r.orderId === undefined) && new Date(ord.createdAt) <= new Date(r.createdAt))
          )
        );
        return {
          ...itm,
          isReviewed
        };
      })
    }));

    const { checkAndExtendDeliveryDates } = require("../../utils/deliveryHelper");
    const updatedOrders = await checkAndExtendDeliveryDates(ordersWithReviews);

    res.status(200).json({ success: true, data: updatedOrders });
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

const createBulkOrder = async (req, res) => {
  const {
    userId,
    items, 
    paymentMode,
    paymentPlan,
    paymentChannel,
    cardDetails,
    gcashNumber,
    fulfillmentType,
    customerEmail,
    shippingName,
    shippingContactNumber,
    shippingAddress,
    shippingCity,
    shippingProvince,
    shippingZipCode,
    notes
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "Order items are required" });
  }

  if (customerEmail) {
    const emailCheck = validateRealisticEmail(customerEmail);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, error: emailCheck.error });
    }
  }

  if (shippingContactNumber && String(shippingContactNumber).trim()) {
    const cleanPhone = String(shippingContactNumber).trim();
    if (!/^09[0-9]{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "Contact number must be an 11-digit Philippine mobile number starting with 09 (ex. 09171234567)."
      });
    }
  }

  const { paymentMode: finalPaymentMode, paymentStatus: finalPaymentStatus } = resolvePaymentInfo(
    paymentMode,
    cardDetails,
    gcashNumber,
    paymentPlan,
    paymentChannel
  );

  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const { productId, variantId, quantity } = item;
        const parsedVariantId = variantId ? parseInt(variantId) : null;
        
        const product = await tx.product.findUnique({ where: { id: parseInt(productId) } });
        if (!product) {
          throw new Error(`Product ID ${productId} not found`);
        }

        const isPreOrder = product.isPreOrder ?? true;
        const customLength = item.customLength ? Math.min(21.0, Math.max(0.5, parseFloat(item.customLength))) : null;
        const thickness = item.thickness || null;

        let unitPrice;
        let variantName = null;

        if (parsedVariantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: parsedVariantId } });
          if (!variant) throw new Error(`Variant ID ${parsedVariantId} not found`);
          if (!isPreOrder && (variant.status === "out_of_stock" || variant.stock < parseInt(quantity))) {
            throw { type: 'STOCK_ERROR', itemName: variant.name, available: variant.stock, requested: quantity };
          }

          unitPrice = variant.price;
          variantName = variant.name;

          if (!isPreOrder) {
            const updated = await tx.productVariant.updateMany({
              where: { id: parsedVariantId, stock: { gte: parseInt(quantity) } },
              data: { stock: { decrement: parseInt(quantity) } }
            });
            if (updated.count === 0) {
              const current = await tx.productVariant.findUnique({ where: { id: parsedVariantId } });
              throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: quantity };
            }
          }
        } else {
          if (!isPreOrder && product.stock < parseInt(quantity)) {
            throw { type: 'STOCK_ERROR', itemName: product.name, available: product.stock, requested: quantity };
          }
          unitPrice = product.price;

          if (!isPreOrder) {
            const updated = await tx.product.updateMany({
              where: { id: parseInt(productId), stock: { gte: parseInt(quantity) } },
              data: { stock: { decrement: parseInt(quantity) } }
            });
            if (updated.count === 0) {
              const current = await tx.product.findUnique({ where: { id: parseInt(productId) } });
              throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: quantity };
            }
          }
        }

        const isPerMeterItem = product.unit === "per meter" || product.unit === "meter" || isPreOrder;
        const lengthMultiplier = (customLength && isPerMeterItem) ? customLength : 1;
        totalAmount += Math.round(unitPrice * lengthMultiplier * parseInt(quantity) * 100) / 100;

        
        if (item.color) {
          const effThickness = thickness || variantName || product.thickness || "0.35mm";
          const thickMatch = String(effThickness).match(/0\.\d+/);
          const cleanThick = thickMatch ? `${thickMatch[0]}mm` : String(effThickness).trim();

          const coil = await tx.coilInventory.findFirst({
            where: {
              thickness: { contains: cleanThick, mode: "insensitive" },
              color: { equals: item.color.trim(), mode: "insensitive" }
            }
          });

          if (!coil || coil.coilCount <= 0) {
            throw {
              type: 'STOCK_ERROR',
              itemName: `${product.name} (${cleanThick} • ${item.color})`,
              available: 0,
              requested: quantity
            };
          }
        }

        orderItemsData.push({
          productId: parseInt(productId),
          variantId: parsedVariantId,
          variantName,
          quantity: parseInt(quantity),
          price: unitPrice,
          color: item.color || null,
          customLength,
          thickness
        });
      }

      let shippingFee = 0;
      if (fulfillmentType !== 'Pickup') {
        if (req.body.shippingFee !== undefined && !isNaN(parseFloat(req.body.shippingFee))) {
          shippingFee = parseFloat(req.body.shippingFee);
        } else if (shippingProvince && shippingCity) {
          const feeCalc = await calculateDeliveryFee({
            province: shippingProvince,
            city: shippingCity,
            items
          });
          shippingFee = feeCalc.totalDeliveryCharge;
        } else {
          shippingFee = HARDCODED_SHIPPING_FEE;
        }
      }
      const finalTotal = totalAmount + shippingFee;

      const order = await tx.order.create({
        data: {
          userId: parseInt(userId),
          total: finalTotal,
          status: "pending",
          paymentStatus: finalPaymentStatus,
          paymentMode: finalPaymentMode,
          fulfillmentType: fulfillmentType || "Delivery",
          customerName: shippingName || req.body.customerName || null,
          customerEmail,
          shippingName,
          shippingContactNumber,
          shippingAddress,
          shippingCity,
          shippingProvince,
          shippingZipCode,
          notes,
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          items: {
            create: orderItemsData
          }
        }
      });

      return order;
    });

    
    let fullOrder = null;
    try {
      fullOrder = await prisma.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, type: true } },
              variant: { select: { id: true, name: true, price: true } }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              customerProfile: { select: { name: true } }
            }
          }
        }
      });

      const targetEmail = customerEmail || fullOrder?.user?.email;
      if (targetEmail && fullOrder) {
        sendOrderReceiptEmail(targetEmail, fullOrder).catch((err) => {
          console.error("[RECEIPT EMAIL DISPATCH ERROR]:", err.message);
        });
      }
    } catch (postErr) {
      console.warn("[POST-BULK-ORDER RECEIPT NON-FATAL WARNING]:", postErr.message);
    }

    res.status(201).json({ success: true, data: fullOrder || newOrder });
  } catch (error) {
    console.error("Failed to create bulk order:", error);
    if (error.type === 'STOCK_ERROR') {
      return res.status(409).json({ success: false, error: 'Out of Stock', details: error });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to create bulk order" });
  }
};

const calculateShippingFee = async (req, res) => {
  try {
    const { province, city, items, customDieselPrice } = req.body;
    if (!province || !city) {
      return res.status(400).json({ success: false, error: "Province and City are required to compute shipping fee" });
    }
    const calculation = await calculateDeliveryFee({ province, city, items, customDieselPrice });
    res.status(200).json({ success: true, data: calculation });
  } catch (error) {
    console.error("Shipping fee calculation error:", error);
    res.status(500).json({ success: false, error: "Failed to calculate delivery fee" });
  }
};

module.exports = {
  createOrder,
  createBulkOrder,
  getOrderById,
  getMyOrders,
  calculateShippingFee
};
