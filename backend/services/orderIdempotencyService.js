const prisma = require("../config/db");

const IDEMPOTENCY_PREFIX = "order_idempotency_";
const PAYMONGO_PREFIX = "order_paymongo_";

// Sanitize client-generated idempotency keys to safe alphanumeric tokens
const sanitizeIdempotencyToken = (rawToken) => {
  if (!rawToken || typeof rawToken !== "string") return null;
  const cleaned = rawToken.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  if (cleaned.length < 8 || cleaned.length > 90) return null;
  return cleaned;
};

const buildRequestSettingKey = (clientRequestId) => {
  const token = sanitizeIdempotencyToken(clientRequestId);
  return token ? `${IDEMPOTENCY_PREFIX}${token}` : null;
};

const buildPaymongoSettingKey = (paymentIntentId) => {
  const token = sanitizeIdempotencyToken(paymentIntentId);
  return token ? `${PAYMONGO_PREFIX}${token}` : null;
};

// Look up an already-created order matching this checkout request ID or PayMongo intent ID
const findExistingOrderByIdempotency = async ({ userId, clientRequestId, paymentIntentId }) => {
  const keysToCheck = [
    buildRequestSettingKey(clientRequestId),
    buildPaymongoSettingKey(paymentIntentId)
  ].filter(Boolean);

  if (keysToCheck.length === 0) return null;

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: keysToCheck } }
  });

  for (const setting of settings) {
    try {
      const parsed = JSON.parse(setting.value);
      const savedOrderId = parseInt(parsed?.orderId, 10);
      const savedUserId = parseInt(parsed?.userId, 10);
      if (Number.isNaN(savedOrderId)) continue;
      if (userId && !Number.isNaN(savedUserId) && savedUserId !== parseInt(userId, 10)) {
        continue;
      }

      const existingOrder = await prisma.order.findUnique({
        where: { id: savedOrderId },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, type: true } },
              variant: { select: { id: true, name: true, price: true } }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              customerProfile: { select: { name: true } }
            }
          }
        }
      });

      if (existingOrder) {
        return existingOrder;
      }
    } catch {
      // Ignore malformed legacy entries
    }
  }

  return null;
};

// Persist checkout idempotency keys atomically inside the order creation transaction
const recordOrderIdempotencyInTx = async (tx, { orderId, userId, clientRequestId, paymentIntentId }) => {
  const entries = [];
  const reqKey = buildRequestSettingKey(clientRequestId);
  const paymongoKey = buildPaymongoSettingKey(paymentIntentId);
  const serializedValue = JSON.stringify({
    orderId: parseInt(orderId, 10),
    userId: parseInt(userId, 10),
    createdAt: new Date().toISOString()
  });

  if (reqKey) {
    entries.push({
      key: reqKey,
      value: serializedValue,
      description: `Checkout idempotency record for Order #ORD-${orderId}`
    });
  }

  if (paymongoKey) {
    entries.push({
      key: paymongoKey,
      value: serializedValue,
      description: `PayMongo payment intent linkage for Order #ORD-${orderId}`
    });
  }

  for (const entry of entries) {
    await tx.systemSetting.create({ data: entry });
  }
};

module.exports = {
  sanitizeIdempotencyToken,
  findExistingOrderByIdempotency,
  recordOrderIdempotencyInTx
};
