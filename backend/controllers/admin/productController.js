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

    
    const productsWithStats = products.map(product => {
      let totalSales = 0;
      try {
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
  const { name, type, description, price, unit, stock, imageUrl, imageUrls, variants, color } = req.body;
  try {
    
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
      return res.status(400).json({ error: "The Product is already exists. Please enter a new product." });
    }

    const rawPrice = parseFloat(price) || 0;
    const origPrice = req.body.originalPrice !== undefined && req.body.originalPrice !== null && req.body.originalPrice !== ''
      ? parseFloat(req.body.originalPrice)
      : rawPrice;
    const discountPct = req.body.discountPercent !== undefined && req.body.discountPercent !== null && req.body.discountPercent !== ''
      ? parseFloat(req.body.discountPercent)
      : 30;
    const sellingPrice = Math.round(origPrice * (1 - discountPct / 100) * 100) / 100;

    const product = await prisma.product.create({
      data: {
        name: normalizedName,
        type,
        description,
        price: sellingPrice,
        originalPrice: origPrice,
        discountPercent: discountPct,
        unit: unit || "per meter",
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
        imageUrls: imageUrls || [],
        color: color || null,
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
        variants:
          variants && variants.length > 0
            ? {
                create: variants.map((v) => {
                  const vRawPrice = parseFloat(v.price) || 0;
                  const vOrigPrice = v.originalPrice !== undefined && v.originalPrice !== null && v.originalPrice !== ''
                    ? parseFloat(v.originalPrice)
                    : vRawPrice;
                  const vDiscountPct = v.discountPercent !== undefined && v.discountPercent !== null && v.discountPercent !== ''
                    ? parseFloat(v.discountPercent)
                    : 30;
                  const vSellingPrice = Math.round(vOrigPrice * (1 - vDiscountPct / 100) * 100) / 100;

                  return {
                    name: v.name,
                    color: v.color || null,
                    price: vSellingPrice,
                    originalPrice: vOrigPrice,
                    discountPercent: vDiscountPct,
                    stock: parseInt(v.stock),
                    sku: v.sku || null,
                    status: v.status || "available",
                  };
                }),
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
  const { name, type, description, price, unit, stock, imageUrl, imageUrls, color } = req.body;
  
  try {
    const normalizedName = name.trim();
    
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
      return res.status(400).json({ error: "The Product is already exists. Please enter a new product." });
    }

    const currentProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const previousStock = currentProduct.stock;
    const finalStock = (stock !== undefined && stock !== null && stock !== '')
      ? parseInt(stock)
      : previousStock;

    let sellingPrice = currentProduct.price;
    let origPrice = currentProduct.originalPrice;
    let discountPct = currentProduct.discountPercent ?? 30;

    if (price !== undefined && price !== null && price !== '') {
      const rawPrice = parseFloat(price) || 0;
      origPrice = req.body.originalPrice !== undefined && req.body.originalPrice !== null && req.body.originalPrice !== ''
        ? parseFloat(req.body.originalPrice)
        : rawPrice;
      discountPct = req.body.discountPercent !== undefined && req.body.discountPercent !== null && req.body.discountPercent !== ''
        ? parseFloat(req.body.discountPercent)
        : 30;
      sellingPrice = Math.round(origPrice * (1 - discountPct / 100) * 100) / 100;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: normalizedName,
        type,
        description,
        price: sellingPrice,
        originalPrice: origPrice,
        discountPercent: discountPct,
        unit: unit || "per meter",
        stock: isNaN(finalStock) ? 0 : finalStock,
        imageUrl: imageUrl || (Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls[0] : null),
        imageUrls: imageUrls || [],
        color: color || null,
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : currentProduct.isActive,
      },
      include: { variants: true },
    });

    if (finalStock !== previousStock) {
      try {
        let userId = req.user?.userId || null;
        if (!userId && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
          try {
            const jwt = require("jsonwebtoken");
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.decode(token);
            if (decoded && decoded.userId) {
              userId = decoded.userId;
            }
          } catch (e) {
            
          }
        }

        await prisma.inventoryLog.create({
          data: {
            productId: parseInt(id),
            addedBy: userId,
            previousStock,
            addedQuantity: finalStock - previousStock,
            newStock: finalStock,
            reason: req.body.reason || "Inventory Item Update"
          }
        });
      } catch (logErr) {
        console.error("Failed to create inventory log for product update:", logErr);
      }
    }
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Failed to update product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};


const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const orderItemCount = await prisma.orderItem.count({
      where: { productId }
    });

    if (orderItemCount > 0) {
      await prisma.$transaction([
        prisma.product.update({
          where: { id: productId },
          data: { isPreOrder: false, stock: 0 }
        }),
        prisma.productVariant.updateMany({
          where: { productId },
          data: { status: "out_of_stock" }
        })
      ]);

      const io = req.app.get("io");
      if (io) {
        io.emit("product_catalog_updated", { action: "delete", productId });
      }

      return res.status(200).json({
        message: "Product has associated orders, so it was archived and unlisted instead of being permanently deleted."
      });
    }

    await prisma.$transaction([
      prisma.review.deleteMany({ where: { productId } }),
      prisma.inventoryLog.deleteMany({ where: { productId } }),
      prisma.productVariant.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } })
    ]);

    const io = req.app.get("io");
    if (io) {
      io.emit("product_catalog_updated", { action: "delete", productId });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    if (error.code === "P2003") {
      return res.status(409).json({ error: "Cannot delete product due to existing order dependencies." });
    }
    res.status(500).json({ error: error.message || "Failed to delete product" });
  }
};

