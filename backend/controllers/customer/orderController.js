const prisma = require("../../config/db");
const { calculateDeliveryFee } = require("../../services/deliveryFeeService");
const { validateRealisticEmail } = require("../../utils/emailValidator");
const { buildOrderPaymentSummary, roundCurrency } = require("../../services/paymentCalculationService");
const { notifyOrderPlaced } = require("../../services/notificationManagerService");
const {
  deductCoilsForOrderInTx,
  emitCoilInventoryUpdates
} = require("../../services/coilInventoryService");
const {
  findGatewayPaymentClaim,
  findExistingOrderByIdempotency,
  recordOrderIdempotencyInTx
} = require("../../services/orderIdempotencyService");
const {
  buildOrderGatewayIds,
  assertCapturedAmountMatchesOrder,
  verifyOrderGatewayPayment
} = require("../../services/paypalVerificationService");

const HARDCODED_SHIPPING_FEE = 100;

const CUSTOM_LENGTH_PROFILE_TYPES = ['rib type', 'corrugated', 'tile profile'];

const isCustomLengthProfile = (type) => {
  if (!type || typeof type !== 'string') return false;
  return CUSTOM_LENGTH_PROFILE_TYPES.includes(type.trim().toLowerCase());
};

// Detect whether the live database subtotal differs from what the customer saw on checkout
const hasCheckoutPriceMismatch = ({ expectedItemsTotal, liveItemsTotal, hasVerifiedPaymongoPayment }) => {
  if (hasVerifiedPaymongoPayment) return false;
  if (expectedItemsTotal === undefined || expectedItemsTotal === null || expectedItemsTotal === "") return false;
  const parsedExpected = Number(expectedItemsTotal);
  if (Number.isNaN(parsedExpected) || !Number.isFinite(parsedExpected)) return false;
  return Math.abs(parsedExpected - liveItemsTotal) > 0.01;
};

// Compute the authoritative delivery fee on the server so client-sent shipping totals cannot be tampered
const resolveServerShippingFee = async ({
  fulfillmentType,
  shippingProvince,
  shippingCity,
  itemsForShipping = [],
  fallbackShippingFee
}) => {
  if (String(fulfillmentType || "").trim().toLowerCase() === "pickup") {
    return 0;
  }

  if (shippingProvince && shippingCity) {
    const feeCalc = await calculateDeliveryFee({
      province: shippingProvince,
      city: shippingCity,
      items: itemsForShipping
    });
    return roundCurrency(feeCalc.totalDeliveryCharge);
  }

  const parsedFallback = parseFloat(fallbackShippingFee);
  if (fallbackShippingFee !== undefined && !Number.isNaN(parsedFallback) && parsedFallback >= 0) {
    return roundCurrency(parsedFallback);
  }

  return HARDCODED_SHIPPING_FEE;
};

// Pre-compute bulk item prices and delivery dimensions outside the DB transaction before calling PayPal
const computeBulkOrderPrecheck = async (items) => {
  let precheckItemsTotal = 0;
  const shippingItems = [];

  for (const item of items) {
    const parsedProductId = parseInt(item.productId, 10);
    const parsedVariantId = item.variantId ? parseInt(item.variantId, 10) : null;
    const parsedQuantity = parseInt(item.quantity, 10);

    if (Number.isNaN(parsedProductId) || Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
      throw new Error("Every order item must include a valid product and quantity of at least 1.");
    }

    const product = await prisma.product.findUnique({ where: { id: parsedProductId } });
    if (!product) {
      throw new Error(`Product ID ${item.productId} not found`);
    }

    let unitPrice = product.price;
    let variantName = null;
    if (parsedVariantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: parsedVariantId } });
      if (!variant) {
        throw new Error(`Variant ID ${parsedVariantId} not found`);
      }
      unitPrice = variant.price;
      variantName = variant.name;
    }

    const isCustomEligible = isCustomLengthProfile(product.type);
    const isPreOrder = product.isPreOrder ?? true;
    const customLength = (isCustomEligible && item.customLength)
      ? Math.min(21.0, Math.max(0.5, parseFloat(item.customLength)))
      : null;
    const isPerMeterItem = isCustomEligible && (product.unit === "per meter" || product.unit === "meter" || isPreOrder);
    const lengthMultiplier = (customLength && isPerMeterItem) ? customLength : 1;

    precheckItemsTotal += Math.round(unitPrice * lengthMultiplier * parsedQuantity * 100) / 100;
    shippingItems.push({
      productId: parsedProductId,
      variantId: parsedVariantId,
      variantName,
      name: product.name,
      quantity: parsedQuantity
    });
  }

  return {
    precheckItemsTotal: roundCurrency(precheckItemsTotal),
    shippingItems
  };
};

