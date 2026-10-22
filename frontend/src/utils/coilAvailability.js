

export const normalizeThickness = (rawThickness) => {
  if (!rawThickness) return '0.35mm';
  const str = String(rawThickness).trim();
  const match = str.match(/0\.\d+/);
  return match ? `${match[0]}mm` : str.toLowerCase();
};

export const normalizeColor = (rawColor) => {
  if (!rawColor) return '';
  return String(rawColor).trim().toLowerCase();
};


export const isCoilInStock = (coils, thickness, color) => {
  if (!coils || !Array.isArray(coils) || coils.length === 0) return true;
  if (!thickness || !color) return true;

  const targetThickness = normalizeThickness(thickness);
  const targetColor = normalizeColor(color);

  const matched = coils.find((c) => {
    return normalizeThickness(c.thickness) === targetThickness &&
           normalizeColor(c.color) === targetColor;
  });

  if (!matched) return true;
  return Number(matched.coilCount) > 0;
};


export const getFirstInStockColor = (coils, thickness, allColors = [], currentColor = null) => {
  if (!allColors || allColors.length === 0) return currentColor;
  if (currentColor && isCoilInStock(coils, thickness, currentColor)) {
    return currentColor;
  }
  const firstInStock = allColors.find((c) => isCoilInStock(coils, thickness, c));
  return firstInStock || currentColor || allColors[0];
};


export const getFirstInStockOption = (coils, color, options = [], currentOption = null) => {
  if (!options || options.length === 0) return currentOption;
  if (currentOption && isCoilInStock(coils, currentOption.thickness || currentOption.name, color)) {
    return currentOption;
  }
  const firstInStock = options.find((opt) => isCoilInStock(coils, opt.thickness || opt.name, color));
  return firstInStock || currentOption || options[0];
};
