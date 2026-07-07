const prisma = require("../../config/db");

// Get all reviews for employee panel
const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
        user: { select: { id: true, name: true, email: true } },
        reply: {
          include: {
            user: { select: { name: true, role: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
};

// Reply to a review
const replyToReview = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const userId = req.user.userId || req.user.id;

  if (!comment || comment.trim() === "") {
    return res.status(400).json({ success: false, message: "Reply comment is required." });
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    // Upsert the employee reply
    const reply = await prisma.reviewReply.upsert({
      where: { reviewId: parseInt(id) },
      update: {
        comment,
        userId: parseInt(userId)
      },
      create: {
        reviewId: parseInt(id),
        comment,
        userId: parseInt(userId)
      },
      include: {
        user: { select: { name: true, role: true } }
      }
    });

    res.json({ success: true, message: "Reply saved successfully.", data: reply });
  } catch (error) {
    console.error("Error replying to review:", error);
    res.status(500).json({ success: false, error: "Failed to save reply due to a server error." });
  }
};

module.exports = {
  getAllReviews,
  replyToReview
};
