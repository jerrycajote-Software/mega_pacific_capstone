const prisma = require("../../config/db");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  const { name, type, description, price, unit, stock, imageUrl } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        type,
        description,
        price: parseFloat(price),
        unit,
        stock: parseInt(stock),
        imageUrl,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, type, description, price, unit, stock, imageUrl } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        description,
        price: price ? parseFloat(price) : undefined,
        unit,
        stock: stock ? parseInt(stock) : undefined,
        imageUrl,
      },
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