/**
 * POST /api/admin/products/stock-adjust
 * Single item stock addition
 */
const adjustStock = async (req, res) => {
  try {
    const { productId, variantId, addedQuantity, reason } = req.body;
    const qty = parseInt(addedQuantity);

    if (!productId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: "Product ID and a valid positive addedQuantity are required." });
    }

    const userId = req.user?.userId || null;
    let result;

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: parseInt(variantId) },
        include: { product: true }
      });
      if (!variant) {
        return res.status(404).json({ error: "Product variant not found" });
      }

      const previousStock = variant.stock;
      const newStock = previousStock + qty;

      const [updatedVariant, log] = await prisma.$transaction([
        prisma.productVariant.update({
          where: { id: parseInt(variantId) },
          data: {
            stock: newStock,
            status: newStock > 0 ? "available" : "out_of_stock"
          }
        }),
        prisma.inventoryLog.create({
          data: {
            productId: parseInt(productId),
            variantId: parseInt(variantId),
            addedBy: userId,
            previousStock,
            addedQuantity: qty,
            newStock,
            reason: reason || "Restock"
          },
          include: {
            product: { select: { name: true } },
            variant: { select: { name: true } },
            user: { select: { email: true } }
          }
        })
      ]);

      result = { updatedVariant, log };
    } else {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) }
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const previousStock = product.stock;
      const newStock = previousStock + qty;

      const [updatedProduct, log] = await prisma.$transaction([
        prisma.product.update({
          where: { id: parseInt(productId) },
          data: { stock: newStock }
        }),
        prisma.inventoryLog.create({
          data: {
            productId: parseInt(productId),
            addedBy: userId,
            previousStock,
            addedQuantity: qty,
            newStock,
            reason: reason || "Restock"
          },
          include: {
            product: { select: { name: true } },
            user: { select: { email: true } }
          }
        })
      ]);

      result = { updatedProduct, log };
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Stock adjustment failed:", error);
    res.status(500).json({ error: "Failed to adjust stock: " + error.message });
  }
};


const bulkAdjustStock = async (req, res) => {
  try {
    const { adjustments } = req.body;
    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({ error: "Adjustments array is required." });
    }

    const userId = req.user?.userId || null;
    const logs = [];

    await prisma.$transaction(async (tx) => {
      for (const item of adjustments) {
        const { productId, variantId, addedQuantity, reason } = item;
        const qty = parseInt(addedQuantity);
        if (!productId || isNaN(qty) || qty <= 0) continue;

        if (variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: parseInt(variantId) } });
          if (!variant) continue;
          const previousStock = variant.stock;
          const newStock = previousStock + qty;

          await tx.productVariant.update({
            where: { id: parseInt(variantId) },
            data: {
              stock: newStock,
              status: newStock > 0 ? "available" : "out_of_stock"
            }
          });

          const log = await tx.inventoryLog.create({
            data: {
              productId: parseInt(productId),
              variantId: parseInt(variantId),
              addedBy: userId,
              previousStock,
              addedQuantity: qty,
              newStock,
              reason: reason || "Bulk Restock"
            }
          });
          logs.push(log);
        } else {
          const product = await tx.product.findUnique({ where: { id: parseInt(productId) } });
          if (!product) continue;
          const previousStock = product.stock;
          const newStock = previousStock + qty;

          await tx.product.update({
            where: { id: parseInt(productId) },
            data: { stock: newStock }
          });

          const log = await tx.inventoryLog.create({
            data: {
              productId: parseInt(productId),
              addedBy: userId,
              previousStock,
              addedQuantity: qty,
              newStock,
              reason: reason || "Bulk Restock"
            }
          });
          logs.push(log);
        }
      }
    });

    res.status(200).json({ success: true, count: logs.length, message: `Successfully restocked ${logs.length} items.` });
  } catch (error) {
    console.error("Bulk stock adjustment failed:", error);
    res.status(500).json({ error: "Failed to perform bulk stock restock: " + error.message });
  }
};


const getStockLogs = async (req, res) => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, type: true } },
        variant: { select: { id: true, name: true } },
        user: { select: { id: true, email: true, role: true } }
      },
      take: 200
    });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Failed to fetch stock logs:", error);
    res.status(500).json({ error: "Failed to fetch stock logs" });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  bulkAdjustStock,
  getStockLogs,
};
