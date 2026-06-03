const prisma = require("../../config/db");

// GET /api/admin/products/:productId/variants
const getVariants = async (req, res) => {
  const { productId } = req.params;
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId: parseInt(productId) },
      orderBy: { price: "asc" },
    });
    res.status(200).json({ success: true, data: variants });
  } catch (error) {
    console.error("Failed to fetch variants:", error);
    res.status(500).json({ success: false, error: "Failed to fetch variants" });
  }
};

// POST /api/admin/products/:productId/variants
const createVariant = async (req, res) => {
  const { productId } = req.params;
  const { name, price, stock, sku, status } = req.body;
  try {
    const variant = await prisma.productVariant.create({
      data: {
        productId: parseInt(productId),
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        sku: sku || null,
        status: status || "available",
      },
    });
    res.status(201).json({ success: true, data: variant });
  } catch (error) {
    console.error("Failed to create variant:", error);
    res.status(500).json({ success: false, error: "Failed to create variant" });
  }
};

// PUT /api/admin/products/:productId/variants/:id
const updateVariant = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, sku, status } = req.body;
  try {
    const variant = await prisma.productVariant.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        sku: sku !== undefined ? (sku || null) : undefined,
        status: status !== undefined ? status : undefined,
      },
    });
    res.status(200).json({ success: true, data: variant });
  } catch (error) {
    console.error("Failed to update variant:", error);
    res.status(500).json({ success: false, error: "Failed to update variant" });
  }
};

// DELETE /api/admin/products/:productId/variants/:id
const deleteVariant = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.productVariant.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Failed to delete variant:", error);
    res.status(500).json({ success: false, error: "Failed to delete variant" });
  }
};

module.exports = {
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
};
