require("dotenv").config();
const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

module.exports = prisma;
