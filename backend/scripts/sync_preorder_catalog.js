const prisma = require("../config/db");

const OFFICIAL_PROFILES = [
  {
    id: 20,
    name: "Pico Rib",
    type: "Rib Type",
    effectiveWidth: 1.013,
    nominalWidth: 1.120,
    ribHeight: 28,
    thickness: "0.35mm",
    originalPrice: 340.00,
    price: 238.00,
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 340.00, price: 238.00 },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 368.00, price: 257.60 },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 469.00, price: 328.30 },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 557.00, price: 389.90 }
    ]
  },
  {
    id: 21,
    name: "Agua Corr",
    type: "Corrugated",
    effectiveWidth: 0.912,
    nominalWidth: 1.080,
    ribHeight: 18,
    thickness: "0.35mm",
    originalPrice: 340.00,
    price: 238.00,
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 340.00, price: 238.00 },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 368.00, price: 257.60 },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 469.00, price: 328.30 },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 557.00, price: 389.90 }
    ]
  },
  {
    id: 22,
    name: "Mega Hi-rib",
    type: "Rib Type",
    effectiveWidth: 0.900,
    nominalWidth: 1.003,
    ribHeight: 51,
    thickness: "0.35mm",
    originalPrice: 340.00,
    price: 238.00,
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 340.00, price: 238.00 },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 368.00, price: 257.60 },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 469.00, price: 328.30 },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 557.00, price: 389.90 }
    ]
  },
  {
    id: 23,
    name: "Mega Twin Rib",
    type: "Rib Type",
    effectiveWidth: 0.945,
    nominalWidth: 1.053,
    ribHeight: 28,
    thickness: "0.35mm",
    originalPrice: 340.00,
    price: 238.00,
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 340.00, price: 238.00 },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 368.00, price: 257.60 },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 469.00, price: 328.30 },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 557.00, price: 389.90 }
    ]
  },
  {
    id: 11,
    name: "Mega S-Rib",
    type: "Rib Type",
    effectiveWidth: 0.490,
    nominalWidth: 0.500,
    ribHeight: 62,
    thickness: "0.35mm",
    originalPrice: 187.00,
    price: 130.90,
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 187.00, price: 130.90 },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 203.00, price: 142.10 },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 256.00, price: 179.20 },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 307.00, price: 214.90 }
    ]
  },
  {
    id: 13,
    name: "Hermosa Tile",
    type: "Tile Profile",
    effectiveWidth: 1.005,
    nominalWidth: 1.060,
    ribHeight: 25,
    thickness: "0.35mm",
    originalPrice: 347.00,
    price: 242.90,
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 347.00, price: 242.90 },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 400.00, price: 280.00 },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 520.00, price: 364.00 },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 645.00, price: 451.50 }
    ]
  }
];

const COIL_COLORS = [
  "Marshall Dark Gray",
  "Saipan Brown",
  "Tongan Red",
  "Maori Green",
  "Samoan Beige",
  "Seafoam Green",
  "Fijian White",
  "Hawaiian Blue",
  "Tahiti Grey",
  "Kauai Dark",
  "Aussie Red",
  "New Zealand Green",
  "Nauru Blue",
  "New Guinea Brown"
];

async function sync() {
  console.log("Starting catalog and inventory synchronization...");

  // 1. Separate / Archive legacy inventory products so they do not show in pre-order customer catalog
  const legacyIds = [8, 16, 18, 19];
  for (const legId of legacyIds) {
    const existing = await prisma.product.findUnique({ where: { id: legId } });
    if (existing) {
      await prisma.product.update({
        where: { id: legId },
        data: {
          isPreOrder: false
        }
      });
      console.log(`Legacy product ID ${legId} (${existing.name}) marked as isPreOrder: false`);
    }
  }

  // 2. Synchronize all 6 official Pre-Order products
  for (const prof of OFFICIAL_PROFILES) {
    const prod = await prisma.product.findUnique({
      where: { id: prof.id },
      include: { variants: true }
    });

    if (!prod) {
      console.log(`Product ID ${prof.id} (${prof.name}) not found, skipping.`);
      continue;
    }

    await prisma.product.update({
      where: { id: prof.id },
      data: {
        isPreOrder: true,
        effectiveWidth: prof.effectiveWidth,
        nominalWidth: prof.nominalWidth,
        ribHeight: prof.ribHeight,
        thickness: prof.thickness,
        colors: COIL_COLORS,
        maxMeters: 21.0,
        originalPrice: prof.originalPrice,
        price: prof.price,
        unit: "per meter"
      }
    });

    // Check existing variants
    const currentVariants = prod.variants;
    for (const vTarget of prof.variants) {
      const match = currentVariants.find(
        (cv) =>
          (cv.thickness && cv.thickness.toLowerCase().trim() === vTarget.thickness.toLowerCase().trim()) ||
          (cv.name && cv.name.toLowerCase().includes(vTarget.thickness.toLowerCase()))
      );

      if (match) {
        await prisma.productVariant.update({
          where: { id: match.id },
          data: {
            name: vTarget.name,
            thickness: vTarget.thickness,
            originalPrice: vTarget.originalPrice,
            price: vTarget.price,
            discountPercent: 30,
            status: "available",
            stock: 9999
          }
        });
        console.log(`Updated variant ${vTarget.name} for ${prof.name}`);
      } else {
        await prisma.productVariant.create({
          data: {
            productId: prof.id,
            name: vTarget.name,
            thickness: vTarget.thickness,
            originalPrice: vTarget.originalPrice,
            price: vTarget.price,
            discountPercent: 30,
            status: "available",
            stock: 9999
          }
        });
        console.log(`Created missing variant ${vTarget.name} for ${prof.name}`);
      }
    }
  }

  console.log("Catalog and inventory synchronization completed successfully!");
}

sync()
  .catch((err) => {
    console.error("Sync error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
