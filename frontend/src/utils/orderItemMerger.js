import { isCustomLengthProfile } from '../pages/customer/buildProductOptions';

const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

const normalizeId = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? String(value).trim() : parsed;
};

const normalizeLength = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
};

// Check whether two order items represent the exact same product and specifications
export const isSameOrderItem = (itemA, itemB) => {
  if (!itemA || !itemB) return false;

  const productIdA = normalizeId(itemA?.product?.id ?? itemA?.productId);
  const productIdB = normalizeId(itemB?.product?.id ?? itemB?.productId);
  if (productIdA === null || productIdA !== productIdB) return false;

  const variantIdA = normalizeId(itemA?.variant?.id ?? itemA?.variantId);
  const variantIdB = normalizeId(itemB?.variant?.id ?? itemB?.variantId);
  if (variantIdA !== variantIdB) return false;

  if (normalizeLength(itemA?.customLength) !== normalizeLength(itemB?.customLength)) return false;
  if (normalizeText(itemA?.color) !== normalizeText(itemB?.color)) return false;
  if (normalizeText(itemA?.thickness) !== normalizeText(itemB?.thickness)) return false;

  return true;
};

// Compute the rounded line total for an order item at a given quantity
export const computeOrderItemTotal = (item, quantityOverride) => {
  const qty = Math.max(1, parseInt(quantityOverride ?? item?.quantity, 10) || 1);
  const isCustomEligible = isCustomLengthProfile(item?.product?.type || item?.type);
  const unitStr = normalizeText(item?.product?.unit);
  const isPerMeter =
    isCustomEligible &&
    (unitStr === 'per meter' ||
      unitStr === 'meter' ||
      unitStr.includes('meter') ||
      !item?.product?.unit ||
      Boolean(item?.product?.isPreOrder));

  const lengthMultiplier = isPerMeter && item?.customLength ? Number(item.customLength) : 1;
  const unitPrice = Number(item?.variant?.price ?? item?.price ?? item?.product?.price ?? 0);
  return Math.round(unitPrice * lengthMultiplier * qty * 100) / 100;
};

// Combine an incoming item with a matching item in the list, or append it if distinct
export const mergeOrderItemIntoList = (items = [], incomingItem) => {
  if (!incomingItem) return Array.isArray(items) ? items : [];

  const list = Array.isArray(items) ? items : [];
  const incomingQty = Math.max(1, parseInt(incomingItem.quantity, 10) || 1);
  const existingIdx = list.findIndex((item) => isSameOrderItem(item, incomingItem));

  if (existingIdx > -1) {
    const updated = [...list];
    const existing = updated[existingIdx];
    const existingQty = Math.max(1, parseInt(existing.quantity, 10) || 1);
    const combinedQty = existingQty + incomingQty;

    updated[existingIdx] = {
      ...existing,
      quantity: combinedQty,
      total: computeOrderItemTotal(existing, combinedQty)
    };
    return updated;
  }

  return [
    ...list,
    {
      ...incomingItem,
      quantity: incomingQty,
      total: incomingItem.total ?? computeOrderItemTotal(incomingItem, incomingQty)
    }
  ];
};

// Deduplicate and combine matching items across an entire order item array
export const mergeOrderItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.reduce((merged, item) => mergeOrderItemIntoList(merged, item), []);
};
