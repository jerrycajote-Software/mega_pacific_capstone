// Concurrency helpers for PostgreSQL row-level locking and safe conflict detection

const lockCoilInventoryRowById = async (tx, coilId) => {
  const parsedId = parseInt(coilId, 10);
  if (Number.isNaN(parsedId)) return null;

  const rows = await tx.$queryRaw`
    SELECT * FROM "CoilInventory"
    WHERE "id" = ${parsedId}
    FOR UPDATE
  `;

  return rows && rows.length > 0 ? rows[0] : null;
};

const lockCoilInventoryRowBySpec = async (tx, thickness, color) => {
  if (!thickness || !color) return null;

  const thicknessPattern = `%${String(thickness).trim()}%`;
  const cleanColor = String(color).trim();

  // Lock the matching coil row inside the active transaction to prevent concurrent overselling
  const rows = await tx.$queryRaw`
    SELECT * FROM "CoilInventory"
    WHERE "thickness" ILIKE ${thicknessPattern}
      AND LOWER("color") = LOWER(${cleanColor})
    ORDER BY "id" ASC
    LIMIT 1
    FOR UPDATE
  `;

  return rows && rows.length > 0 ? rows[0] : null;
};

const lockOrderRowById = async (tx, orderId) => {
  const parsedId = parseInt(orderId, 10);
  if (Number.isNaN(parsedId)) return null;

  const rows = await tx.$queryRaw`
    SELECT * FROM "Order"
    WHERE "id" = ${parsedId}
    FOR UPDATE
  `;

  return rows && rows.length > 0 ? rows[0] : null;
};

const lockUserRowById = async (tx, userId) => {
  const parsedId = parseInt(userId, 10);
  if (Number.isNaN(parsedId)) return null;

  const rows = await tx.$queryRaw`
    SELECT "id", "email", "role", "status", "isEmailVerified", "otpCode", "otpExpiresAt", "resetOtpCode", "resetOtpExpiresAt"
    FROM "User"
    WHERE "id" = ${parsedId}
    FOR UPDATE
  `;

  return rows && rows.length > 0 ? rows[0] : null;
};

const isUniqueConstraintError = (error) => {
  return Boolean(error && error.code === "P2002");
};

module.exports = {
  lockCoilInventoryRowById,
  lockCoilInventoryRowBySpec,
  lockOrderRowById,
  lockUserRowById,
  isUniqueConstraintError
};
