const prisma = require("../../config/db");


const getProductTypes = async (req, res) => {
  try {
    
    if (!prisma) {
      console.error("ProductType: Prisma client is not initialized. Check config/db.js");
      return res.status(500).json({ error: "Database client is not available" });
    }
    if (!prisma.productType) {
      console.error(
        "ProductType: prisma.productType is undefined. " +
        "The Prisma Client likely needs to be regenerated. " +
        "Run: npx prisma migrate dev --name add_product_type_table"
      );
      return res.status(500).json({
        error: "ProductType model is not available. Prisma Client may need regeneration.",
      });
    }

    const types = await prisma.productType.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json(types);
  } catch (error) {
    console.error("Failed to fetch product types:", error);
    res.status(500).json({ error: "Failed to fetch product types" });
  }
};


const createProductType = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Type name is required" });
  }

  try {
    
    if (!prisma || !prisma.productType) {
      console.error(
        "ProductType: prisma.productType is undefined. " +
        "Run: npx prisma migrate dev --name add_product_type_table"
      );
      return res.status(500).json({
        error: "ProductType model is not available. Prisma Client may need regeneration.",
      });
    }

    
    const existing = await prisma.productType.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: "A product type with this name already exists" });
    }

    const productType = await prisma.productType.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    res.status(201).json(productType);
  } catch (error) {
    console.error("Failed to create product type:", error);
    res.status(500).json({ error: "Failed to create product type" });
  }
};

module.exports = {
  getProductTypes,
  createProductType,
};

