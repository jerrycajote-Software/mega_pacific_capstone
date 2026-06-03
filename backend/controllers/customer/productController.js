const prisma = require("../../config/db");

// Get a single product by ID including its variants and reviews
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        variants: {
          where: { status: "available" },
          orderBy: { price: "asc" },
        },
        reviews: {
          include: {
            user: { select: { name: true, avatarUrl: true } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    res.status(500).json({ success: false, error: "Failed to fetch product" });
  }
};

module.exports = {
  getProductById
};
