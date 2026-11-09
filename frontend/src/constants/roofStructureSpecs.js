/**
 * Structural Layer Definitions & Mesh Inspector Metadata
 * Powers the interactive 3D Internal Roof Structure Visualization.
 *
 * Maps every 3D mesh node inside Pico_Rib_1220_House.glb to one of 7
 * structural layers with vertical explode offsets and human-friendly specs.
 */

export const ROOF_STRUCTURAL_LAYERS = [
  {
    id: 'trims_flashing',
    label: 'Ridge Cap, Flashings & Gutters',
    shortLabel: 'Trims & Gutters',
    badgeColor: '#38bdf8',
    explodeOffsetY: 2.15,
    description: 'Seals the roof peak, gable edges, and eaves against wind-driven rain while channeling rainwater into the perimeter gutters.',
  },
  {
    id: 'roof_sheets',
    label: 'Pico Rib 1220 Roofing Sheets',
    shortLabel: 'Roofing Sheets',
    badgeColor: '#4ade80',
    explodeOffsetY: 1.65,
    description: 'Pre-painted galvanized steel panels with 28mm major trapezoidal ribs and dual pico-wave stiffeners in every pan.',
  },
  {
    id: 'underlayment',
    label: 'Thermal & Moisture Underlayment',
    shortLabel: 'Underlayment',
    badgeColor: '#a78bfa',
    explodeOffsetY: 1.15,
    description: 'Double-sided reflective thermal insulation and moisture barrier membrane installed directly beneath the steel sheets.',
  },
  {
    id: 'purlins',
    label: 'Horizontal C-Purlins (Battens)',
    shortLabel: 'Purlins (Battens)',
    badgeColor: '#fbbf24',
    explodeOffsetY: 0.72,
    description: '10 horizontal structural support bars (5 per slope) spaced at 750mm on-center where the roofing sheets are screw-fastened.',
  },
  {
    id: 'trusses',
    label: 'Engineered A-Frame Roof Trusses',
    shortLabel: 'Roof Trusses',
    badgeColor: '#fb923c',
    explodeOffsetY: 0.32,
    description: '5 heavy-duty A-frame trusses spaced 1.5m apart, each built with sloped rafters, a bottom tie beam, a central king post, and diagonal web struts.',
  },
  {
    id: 'top_plate',
    label: 'Perimeter Wall Top Plate',
    shortLabel: 'Wall Top Plate',
    badgeColor: '#f472b6',
    explodeOffsetY: 0.08,
    description: 'Continuous 120mm × 120mm load-bearing perimeter tie plate anchored along the top of the exterior walls to support the roof trusses.',
  },
  {
    id: 'base_house',
    label: 'Base House Walls & Foundation',
    shortLabel: 'House Walls',
    badgeColor: '#94a3b8',
    explodeOffsetY: 0.0,
    description: '6m × 6m reinforced concrete slab foundation, exterior stucco masonry walls, gable peaks, windows, and entrance door.',
  },
];

export const DEFAULT_LAYER_VISIBILITY = {
  trims_flashing: true,
  roof_sheets: true,
  underlayment: true,
  purlins: true,
  trusses: true,
  top_plate: true,
  base_house: true,
};

/**
 * Resolves the structural layer ID for a given Three.js mesh name.
 * @param {string} meshName
 * @returns {string}
 */
export const getLayerIdForMesh = (meshName = '') => {
  if (!meshName) return 'base_house';
  if (meshName.startsWith('RoofSheet_') || meshName.startsWith('Hermosa_Tile_')) {
    return 'roof_sheets';
  }
  if (
    meshName === 'Ridge_Cap' ||
    meshName.startsWith('Rake_Flashing_') ||
    meshName.startsWith('Gutter_') ||
    meshName.startsWith('Fascia_Board_') ||
    meshName.startsWith('Eave_Flashing_')
  ) {
    return 'trims_flashing';
  }
  if (meshName.startsWith('Underlayment_')) {
    return 'underlayment';
  }
  if (meshName.startsWith('Purlin_') || meshName.startsWith('Battens_')) {
    return 'purlins';
  }
  if (meshName.startsWith('Truss_') || meshName.startsWith('Roof_Truss_')) {
    return 'trusses';
  }
  if (meshName.startsWith('Top_Plate')) {
    return 'top_plate';
  }
  return 'base_house';
};

