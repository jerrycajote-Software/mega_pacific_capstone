const prisma = require("../config/db");

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

const THICKNESSES = ["0.35mm", "0.40mm", "0.50mm", "0.60mm"];

const SEED_PROFILES = [
  {
    name: "Pico Rib",
    type: "Rib Type",
    effectiveWidth: 1.013,
    nominalWidth: 1.120,
    ribHeight: 28,
    thickness: "0.35mm",
    originalPrice: 340.00,
    unit: "per meter",
    description: "Premium architectural roofing profile engineered for superior water run-off and durability. Features 28mm rib height with an effective coverage of 1.013m.",
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 340.00, price: 340.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 368.00, price: 368.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 469.00, price: 469.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 557.00, price: 557.00 * 0.70, stock: 9999, status: "available" }
    ]
  },
  {
    name: "Agua Corr",
    type: "Corrugated",
    effectiveWidth: 0.912,
    nominalWidth: 1.080,
    ribHeight: 18,
    thickness: "0.35mm",
    originalPrice: 340.00,
    unit: "per meter",
    description: "Classic sinusoidal corrugated design with 18mm depth, engineered for structural versatility and timeless aesthetics. Effective width 0.912m.",
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 340.00, price: 340.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 368.00, price: 368.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 469.00, price: 469.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 557.00, price: 557.00 * 0.70, stock: 9999, status: "available" }
    ]
  },
  {
    name: "Mega Hi-rib",
    type: "Rib Type",
    effectiveWidth: 0.900,
    nominalWidth: 1.003,
    ribHeight: 51,
    thickness: "0.35mm",
    originalPrice: 340.00,
    unit: "per meter",
    description: "High-crest industrial rib roofing with an aggressive 51mm rib height designed for high rainfall volume and heavy industrial spans. Effective width 0.900m.",
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 340.00, price: 340.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 368.00, price: 368.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 469.00, price: 469.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 557.00, price: 557.00 * 0.70, stock: 9999, status: "available" }
    ]
  },
  {
    name: "Mega Twin Rib",
    type: "Rib Type",
    effectiveWidth: 0.945,
    nominalWidth: 1.053,
    ribHeight: 28,
    thickness: "0.35mm",
    originalPrice: 340.00,
    unit: "per meter",
    description: "Dual-flute rib architecture offering reinforced longitudinal rigidity and seamless anti-siphon side laps. Effective width 0.945m.",
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 340.00, price: 340.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 368.00, price: 368.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 469.00, price: 469.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 557.00, price: 557.00 * 0.70, stock: 9999, status: "available" }
    ]
  },
  {
    name: "Mega S-Rib",
    type: "Rib Type",
    effectiveWidth: 0.490,
    nominalWidth: 0.500,
    ribHeight: 62,
    thickness: "0.35mm",
    originalPrice: 187.00,
    unit: "per meter",
    description: "Heavy-duty standing-seam style S-rib profile with a bold 62mm rib height for steep slopes and modern architectural accents. Effective width 0.490m.",
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 187.00, price: 187.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 203.00, price: 203.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 256.00, price: 256.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 307.00, price: 307.00 * 0.70, stock: 9999, status: "available" }
    ]
  },
  {
    name: "Hermosa Tile",
    type: "Tile Profile",
    effectiveWidth: 1.005,
    nominalWidth: 1.060,
    ribHeight: 25,
    thickness: "0.35mm",
    originalPrice: 347.00,
    unit: "per meter",
    description: "Mediterranean-inspired step tile profile with elegant curves and high wind resistance, providing residential luxury roofing aesthetics. Effective width 1.005m.",
    variants: [
      { name: "0.35mm Thickness", thickness: "0.35mm", originalPrice: 347.00, price: 347.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.40mm Thickness", thickness: "0.40mm", originalPrice: 400.00, price: 400.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.50mm Thickness", thickness: "0.50mm", originalPrice: 520.00, price: 520.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.60mm Thickness", thickness: "0.60mm", originalPrice: 645.00, price: 645.00 * 0.70, stock: 9999, status: "available" }
    ]
  },
  {
    name: "Ridge Roll",
    type: "Accessories",
    effectiveWidth: 0.450,
    nominalWidth: 0.450,
    ribHeight: null,
    thickness: "0.40mm",
    originalPrice: 280.00,
    unit: "per piece",
    description: "Standard 8-foot (2.44m) pre-painted ridge roll designed to cap and protect roof apex ridges against rainwater intrusion.",
    variants: [
      { name: "0.40mm Thickness (2.44m)", thickness: "0.40mm", originalPrice: 280.00, price: 280.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.50mm Thickness (2.44m)", thickness: "0.50mm", originalPrice: 350.00, price: 350.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.60mm Thickness (2.44m)", thickness: "0.60mm", originalPrice: 420.00, price: 420.00 * 0.70, stock: 9999, status: "available" }
    ]
  },
  {
    name: "Roof Flashing & Capping",
    type: "Accessories",
    effectiveWidth: 0.450,
    nominalWidth: 0.450,
    ribHeight: null,
    thickness: "0.40mm",
    originalPrice: 260.00,
    unit: "per piece",
    description: "Precision-bent 8-foot (2.44m) wall flashing and end capping designed for watertight transitions at parapets and roof wall junctions.",
    variants: [
      { name: "0.40mm Thickness (2.44m)", thickness: "0.40mm", originalPrice: 260.00, price: 260.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.50mm Thickness (2.44m)", thickness: "0.50mm", originalPrice: 330.00, price: 330.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.60mm Thickness (2.44m)", thickness: "0.60mm", originalPrice: 395.00, price: 395.00 * 0.70, stock: 9999, status: "available" }
    ]
  },
  {
    name: "Pre-painted Box Gutter",
    type: "Accessories",
    effectiveWidth: 0.600,
    nominalWidth: 0.600,
    ribHeight: null,
    thickness: "0.40mm",
    originalPrice: 320.00,
    unit: "per piece",
    description: "Durable box gutter 8-foot (2.44m) section engineered for high-volume storm water discharge and rainwater harvesting.",
    variants: [
      { name: "0.40mm Thickness (2.44m)", thickness: "0.40mm", originalPrice: 320.00, price: 320.00 * 0.70, stock: 9999, status: "available" },
      { name: "0.50mm Thickness (2.44m)", thickness: "0.50mm", originalPrice: 395.00, price: 395.00 * 0.70, stock: 9999, status: "available" }
    ]
  },
  {
    name: "Self-Drilling Texscrews (Box of 100)",
    type: "Fasteners",
    effectiveWidth: null,
    nominalWidth: null,
    ribHeight: null,
    thickness: null,
    originalPrice: 350.00,
    unit: "per box",
    description: "Heavy-duty #12 x 55mm self-drilling hex washer head roofing screws with EPDM weather-seal vulcanized washers.",
    variants: [
      { name: "2\" #12x55mm Texscrews (Box)", thickness: null, originalPrice: 350.00, price: 350.00 * 0.70, stock: 9999, status: "available" },
      { name: "2.5\" #12x65mm Texscrews (Box)", thickness: null, originalPrice: 420.00, price: 420.00 * 0.70, stock: 9999, status: "available" }
    ]
  }
];

