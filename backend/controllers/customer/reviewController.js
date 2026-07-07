const prisma = require("../../config/db");

// Submit a review
const submitReview = async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const { productId, rating, title, comment, imageUrls, orderId } = req.body;

  // 1. Validate payload
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
    if (orderId) {
      // 2a. Verify the user has purchased the product in this specific order, and the order is delivered
      const order = await prisma.order.findFirst({
        where: {
          id: parseInt(orderId),
          userId: userId,
          status: {
            equals: "delivered",
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
        return res.status(403).json({ success: false, message: "You can only review products from your delivered orders." });
      }

      // 3a. Check if user already reviewed this product for this specific order
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: userId,
          productId: parseInt(productId),
          orderId: parseInt(orderId)
        }
      });

      if (existingReview) {
        return res.status(400).json({ success: false, message: "You have already reviewed this product for this order." });
      }
    } else {
      // 2b. Legacy: Verify the user has purchased the product and it is delivered
      const hasDeliveredOrder = await prisma.order.findFirst({
        where: {
          userId: userId,
          status: {
            equals: "delivered",
            mode: "insensitive"
          },
          items: {
            some: {
              productId: parseInt(productId)
            }
          }
        }
      });

      if (!hasDeliveredOrder) {
        return res.status(403).json({ success: false, message: "You can only review products from delivered orders." });
      }

      // 3b. Check if user already reviewed this product globally
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: userId,
          productId: parseInt(productId)
        }
      });

      if (existingReview) {
        return res.status(400).json({ success: false, message: "You have already reviewed this product." });
      }
    }

    // 4. Create the review
    const review = await prisma.review.create({
      data: {
        userId: userId,
        productId: parseInt(productId),
        rating: parseInt(rating),
        title,
        comment,
        imageUrls: imageUrls || [],
        orderId: orderId ? parseInt(orderId) : null
      }
    });

    // 5. Update the Product's average rating and review count
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

// Get reviews for a product
const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true
          }
        },
        reply: {
          include: {
            user: {
              select: {
                name: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

module.exports = {
  submitReview,
  getProductReviews
};
