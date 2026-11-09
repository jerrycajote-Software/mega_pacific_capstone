/**
 * 3D Roof House Model Registry & Product Profile Compatibility Service
 *
 * Specific validation rules:
 * 1. Pico Rib 1220: Dedicated 3D modular models mapped across 4 house tiers:
 *    - Starter House (6m x 6m footprint, 8m x 6m roof, 16 sheets): 2.0m – 3.9m cut length
 *    - Typical 2-Storey House (8m x 6m footprint/flr, 9m x 7m roof, 18 sheets): 4.0m – 4.5m cut length
 *    - Single-Storey House (8m x 8m footprint, 10m x 8m roof, 20 sheets): 4.6m – 5.4m cut length
 *    - Larger 2-Storey House (10m x 6m footprint/flr, 10m x 8m roof, 20 sheets): 5.5m – 6.5m cut length
 * 2. Other products (ex. Mega Twin Rib): No 3D model currently available, returns
 *    clear status: "Nothing available model for this product".
 */

export const isPicoRib1220 = (productName) => {
  if (!productName || typeof productName !== 'string') return false;
  return /pico\s*rib(\s*1220)?/i.test(productName.trim());
};

export const AVAILABLE_3D_ROOF_MODELS = [
  {
    id: 'pico_rib_1220_house',
    name: 'Small / Starter House (6×6m)',
    shortLabel: 'Starter House 6×6m',
    profileName: 'Pico Rib 1220',
    modelPath: '/models/house/Pico_Rib_1220_House.glb',
    blendFileName: 'Pico_Rib_1220_Starter_House_6x6.blend',
    floorArea: '36 sqm (6m × 6m footprint)',
    roofDimensions: '8m × 6m gable roof (48 sqm)',
    effectiveWidthMm: 1013,
    nominalWidthMm: 1080,
    ribHeightMm: 28,
    minRafterLength: 2.0,
    maxRafterLength: 3.9,
    recommendedLength: 3.8,
    totalSheets: 16,
    sheetsPerSlope: 8,
    sheetWidthMeters: 1.013,
    cameraTargetY: 2.3,
    cameraDefaultPos: [5.6, 3.8, 5.6],
    description: 'Small starter house (36 sqm floor area) with an 8m × 6m gable roof requiring 16 Pico Rib 1220 sheets at 3.8m rafter length.',
  },
  {
    id: 'pico_rib_1220_two_storey_8x6',
    name: 'Typical 2-Storey House (8×6m)',
    shortLabel: '2-Storey House 8×6m',
    profileName: 'Pico Rib 1220',
    modelPath: '/models/house/Pico_Rib_1220_Two_Storey_8x6.glb',
    blendFileName: 'Pico_Rib_1220_Two_Storey_8x6.blend',
    floorArea: '96 sqm total (8m × 6m per floor)',
    roofDimensions: '9m × 7m gable roof (63 sqm)',
    effectiveWidthMm: 1013,
    nominalWidthMm: 1080,
    ribHeightMm: 28,
    minRafterLength: 4.0,
    maxRafterLength: 4.5,
    recommendedLength: 4.2,
    totalSheets: 18,
    sheetsPerSlope: 9,
    sheetWidthMeters: 1.013,
    cameraTargetY: 4.2,
    cameraDefaultPos: [7.5, 6.4, 7.5],
    description: 'Typical 2-storey residential home (96 sqm total floor area) with a 9m × 7m roof requiring 18 Pico Rib 1220 sheets at 4.2m rafter length.',
  },
  {
    id: 'pico_rib_1220_single_storey_8x8',
    name: 'Single-Storey House (8×8m)',
    shortLabel: 'Single-Storey 8×8m',
    profileName: 'Pico Rib 1220',
    modelPath: '/models/house/Pico_Rib_1220_Single_Storey_8x8.glb',
    blendFileName: 'Pico_Rib_1220_Single_Storey_8x8.blend',
    floorArea: '64 sqm (8m × 8m footprint)',
    roofDimensions: '10m × 8m gable roof (80 sqm)',
    effectiveWidthMm: 1013,
    nominalWidthMm: 1080,
    ribHeightMm: 28,
    minRafterLength: 4.6,
    maxRafterLength: 5.4,
    recommendedLength: 4.8,
    totalSheets: 20,
    sheetsPerSlope: 10,
    sheetWidthMeters: 1.013,
    cameraTargetY: 2.6,
    cameraDefaultPos: [7.2, 4.6, 7.2],
    description: 'Spacious single-storey bungalow (64 sqm floor area) with a 10m × 8m gable roof requiring 20 Pico Rib 1220 sheets at 4.8m rafter length.',
  },
  {
    id: 'pico_rib_1220_large_two_storey_10x6',
    name: 'Larger 2-Storey House (10×6m)',
    shortLabel: 'Larger 2-Storey 10×6m',
    profileName: 'Pico Rib 1220',
    modelPath: '/models/house/Pico_Rib_1220_Large_Two_Storey_10x6.glb',
    blendFileName: 'Pico_Rib_1220_Large_Two_Storey_10x6.blend',
    floorArea: '120 sqm total (10m × 6m per floor)',
    roofDimensions: '10m × 8m gable roof (80 sqm)',
    effectiveWidthMm: 1013,
    nominalWidthMm: 1080,
    ribHeightMm: 28,
    minRafterLength: 5.5,
    maxRafterLength: 6.5,
    recommendedLength: 6.0,
    totalSheets: 20,
    sheetsPerSlope: 10,
    sheetWidthMeters: 1.013,
    cameraTargetY: 4.4,
    cameraDefaultPos: [8.4, 6.8, 8.4],
    description: 'Larger 2-storey residence (120 sqm total floor area) with a 10m × 8m roof requiring 20 Pico Rib 1220 sheets.',
  },
];

/**
 * Validates product profile name and cut length compatibility.
 * @param {number|string} lengthMeters
 * @param {string} [productName]
 * @returns {object} { isProfileSupported: boolean, model: object|null, message?: string }
 */
export const getCompatibleRoofModel = (lengthMeters, productName = '') => {
  // 1. Profile Name Validation (Dedicated Pico Rib 1220 models)
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
    (m) => numLength >= m.minRafterLength - 1e-6 && numLength <= m.maxRafterLength + 1e-6
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
    (m) => `${m.name}: ${m.minRafterLength.toFixed(1)}m – ${m.maxRafterLength.toFixed(1)}m (ex. ${m.recommendedLength}m • ${m.totalSheets} sheets)`
  ).join(' | ');
};
