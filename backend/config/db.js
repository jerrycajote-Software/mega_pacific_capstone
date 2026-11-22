require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma");
const { parse } = require("pg-connection-string");

const config = parse(process.env.DATABASE_URL);
config.password = String(config.password);

// Keep default pool size at 10 so Supabase Free Tier Session Pooler (max 15 clients) is never exhausted
const parsedPoolMax = parseInt(process.env.DB_POOL_MAX, 10);
config.max = Number.isInteger(parsedPoolMax) && parsedPoolMax > 0 ? parsedPoolMax : 10;
config.idleTimeoutMillis = 30000;
config.connectionTimeoutMillis = 10000;

const pool = new Pool(config);
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
