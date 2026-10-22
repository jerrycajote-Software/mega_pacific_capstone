const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const { seedCoilsAndProducts } = require("./seed_coils_and_products");

async function main() {
  console.log("Starting database initialization...");

  // 1. Seed Super Admin account if none exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { role: "super_admin" },
        { role: "superadmin" },
        { email: process.env.SEED_SUPERADMIN_EMAIL || "superadmin@megapacific.com" }
      ]
    },
  });

  if (existingSuperAdmin) {
    console.log(`Super Admin account already exists with email: ${existingSuperAdmin.email}. Skipping creation.`);
  } else {
    console.log("No super admin account found. Creating default Super Admin account...");
    const superAdminEmail = process.env.SEED_SUPERADMIN_EMAIL || "superadmin@megapacific.com";
    const superAdminPassword = process.env.SEED_SUPERADMIN_PASSWORD || "SuperAdmin@2026!";
    const superAdminName = process.env.SEED_SUPERADMIN_NAME || "Super Admin";
    const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedSuperAdminPassword,
        role: "super_admin",
        status: "active",
        isEmailVerified: true,
        superAdminProfile: {
          create: {
            name: superAdminName,
          },
        },
      },
    });

    console.log(`Super Admin account created successfully with email: ${superAdmin.email}`);
  }

  // 2. Seed Admin account if none exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  if (existingAdmin) {
    console.log(`Admin account already exists with email: ${existingAdmin.email}. Skipping creation.`);
  } else {
    console.log("No admin account found. Creating default admin account...");
    const defaultAdminEmail = process.env.SEED_ADMIN_EMAIL || "admin@megapacific.com";
    const defaultAdminPassword = process.env.SEED_ADMIN_PASSWORD || "megapacific@123";
    const defaultAdminName = process.env.SEED_ADMIN_NAME || "System Admin";
    const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: defaultAdminEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
        isEmailVerified: true,
        adminProfile: {
          create: {
            name: defaultAdminName,
          },
        },
      },
    });

    console.log(`Default admin account created successfully with email: ${admin.email}`);
  }

  // 3. Seed master steel coils and official pre-order roofing profiles
  await seedCoilsAndProducts();
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
