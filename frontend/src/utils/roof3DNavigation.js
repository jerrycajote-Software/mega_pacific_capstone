import {
  STUDIO_HOUSE_ARCHITECTURES,
  hasFixed3DModel,
  getStudioRoofProfileByName,
  getStudioRoofProfileById,
  getStudioHouseById,
  resolveStudioHouseRoofModel,
} from '../services/roofModelRegistry';

// Canonical navigation origins separating Fixed 3D models from full-screen 3D Customization
export const VIEWER_ORIGINS = {
  STUDIO: '3d-customization',
  FIXED: 'fixed-3d',
  CATALOG: 'catalog',
};

const PRODUCT_CONTEXT_STORAGE_KEY = 'mega_pacific_3d_product_context';
const STUDIO_RETURN_STORAGE_KEY = 'mega_pacific_3d_studio_return';
const STUDIO_MOBILE_CONFIRMED_KEY = 'mega_pacific_3d_mobile_confirmed';

// Safely read JSON data from sessionStorage without breaking private browsing modes
const readSessionJson = (key) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Safely persist JSON data in sessionStorage
const writeSessionJson = (key, payload) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or restricted context errors
  }
};

// Record that a mobile customer already accepted the 3D Customization notice in this session
export const markStudioMobileNoticeConfirmed = () => {
  writeSessionJson(STUDIO_MOBILE_CONFIRMED_KEY, { confirmed: true });
};

// Check whether the mobile customer already accepted the 3D Customization notice in this session
export const hasConfirmedStudioMobileNotice = () => {
  const saved = readSessionJson(STUDIO_MOBILE_CONFIRMED_KEY);
  return Boolean(saved?.confirmed);
};

// Pick the residential house architecture that best matches a customer's selected cut length
export const matchStudioHouseByLength = (lengthMeters) => {
  const parsed = parseFloat(lengthMeters);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return STUDIO_HOUSE_ARCHITECTURES[0].id;
  }
  if (parsed <= 3.9) return 'starter_6x6';
  if (parsed <= 4.5) return 'two_storey_8x6';
  if (parsed <= 5.2) return 'single_storey_8x8';
  if (parsed <= 5.7) return 'lshape_balcony_house';
  if (parsed <= 6.5) return 'large_two_storey_10x6';
  return STUDIO_HOUSE_ARCHITECTURES[0].id;
};

// Build the Product Page URL and router state when coming from 3D Customization
export const buildProductNavigationFromStudio = ({
  productId,
  houseId,
  roofId,
  color,
  thickness,
  length,
  quantity,
  viewFullRoof = true,
}) => {
  const validHouse = getStudioHouseById(houseId) || STUDIO_HOUSE_ARCHITECTURES[0];
  const validRoof = getStudioRoofProfileById(roofId);
  const params = new URLSearchParams();
  params.set('from', VIEWER_ORIGINS.STUDIO);
  params.set('house', validHouse.id);

  const statePayload = {
    viewerOrigin: VIEWER_ORIGINS.STUDIO,
    studioHouseId: validHouse.id,
    studioRoofId: validRoof?.id || roofId || null,
    studioViewFullRoof: Boolean(viewFullRoof),
    selectedColor: color,
    selectedThickness: thickness,
    selectedLength: length,
    selectedQuantity: quantity,
    color,
    thickness,
    length,
    quantity,
  };

  writeSessionJson(PRODUCT_CONTEXT_STORAGE_KEY, {
    productId: String(productId),
    ...statePayload,
  });

  return {
    to: `/product/${productId}?${params.toString()}`,
    state: statePayload,
  };
};

// Build the Product Page URL and router state when coming from the Fixed 3D Model Viewer
export const buildProductNavigationFromFixed3D = ({
  productId,
  fixedModelId = null,
  color,
  thickness,
  length,
  quantity,
}) => {
  const params = new URLSearchParams();
  params.set('from', VIEWER_ORIGINS.FIXED);
  if (fixedModelId) {
    params.set('model', fixedModelId);
  }

  const statePayload = {
    viewerOrigin: VIEWER_ORIGINS.FIXED,
    fixedHouseModelId: fixedModelId || null,
    selectedColor: color,
    selectedThickness: thickness,
    selectedLength: length,
    selectedQuantity: quantity,
    color,
    thickness,
    length,
    quantity,
  };

  writeSessionJson(PRODUCT_CONTEXT_STORAGE_KEY, {
    productId: String(productId),
    ...statePayload,
  });

  return {
    to: `/product/${productId}?${params.toString()}`,
    state: statePayload,
  };
};

