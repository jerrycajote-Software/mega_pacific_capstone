import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { isCustomLengthProfile } from '../pages/customer/buildProductOptions';

// Compute line subtotal for a single checkout item using the same rounding as the backend
const computeCheckoutItemSubtotal = (item) => {
  const isCustomEligible = isCustomLengthProfile(item?.product?.type || item?.type);
  const isPerMeter =
    isCustomEligible &&
    (item?.product?.unit === 'per meter' ||
      item?.product?.unit === 'meter' ||
      item?.product?.isPreOrder);
  const lengthMultiplier = isPerMeter && item?.customLength ? Number(item.customLength) : 1;
  const unitPrice = Number(item?.variant?.price ?? item?.product?.price ?? item?.price ?? 0);
  const qty = parseInt(item?.quantity, 10) || 1;
  return Math.round(unitPrice * lengthMultiplier * qty * 100) / 100;
};

const computeCheckoutItemsTotal = (items = []) => {
  const sum = items.reduce((acc, item) => acc + computeCheckoutItemSubtotal(item), 0);
  return Math.round(sum * 100) / 100;
};

// Synchronizes live product and variant prices on Checkout when Sales updates discounts
export const useCheckoutLivePrices = ({
  orderItems,
  setOrderItems,
  token,
  disabled = false,
  onPricesChanged
}) => {
  const [priceUpdateNotice, setPriceUpdateNotice] = useState(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  const orderItemsRef = useRef(orderItems);
  const onPricesChangedRef = useRef(onPricesChanged);
  const refreshingRef = useRef(false);

  useEffect(() => {
    orderItemsRef.current = orderItems;
  }, [orderItems]);

  useEffect(() => {
    onPricesChangedRef.current = onPricesChanged;
  }, [onPricesChanged]);

  const dismissPriceUpdateNotice = useCallback(() => {
    setPriceUpdateNotice(null);
  }, []);

  // Re-fetch live product and variant pricing from the server and update orderItems if anything changed
  const refreshLivePrices = useCallback(async ({ silentIfUnchanged = true } = {}) => {
    const currentItems = orderItemsRef.current || [];
    if (disabled || currentItems.length === 0 || refreshingRef.current) {
      return {
        changed: false,
        previousTotal: computeCheckoutItemsTotal(currentItems),
        updatedTotal: computeCheckoutItemsTotal(currentItems)
      };
    }

    const uniqueProductIds = Array.from(
      new Set(
        currentItems
          .map((item) => item?.product?.id || item?.productId || item?.id)
          .filter(Boolean)
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id))
      )
    );

    if (uniqueProductIds.length === 0) {
      return {
        changed: false,
        previousTotal: computeCheckoutItemsTotal(currentItems),
        updatedTotal: computeCheckoutItemsTotal(currentItems)
      };
    }

    refreshingRef.current = true;
    setIsRefreshingPrices(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const responses = await Promise.allSettled(
        uniqueProductIds.map((productId) =>
          axios.get(`${API_URL}/api/customer/products/${productId}`, { headers })
        )
      );

      const latestByProductId = new Map();
      responses.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value?.data?.success && res.value?.data?.data) {
          latestByProductId.set(uniqueProductIds[idx], res.value.data.data);
        }
      });

      if (latestByProductId.size === 0) {
        const currentTotal = computeCheckoutItemsTotal(currentItems);
        return { changed: false, previousTotal: currentTotal, updatedTotal: currentTotal };
      }

      const previousTotal = computeCheckoutItemsTotal(currentItems);
      let anyPriceOrDiscountChanged = false;

      const updatedItems = currentItems.map((item) => {
        const prodId = Number(item?.product?.id || item?.productId || item?.id);
        const liveProduct = latestByProductId.get(prodId);
        if (!liveProduct) return item;

        const targetVariantId = item?.variant?.id || item?.variantId || null;
        const liveVariant = targetVariantId
          ? (liveProduct.variants || []).find((v) => Number(v.id) === Number(targetVariantId)) || null
          : null;

        const prevUnitPrice = Number(item?.variant?.price ?? item?.product?.price ?? item?.price ?? 0);
        const nextUnitPrice = Number(liveVariant?.price ?? liveProduct.price ?? prevUnitPrice);
        const prevDiscount = Number(
          item?.variant?.discountPercent ?? item?.product?.discountPercent ?? item?.discountPercent ?? 0
        );
        const nextDiscount = Number(
          liveVariant?.discountPercent ?? liveProduct.discountPercent ?? prevDiscount
        );
        const nextOriginalPrice =
          liveVariant?.originalPrice ?? liveProduct.originalPrice ?? item?.originalPrice ?? null;

        if (
          Math.abs(prevUnitPrice - nextUnitPrice) > 0.001 ||
          Math.abs(prevDiscount - nextDiscount) > 0.001
        ) {
          anyPriceOrDiscountChanged = true;
        }

        return {
          ...item,
          product: {
            ...(item.product || {}),
            ...liveProduct
          },
          variant: liveVariant
            ? { ...(item.variant || {}), ...liveVariant }
            : item.variant,
          price: nextUnitPrice,
          originalPrice: nextOriginalPrice,
          discountPercent: nextDiscount
        };
      });

      const updatedTotal = computeCheckoutItemsTotal(updatedItems);

      if (anyPriceOrDiscountChanged) {
        setOrderItems(updatedItems);
        const notice = {
          previousTotal,
          updatedTotal,
          direction: updatedTotal < previousTotal ? 'decreased' : updatedTotal > previousTotal ? 'increased' : 'updated',
          updatedAt: Date.now()
        };
        setPriceUpdateNotice(notice);
        if (onPricesChangedRef.current) {
          onPricesChangedRef.current(notice);
        }
        return { changed: true, previousTotal, updatedTotal };
      }

      if (!silentIfUnchanged) {
        setPriceUpdateNotice(null);
      }

      return { changed: false, previousTotal, updatedTotal };
    } catch (err) {
      console.warn('Live checkout price sync skipped:', err?.message);
      const currentTotal = computeCheckoutItemsTotal(currentItems);
      return { changed: false, previousTotal: currentTotal, updatedTotal: currentTotal };
    } finally {
      refreshingRef.current = false;
      setIsRefreshingPrices(false);
    }
  }, [disabled, setOrderItems, token]);

  // Verify live prices once on mount and subscribe to real-time Sales catalog updates
  useEffect(() => {
    if (disabled) return undefined;

    refreshLivePrices({ silentIfUnchanged: true });

    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL);

    const handleCatalogUpdate = (payload) => {
      const action = payload?.action;
      if (
        action === 'global_discount_updated' ||
        action === 'product_discount_updated' ||
        action === 'update' ||
        !action
      ) {
        refreshLivePrices({ silentIfUnchanged: true });
      }
    };

    socket.on('product_catalog_updated', handleCatalogUpdate);

    return () => {
      socket.off('product_catalog_updated', handleCatalogUpdate);
      socket.close();
    };
  }, [disabled, refreshLivePrices]);

  return {
    priceUpdateNotice,
    isRefreshingPrices,
    refreshLivePrices,
    dismissPriceUpdateNotice
  };
};
