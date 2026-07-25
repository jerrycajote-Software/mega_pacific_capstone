const prisma = require('./config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
  try {
    const email = 'admin@megapacific.com';
    const password = 'megapacific@123';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return console.log('USER NOT FOUND');
    console.log('1. User found:', user.email, '| Role:', user.role);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('2. Password match:', isMatch);
    if (!isMatch) return;

    const sessionToken = crypto.randomUUID();
    await prisma.user.update({
      where: { id: user.id },
      data: { sessionToken }
    });
    console.log('3. sessionToken updated:', sessionToken);

    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ userId: user.id, role: user.role, sessionToken }, jwtSecret, { expiresIn: '1d' });
    console.log('4. JWT token generated successfully');
    console.log('LOGIN WOULD SUCCEED!');

  } catch (err) {
    console.error('FAILURE:', err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
