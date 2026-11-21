const PENDING_RECOVERY_STORAGE_KEY = 'mega_pending_checkout_recovery_v1';
const RECOVERY_TTL_MS = 24 * 60 * 60 * 1000;

// Generate a unique idempotency key for a checkout attempt
export const generateCheckoutRequestId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `chk_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `chk_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

// Detect whether an Axios error was caused by an internet disconnect or lost response
export const isNetworkDisconnectError = (err) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }
  if (!err) return false;
  if (!err.response) return true;
  return err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';
};

// Persist a pending checkout/payment session in localStorage so it survives disconnects or reloads
export const savePendingPaymentRecovery = (sessionData) => {
  if (typeof window === 'undefined' || !sessionData) return;
  try {
    const payload = {
      ...sessionData,
      savedAt: Date.now()
    };
    localStorage.setItem(PENDING_RECOVERY_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Unable to store pending payment recovery snapshot:', err);
  }
};

// Retrieve an active pending payment recovery snapshot for the logged-in customer
export const loadPendingPaymentRecovery = (userId) => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PENDING_RECOVERY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    if (!parsed || !parsed.savedAt || Date.now() - parsed.savedAt > RECOVERY_TTL_MS) {
      localStorage.removeItem(PENDING_RECOVERY_STORAGE_KEY);
      return null;
    }

    if (userId && parsed.userId && String(parsed.userId) !== String(userId)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

// Remove the saved recovery snapshot once the order has been confirmed on the server
export const clearPendingPaymentRecovery = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PENDING_RECOVERY_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup errors
  }
};
