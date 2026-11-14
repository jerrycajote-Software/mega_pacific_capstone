/**
 * 3D Roof House Model Registry & Product Profile Compatibility Service
 *
 * Specific validation rules (strict exact product name matching):
 * 1. Pico Rib 1220: Dedicated 3D modular models mapped across 4 house tiers (2.0m - 6.5m).
 * 2. Mega Curved Roof: Dedicated 3D barrel-vault models mapped across 3 structural tiers (4.0m - 14.0m):
 *    - Curved Canopy / Walkway (4.45m x 8.1m, 8 sheets): 4.0m - 5.9m arc cut length
 *    - Covered Court / Mini Gymnasium (7.6m x 12.2m, 12 sheets): 6.0m - 8.9m arc cut length
 *    - Full Sports Gymnasium & Dome (9.6m x 16.2m, 16 sheets): 9.0m - 14.0m arc cut length
 * 3. All other products return status: "Nothing available model for this product".
 */

const normalizeProductName = (productName) => {
  if (!productName || typeof productName !== 'string') return '';
  return productName.trim().replace(/\s+/g, ' ').toLowerCase();
};

export const isPicoRib1220 = (productName) => {
  return normalizeProductName(productName) === 'pico rib 1220';
};

export const isMegaCurvedRoof = (productName) => {
  return normalizeProductName(productName) === 'mega curved roof';
};

export const has3DModel = (productName) => {
  return isPicoRib1220(productName) || isMegaCurvedRoof(productName);
};

export const isProduct3DSupported = (productName) => {
  return has3DModel(productName);
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
    sheetEdgeTarget: [-3.546, 2.879, 3.510],
    sheetEdgeCameraPos: [-3.546, 2.859, 4.230],
    internalTrussTarget: [0, 3.634, 0],
    internalTrussCameraPos: [3.2, 3.175, 2.8],
    roofTopTarget: [0, 3.634, 0],
    roofTopCameraPos: [0, 9.0, 1.4],
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
    sheetEdgeTarget: [-4.052, 5.679, 3.510],
    sheetEdgeCameraPos: [-4.052, 5.659, 4.230],
    internalTrussTarget: [0, 6.434, 0],
    internalTrussCameraPos: [3.2, 5.975, 2.8],
    roofTopTarget: [0, 6.434, 0],
    roofTopCameraPos: [0, 11.8, 1.4],
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
    sheetEdgeTarget: [-4.558, 3.100, 4.460],
    sheetEdgeCameraPos: [-4.558, 3.080, 5.180],
    internalTrussTarget: [0, 4.036, 0],
    internalTrussCameraPos: [3.2, 3.375, 2.8],
    roofTopTarget: [0, 4.036, 0],
    roofTopCameraPos: [0, 9.8, 1.4],
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
    sheetEdgeTarget: [-4.558, 5.677, 4.010],
    sheetEdgeCameraPos: [-4.558, 5.657, 4.730],
    internalTrussTarget: [0, 6.634, 0],
    internalTrussCameraPos: [3.2, 6.175, 2.8],
    roofTopTarget: [0, 6.634, 0],
    roofTopCameraPos: [0, 12.0, 1.4],
    description: 'Larger 2-storey residence (120 sqm total floor area) with a 10m × 8m roof requiring 20 Pico Rib 1220 sheets.',
  },
];

