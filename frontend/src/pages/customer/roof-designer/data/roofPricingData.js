/**
 * Roof Pricing Data — Hardcoded constants for the 3D Roof Cost Estimator.
 *
 * Materials are ordered by correct construction sequence for tile roofing:
 *
 *   Step 0: House Model (loaded by user — no price)
 *   Step 1: Top Plate
 *   Step 2: Trusses / Rafters
 *   Step 3: Fascia Board
 *   Step 4: Decking (Sheathing)
 *   Step 5: Eave Flashing (Drip Edge)
 *   Step 6: Underlayment
 *   Step 7: Battens (Purlins)
 *   Step 8: Hermosa Roof Tile — installed after steps 1–7
 *   Step 9: Rake & Valley Flashing — LAST step, applied after the roof tile
 */

export const ROOF_MATERIALS = [
  // Step 1
  {
    id: 'top_plate',
    step: 1,
    name: 'Top Plate',
    description: 'Horizontal lumber anchored on top of wall framing — the anchor point for the entire roof structure',
    stepHint: 'Anchor point for the roof structure',
    modelPath: '/models/accessories/Top_Plate.glb',
    category: 'structural',
    unitPrice: 450,
    unit: 'per piece',
    defaultQty: 8,
    icon: 'fi-rr-rectangle-horizontal',
    offset: [0, 0, 0], // TODO: Adjust these coordinates to fit the house
  },

  // Step 2
  {
    id: 'roof_truss',
    step: 2,
    name: 'Trusses / Rafters',
    description: 'Pre-fabricated triangular frames that create the roof slope, sitting on the top plate',
    stepHint: 'Main framework creating the roof slope',
    modelPath: '/models/accessories/Roof_Truss.glb',
    category: 'structural',
    unitPrice: 2800,
    unit: 'per set',
    defaultQty: 6,
    icon: 'fi-rr-triangle',
    offset: [0, 0, 0],
  },

  // Step 3
  {
    id: 'fascia_board',
    step: 3,
    name: 'Fascia Board',
    description: 'Board attached to the truss tails along the eave line, covering the exposed rafter ends',
    stepHint: 'Covers truss tails along the eave',
    modelPath: '/models/accessories/Fascia_Board.glb',
    category: 'structural',
    unitPrice: 350,
    unit: 'per piece',
    defaultQty: 8,
    icon: 'fi-rr-border-bottom',
    offset: [0, 0, 0],
  },

  // Step 4
  {
    id: 'roof_decking',
    step: 4,
    name: 'Decking (Sheathing)',
    description: 'Plywood or OSB sheets nailed over the trusses to form a solid surface',
    stepHint: 'Solid surface over the structure',
    modelPath: '/models/accessories/Roof_Decking.glb',
    category: 'decking',
    unitPrice: 520,
    unit: 'per sheet',
    defaultQty: 12,
    icon: 'fi-rr-layers',
    offset: [0, 0, 0],
  },

  // Step 5
  {
    id: 'eave_flashing',
    step: 5,
    name: 'Eave Flashing (Drip Edge)',
    description: 'Metal strip installed along the eave edge — must go BEFORE underlayment so water drains correctly',
    stepHint: 'Directs water away from the eave',
    modelPath: '/models/accessories/Eave_Flashing.glb',
    category: 'flashing',
    unitPrice: 280,
    unit: 'per meter',
    defaultQty: 16,
    icon: 'fi-rr-angle-down',
    offset: [0, 0, 0],
  },

  // Step 6
  {
    id: 'underlayment',
    step: 6,
    name: 'Underlayment',
    description: 'Water-resistant barrier rolled over the decking, overlapping the drip edge for watertight seal',
    stepHint: 'Waterproof barrier under the roof',
    modelPath: '/models/accessories/Underlayment.glb',
    category: 'decking',
    unitPrice: 1200,
    unit: 'per roll',
    defaultQty: 4,
    icon: 'fi-rr-shield',
    offset: [0, 0, 0],
  },

  // Step 7
  {
    id: 'purlins',
    step: 7,
    name: 'Battens (Purlins)',
    description: 'Horizontal strips nailed over the underlayment — tiles hook onto these for attachment',
    stepHint: 'Horizontal strips for tile attachment',
    modelPath: '/models/accessories/Purlins.glb',
    category: 'structural',
    unitPrice: 380,
    unit: 'per piece',
    defaultQty: 14,
    icon: 'fi-rr-bars-sort',
    offset: [0, 0, 0],
  },

  // Step 8 — installed after steps 1–7
  {
    id: 'hermosa_tile',
    step: 8,
    name: 'Hermosa Roof Tile',
    description: 'Premium clay-look roof tile — installed after all supporting layers are in place',
    stepHint: 'Roof covering — add one tile at a time',
    modelPath: '/models/roof/Hermosa_Tile.glb',
    category: 'roofing',
    unitPrice: 85,
    unit: 'per piece',
    defaultQty: 1,
    installByPcs: true,
    icon: 'fi-rr-home',
    offset: [0, 0, 0],
  },

  // Step 9 (LAST) — applied over the installed roof tile
  {
    id: 'rake_valley_flashing',
    step: 9,
    name: 'Rake & Valley Flashing',
    description: 'Metal strips applied at rake edges and roof valleys after the roof tile is installed — the final finishing step',
    stepHint: 'Final finishing step — seals edges & valleys',
    modelPath: '/models/accessories/Rake_and_Valley_Flashing.glb',
    category: 'flashing',
    unitPrice: 320,
    unit: 'per meter',
    defaultQty: 12,
    icon: 'fi-rr-arrows-alt-v',
    isLastStep: true,
    offset: [0, 0, 0],
  },
];

/** Category display labels */
export const CATEGORY_LABELS = {
  structural: 'Structural Components',
  decking: 'Decking & Underlayment',
  flashing: 'Flashing & Trim',
  roofing: 'Roof Covering',
};

/**
 * Available roof tile color options.
 * Each entry has a display name and a hex color value.
 * The first entry is the default (natural clay).
 */
export const ROOF_COLORS = [
  { id: 'clay_red',      name: 'Clay Red',      hex: '#C0522A' },
  { id: 'terracotta',    name: 'Terracotta',    hex: '#B85C38' },
  { id: 'tuscan_brown',  name: 'Tuscan Brown',  hex: '#7A4020' },
  { id: 'spanish_red',   name: 'Spanish Red',   hex: '#9B1B30' },
  { id: 'sandstone',     name: 'Sandstone',     hex: '#C2A47E' },
  { id: 'slate_gray',    name: 'Slate Gray',    hex: '#6B7F8A' },
  { id: 'charcoal',      name: 'Charcoal',      hex: '#36454F' },
  { id: 'forest_green',  name: 'Forest Green',  hex: '#2E6B3E' },
  { id: 'dark_bronze',   name: 'Dark Bronze',   hex: '#5C3D1E' },
  { id: 'pearl_white',   name: 'Pearl White',   hex: '#E8E0D4' },
];

/**
 * Correct construction sequence for tile roofing.
 * Each part can only be installed after ALL previous parts in this list.
 * The roof tile (step 9) additionally requires every step 1-8.
 */
export const INSTALL_ORDER = [
  'top_plate',            // Step 1
  'roof_truss',           // Step 2
  'fascia_board',         // Step 3
  'roof_decking',         // Step 4
  'eave_flashing',        // Step 5
  'underlayment',         // Step 6
  'purlins',              // Step 7
  'hermosa_tile',         // Step 8 (roof tile — after steps 1–7)
  'rake_valley_flashing', // Step 9 (LAST — applied after the roof tile)
];
