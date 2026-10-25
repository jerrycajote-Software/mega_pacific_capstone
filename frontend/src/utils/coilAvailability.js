

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
  if (!coils || !Array.isArray(coils) || coils.length === 0) return false;
  if (!thickness || !color) return false;

  const targetThickness = normalizeThickness(thickness);
  const targetColor = normalizeColor(color);

  const matched = coils.find((c) => {
    return normalizeThickness(c.thickness) === targetThickness &&
           normalizeColor(c.color) === targetColor;
  });

  if (!matched) return false;
  return Number(matched.coilCount) > 0 && String(matched.status || '').toLowerCase() !== 'out of stock';
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

export const getAvailableColorsForThickness = (coils, thickness) => {
  if (!coils || !Array.isArray(coils) || coils.length === 0 || !thickness) return new Set();
  const targetThickness = normalizeThickness(thickness);
  const matching = coils.filter((c) => {
    return normalizeThickness(c.thickness) === targetThickness &&
           Number(c.coilCount) > 0 &&
           String(c.status || '').toLowerCase() !== 'out of stock';
  });
  return new Set(matching.map((c) => c.color));
};

export const hasCoilStockForThickness = (coils, thickness) => {
  if (!coils || !Array.isArray(coils) || coils.length === 0 || !thickness) return false;
  const targetThickness = normalizeThickness(thickness);
  return coils.some((c) => {
    return normalizeThickness(c.thickness) === targetThickness &&
           Number(c.coilCount) > 0 &&
           String(c.status || '').toLowerCase() !== 'out of stock';
  });
};

