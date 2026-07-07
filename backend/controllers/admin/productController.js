const prisma = require("../../config/db");


const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: { price: "asc" },
        },
        orderItems: {
          include: {
            order: true
          }
        },
        reviews: true
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate sales count and average rating for each product
    const productsWithStats = products.map(product => {
      let totalSales = 0;
      try {
        // Calculate total sales from completed orders
        totalSales = product.orderItems
          ? product.orderItems
              .filter(item => item.order && item.order.status === 'completed')
              .reduce((sum, item) => sum + (item.quantity || 0), 0)
          : 0;
      } catch (e) {
        console.error("Error calculating sales:", e);
        totalSales = 0;
      }

      let averageRating = 0;
      try {
        // Calculate average rating
        if (product.reviews && product.reviews.length > 0) {
          const totalRating = product.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          averageRating = totalRating / product.reviews.length;
        }
      } catch (e) {
        console.error("Error calculating rating:", e);
        averageRating = 0;
      }

      return {
        ...product,
        totalSales,
        averageRating: Math.round(averageRating * 10) / 10
      };
    });

    res.status(200).json(productsWithStats);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};


const createProduct = async (req, res) => {
  const { name, type, description, price, unit, stock, imageUrl, imageUrls, variants } = req.body;
  try {
    // Check for duplicate product name (case-insensitive and ignoring leading/trailing spaces)
    const normalizedName = name.trim();
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive'
        }
      }
    });

    if (existingProduct) {
      return res.status(400).json({ error: "Product name already exists. Please enter a unique product name." });
    }

    const product = await prisma.product.create({
      data: {
        name: normalizedName,
        type,
        description,
        price: parseFloat(price) || 0,
        unit: unit || "per meter",
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
        imageUrls: imageUrls || [],
        
        variants:
          variants && variants.length > 0
            ? {
                create: variants.map((v) => ({
                  name: v.name,
                  price: parseFloat(v.price),
                  stock: parseInt(v.stock),
                  sku: v.sku || null,
                  status: v.status || "available",
                })),
              }
            : undefined,
      },
      include: { variants: true },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Failed to create product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};


const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, type, description, price, unit, stock, imageUrl, imageUrls } = req.body;
  
  try {
    const normalizedName = name.trim();
    
    // Check for duplicate product name
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive'
        },
        id: {
          not: parseInt(id)
        }
      }
    });

    if (existingProduct) {
      return res.status(400).json({ error: "Product name already exists. Please enter a unique product name." });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: normalizedName,
        type,
        description,
        price: parseFloat(price) || 0,
        unit: unit || "per meter",
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
        imageUrls: imageUrls || [],
      },
      include: { variants: true },
    });
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Failed to update product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};


const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