async function seed() {
  console.log("Seeding raw material Coil Inventory...");
  for (const thickness of THICKNESSES) {
    for (const color of COIL_COLORS) {
      const initialCount = Math.floor(Math.random() * 3) + 1; 
      await prisma.coilInventory.upsert({
        where: {
          thickness_color: {
            thickness,
            color
          }
        },
        update: {
          coilCount: initialCount,
          minAlertCount: 1
        },
        create: {
          name: "Steel Coil",
          thickness,
          color,
          coilCount: initialCount,
          minAlertCount: 1,
          availableMeters: initialCount * 1200,
          minAlertMeters: 250
        }
      });
    }
  }
  console.log("Coil Inventory seeded successfully (14 colors across 4 thicknesses).");

  console.log("Seeding / updating Pre-Order Products from Price List...");
  for (const p of SEED_PROFILES) {
    const sellingPrice = p.originalPrice * 0.70;
    const existing = await prisma.product.findUnique({
      where: { name: p.name }
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          isPreOrder: true,
          effectiveWidth: p.effectiveWidth,
          nominalWidth: p.nominalWidth,
          ribHeight: p.ribHeight,
          thickness: p.thickness,
          colors: COIL_COLORS,
          maxMeters: 21.0,
          originalPrice: p.originalPrice,
          price: sellingPrice
        }
      });

      
      const existingVars = await prisma.productVariant.findMany({ where: { productId: existing.id } });
      for (const vTarget of p.variants) {
        const match = existingVars.find(
          (cv) =>
            (vTarget.thickness && cv.thickness && cv.thickness.toLowerCase().trim() === vTarget.thickness.toLowerCase().trim()) ||
            (vTarget.thickness && cv.name && cv.name.toLowerCase().includes(vTarget.thickness.toLowerCase())) ||
            (vTarget.name && cv.name && cv.name.toLowerCase().trim() === vTarget.name.toLowerCase().trim())
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
        } else {
          await prisma.productVariant.create({
            data: {
              productId: existing.id,
              name: vTarget.name,
              thickness: vTarget.thickness,
              originalPrice: vTarget.originalPrice,
              price: vTarget.price,
              discountPercent: 30,
              status: "available",
              stock: 9999
            }
          });
        }
      }
      console.log(`Updated existing product ${p.name} with pre-order dimensions, 14 colors, and thickness variants.`);
    } else {
      await prisma.product.create({
        data: {
          name: p.name,
          type: p.type,
          description: p.description,
          price: sellingPrice,
          originalPrice: p.originalPrice,
          discountPercent: 30,
          unit: p.unit,
          stock: 9999,
          isPreOrder: true,
          effectiveWidth: p.effectiveWidth,
          nominalWidth: p.nominalWidth,
          ribHeight: p.ribHeight,
          thickness: p.thickness,
          colors: COIL_COLORS,
          maxMeters: 21.0,
          variants: {
            create: p.variants
          }
        }
      });
      console.log(`Created pre-order product ${p.name} with thickness variants and 14 colors.`);
    }
  }

  console.log("Pre-Order Products and Coil Inventory Seeding Complete!");
}

if (require.main === module) {
  seed()
    .catch((err) => {
      console.error("Seeding error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
}

module.exports = { seedCoilsAndProducts: seed };
