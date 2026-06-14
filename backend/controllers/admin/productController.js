const prisma = require("../../config/db");


const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: { price: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};


const createProduct = async (req, res) => {
  const { name, type, shortDescription, longDescription, price, unit, stock, imageUrl, imageUrls, variants } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        type,
        shortDescription,
        longDescription,
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
  deleteProduct,
};