/**
 * Returns the vertical Y explode offset in meters for a given mesh name.
 * @param {string} meshName
 * @returns {number}
 */
export const getExplodeOffsetForMesh = (meshName = '') => {
  const layerId = getLayerIdForMesh(meshName);
  const found = ROOF_STRUCTURAL_LAYERS.find((l) => l.id === layerId);
  return found ? found.explodeOffsetY : 0;
};

/**
 * Returns rich human-friendly inspection details when a user clicks or hovers any 3D structural mesh.
 * @param {string} meshName
 * @param {object} [context] - Optional active thickness/color context
 * @returns {object|null}
 */
export const getStructuralMeshMetadata = (meshName = '', context = {}) => {
  if (!meshName) return null;
  const layerId = getLayerIdForMesh(meshName);
  const layerMeta = ROOF_STRUCTURAL_LAYERS.find((l) => l.id === layerId) || ROOF_STRUCTURAL_LAYERS[6];
  const activeThick = context.thickness || '0.35mm';
  const activeColor = context.color || 'Marshall Dark Gray';

  if (meshName.startsWith('RoofSheet_')) {
    const num = parseInt(meshName.replace('RoofSheet_', ''), 10) || 1;
    const sheetsPerSlope = context.sheetsPerSlope || 8;
    const sheetLength = context.length || 3.8;
    const slope = num <= sheetsPerSlope ? 'Front Slope' : 'Back Slope';
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Pico Rib 1220 Panel #${num} (${slope})`,
      dimensions: `1013mm effective width × ${sheetLength}m length • ${activeThick} gauge`,
      material: `Pre-Painted Galvanized Steel (${activeColor})`,
      role: 'Primary outer weatherproofing roof sheet with 28mm ribs and dual pico-wave stiffeners fastened directly into the horizontal purlins.',
    };
  }

  if (meshName === 'Ridge_Cap') {
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: 'Top Ridge Cap Flashing',
      dimensions: '280mm girth × 8.2m total ridge length',
      material: 'Pre-Painted Galvanized Steel Trim',
      role: 'Covers and weather-seals the top peak joint where the front and back Pico Rib 1220 roof slopes meet.',
    };
  }

  if (meshName.startsWith('Rake_Flashing_')) {
    const parts = meshName.replace('Rake_Flashing_', '').split('_');
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Gable Rake Flashing (${parts.join(' • ')})`,
      dimensions: '80mm × 80mm L-profile × 3.78m slope length',
      material: 'Pre-Painted Steel Edge Trim',
      role: 'Protects the exposed side edges of the roof along the left and right gable overhangs against wind uplift and side rain entry.',
    };
  }

  if (meshName.startsWith('Fascia_Board_')) {
    const slope = meshName.replace('Fascia_Board_', '');
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Eave Fascia Board (${slope} Eave)`,
      dimensions: '180mm height × 30mm thickness × 8.1m length',
      material: 'Treated Exterior Fascia Trim',
      role: 'Caps the exposed lower ends of the truss rafters and provides a flat mounting surface for the rain gutters.',
    };
  }

  if (meshName.startsWith('Gutter_')) {
    const slope = meshName.replace('Gutter_', '');
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Box Rain Gutter (${slope} Eave)`,
      dimensions: '140mm × 140mm box profile × 8.2m length',
      material: 'Pre-Painted Galvanized Steel',
      role: 'Collects rainwater flowing down the Pico Rib 1220 valleys at the lower eave edge and directs it safely to downspouts.',
    };
  }

  if (meshName.startsWith('Underlayment_')) {
    const slope = meshName.replace('Underlayment_', '');
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Thermal & Vapor Underlayment (${slope} Slope)`,
      dimensions: '8.1m × 3.78m continuous membrane • 5mm thick',
      material: 'Cross-Linked PE Foam with Reflective Foil',
      role: 'Reduces radiant attic heat gain and acts as a secondary condensation barrier underneath the metal roofing sheets.',
    };
  }

  if (meshName.startsWith('Purlin_')) {
    const parts = meshName.replace('Purlin_', '').split('_');
    const slope = parts[0] || 'Front';
    const idx = parts[1] || '1';
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Horizontal C-Purlin #${idx} (${slope} Slope)`,
      dimensions: '60mm × 50mm cross-section × 8.1m span • 750mm spacing',
      material: 'Structural Timber / Galvanized C-Purlin',
      role: 'Spans horizontally across all 5 roof trusses to provide even screw-fastening lines for the Pico Rib 1220 sheets.',
    };
  }

  if (meshName.startsWith('Truss_Rafter')) {
    const isFront = meshName.includes('Front');
    const idx = meshName.split('_').pop();
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Truss #${idx} Top Chord Rafter (${isFront ? 'Front' : 'Back'} Slope)`,
      dimensions: '100mm × 140mm structural member × 3.78m length (22° pitch)',
      material: 'Kiln-Dried Structural Timber / Steel Truss Chord',
      role: 'Primary inclined load-bearing beam of the A-frame truss that supports the horizontal purlins and roof snow/wind loads.',
    };
  }

  if (meshName.startsWith('Truss_TieBeam_')) {
    const idx = meshName.split('_').pop();
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Truss #${idx} Bottom Tie Beam (Ceiling Joist)`,
      dimensions: '120mm × 150mm horizontal beam × 6.0m wall-to-wall span',
      material: 'Structural Timber / Steel Bottom Chord',
      role: 'Ties the bottom ends of the front and back rafters together to prevent the roof from pushing the exterior house walls outward.',
    };
  }

  if (meshName.startsWith('Truss_KingPost_')) {
    const idx = meshName.split('_').pop();
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Truss #${idx} Central King Post`,
      dimensions: '80mm × 80mm vertical post × 1.21m height',
      material: 'Structural Timber / Steel Vertical Post',
      role: 'Connects the highest ridge peak of the truss directly to the center of the bottom tie beam to prevent sagging.',
    };
  }

  if (meshName.startsWith('Truss_Web')) {
    const isFront = meshName.includes('Front');
    const idx = meshName.split('_').pop();
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Truss #${idx} Diagonal Web Strut (${isFront ? 'Front' : 'Back'} Bay)`,
      dimensions: '70mm × 70mm diagonal compression strut × 1.63m length',
      material: 'Structural Timber / Steel Web Bracing',
      role: 'Transfers mid-rafter bending loads diagonally down to the central king post base, forming a rigid triangulated truss.',
    };
  }

  if (meshName.startsWith('Top_Plate_')) {
    const side = meshName.replace('Top_Plate_', '');
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Structural Wall Top Plate (${side} Wall)`,
      dimensions: '120mm × 120mm continuous ring plate × 6.0m length',
      material: 'Anchor-Bolted Structural Wall Plate',
      role: 'Anchored to the top of the masonry walls to distribute concentrated truss loads evenly into the building walls.',
    };
  }

  if (meshName.startsWith('Gable_Wall_')) {
    const side = meshName.replace('Gable_Wall_', '');
    return {
      meshName,
      layerId,
      layerLabel: layerMeta.label,
      badgeColor: layerMeta.badgeColor,
      title: `Triangular Gable End Wall (${side} Side)`,
      dimensions: '6.0m base width × 1.21m peak height (22° slope)',
      material: 'Reinforced Masonry with Stucco Finish',
      role: 'Encloses the triangular attic space at the left and right ends of the gable roof.',
    };
  }

  return {
    meshName,
    layerId,
    layerLabel: layerMeta.label,
    badgeColor: layerMeta.badgeColor,
    title: meshName.replace(/_/g, ' '),
    dimensions: '6.0m × 6.0m starter house footprint (2.8m wall height)',
    material: 'Reinforced Concrete & Stucco Masonry',
    role: 'Base house building structure supporting the perimeter wall top plates and roof assembly.',
  };
};

