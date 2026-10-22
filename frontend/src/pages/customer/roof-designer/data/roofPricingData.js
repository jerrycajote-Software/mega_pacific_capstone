
export const ROOF_MATERIALS = [
  
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
    offset: [0, 0, 0], 
  },


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


export const CATEGORY_LABELS = {
  structural: 'Structural Components',
  decking: 'Decking & Underlayment',
  flashing: 'Flashing & Trim',
  roofing: 'Roof Covering',
};


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


export const INSTALL_ORDER = [
  'top_plate',            
  'roof_truss',           
  'fascia_board',         
  'roof_decking',         
  'eave_flashing',        
  'underlayment',         
  'purlins',              
  'hermosa_tile',         
  'rake_valley_flashing', 
];
