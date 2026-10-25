const prisma = require("../../config/db");

const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: { select: { id: true, name: true, imageUrl: true, imageUrls: true, type: true } },
        user: {
          select: {
            id: true,
            email: true,
            customerProfile: { select: { name: true, avatarUrl: true } }
          }
        },
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
      orderBy: { createdAt: "desc" }
    });
    const formatted = reviews.map(r => ({
      ...r,
      user: {
        ...r.user,
        avatarUrl: r.user?.customerProfile?.avatarUrl || "/default-profile.png",
        customerProfile: {
          name: r.user?.customerProfile?.name || r.user?.email?.split('@')[0] || "Customer",
          avatarUrl: r.user?.customerProfile?.avatarUrl || "/default-profile.png"
        }
      }
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
};

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
        user: {
          select: {
            id: true,
            role: true,
            salesProfile: { select: { name: true } },
            adminProfile: { select: { name: true } }
          }
        }
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
