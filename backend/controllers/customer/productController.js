const prisma = require("../../config/db");


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
            user: { select: { id: true, email: true } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!product || product.isActive === false) {
      return res.status(404).json({ success: false, error: "This pre-order item is currently disabled and unavailable." });
    }

    const coilInventory = await prisma.coilInventory.findMany({
      select: {
        id: true,
        thickness: true,
        color: true,
        coilCount: true,
        minAlertCount: true
      }
    });

    res.status(200).json({ success: true, data: { ...product, coilInventory } });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    res.status(500).json({ success: false, error: "Failed to fetch product" });
  }
};


const getProducts = async (req, res) => {
  try {
    const { bestSellersOnly } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        variants: {
          where: { status: "available" },
          orderBy: { price: "asc" },
        },
        orderItems: {
          where: {
            order: {
              status: { notIn: ["cancelled", "rejected"] },
              paymentStatus: { not: "refunded" }
            }
          },
          select: {
            quantity: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Compute sales volume and review statistics
    const productsWithStats = products.map((product) => {
      const totalSales = Array.isArray(product.orderItems)
        ? product.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 0;

      let calculatedRating = product.averageRating || 0;
      if (product.reviews && product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        calculatedRating = Number((totalRating / product.reviews.length).toFixed(1));
      }

      // Exclude raw order items from client payload
      const { orderItems, ...cleanedProduct } = product;
      return {
        ...cleanedProduct,
        totalSales,
        averageRating: calculatedRating,
        isBestSeller: false,
      };
    });

    // Determine top best sellers by sales volume (or rating fallback)
    const sortedBySales = [...productsWithStats].sort((a, b) => {
      if (b.totalSales !== a.totalSales) {
        return b.totalSales - a.totalSales;
      }
      return (b.averageRating || 0) - (a.averageRating || 0);
    });

    // Tag the top 6 products as best sellers
    const topCount = Math.min(6, sortedBySales.length);
    const bestSellerIds = new Set(
      sortedBySales
        .slice(0, topCount)
        .filter((p) => p.totalSales > 0 || sortedBySales.every((item) => item.totalSales === 0))
        .map((p) => p.id)
    );

    const finalProducts = productsWithStats.map((p) => ({
      ...p,
      isBestSeller: bestSellerIds.has(p.id),
      salesRank: sortedBySales.findIndex((s) => s.id === p.id) + 1,
    }));

    if (bestSellersOnly === "true") {
      const bestSellersList = finalProducts
        .filter((p) => p.isBestSeller)
        .sort((a, b) => (a.salesRank || 99) - (b.salesRank || 99));
      return res.status(200).json({ success: true, data: bestSellersList });
    }

    res.status(200).json({ success: true, data: finalProducts });
  } catch (error) {
    console.error("Failed to fetch customer products:", error);
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
};


const getCoilAvailability = async (req, res) => {
  try {
    const coils = await prisma.coilInventory.findMany({
      select: {
        id: true,
        thickness: true,
        color: true,
        coilCount: true,
        minAlertCount: true
      }
    });

    res.status(200).json({ success: true, data: coils });
  } catch (error) {
    console.error("Failed to fetch coil availability:", error);
    res.status(500).json({ success: false, error: "Failed to fetch coil availability" });
  }
};

module.exports = {
  getProductById,
  getProducts,
  getCoilAvailability
};
