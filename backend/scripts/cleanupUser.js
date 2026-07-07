require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const prisma = require('../config/db');

async function main() {
  const users = await prisma.user.findMany({
    where: { email: 'jerrycajote5@gmail.com' },
    select: { id: true, email: true, isEmailVerified: true, createdAt: true }
  });
  console.log(JSON.stringify(users, null, 2));
  if (users.length > 0) {
    console.log('\n⚠️  User already exists in DB from a failed registration attempt or previous session.');
    console.log('Soft deleting user so the restoration flow can be tested...');
    await prisma.user.update({
      where: { email: 'jerrycajote5@gmail.com' },
      data: { status: 'deleted', deletedAt: new Date() }
    });
    console.log('✅ Soft-deleted user.');
  } else {
    console.log('✅ No duplicate user found — registration should work fine.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