const resolvePaymentInfo = (
  paymentMode,
  cardDetails,
  gcashNumber,
  paymentPlan,
  paymentChannel,
  paymongoReference,
  fulfillmentType = 'Delivery',
  paypalCaptureId = null,
  paypalOrderId = null
) => {
  const mode = (paymentMode || '').trim();
  const plan = paymentPlan || (mode.toLowerCase().includes('50%') || mode.toLowerCase().includes('cash on delivery') ? 'COD_50' : 'FULL_PAYMENT');
  const channel = paymentChannel || (
    (paypalCaptureId || paypalOrderId) ? 'PayPal' :
    (cardDetails && cardDetails.cardNumber) ? 'Card' :
    gcashNumber ? 'GCash' :
    (mode.toLowerCase().includes('paypal') ? 'PayPal' : 'Card')
  );
  const isPickup = String(fulfillmentType || '').trim().toLowerCase() === 'pickup';

  let channelDetails = '';
  if (channel === 'PayPal' || paypalCaptureId || paypalOrderId) {
    const cleanCapture = (paypalCaptureId || '').trim();
    const cleanOrder = (paypalOrderId || '').trim();
    if (cleanCapture) {
      channelDetails = `PayPal (Capture ID: ${cleanCapture})`;
    } else if (cleanOrder) {
      channelDetails = `PayPal (Order ID: ${cleanOrder})`;
    } else {
      channelDetails = 'PayPal (Verified)';
    }
  } else if (channel === 'Card' || (cardDetails && cardDetails.cardNumber)) {
    const rawNumber = (cardDetails?.cardNumber || '').replace(/\D/g, '');
    let brand = 'Card';
    if (/^4/.test(rawNumber)) brand = 'Visa';
    else if (/^(5[1-5]|2[2-7])/.test(rawNumber)) brand = 'Mastercard';
    else if (/^3[47]/.test(rawNumber)) brand = 'American Express';
    else if (/^(?:2131|1800|35)/.test(rawNumber)) brand = 'JCB';

    const last4 = rawNumber.slice(-4) || '••••';
    channelDetails = `Bank Card (${brand} ending in ${last4})`;
  } else if (channel === 'GCash' || gcashNumber || paymongoReference) {
    const cleanGcash = (gcashNumber || '').trim();
    const cleanRef = (paymongoReference || '').trim();
    if (cleanRef && cleanGcash) {
      channelDetails = `GCash QR via PayMongo (${cleanGcash} • Ref: ${cleanRef})`;
    } else if (cleanRef) {
      channelDetails = `GCash QR via PayMongo (Ref: ${cleanRef})`;
    } else {
      channelDetails = `GCash (${cleanGcash || 'Verified'})`;
    }
  } else {
    channelDetails = 'Bank Transfer';
  }

  if (plan === 'COD_50') {
    return {
      paymentMode: isPickup
        ? `Cash on Pick-up (50% Downpayment via ${channelDetails}, 50% on Pick-up)`
        : `Cash on Delivery (50% Downpayment via ${channelDetails}, 50% on Delivery)`,
      paymentStatus: '50% Downpayment Paid'
    };
  }

  if (channel === 'PayPal' || paypalCaptureId || paypalOrderId) {
    return {
      paymentMode: `PayPal - Full Payment (${channelDetails})`,
      paymentStatus: 'paid'
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
    paymongoReference,
    paymentIntentId,
    paypalOrderId,
    paypalCaptureId,
    clientRequestId,
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
    const cleanPhone = String(shippingContactNumber).trim().replace(/[-\s]/g, '');
    if (!/^09[0-9]{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "Contact number must be an 11-digit Philippine mobile number starting with 09 (ex. 09171234567)."
      });
    }
  }

  const resolvedUserId = req.user?.userId || req.user?.id || (userId ? parseInt(userId) : null);
  if (!resolvedUserId || isNaN(resolvedUserId)) {
    return res.status(401).json({ success: false, error: "User authentication required. Please log in again." });
  }

  const parsedQuantity = parseInt(quantity, 10);
  if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
    return res.status(400).json({ success: false, error: "Order quantity must be at least 1." });
  }

  let activeGatewayIds = buildOrderGatewayIds({
    paymentIntentId,
    paymongoReference,
    paypalOrderId,
    paypalCaptureId
  });

  try {
    // Return already-created order if this is a retry after a network disconnect
    const existingDuplicateOrder = await findExistingOrderByIdempotency({
      userId: resolvedUserId,
      clientRequestId,
      paymentIntentIds: activeGatewayIds
    });
    if (existingDuplicateOrder) {
      return res.status(200).json({
        success: true,
        duplicatePrevented: true,
        data: {
          ...existingDuplicateOrder,
          paymentSummary: buildOrderPaymentSummary(existingDuplicateOrder)
        }
      });
    }

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
    const isCustomEligible = isCustomLengthProfile(product.type);
    const customLength = (isCustomEligible && req.body.customLength)
      ? Math.min(21.0, Math.max(0.5, parseFloat(req.body.customLength)))
      : null;
    const thickness = req.body.thickness || null;

    if (parsedVariantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: parsedVariantId }
      });

      if (!variant) {
        return res.status(404).json({ success: false, error: "Product variant not found" });
      }

      if (!isPreOrder && (variant.status === "out_of_stock" || variant.stock < parsedQuantity)) {
        return res.status(400).json({ success: false, error: "Insufficient stock for selected variant" });
      }

      unitPrice = variant.price;
      variantName = variant.name; 
    } else {
      if (!isPreOrder && product.stock < parsedQuantity) {
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
          details: { type: 'STOCK_ERROR', itemName: `${product.name} (${cleanThick} • ${color})`, available: 0, requested: parsedQuantity }
        });
      }
    }

    const isPerMeter = isCustomEligible && (product.unit === "per meter" || product.unit === "meter" || isPreOrder);
    const lengthMultiplier = (customLength && isPerMeter) ? customLength : 1;
    const itemsTotal = Math.round(unitPrice * lengthMultiplier * parsedQuantity * 100) / 100;

    // Guard against stale checkout screens when Sales updates a discount right before submission
    const hasVerifiedPaymongoPayment = Boolean(paymentIntentId || paymongoReference || paypalCaptureId || paypalOrderId);
    if (hasCheckoutPriceMismatch({
      expectedItemsTotal: req.body.expectedItemsTotal,
      liveItemsTotal: itemsTotal,
      hasVerifiedPaymongoPayment
    })) {
      return res.status(409).json({
        success: false,
        code: "PRICE_CHANGED",
        error: "Product prices or discounts were just updated. Please review your updated order total before confirming.",
        details: {
          type: "PRICE_CHANGED",
          previousItemsTotal: Math.round(Number(req.body.expectedItemsTotal) * 100) / 100,
          updatedItemsTotal: itemsTotal
        }
      });
    }

    const shippingFee = await resolveServerShippingFee({
      fulfillmentType,
      shippingProvince,
      shippingCity,
      itemsForShipping: [
        {
          productId: parseInt(productId, 10),
          variantId: parsedVariantId,
          variantName,
          name: product.name,
          quantity: parsedQuantity
        }
      ],
      fallbackShippingFee: req.body.shippingFee
    });
    const total = roundCurrency(itemsTotal + shippingFee);

    // Verify payment capture status, PHP currency, and captured amount directly with the gateway
    const verifiedPayment = await verifyOrderGatewayPayment({
      userId: resolvedUserId,
      orderTotalPhp: total,
      paymentPlan,
      paymentMode,
      paypalOrderId,
      paypalCaptureId,
      paymentIntentId,
      paymongoReference
    });
    activeGatewayIds = verifiedPayment.gatewayIntentIds;

    // Re-check idempotency using authoritative gateway IDs in case client retried with a fresh request ID
    const existingByVerifiedGateway = await findExistingOrderByIdempotency({
      userId: resolvedUserId,
      clientRequestId,
      paymentIntentIds: activeGatewayIds
    });
    if (existingByVerifiedGateway) {
      return res.status(200).json({
        success: true,
        duplicatePrevented: true,
        data: {
          ...existingByVerifiedGateway,
          paymentSummary: buildOrderPaymentSummary(existingByVerifiedGateway)
        }
      });
    }

    const { paymentMode: finalPaymentMode, paymentStatus: finalPaymentStatus } = resolvePaymentInfo(
      paymentMode,
      cardDetails,
      gcashNumber,
      paymentPlan,
      verifiedPayment.provider === "PayPal" ? "PayPal" : paymentChannel,
      verifiedPayment.verifiedPaymongoReference || paymongoReference,
      fulfillmentType,
      verifiedPayment.verifiedPaypalCaptureId,
      verifiedPayment.verifiedPaypalOrderId
    );

    
    const { order: newOrder, coilUpdates } = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: resolvedUserId,
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

      // Automatically deduct ordered linear meters from matching coil inventory
      const deductedCoils = await deductCoilsForOrderInTx(tx, {
        orderId: order.id,
        userId: resolvedUserId,
        items: [
          {
            productName: product.name,
            productThickness: product.thickness,
            productUnit: product.unit,
            variantName,
            thickness: thickness || (parsedVariantId ? variantName : null) || product.thickness,
            color: color || null,
            customLength,
            quantity: parseInt(quantity),
            isPerMeter
          }
        ]
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

      // Save idempotency keys atomically so network retries never create duplicate orders
      await recordOrderIdempotencyInTx(tx, {
        orderId: order.id,
        userId: resolvedUserId,
        clientRequestId,
        paymentIntentIds: activeGatewayIds
      });

      return { order, coilUpdates: deductedCoils };
    });

    const ioForOrder = req.app.get("io");
    if (ioForOrder && coilUpdates.length > 0) {
      emitCoilInventoryUpdates(ioForOrder, coilUpdates);
    }

    
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
      const io = req.app.get("io");
      if (fullOrder) {
        notifyOrderPlaced({ io, order: fullOrder, customerEmail: targetEmail }).catch((err) => {
          console.error("[ORDER PLACED NOTIFICATION ERROR]:", err.message);
        });
      }
    } catch (postErr) {
      console.warn("[POST-ORDER RECEIPT NON-FATAL WARNING]:", postErr.message);
    }

    const responseOrder = fullOrder || newOrder;
    res.status(201).json({
      success: true,
      data: {
        ...responseOrder,
        paymentSummary: buildOrderPaymentSummary(responseOrder)
      }
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    if (error.type === "PAYMENT_VERIFICATION_ERROR") {
      return res.status(error.statusCode || 400).json({
        success: false,
        code: error.code,
        error: error.message,
        message: error.message,
        ...(error.details ? { details: error.details } : {})
      });
    }
    if (error.code === "P2002") {
      const existingOrder = await findExistingOrderByIdempotency({
        userId: resolvedUserId,
        clientRequestId,
        paymentIntentIds: activeGatewayIds
      });
      if (existingOrder) {
        return res.status(200).json({
          success: true,
          duplicatePrevented: true,
          data: {
            ...existingOrder,
            paymentSummary: buildOrderPaymentSummary(existingOrder)
          }
        });
      }
      const claimedByAnother = await findGatewayPaymentClaim({ paymentIntentIds: activeGatewayIds });
      if (claimedByAnother) {
        return res.status(409).json({
          success: false,
          code: "PAYMENT_ALREADY_USED",
          error: "This payment has already been used for another order.",
          message: "This payment has already been used for another order."
        });
      }
    }
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

    res.status(200).json({
      success: true,
      data: {
        ...updatedOrder,
        paymentSummary: buildOrderPaymentSummary(updatedOrder)
      }
    });
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
    const enrichedOrders = updatedOrders.map((ord) => ({
      ...ord,
      paymentSummary: buildOrderPaymentSummary(ord)
    }));

    res.status(200).json({ success: true, data: enrichedOrders });
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
    paymongoReference,
    paymentIntentId,
    paypalOrderId,
    paypalCaptureId,
    clientRequestId,
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
    const cleanPhone = String(shippingContactNumber).trim().replace(/[-\s]/g, '');
    if (!/^09[0-9]{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "Contact number must be an 11-digit Philippine mobile number starting with 09 (ex. 09171234567)."
      });
    }
  }

  const resolvedUserId = req.user?.userId || req.user?.id || (userId ? parseInt(userId) : null);
  if (!resolvedUserId || isNaN(resolvedUserId)) {
    return res.status(401).json({ success: false, error: "User authentication required. Please log in again." });
  }

  let activeGatewayIds = buildOrderGatewayIds({
    paymentIntentId,
    paymongoReference,
    paypalOrderId,
    paypalCaptureId
  });

  try {
    // Return already-created bulk order if this is a retry after a network disconnect
    const existingDuplicateBulkOrder = await findExistingOrderByIdempotency({
      userId: resolvedUserId,
      clientRequestId,
      paymentIntentIds: activeGatewayIds
    });
    if (existingDuplicateBulkOrder) {
      return res.status(200).json({
        success: true,
        duplicatePrevented: true,
        data: {
          ...existingDuplicateBulkOrder,
          paymentSummary: buildOrderPaymentSummary(existingDuplicateBulkOrder)
        }
      });
    }

    // Pre-calculate item subtotal and authoritative delivery fee outside the DB transaction
    const { precheckItemsTotal, shippingItems } = await computeBulkOrderPrecheck(items);
    const shippingFee = await resolveServerShippingFee({
      fulfillmentType,
      shippingProvince,
      shippingCity,
      itemsForShipping: shippingItems,
      fallbackShippingFee: req.body.shippingFee
    });
    const precheckTotal = roundCurrency(precheckItemsTotal + shippingFee);

    // Verify payment capture status, PHP currency, and captured amount directly with the gateway
    const verifiedPayment = await verifyOrderGatewayPayment({
      userId: resolvedUserId,
      orderTotalPhp: precheckTotal,
      paymentPlan,
      paymentMode,
      paypalOrderId,
      paypalCaptureId,
      paymentIntentId,
      paymongoReference
    });
    activeGatewayIds = verifiedPayment.gatewayIntentIds;

    // Re-check idempotency using authoritative gateway IDs in case client retried with a fresh request ID
    const existingBulkByVerifiedGateway = await findExistingOrderByIdempotency({
      userId: resolvedUserId,
      clientRequestId,
      paymentIntentIds: activeGatewayIds
    });
    if (existingBulkByVerifiedGateway) {
      return res.status(200).json({
        success: true,
        duplicatePrevented: true,
        data: {
          ...existingBulkByVerifiedGateway,
          paymentSummary: buildOrderPaymentSummary(existingBulkByVerifiedGateway)
        }
      });
    }

    const { paymentMode: finalPaymentMode, paymentStatus: finalPaymentStatus } = resolvePaymentInfo(
      paymentMode,
      cardDetails,
      gcashNumber,
      paymentPlan,
      verifiedPayment.provider === "PayPal" ? "PayPal" : paymentChannel,
      verifiedPayment.verifiedPaymongoReference || paymongoReference,
      fulfillmentType,
      verifiedPayment.verifiedPaypalCaptureId,
      verifiedPayment.verifiedPaypalOrderId
    );

    const { order: newOrder, coilUpdates } = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];
      const coilDeductionItems = [];

      for (const item of items) {
        const { productId, variantId, quantity } = item;
        const parsedVariantId = variantId ? parseInt(variantId) : null;
        const parsedItemQty = parseInt(quantity, 10);
        if (Number.isNaN(parsedItemQty) || parsedItemQty < 1) {
          throw new Error("Every order item must have a quantity of at least 1.");
        }
        
        const product = await tx.product.findUnique({ where: { id: parseInt(productId) } });
        if (!product) {
          throw new Error(`Product ID ${productId} not found`);
        }

        const isCustomEligible = isCustomLengthProfile(product.type);
        const isPreOrder = product.isPreOrder ?? true;
        const customLength = (isCustomEligible && item.customLength)
          ? Math.min(21.0, Math.max(0.5, parseFloat(item.customLength)))
          : null;
        const thickness = item.thickness || null;

        let unitPrice;
        let variantName = null;

        if (parsedVariantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: parsedVariantId } });
          if (!variant) throw new Error(`Variant ID ${parsedVariantId} not found`);
          if (!isPreOrder && (variant.status === "out_of_stock" || variant.stock < parsedItemQty)) {
            throw { type: 'STOCK_ERROR', itemName: variant.name, available: variant.stock, requested: parsedItemQty };
          }

          unitPrice = variant.price;
          variantName = variant.name;

          if (!isPreOrder) {
            const updated = await tx.productVariant.updateMany({
              where: { id: parsedVariantId, stock: { gte: parsedItemQty } },
              data: { stock: { decrement: parsedItemQty } }
            });
            if (updated.count === 0) {
              const current = await tx.productVariant.findUnique({ where: { id: parsedVariantId } });
              throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: parsedItemQty };
            }
          }
        } else {
          if (!isPreOrder && product.stock < parsedItemQty) {
            throw { type: 'STOCK_ERROR', itemName: product.name, available: product.stock, requested: parsedItemQty };
          }
          unitPrice = product.price;

          if (!isPreOrder) {
            const updated = await tx.product.updateMany({
              where: { id: parseInt(productId), stock: { gte: parsedItemQty } },
              data: { stock: { decrement: parsedItemQty } }
            });
            if (updated.count === 0) {
              const current = await tx.product.findUnique({ where: { id: parseInt(productId) } });
              throw { type: 'STOCK_ERROR', itemName: current.name, available: current.stock, requested: parsedItemQty };
            }
          }
        }

        const isPerMeterItem = isCustomEligible && (product.unit === "per meter" || product.unit === "meter" || isPreOrder);
        const lengthMultiplier = (customLength && isPerMeterItem) ? customLength : 1;
        totalAmount += Math.round(unitPrice * lengthMultiplier * parsedItemQty * 100) / 100;

        if (item.color) {
          coilDeductionItems.push({
            productName: product.name,
            productThickness: product.thickness,
            productUnit: product.unit,
            variantName,
            thickness: thickness || variantName || product.thickness,
            color: item.color,
            customLength,
            quantity: parsedItemQty,
            isPerMeter: isPerMeterItem
          });
        }

        orderItemsData.push({
          productId: parseInt(productId),
          variantId: parsedVariantId,
          variantName,
          quantity: parsedItemQty,
          price: unitPrice,
          color: item.color || null,
          customLength,
          thickness
        });
      }

      const roundedItemsTotal = Math.round(totalAmount * 100) / 100;
      const hasVerifiedPaymongoPayment = Boolean(paymentIntentId || paymongoReference || paypalCaptureId || paypalOrderId);
      if (hasCheckoutPriceMismatch({
        expectedItemsTotal: req.body.expectedItemsTotal,
        liveItemsTotal: roundedItemsTotal,
        hasVerifiedPaymongoPayment
      })) {
        throw {
          type: "PRICE_CHANGED",
          previousItemsTotal: Math.round(Number(req.body.expectedItemsTotal) * 100) / 100,
          updatedItemsTotal: roundedItemsTotal
        };
      }

      const finalTotal = roundCurrency(roundedItemsTotal + shippingFee);

      // Re-verify captured amount against live transaction total in case prices increased mid-checkout
      assertCapturedAmountMatchesOrder({
        verifiedAmountPhp: verifiedPayment.verifiedAmountPhp,
        orderTotalPhp: finalTotal,
        paymentPlan,
        paymentMode,
        providerLabel: verifiedPayment.provider
      });

      const order = await tx.order.create({
        data: {
          userId: resolvedUserId,
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

      // Atomically validate remaining meters and deduct combined coil length for all items
      const deductedCoils = await deductCoilsForOrderInTx(tx, {
        orderId: order.id,
        userId: resolvedUserId,
        items: coilDeductionItems
      });

      // Save idempotency keys atomically so network retries never create duplicate orders
      await recordOrderIdempotencyInTx(tx, {
        orderId: order.id,
        userId: resolvedUserId,
        clientRequestId,
        paymentIntentIds: activeGatewayIds
      });

      return { order, coilUpdates: deductedCoils };
    });

    const ioForBulkOrder = req.app.get("io");
    if (ioForBulkOrder && coilUpdates.length > 0) {
      emitCoilInventoryUpdates(ioForBulkOrder, coilUpdates);
    }

    
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
      const io = req.app.get("io");
      if (fullOrder || targetEmail) {
        notifyOrderPlaced({ io, order: fullOrder || newOrder, customerEmail: targetEmail }).catch((err) => {
          console.error("[ORDER NOTIFICATION DISPATCH ERROR]:", err.message);
        });
      }
    } catch (postErr) {
      console.warn("[POST-BULK-ORDER RECEIPT NON-FATAL WARNING]:", postErr.message);
    }

    const responseOrder = fullOrder || newOrder;
    res.status(201).json({
      success: true,
      data: {
        ...responseOrder,
        paymentSummary: buildOrderPaymentSummary(responseOrder)
      }
    });
  } catch (error) {
    console.error("Failed to create bulk order:", error);
    if (error.type === "PAYMENT_VERIFICATION_ERROR") {
      return res.status(error.statusCode || 400).json({
        success: false,
        code: error.code,
        error: error.message,
        message: error.message,
        ...(error.details ? { details: error.details } : {})
      });
    }
    if (error.code === "P2002") {
      const existingOrder = await findExistingOrderByIdempotency({
        userId: resolvedUserId,
        clientRequestId,
        paymentIntentIds: activeGatewayIds
      });
      if (existingOrder) {
        return res.status(200).json({
          success: true,
          duplicatePrevented: true,
          data: {
            ...existingOrder,
            paymentSummary: buildOrderPaymentSummary(existingOrder)
          }
        });
      }
      const claimedByAnother = await findGatewayPaymentClaim({ paymentIntentIds: activeGatewayIds });
      if (claimedByAnother) {
        return res.status(409).json({
          success: false,
          code: "PAYMENT_ALREADY_USED",
          error: "This payment has already been used for another order.",
          message: "This payment has already been used for another order."
        });
      }
    }
    if (error.type === 'PRICE_CHANGED') {
      return res.status(409).json({
        success: false,
        code: 'PRICE_CHANGED',
        error: 'Product prices or discounts were just updated. Please review your updated order total before confirming.',
        details: error
      });
    }
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
