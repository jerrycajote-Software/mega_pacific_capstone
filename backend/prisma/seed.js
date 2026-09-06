const prisma = require("../config/db");
const bcrypt = require("bcryptjs");

async function main() {
  console.log("Starting database initialization...");

  
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  if (existingAdmin) {
    console.log(`Admin account already exists with email: ${existingAdmin.email}. Skipping creation.`);
    return;
  }

  
  console.log("No admin account found. Creating default admin account...");
  
  // Use environment variables if set, otherwise fall back to dev defaults
  // WARNING: Change these credentials immediately after first login!
  const defaultAdminEmail = process.env.SEED_ADMIN_EMAIL || "admin@megapacific.com";
  const defaultAdminPassword = process.env.SEED_ADMIN_PASSWORD || "megapacific@123";
  const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: defaultAdminEmail,
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
    },
  });

  console.log(`Default admin account created successfully with email: ${admin.email}`);
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
