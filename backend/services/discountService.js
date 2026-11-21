const prisma = require("../config/db");

const GLOBAL_DISCOUNT_SETTING_KEY = "global_product_discount_percent";
const DEFAULT_DISCOUNT_PERCENT = 30;
const MIN_DISCOUNT_PERCENT = 0;
const MAX_DISCOUNT_PERCENT = 95;

// Parse and validate a discount percentage between 0% and 95%
const parseAndValidateDiscountPercent = (rawValue) => {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    const err = new Error("Please enter a discount percentage between 0% and 95%.");
    err.statusCode = 400;
    throw err;
  }

  const parsed = Number(rawValue);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    const err = new Error("Discount percentage must be a valid number.");
    err.statusCode = 400;
    throw err;
  }

  if (parsed < MIN_DISCOUNT_PERCENT || parsed > MAX_DISCOUNT_PERCENT) {
    const err = new Error(`Discount percentage must be between ${MIN_DISCOUNT_PERCENT}% and ${MAX_DISCOUNT_PERCENT}%.`);
    err.statusCode = 400;
    throw err;
  }

  return Math.round(parsed * 100) / 100;
};

// Compute selling price from original price and discount percentage
const calculateDiscountedPrice = (originalPrice, discountPercent) => {
  const numericOriginal = Number(originalPrice) || 0;
  const numericDiscount = Math.max(0, Math.min(MAX_DISCOUNT_PERCENT, Number(discountPercent) || 0));
  return Math.round(numericOriginal * (1 - numericDiscount / 100) * 100) / 100;
};

// Recover the pre-discount original price safely when older records omit originalPrice
const resolveOriginalPrice = (record) => {
  if (record.originalPrice !== null && record.originalPrice !== undefined && Number(record.originalPrice) > 0) {
    return Number(record.originalPrice);
  }
  const currentPrice = Number(record.price) || 0;
  const currentDiscount = Number(record.discountPercent);
  if (!Number.isNaN(currentDiscount) && currentDiscount > 0 && currentDiscount < 100) {
    return Math.round((currentPrice / (1 - currentDiscount / 100)) * 100) / 100;
  }
  return currentPrice;
};

// Read the current storewide global product discount percentage from SystemSetting
const getGlobalProductDiscountPercent = async () => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: GLOBAL_DISCOUNT_SETTING_KEY }
  });

  if (!setting) {
    return DEFAULT_DISCOUNT_PERCENT;
  }

  const parsed = Number(setting.value);
  if (Number.isNaN(parsed) || parsed < MIN_DISCOUNT_PERCENT || parsed > MAX_DISCOUNT_PERCENT) {
    return DEFAULT_DISCOUNT_PERCENT;
  }
  return Math.round(parsed * 100) / 100;
};

// Fetch the global discount setting along with live catalog discount distribution stats
const getGlobalDiscountOverview = async () => {
  const [globalDiscountPercent, products] = await Promise.all([
    getGlobalProductDiscountPercent(),
    prisma.product.findMany({
      select: {
        id: true,
        discountPercent: true,
        isPreOrder: true,
        isActive: true
      }
    })
  ]);

  const totalProducts = products.length;
  const customDiscountCount = products.filter((p) => {
    const prodPct = p.discountPercent ?? DEFAULT_DISCOUNT_PERCENT;
    return Math.abs(prodPct - globalDiscountPercent) > 0.001;
  }).length;
  const activeDiscountedCount = products.filter((p) => (p.discountPercent ?? DEFAULT_DISCOUNT_PERCENT) > 0).length;

  return {
    globalDiscountPercent,
    totalProducts,
    customDiscountCount,
    syncedWithGlobalCount: totalProducts - customDiscountCount,
    activeDiscountedCount
  };
};

// Apply a new storewide discount percentage to all products and variants atomically
const applyGlobalProductDiscount = async (rawDiscountPercent) => {
  const discountPercent = parseAndValidateDiscountPercent(rawDiscountPercent);

  const result = await prisma.$transaction(async (tx) => {
    await tx.systemSetting.upsert({
      where: { key: GLOBAL_DISCOUNT_SETTING_KEY },
      update: {
        value: String(discountPercent),
        description: "Default storewide product discount percentage managed by Sales Staff"
      },
      create: {
        key: GLOBAL_DISCOUNT_SETTING_KEY,
        value: String(discountPercent),
        description: "Default storewide product discount percentage managed by Sales Staff"
      }
    });

    const allProducts = await tx.product.findMany({
      include: { variants: true }
    });

    let updatedProductCount = 0;
    let updatedVariantCount = 0;

    for (const product of allProducts) {
      const baseOriginal = resolveOriginalPrice(product);
      const nextBaseSelling = calculateDiscountedPrice(baseOriginal, discountPercent);

      await tx.product.update({
        where: { id: product.id },
        data: {
          originalPrice: baseOriginal,
          discountPercent,
          price: nextBaseSelling
        }
      });
      updatedProductCount += 1;

      if (Array.isArray(product.variants) && product.variants.length > 0) {
        for (const variant of product.variants) {
          const variantOriginal = resolveOriginalPrice(variant);
          const nextVariantSelling = calculateDiscountedPrice(variantOriginal, discountPercent);

          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              originalPrice: variantOriginal,
              discountPercent,
              price: nextVariantSelling
            }
          });
          updatedVariantCount += 1;
        }
      }
    }

    return {
      globalDiscountPercent: discountPercent,
      updatedProductCount,
      updatedVariantCount
    };
  });

  return result;
};

// Update the discount percentage for a single product and all of its thickness variants
const updateSingleProductDiscount = async (productId, rawDiscountPercent) => {
  const parsedId = parseInt(productId, 10);
  if (Number.isNaN(parsedId)) {
    const err = new Error("Invalid product ID provided.");
    err.statusCode = 400;
    throw err;
  }

  const discountPercent = parseAndValidateDiscountPercent(rawDiscountPercent);

  const updatedProduct = await prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({
      where: { id: parsedId },
      include: { variants: true }
    });

    if (!existing) {
      const err = new Error("Product not found.");
      err.statusCode = 404;
      throw err;
    }

    const baseOriginal = resolveOriginalPrice(existing);
    const nextBaseSelling = calculateDiscountedPrice(baseOriginal, discountPercent);

    await tx.product.update({
      where: { id: parsedId },
      data: {
        originalPrice: baseOriginal,
        discountPercent,
        price: nextBaseSelling
      }
    });

    if (Array.isArray(existing.variants) && existing.variants.length > 0) {
      for (const variant of existing.variants) {
        const variantOriginal = resolveOriginalPrice(variant);
        const nextVariantSelling = calculateDiscountedPrice(variantOriginal, discountPercent);

        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            originalPrice: variantOriginal,
            discountPercent,
            price: nextVariantSelling
          }
        });
      }
    }

    return tx.product.findUnique({
      where: { id: parsedId },
      include: {
        variants: {
          orderBy: { price: "asc" }
        }
      }
    });
  });

  return updatedProduct;
};

module.exports = {
  GLOBAL_DISCOUNT_SETTING_KEY,
  DEFAULT_DISCOUNT_PERCENT,
  parseAndValidateDiscountPercent,
  calculateDiscountedPrice,
  resolveOriginalPrice,
  getGlobalProductDiscountPercent,
  getGlobalDiscountOverview,
  applyGlobalProductDiscount,
  updateSingleProductDiscount
};
