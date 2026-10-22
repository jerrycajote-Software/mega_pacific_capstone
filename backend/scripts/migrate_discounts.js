const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function run() {
  const config = parse(process.env.DATABASE_URL);
  config.password = String(config.password);
  const pool = new Pool(config);

  const client = await pool.connect();
  try {
    console.log("Connected to database. Applying schema updates...");

    
    await client.query(`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "discountPercent" DOUBLE PRECISION DEFAULT 30;
    `);
    console.log("Added originalPrice and discountPercent columns to Product table.");

    
    await client.query(`
      ALTER TABLE "ProductVariant" 
      ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "discountPercent" DOUBLE PRECISION DEFAULT 30;
    `);
    console.log("Added originalPrice and discountPercent columns to ProductVariant table.");

    
    const resProducts = await client.query(`
      UPDATE "Product"
      SET 
        "originalPrice" = "price",
        "price" = ROUND(("price" * 0.70)::numeric, 2)::double precision,
        "discountPercent" = 30
      WHERE "originalPrice" IS NULL
      RETURNING id, name, "originalPrice", "price", "discountPercent";
    `);
    console.log(`Updated ${resProducts.rowCount} existing products with less 30% discount:`);
    console.log(resProducts.rows);

    // 4. Update existing ProductVariant records
    const resVariants = await client.query(`
      UPDATE "ProductVariant"
      SET 
        "originalPrice" = "price",
        "price" = ROUND(("price" * 0.70)::numeric, 2)::double precision,
        "discountPercent" = 30
      WHERE "originalPrice" IS NULL
      RETURNING id, name, "originalPrice", "price", "discountPercent";
    `);
    console.log(`Updated ${resVariants.rowCount} existing variants with less 30% discount:`);
    console.log(resVariants.rows);

    console.log("Migration and data update completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
