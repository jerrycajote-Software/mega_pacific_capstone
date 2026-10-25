const prisma = require("../../config/db");

const normalizeThickness = (val) => {
  if (!val) return "";
  let str = String(val).trim();
  if (/^\d+(\.\d+)?$/.test(str)) {
    str = `${str}mm`;
  } else if (/^\d+(\.\d+)?\s*mm$/i.test(str)) {
    str = str.replace(/\s*mm$/i, "mm");
  }
  return str.toLowerCase();
};

const getPreOrderProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isPreOrder: true
      },
      include: {
        variants: {
          orderBy: { price: "asc" }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const productsWithStats = products.map((product) => {
      let averageRating = 0;
      if (product.reviews && product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        averageRating = Math.round((totalRating / product.reviews.length) * 10) / 10;
      }

      return {
        ...product,
        averageRating,
        reviewCount: product.reviews ? product.reviews.length : 0
      };
    });

    res.status(200).json({ success: true, data: productsWithStats });
  } catch (error) {
    console.error("Failed to fetch pre-order products:", error);
    res.status(500).json({ success: false, error: "Failed to fetch pre-order products" });
  }
};

const createPreOrderProduct = async (req, res) => {
  const {
    name,
    type,
    description,
    price,
    originalPrice,
    unit,
    thickness,
    effectiveWidth,
    nominalWidth,
    ribHeight,
    colors,
    maxMeters,
    imageUrl,
    imageUrls,
    variants
  } = req.body;

  try {
    const normalizedName = (name || "").trim();
    if (!normalizedName) {
      return res.status(400).json({ success: false, error: "Product name is required." });
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive"
        }
      }
    });

    if (existingProduct) {
      return res.status(400).json({ success: false, error: "A product with this name already exists. Please choose a different name." });
    }

    const rawOrigPrice = originalPrice !== undefined && originalPrice !== "" ? parseFloat(originalPrice) : parseFloat(price) || 0;
    const discountPct = req.body.discountPercent !== undefined && req.body.discountPercent !== "" ? parseFloat(req.body.discountPercent) : 30;
    const sellingPrice = Math.round(rawOrigPrice * (1 - discountPct / 100) * 100) / 100;

    const parsedColors = Array.isArray(colors) ? colors : typeof colors === "string" ? colors.split(",").map(c => c.trim()).filter(Boolean) : [];

    const normBaseThickness = normalizeThickness(thickness || "0.35mm");

    const coilsInInventory = await prisma.coilInventory.findMany({
      where: {
        thickness: { equals: normBaseThickness, mode: "insensitive" }
      }
    });

    const inStockCoils = coilsInInventory.filter(c => (c.coilCount ?? 0) > 0);

    if (inStockCoils.length === 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot create pre-order product: Thickness "${thickness || normBaseThickness}" is not available in Coil Inventory. Steel coils must be stocked in inventory before products can be created.`
      });
    }

    if (!parsedColors || parsedColors.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one available color finish must be selected from Coil Inventory."
      });
    }

    const availableColorSet = new Set(
      inStockCoils.map(c => c.color.toLowerCase().trim())
    );

    const unavailableChosen = parsedColors.filter(c => !availableColorSet.has(c.toLowerCase().trim()));
    if (unavailableChosen.length > 0) {
      return res.status(400).json({
        success: false,
        error: `The material ${normBaseThickness} with color(s) "${unavailableChosen.join(", ")}" is not available in Coil Inventory and cannot be created.`
      });
    }

    if (Array.isArray(variants) && variants.length > 0) {
      const seenVariantThicknesses = new Set();
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const vThick = normalizeThickness(v.thickness || "");
        if (!vThick) continue;

        if (vThick === normBaseThickness) {
          return res.status(400).json({
            success: false,
            error: `Variant "${v.name || v.thickness}" cannot have the same thickness (${v.thickness || normBaseThickness}) as the Base Product. Each thickness on a product must be unique.`
          });
        }

        if (seenVariantThicknesses.has(vThick)) {
          return res.status(400).json({
            success: false,
            error: `Duplicate thickness "${v.thickness}" detected among product variants. Each variant must specify a different thickness.`
          });
        }
        seenVariantThicknesses.add(vThick);

        const variantCoils = await prisma.coilInventory.findMany({
          where: {
            thickness: { equals: vThick, mode: "insensitive" }
          }
        });
        const hasVariantStock = variantCoils.some(c => (c.coilCount ?? 0) > 0);
        if (!hasVariantStock) {
          v.status = "out_of_stock";
        }
      }
    }

    const product = await prisma.product.create({
      data: {
        name: normalizedName,
        type: type || "Rib Type",
        description: description || "",
        price: sellingPrice,
        originalPrice: rawOrigPrice,
        discountPercent: discountPct,
        unit: unit || "per meter",
        stock: 9999, 
        isPreOrder: true,
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
        thickness: thickness || "0.35mm",
        effectiveWidth: effectiveWidth !== undefined && effectiveWidth !== "" ? parseFloat(effectiveWidth) : null,
        nominalWidth: nominalWidth !== undefined && nominalWidth !== "" ? parseFloat(nominalWidth) : null,
        ribHeight: ribHeight !== undefined && ribHeight !== "" ? parseFloat(ribHeight) : null,
        colors: parsedColors,
        maxMeters: maxMeters !== undefined && maxMeters !== "" ? parseFloat(maxMeters) : 21.0,
        imageUrl: imageUrl || (imageUrls && imageUrls[0]) || null,
        imageUrls: imageUrls || [],
        variants: variants && variants.length > 0
          ? {
              create: variants.map((v) => {
                const vOrig = v.originalPrice !== undefined && v.originalPrice !== "" ? parseFloat(v.originalPrice) : parseFloat(v.price) || 0;
                const vSelling = Math.round(vOrig * (1 - discountPct / 100) * 100) / 100;
                return {
                  name: v.name || `${v.thickness || "Standard"} Thickness`,
                  thickness: v.thickness || thickness || "0.35mm",
                  color: v.color || null,
                  originalPrice: vOrig,
                  price: vSelling,
                  discountPercent: discountPct,
                  stock: 9999,
                  status: v.status || "available"
                };
              })
            }
          : undefined
      },
      include: {
        variants: true
      }
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("product_catalog_updated", { action: "create", product });
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Failed to create pre-order product:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create pre-order product" });
  }
};

const updatePreOrderProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    type,
    description,
    price,
    originalPrice,
    unit,
    thickness,
    effectiveWidth,
    nominalWidth,
    ribHeight,
    colors,
    maxMeters,
    imageUrl,
    imageUrls,
    variants
  } = req.body;

  try {
    const productId = parseInt(id, 10);
    const existing = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const normalizedName = (name || "").trim();
    if (normalizedName) {
      const duplicate = await prisma.product.findFirst({
        where: {
          name: { equals: normalizedName, mode: "insensitive" },
          id: { not: productId }
        }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, error: "Another product already uses this name." });
      }
    }

    const rawOrigPrice = originalPrice !== undefined && originalPrice !== "" ? parseFloat(originalPrice) : (price !== undefined && price !== "" ? parseFloat(price) : existing.originalPrice || existing.price);
    const discountPct = req.body.discountPercent !== undefined && req.body.discountPercent !== "" ? parseFloat(req.body.discountPercent) : existing.discountPercent || 30;
    const sellingPrice = Math.round(rawOrigPrice * (1 - discountPct / 100) * 100) / 100;
    const parsedColors = Array.isArray(colors) ? colors : existing.colors;

    const normBaseThickness = normalizeThickness(thickness || existing.thickness || "0.35mm");

    if (colors !== undefined || thickness !== undefined) {
      const coilsInInventory = await prisma.coilInventory.findMany({
        where: {
          thickness: { equals: normBaseThickness, mode: "insensitive" }
        }
      });

      const inStockCoils = coilsInInventory.filter(c => (c.coilCount ?? 0) > 0);

      if (inStockCoils.length === 0) {
        return res.status(400).json({
          success: false,
          error: `Thickness "${thickness || normBaseThickness}" has no available raw materials in Coil Inventory. Steel coils must be stocked in inventory before products can be updated.`
        });
      }

      if (!parsedColors || parsedColors.length === 0) {
        return res.status(400).json({
          success: false,
          error: "At least one available color finish must be selected from Coil Inventory."
        });
      }

      const availableColorSet = new Set(
        inStockCoils.map(c => c.color.toLowerCase().trim())
      );
      const unavailableChosen = parsedColors.filter(c => !availableColorSet.has(c.toLowerCase().trim()));
      if (unavailableChosen.length > 0) {
        return res.status(400).json({
          success: false,
          error: `The material ${normBaseThickness} with color(s) "${unavailableChosen.join(", ")}" is not available in Coil Inventory and cannot be assigned.`
        });
      }
    }

    if (Array.isArray(variants) && variants.length > 0) {
      const seenVariantThicknesses = new Set();
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const vThick = normalizeThickness(v.thickness || "");
        if (!vThick) continue;

        if (vThick === normBaseThickness) {
          return res.status(400).json({
            success: false,
            error: `Variant "${v.name || v.thickness}" cannot have the same thickness (${v.thickness || normBaseThickness}) as the Base Product. Each thickness on a product must be unique.`
          });
        }

        if (seenVariantThicknesses.has(vThick)) {
          return res.status(400).json({
            success: false,
            error: `Duplicate thickness "${v.thickness}" detected among product variants. Each variant must specify a different thickness.`
          });
        }
        seenVariantThicknesses.add(vThick);
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: normalizedName || existing.name,
        type: type !== undefined ? type : existing.type,
        description: description !== undefined ? description : existing.description,
        price: sellingPrice,
        originalPrice: rawOrigPrice,
        discountPercent: discountPct,
        unit: unit || existing.unit,
        thickness: thickness || existing.thickness,
        effectiveWidth: effectiveWidth !== undefined && effectiveWidth !== "" ? parseFloat(effectiveWidth) : existing.effectiveWidth,
        nominalWidth: nominalWidth !== undefined && nominalWidth !== "" ? parseFloat(nominalWidth) : existing.nominalWidth,
        ribHeight: ribHeight !== undefined && ribHeight !== "" ? parseFloat(ribHeight) : existing.ribHeight,
        colors: parsedColors,
        imageUrl: imageUrl !== undefined 
          ? imageUrl 
          : (Array.isArray(imageUrls) ? (imageUrls[0] || null) : existing.imageUrl),
        imageUrls: imageUrls !== undefined ? imageUrls : existing.imageUrls,
        isPreOrder: true,
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : existing.isActive
      },
      include: {
        variants: true
      }
    });

    
    if (Array.isArray(variants)) {
      const incomingIds = variants.filter(v => v.id).map(v => parseInt(v.id, 10));
      const existingVariants = await prisma.productVariant.findMany({ where: { productId } });
      for (const ev of existingVariants) {
        if (!incomingIds.includes(ev.id)) {
          const orderCount = await prisma.orderItem.count({ where: { variantId: ev.id } });
          if (orderCount > 0) {
            await prisma.productVariant.update({ where: { id: ev.id }, data: { status: "out_of_stock" } });
          } else {
            await prisma.productVariant.delete({ where: { id: ev.id } });
          }
        }
      }
      for (const v of variants) {
        const vOrig = v.originalPrice !== undefined && v.originalPrice !== "" ? parseFloat(v.originalPrice) : parseFloat(v.price) || 0;
        const vSelling = Math.round(vOrig * (1 - discountPct / 100) * 100) / 100;
        const vNorm = normalizeThickness(v.thickness || "");
        const variantCoils = await prisma.coilInventory.findMany({
          where: { thickness: { equals: vNorm, mode: "insensitive" } }
        });
        const hasVariantStock = variantCoils.some(c => (c.coilCount ?? 0) > 0);
        const resolvedVariantStatus = hasVariantStock ? (v.status || "available") : "out_of_stock";

        if (v.id) {
          await prisma.productVariant.update({
            where: { id: parseInt(v.id, 10) },
            data: {
              name: v.name,
              thickness: v.thickness,
              originalPrice: vOrig,
              price: vSelling,
              status: resolvedVariantStatus
            }
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId,
              name: v.name || `${v.thickness || "Standard"} Thickness`,
              thickness: v.thickness || "0.35mm",
              originalPrice: vOrig,
              price: vSelling,
              discountPercent: discountPct,
              stock: 9999,
              status: resolvedVariantStatus
            }
          });
        }
      }
    }

    const refreshed = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("product_catalog_updated", { action: "update", product: refreshed });
    }

    res.status(200).json({ success: true, data: refreshed });
  } catch (error) {
    console.error("Failed to update pre-order product:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update product" });
  }
};

const deletePreOrderProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, error: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const orderCount = product._count?.orderItems || 0;

    if (orderCount > 0) {
      
      
      await prisma.$transaction([
        prisma.product.update({
          where: { id: productId },
          data: {
            isPreOrder: false,
            stock: 0
          }
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
        success: true,
        archived: true,
        message: "Product has associated customer order history, so it was archived and unlisted from the pre-order catalog to protect historical order records."
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

    res.status(200).json({ success: true, message: "Pre-order product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete pre-order product:", error);
    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        error: "Cannot permanently delete product due to database dependencies. Please archive or unlist it instead."
      });
    }
    res.status(500).json({ success: false, error: error.message || "Failed to delete product" });
  }
};

const addVariant = async (req, res) => {
  const { id } = req.params;
  const { name, thickness, originalPrice, price, status } = req.body;

  try {
    const productId = parseInt(id, 10);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    const rawOrig = originalPrice !== undefined && originalPrice !== "" ? parseFloat(originalPrice) : parseFloat(price) || 0;
    const discountPct = product.discountPercent || 30;
    const sellingPrice = Math.round(rawOrig * (1 - discountPct / 100) * 100) / 100;

    const vThick = normalizeThickness(thickness || "0.35mm");
    const baseThick = normalizeThickness(product.thickness || "0.35mm");
    if (vThick === baseThick) {
      return res.status(400).json({
        success: false,
        error: `Cannot add variant with thickness "${thickness}": it duplicates the Base Product thickness (${product.thickness}).`
      });
    }

    const existingVariants = await prisma.productVariant.findMany({ where: { productId } });
    const duplicateVariant = existingVariants.find(ev => normalizeThickness(ev.thickness) === vThick);
    if (duplicateVariant) {
      return res.status(400).json({
        success: false,
        error: `A variant with thickness "${thickness}" already exists for this product.`
      });
    }

    const variantCoils = await prisma.coilInventory.findMany({
      where: {
        thickness: { equals: vThick, mode: "insensitive" }
      }
    });
    const hasVariantStock = variantCoils.some(c => (c.coilCount ?? 0) > 0);
    const resolvedStatus = hasVariantStock ? (status || "available") : "out_of_stock";

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: name || `${thickness || "Standard"} Thickness`,
        thickness: thickness || "0.35mm",
        originalPrice: rawOrig,
        price: sellingPrice,
        discountPercent: discountPct,
        stock: 9999,
        status: resolvedStatus
      }
    });

    res.status(201).json({ success: true, data: variant });
  } catch (error) {
    console.error("Failed to add variant:", error);
    res.status(500).json({ success: false, error: "Failed to add variant" });
  }
};

const deleteVariant = async (req, res) => {
  const { variantId } = req.params;
  try {
    const vId = parseInt(variantId, 10);
    if (isNaN(vId)) {
      return res.status(400).json({ success: false, error: "Invalid variant ID" });
    }

    const orderCount = await prisma.orderItem.count({ where: { variantId: vId } });
    if (orderCount > 0) {
      await prisma.productVariant.update({
        where: { id: vId },
        data: { status: "out_of_stock" }
      });
      return res.status(200).json({
        success: true,
        archived: true,
        message: "Variant has order history, so it was archived and marked out of stock."
      });
    }

    await prisma.productVariant.delete({ where: { id: vId } });

    res.status(200).json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Failed to delete variant:", error);
    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        error: "Cannot delete variant due to existing order dependencies."
      });
    }
    res.status(500).json({ success: false, error: error.message || "Failed to delete variant" });
  }
};

const togglePreOrderProductStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const productId = parseInt(id, 10);
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const nextStatus = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !existing.isActive;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isActive: nextStatus },
      include: {
        variants: {
          orderBy: { price: "asc" }
        },
        reviews: true
      }
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("product_catalog_updated", {
        action: nextStatus ? "product_enabled" : "product_disabled",
        productId,
        product: updated
      });
    }

    res.status(200).json({
      success: true,
      message: nextStatus ? "Pre-order product enabled and visible to customers." : "Pre-order product disabled and hidden from customers.",
      data: updated
    });
  } catch (error) {
    console.error("Failed to toggle product status:", error);
    res.status(500).json({ success: false, error: "Failed to toggle product status" });
  }
};

module.exports = {
  getPreOrderProducts,
  createPreOrderProduct,
  updatePreOrderProduct,
  deletePreOrderProduct,
  togglePreOrderProductStatus,
  addVariant,
  deleteVariant
};
