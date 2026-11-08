/**
 * 3D Roof House Model Registry & Product Profile Compatibility Service
 *
 * Specific validation rules:
 * 1. Pico Rib 1220: Tailored 3D modular model (/models/house/Pico_Rib_1220_House.glb)
 *    Validation: matches product name case-insensitively (ex. "Pico Rib 1220", "PICO RIB 1220").
 * 2. Other products (ex. Mega Twin Rib): No 3D model currently available, returns
 *    clear status: "Nothing available model for this product".
 */

export const isPicoRib1220 = (productName) => {
  if (!productName || typeof productName !== 'string') return false;
  return /pico\s*rib\s*1220/i.test(productName.trim());
};

export const AVAILABLE_3D_ROOF_MODELS = [
  {
    id: 'pico_rib_1220_house',
    name: 'Pico Rib 1220 (Starter House)',
    profileName: 'Pico Rib 1220',
    modelPath: '/models/house/Pico_Rib_1220_House.glb',
    floorArea: '36 sqm (6m × 6m footprint)',
    roofDimensions: '8.1m × 6m gable roof',
    effectiveWidthMm: 1013,
    nominalWidthMm: 1080,
    ribHeightMm: 28,
    minRafterLength: 2.5,
    maxRafterLength: 4.5,
    recommendedLength: 3.8,
    totalSheets: 16,
    sheetsPerSlope: 8,
    sheetWidthMeters: 1.013,
    description: 'Authentic Pico Rib 1220 profile with 28mm trapezoidal ribs and dual pico wave stiffeners in every pan.',
  },
];

/**
 * Validates product profile name and cut length compatibility.
 * @param {number|string} lengthMeters 
 * @param {string} [productName] 
 * @returns {object} { isProfileSupported: boolean, model: object|null, message?: string }
 */
export const getCompatibleRoofModel = (lengthMeters, productName = '') => {
  // 1. Profile Name Validation (Dedicated Pico Rib 1220 model)
  if (productName && !isPicoRib1220(productName)) {
    return {
      isProfileSupported: false,
      model: null,
      message: 'Nothing available model for this product',
      productName,
    };
  }

  // 2. Dimensional validation
  const numLength = parseFloat(lengthMeters);
  if (isNaN(numLength) || numLength <= 0) {
    return {
      isProfileSupported: true,
      model: null,
      message: 'Invalid length specified',
      productName,
    };
  }

  const matched = AVAILABLE_3D_ROOF_MODELS.find(
    (m) => numLength >= m.minRafterLength && numLength <= m.maxRafterLength
  );

  if (!matched) {
    return {
      isProfileSupported: true,
      model: null,
      message: `No 3D house model available for ${lengthMeters}m rafter length`,
      productName,
    };
  }

  return {
    isProfileSupported: true,
    model: matched,
    ...matched,
  };
};

/**
 * Returns human-readable supported length ranges for unavailable model fallback dialogs.
 * @returns {string}
 */
export const getSupportedLengthRangeText = () => {
  return AVAILABLE_3D_ROOF_MODELS.map(
    (m) => `${m.name}: ${m.minRafterLength}m – ${m.maxRafterLength}m (ex. ${m.recommendedLength}m)`
  ).join(', ');
};
