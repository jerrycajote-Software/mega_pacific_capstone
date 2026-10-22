const prisma = require("../../config/db");



const syncParentProductAggregates = async (tx, productId) => {
  const variants = await tx.productVariant.findMany({
    where: { productId },
    orderBy: { price: "asc" },
  });

  if (variants.length > 0) {
    const minPrice = variants[0].price; 
    const minOriginalPrice = variants[0].originalPrice;
    const discountPercent = variants[0].discountPercent || 30;
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    await tx.product.update({
      where: { id: productId },
      data: {
        price: minPrice,
        originalPrice: minOriginalPrice,
        discountPercent: discountPercent,
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
  const { name, color, price, originalPrice, discountPercent, stock, sku, status } = req.body;
  try {
    const rawPrice = parseFloat(price) || 0;
    const origPrice = originalPrice !== undefined && originalPrice !== null && originalPrice !== ''
      ? parseFloat(originalPrice)
      : rawPrice;
    const discountPct = discountPercent !== undefined && discountPercent !== null && discountPercent !== ''
      ? parseFloat(discountPercent)
      : 30;
    const sellingPrice = Math.round(origPrice * (1 - discountPct / 100) * 100) / 100;

    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId: parseInt(productId),
          name,
          color: color || null,
          price: sellingPrice,
          originalPrice: origPrice,
          discountPercent: discountPct,
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
    const variantId = parseInt(id, 10);
    const prodId = parseInt(productId, 10);

    const orderCount = await prisma.orderItem.count({ where: { variantId } });
    if (orderCount > 0) {
      await prisma.productVariant.update({
        where: { id: variantId },
        data: { status: "out_of_stock" }
      });
      return res.status(200).json({
        success: true,
        archived: true,
        message: "Variant has order history, so it was archived and marked out of stock."
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.productVariant.delete({
        where: { id: variantId },
      });

      await syncParentProductAggregates(tx, prodId);
    });

    res.status(200).json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Failed to delete variant:", error);
    if (error.code === "P2003") {
      return res.status(409).json({ success: false, error: "Cannot delete variant due to existing order dependencies." });
    }
    res.status(500).json({ success: false, error: error.message || "Failed to delete variant" });
  }
};

const updateVariant = async (req, res) => {
  const { productId, id } = req.params;
  const { name, color, price, originalPrice, discountPercent, stock, sku, status } = req.body;
  try {
    const currentVariant = await prisma.productVariant.findUnique({
      where: { id: parseInt(id) }
    });

    let sellingPrice = currentVariant ? currentVariant.price : 0;
    let origPrice = currentVariant ? currentVariant.originalPrice : 0;
    let discountPct = currentVariant ? (currentVariant.discountPercent ?? 30) : 30;

    if (price !== undefined && price !== null && price !== '') {
      const rawPrice = parseFloat(price) || 0;
      origPrice = originalPrice !== undefined && originalPrice !== null && originalPrice !== ''
        ? parseFloat(originalPrice)
        : rawPrice;
      discountPct = discountPercent !== undefined && discountPercent !== null && discountPercent !== ''
        ? parseFloat(discountPercent)
        : 30;
      sellingPrice = Math.round(origPrice * (1 - discountPct / 100) * 100) / 100;
    }

    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id: parseInt(id) },
        data: {
          name,
          color: color || null,
          price: sellingPrice,
          originalPrice: origPrice,
          discountPercent: discountPct,
          stock: parseInt(stock),
          sku: sku || null,
          status: status || "available",
        },
      });
      await syncParentProductAggregates(tx, parseInt(productId));
      return variant;
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to update variant:", error);
    res.status(500).json({ success: false, error: "Failed to update variant" });
  }
};

module.exports = {
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
};