// Build the 3D Customization URL and restoration payload when returning or opening from a Product Page
export const buildStudioReturnNavigation = ({
  houseId,
  roofId,
  color,
  thickness,
  quantity,
  viewFullRoof,
  skipMobilePrompt = false,
}) => {
  const validHouse = getStudioHouseById(houseId) || STUDIO_HOUSE_ARCHITECTURES[0];
  const validRoof = getStudioRoofProfileById(roofId);
  const resolvedRoofId = validRoof?.id || null;

  const parsedQty = parseInt(quantity, 10);
  const hasValidQty = !Number.isNaN(parsedQty) && parsedQty >= 1;
  let resolvedViewFullRoof = typeof viewFullRoof === 'boolean' ? viewFullRoof : true;
  let resolvedQty = hasValidQty ? parsedQty : validHouse.totalSheets;

  if (resolvedRoofId) {
    const resolvedModel = resolveStudioHouseRoofModel(validHouse.id, resolvedRoofId);
    if (hasValidQty) {
      resolvedQty = Math.min(resolvedModel.totalSheets, parsedQty);
      resolvedViewFullRoof = parsedQty >= resolvedModel.totalSheets;
    } else {
      resolvedQty = resolvedModel.totalSheets;
      resolvedViewFullRoof = true;
    }
  }

  const params = new URLSearchParams();
  params.set('house', validHouse.id);
  if (resolvedRoofId) {
    params.set('roof', resolvedRoofId);
  }

  const statePayload = {
    houseId: validHouse.id,
    roofId: resolvedRoofId,
    color: color || null,
    thickness: thickness || null,
    quantity: resolvedQty,
    viewFullRoof: resolvedViewFullRoof,
    skipMobilePrompt: Boolean(skipMobilePrompt),
  };

  writeSessionJson(STUDIO_RETURN_STORAGE_KEY, statePayload);

  return {
    to: `/3d-customization?${params.toString()}`,
    state: statePayload,
  };
};

// Read refresh-safe Product Page 3D configuration backup when URL query params confirm a 3D origin
export const readProduct3DFallbackState = ({ productId, locationState, searchParams }) => {
  if (locationState && (locationState.selectedColor || locationState.color || locationState.viewerOrigin)) {
    return locationState;
  }

  const urlFrom = searchParams?.get('from');
  if (urlFrom !== VIEWER_ORIGINS.STUDIO && urlFrom !== VIEWER_ORIGINS.FIXED) {
    return null;
  }

  const stored = readSessionJson(PRODUCT_CONTEXT_STORAGE_KEY);
  if (!stored || String(stored.productId) !== String(productId)) {
    return null;
  }

  if (stored.viewerOrigin !== urlFrom) {
    return null;
  }

  return stored;
};

