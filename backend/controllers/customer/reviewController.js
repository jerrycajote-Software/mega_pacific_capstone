const prisma = require("../../config/db");

const submitReview = async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const { productId, rating, title, comment, imageUrls, orderId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: "Product ID is missing or invalid." });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "A valid rating between 1 and 5 is required." });
  }
  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Review comment is required." });
  }
  if (imageUrls && imageUrls.length > 3) {
    return res.status(400).json({ success: false, message: "You can only upload up to 3 images." });
  }

  try {
    let targetOrderId = orderId ? parseInt(orderId) : null;

    if (targetOrderId) {
      // 2a. Verify the user has purchased the product in this specific order, and the order is delivered or completed (received)
      const order = await prisma.order.findFirst({
        where: {
          id: targetOrderId,
          userId: userId,
          status: {
            in: ["delivered", "completed"],
            mode: "insensitive"
          },
          items: {
            some: {
              productId: parseInt(productId)
            }
          }
        }
      });

      if (!order) {
        return res.status(403).json({ success: false, message: "You can only review products from orders that have been delivered or received." });
      }

      // 3a. Check if user already reviewed this product for this specific order
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: userId,
          productId: parseInt(productId),
          orderId: targetOrderId
        }
      });

      if (existingReview) {
        return res.status(400).json({ success: false, message: "You have already reviewed this product for this order." });
      }
    } else {
      // 2b. If orderId not explicitly provided, find delivered/completed orders containing this product
      const deliveredOrders = await prisma.order.findMany({
        where: {
          userId: userId,
          status: {
            in: ["delivered", "completed"],
            mode: "insensitive"
          },
          items: {
            some: {
              productId: parseInt(productId)
            }
          }
        },
        select: { id: true },
        orderBy: { createdAt: "desc" }
      });

      if (deliveredOrders.length === 0) {
        return res.status(403).json({ success: false, message: "You can only review products from delivered or received orders." });
      }

      // Find an eligible order that has not yet been reviewed by this customer for this product
      const existingReviews = await prisma.review.findMany({
        where: {
          userId: userId,
          productId: parseInt(productId),
          orderId: { in: deliveredOrders.map(o => o.id) }
        },
        select: { orderId: true }
      });

      const reviewedOrderIds = new Set(existingReviews.map(r => r.orderId));
      const unreviewedOrder = deliveredOrders.find(o => !reviewedOrderIds.has(o.id));

      if (!unreviewedOrder) {
        return res.status(400).json({ success: false, message: "You have already reviewed this product for all your completed orders." });
      }

      targetOrderId = unreviewedOrder.id;
    }

    const review = await prisma.review.create({
      data: {
        userId: userId,
        productId: parseInt(productId),
        rating: parseInt(rating),
        title,
        comment,
        imageUrls: imageUrls || [],
        orderId: targetOrderId
      }
    });

    const allReviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) }
    });

    const newReviewCount = allReviews.length;
    const totalRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const newAverageRating = newReviewCount > 0 ? totalRating / newReviewCount : 0;

    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        reviewCount: newReviewCount,
        averageRating: newAverageRating
      }
    });

    res.status(201).json({ success: true, message: "Review submitted successfully", data: review });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit review due to a server error.",
      error: error.message 
    });
  }
};

// Check if customer is eligible to review a product
const checkReviewEligibility = async (req, res) => {
  const userId = req.user?.userId || req.user?.id;
  const { productId } = req.params;

  try {
    // Find all delivered or completed orders by this user that contain this product
    const eligibleOrders = await prisma.order.findMany({
      where: {
        userId: parseInt(userId),
        status: {
          in: ["delivered", "completed"],
          mode: "insensitive"
        },
        items: {
          some: {
            productId: parseInt(productId)
          }
        }
      },
      select: { id: true, createdAt: true, fulfillmentType: true },
      orderBy: { createdAt: "desc" }
    });

    if (eligibleOrders.length === 0) {
      // Check if user has an active pending/processing/shipped order for this product
      const activeOrder = await prisma.order.findFirst({
        where: {
          userId: parseInt(userId),
          items: {
            some: {
              productId: parseInt(productId)
            }
          }
        },
        select: { id: true, status: true, fulfillmentType: true }
      });

      if (activeOrder) {
        const isPickup = activeOrder.fulfillmentType === 'Pickup';
        const statusLabel = activeOrder.status.replace(/_/g, ' ');
        return res.status(200).json({
          success: true,
          eligible: false,
          reason: "pending_fulfillment",
          message: isPickup
            ? `Your order #${activeOrder.id} is currently ${statusLabel}. You can leave a review once you pick up your order.`
            : `Your order #${activeOrder.id} is currently ${statusLabel}. You can leave a review once your product has been delivered.`
        });
      }

      return res.status(200).json({
        success: true,
        eligible: false,
        reason: "not_purchased",
        message: "You can leave a review once you purchase and receive this product."
      });
    }

    // Check which of these orders already has a review for this product
    const existingReviews = await prisma.review.findMany({
      where: {
        userId: parseInt(userId),
        productId: parseInt(productId),
        orderId: { in: eligibleOrders.map(o => o.id) }
      },
      select: { orderId: true }
    });

    const reviewedOrderIds = new Set(existingReviews.map(r => r.orderId));
    const unreviewedOrder = eligibleOrders.find(o => !reviewedOrderIds.has(o.id));

    if (!unreviewedOrder) {
      return res.status(200).json({
        success: true,
        eligible: false,
        reason: "already_reviewed",
        message: "You have already reviewed this product for your received orders. Thank you for your feedback!"
      });
    }

    return res.status(200).json({
      success: true,
      eligible: true,
      orderId: unreviewedOrder.id
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    res.status(500).json({ success: false, message: "Failed to verify review eligibility" });
  }
};

const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            customerProfile: {
              select: {
                name: true,
                avatarUrl: true
              }
            }
          }
        },
        reply: {
          include: {
            user: {
              select: {
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

    const formattedReviews = reviews.map(r => ({
      ...r,
      user: {
        id: r.user?.id,
        email: r.user?.email,
        name: r.user?.customerProfile?.name || (r.user?.email ? r.user.email.split('@')[0] : "Valued Customer"),
        avatarUrl: r.user?.customerProfile?.avatarUrl || null
      },
      reply: r.reply ? {
        ...r.reply,
        user: {
          role: r.reply.user?.role || "Staff",
          name: r.reply.user?.salesProfile?.name || r.reply.user?.adminProfile?.name || "Mega Pacific Team"
        }
      } : null
    }));

    res.status(200).json({ success: true, data: formattedReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

module.exports = {
  submitReview,
  checkReviewEligibility,
  getProductReviews
};
