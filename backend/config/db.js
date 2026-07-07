require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma");
const { parse } = require("pg-connection-string");

const config = parse(process.env.DATABASE_URL);
config.password = String(config.password);
const pool = new Pool(config);
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
