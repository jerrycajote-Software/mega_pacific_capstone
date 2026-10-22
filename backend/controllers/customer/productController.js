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
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        variants: {
          where: { status: "available" },
          orderBy: { price: "asc" },
        },
        reviews: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ success: true, data: products });
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
