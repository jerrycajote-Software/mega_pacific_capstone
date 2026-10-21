const prisma = require('../config/db.js');

async function main() {
  console.log('Starting address migration...');
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { address: { not: null } },
        { city: { not: null } },
        { province: { not: null } },
        { zipCode: { not: null } },
        { contactNumber: { not: null } },
      ],
    },
  });

  console.log(`Found ${users.length} users with legacy address data.`);

  for (const user of users) {
    if (user.address || user.city || user.province || user.zipCode || user.contactNumber) {
      await prisma.address.create({
        data: {
          userId: user.id,
          contactNumber: user.contactNumber || '',
          address: user.address || '',
          city: user.city || '',
          province: user.province || '',
          zipCode: user.zipCode || '',
          isDefault: true,
        },
      });
      console.log(`Created default address for user ${user.id} (${user.email})`);
    }
  }

  console.log('Migration completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
