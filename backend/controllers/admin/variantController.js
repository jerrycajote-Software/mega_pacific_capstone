const prisma = require("../../config/db");


// Calculates the combined stock and lowest price among variants, and updates the parent product.
const syncParentProductAggregates = async (tx, productId) => {
  const variants = await tx.productVariant.findMany({
    where: { productId },
    orderBy: { price: "asc" },
  });

  if (variants.length > 0) {
    const minPrice = variants[0].price; 
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    await tx.product.update({
      where: { id: productId },
      data: {
        price: minPrice,
        stock: totalStock,
      },
    });
  }
};


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


const createVariant = async (req, res) => {
  const { productId } = req.params;
  const { name, price, stock, sku, status } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      
      const variant = await tx.productVariant.create({
        data: {
          productId: parseInt(productId),
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
          sku: sku || null,
          status: status || "available",
        },
      });

      
      await syncParentProductAggregates(tx, parseInt(productId));

      return variant;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to create variant:", error);
    res.status(500).json({ success: false, error: "Failed to create variant" });
  }
};


const deleteVariant = async (req, res) => {
  const { productId, id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      
      await tx.productVariant.delete({
        where: { id: parseInt(id) },
      });

      
      await syncParentProductAggregates(tx, parseInt(productId));
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
  deleteVariant,
};
