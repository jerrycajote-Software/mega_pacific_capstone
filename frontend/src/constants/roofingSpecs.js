export const ROOFING_COLORS = [
  { name: "Marshall Dark Gray", hex: "#3F4349", border: "#525861" },
  { name: "Saipan Brown", hex: "#5E3B27", border: "#784c33" },
  { name: "Tongan Red", hex: "#8B2626", border: "#a83232" },
  { name: "Maori Green", hex: "#1E4D2B", border: "#286639" },
  { name: "Samoan Beige", hex: "#C4B48A", border: "#d4c6a1" },
  { name: "Seafoam Green", hex: "#2E8B57", border: "#3ba86b" },
  { name: "Fijian White", hex: "#F3F4F6", border: "#cbd5e1" },
  { name: "Hawaiian Blue", hex: "#1D4ED8", border: "#2563eb" },
  { name: "Tahiti Grey", hex: "#64748B", border: "#94a3b8" },
  { name: "Kauai Dark", hex: "#18181B", border: "#27272a" },
  { name: "Aussie Red", hex: "#991B1B", border: "#b91c1c" },
  { name: "New Zealand Green", hex: "#166534", border: "#15803d" },
  { name: "Nauru Blue", hex: "#0284C7", border: "#0369a1" },
  { name: "New Guinea Brown", hex: "#451A03", border: "#5e2304" }
];

export const STANDARD_THICKNESSES = [
  "0.35mm",
  "0.40mm",
  "0.50mm",
  "0.60mm"
];

export const DECKING_THICKNESSES = [
  "0.70mm",
  "0.80mm",
  "0.90mm",
  "1.00mm",
  "1.10mm",
  "1.20mm"
];

export const MAX_PREORDER_LENGTH_METERS = 21.0;
export const MIN_PREORDER_LENGTH_METERS = 0.5;

export const getColorHex = (colorName) => {
  if (!colorName) return "#64748b";
  const found = ROOFING_COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase());
  return found ? found.hex : "#64748b";
};