// Determine the exact 3D experience, button label, and origin badge for the Product Page
export const resolveProduct3DContext = ({ locationState, searchParams, productName }) => {
  const isFixedSupported = hasFixed3DModel(productName);
  const studioRoof = getStudioRoofProfileByName(productName);
  const isStudioSupported = Boolean(studioRoof);

  const urlFrom = searchParams?.get('from');
  const rawOrigin = locationState?.viewerOrigin || urlFrom || VIEWER_ORIGINS.CATALOG;

  // Path B: Customer explicitly arrived from 3D Customization on a supported studio roof
  if (rawOrigin === VIEWER_ORIGINS.STUDIO && isStudioSupported) {
    const rawHouseId = locationState?.studioHouseId || searchParams?.get('house');
    const studioHouse = getStudioHouseById(rawHouseId) || STUDIO_HOUSE_ARCHITECTURES[0];

    return {
      origin: VIEWER_ORIGINS.STUDIO,
      targetMode: VIEWER_ORIGINS.STUDIO,
      isSupported: true,
      studioHouse,
      studioRoof,
      fixedModelId: null,
      buttonLabel: 'Return to 3D Customization',
      tooltipText: 'Return to 3D Customization with your current thickness, color, and sheet quantity',
    };
  }

  // Path A: Customer arrived from the Fixed 3D Showcase on a fixed-model roof
  if (rawOrigin === VIEWER_ORIGINS.FIXED && isFixedSupported) {
    return {
      origin: VIEWER_ORIGINS.FIXED,
      targetMode: VIEWER_ORIGINS.FIXED,
      isSupported: true,
      studioHouse: null,
      studioRoof: null,
      fixedModelId: locationState?.fixedHouseModelId || searchParams?.get('model') || null,
      buttonLabel: 'View in 3D',
      tooltipText: 'Open the 3D roof model with your current order selections',
    };
  }

  // Catalog direct visit on any of the 7 residential roofs opens 3D Customization with that roof auto-selected
  if (isStudioSupported) {
    return {
      origin: VIEWER_ORIGINS.CATALOG,
      targetMode: VIEWER_ORIGINS.STUDIO,
      isSupported: true,
      studioHouse: null,
      studioRoof,
      fixedModelId: null,
      buttonLabel: 'View in 3D',
      tooltipText: `Open ${studioRoof.name} in 3D Customization across 6 house designs`,
    };
  }

  // Catalog direct visit on fixed-only profiles (ex. Mega Curved Roof) opens the Fixed 3D Modal
  if (isFixedSupported) {
    return {
      origin: VIEWER_ORIGINS.CATALOG,
      targetMode: VIEWER_ORIGINS.FIXED,
      isSupported: true,
      studioHouse: null,
      studioRoof: null,
      fixedModelId: null,
      buttonLabel: 'View in 3D',
      tooltipText: 'Preview and customize this roofing profile in 3D',
    };
  }

  // Non-3D product (ex. accessories, gutters, C-purlins)
  return {
    origin: VIEWER_ORIGINS.CATALOG,
    targetMode: null,
    isSupported: false,
    studioHouse: null,
    studioRoof: null,
    fixedModelId: null,
    buttonLabel: 'View in 3D',
    tooltipText: `3D model is not available for ${productName || 'this product'}`,
  };
};

// Hydrate initial 3D Customization selections cleanly on return or direct roof deep-link
export const readStudioInitialSelection = ({ locationState, searchParams }) => {
  const urlHouseId = searchParams?.get('house');
  const urlRoofId = searchParams?.get('roof');
  const hasUrlSelection = Boolean(urlHouseId || urlRoofId);
  const hasStateSelection = Boolean(locationState?.houseId || locationState?.roofId);

  let source = null;
  if (hasStateSelection) {
    source = locationState;
  } else if (hasUrlSelection) {
    const stored = readSessionJson(STUDIO_RETURN_STORAGE_KEY);
    const storedMatchesUrl =
      stored &&
      (!urlHouseId || stored.houseId === urlHouseId) &&
      (!urlRoofId || stored.roofId === urlRoofId);

    source = storedMatchesUrl
      ? stored
      : {
          houseId: urlHouseId,
          roofId: urlRoofId,
        };
  }

  const validHouse = getStudioHouseById(source?.houseId) || STUDIO_HOUSE_ARCHITECTURES[0];
  const validRoof = getStudioRoofProfileById(source?.roofId);
  const resolvedRoofId = validRoof?.id || null;

  const fallbackModel = resolvedRoofId
    ? resolveStudioHouseRoofModel(validHouse.id, resolvedRoofId)
    : validHouse;

  const parsedQty = parseInt(source?.quantity, 10);
  const hasValidQty = !Number.isNaN(parsedQty) && parsedQty >= 1;
  const clampedQty = hasValidQty
    ? Math.min(fallbackModel.totalSheets, parsedQty)
    : fallbackModel.totalSheets;

  const viewFullRoof =
    typeof source?.viewFullRoof === 'boolean'
      ? source.viewFullRoof
      : !hasValidQty || parsedQty >= fallbackModel.totalSheets;

  return {
    houseId: validHouse.id,
    roofId: resolvedRoofId,
    thickness: source?.thickness || '0.35mm',
    color: source?.color || 'Marshall Dark Gray',
    quantity: clampedQty,
    viewFullRoof,
    skipMobilePrompt: Boolean(source?.skipMobilePrompt) || hasConfirmedStudioMobileNotice(),
  };
};