export const AVAILABLE_CURVED_ROOF_MODELS = [
  {
    id: 'mega_curved_canopy',
    name: 'Curved Canopy / Covered Walkway',
    shortLabel: 'Curved Canopy',
    profileName: 'Mega Curved Roof',
    modelPath: '/models/curved/Mega_Curved_Canopy.glb',
    blendFileName: 'Mega_Curved_Roof_Canopy.blend',
    floorArea: '36 sqm (8.1m × 4.45m bay)',
    roofDimensions: '8.1m × 5.0m arched roof (40.5 sqm)',
    effectiveWidthMm: 1013,
    nominalWidthMm: 1080,
    ribHeightMm: 28,
    minRafterLength: 4.0,
    maxRafterLength: 5.9,
    recommendedLength: 5.0,
    totalSheets: 8,
    sheetsPerSlope: 8,
    sheetWidthMeters: 1.013,
    cameraTargetY: 2.3,
    cameraDefaultPos: [6.8, 4.6, 6.8],
    sheetEdgeTarget: [-3.545, 3.050, 2.225],
    sheetEdgeCameraPos: [-3.545, 2.98, 2.98],
    internalTrussTarget: [0, 3.55, 0],
    internalTrussCameraPos: [3.8, 2.9, 2.8],
    roofTopTarget: [0, 3.6, 0],
    roofTopCameraPos: [0, 10.5, 1.5],
    maxCameraDistance: 30,
    description: 'Open-sided arched walkway and carport canopy supported by steel columns and curved trusses using 8 Mega Curved Roof sheets at 5.0m arc length.',
  },
  {
    id: 'mega_curved_mini_gym',
    name: 'Covered Court / Mini Gymnasium',
    shortLabel: 'Covered Court',
    profileName: 'Mega Curved Roof',
    modelPath: '/models/curved/Mega_Curved_Mini_Gym.glb',
    blendFileName: 'Mega_Curved_Roof_Mini_Gym.blend',
    floorArea: '92 sqm (12.2m × 7.6m court)',
    roofDimensions: '12.2m × 8.5m barrel arch (103 sqm)',
    effectiveWidthMm: 1013,
    nominalWidthMm: 1080,
    ribHeightMm: 28,
    minRafterLength: 6.0,
    maxRafterLength: 8.9,
    recommendedLength: 8.5,
    totalSheets: 12,
    sheetsPerSlope: 12,
    sheetWidthMeters: 1.013,
    cameraTargetY: 3.4,
    cameraDefaultPos: [10.5, 6.8, 10.5],
    sheetEdgeTarget: [-5.571, 4.750, 3.800],
    sheetEdgeCameraPos: [-5.571, 4.68, 4.55],
    internalTrussTarget: [0, 5.5, 0],
    internalTrussCameraPos: [5.0, 4.4, 3.6],
    roofTopTarget: [0, 5.6, 0],
    roofTopCameraPos: [0, 15.0, 2.0],
    maxCameraDistance: 36,
    description: 'Community covered sports court and mini gymnasium with curved steel lattice trusses and 12 Mega Curved Roof sheets at 8.5m arc length.',
  },
  {
    id: 'mega_curved_gym_dome',
    name: 'Sports Gymnasium & Barrel Dome',
    shortLabel: 'Gym & Dome',
    profileName: 'Mega Curved Roof',
    modelPath: '/models/curved/Mega_Curved_Gym_Dome.glb',
    blendFileName: 'Mega_Curved_Roof_Gym_Dome.blend',
    floorArea: '155 sqm (16.2m × 9.6m arena)',
    roofDimensions: '16.2m × 11.0m barrel dome (178 sqm)',
    effectiveWidthMm: 1013,
    nominalWidthMm: 1080,
    ribHeightMm: 28,
    minRafterLength: 9.0,
    maxRafterLength: 14.0,
    recommendedLength: 11.0,
    totalSheets: 16,
    sheetsPerSlope: 16,
    sheetWidthMeters: 1.013,
    cameraTargetY: 4.2,
    cameraDefaultPos: [14.0, 9.2, 14.0],
    sheetEdgeTarget: [-7.597, 5.750, 4.800],
    sheetEdgeCameraPos: [-7.597, 5.68, 5.55],
    internalTrussTarget: [0, 6.8, 0],
    internalTrussCameraPos: [6.2, 5.2, 4.2],
    roofTopTarget: [0, 7.0, 0],
    roofTopCameraPos: [0, 19.5, 2.5],
    maxCameraDistance: 44,
    description: 'Full enclosed sports gymnasium and dome structure with clerestory windows, curved lattice trusses, and 16 Mega Curved Roof sheets at 11.0m arc length.',
  },
];

/**
 * Returns the dedicated 3D structure models strictly matching the exact product name.
 * @param {string} [productName]
 * @returns {Array}
 */
export const getAvailable3DModelsForProduct = (productName = '') => {
  if (!productName) return AVAILABLE_3D_ROOF_MODELS;
  if (isMegaCurvedRoof(productName)) return AVAILABLE_CURVED_ROOF_MODELS;
  if (isPicoRib1220(productName)) return AVAILABLE_3D_ROOF_MODELS;
  return [];
};

/**
 * Validates exact product profile name and cut length compatibility.
 * @param {number|string} lengthMeters
 * @param {string} [productName]
 * @returns {object} { isProfileSupported: boolean, model: object|null, message?: string }
 */
export const getCompatibleRoofModel = (lengthMeters, productName = '') => {
  if (productName && !isProduct3DSupported(productName)) {
    return {
      isProfileSupported: false,
      model: null,
      message: 'Nothing available model for this product',
      productName,
    };
  }

  const modelsForProfile = getAvailable3DModelsForProduct(productName);
  const numLength = parseFloat(lengthMeters);
  if (isNaN(numLength) || numLength <= 0) {
    return {
      isProfileSupported: true,
      model: null,
      message: 'Invalid length specified',
      productName,
    };
  }

  const matched = modelsForProfile.find(
    (m) => numLength >= m.minRafterLength - 1e-6 && numLength <= m.maxRafterLength + 1e-6
  );

  if (!matched) {
    return {
      isProfileSupported: true,
      model: null,
      message: `No 3D structure model available for ${lengthMeters}m cut length`,
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
 * @param {string} [productName]
 * @returns {string}
 */
export const getSupportedLengthRangeText = (productName = '') => {
  const models = getAvailable3DModelsForProduct(productName);
  return models
    .map(
      (m) => `${m.name}: ${m.minRafterLength.toFixed(1)}m – ${m.maxRafterLength.toFixed(1)}m (ex. ${m.recommendedLength}m • ${m.totalSheets} sheets)`
    )
    .join(' | ');
};
