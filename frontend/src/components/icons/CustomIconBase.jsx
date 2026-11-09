import React from 'react';
import './customIcons.css';

/**
 * resolveCustomIconProps
 * Normalizes props across MUI sx, fontSize, className, color, and standard SVG properties.
 */
export const resolveCustomIconProps = ({
  size,
  fontSize,
  sx,
  style = {},
  color,
  className = '',
  viewBox = '0 0 24 24',
  ...rest
}) => {
  let resolvedSize = size;
  let resolvedColor = color;
  const mergedStyle = { ...style };

  // Resolve MUI sx props
  if (sx && typeof sx === 'object') {
    if (sx.fontSize) {
      if (typeof sx.fontSize === 'number') {
        resolvedSize = sx.fontSize;
      } else if (sx.fontSize === 'small') {
        resolvedSize = 18;
      } else if (sx.fontSize === 'large') {
        resolvedSize = 28;
      } else if (typeof sx.fontSize === 'string') {
        const parsed = parseInt(sx.fontSize, 10);
        resolvedSize = isNaN(parsed) ? 20 : parsed;
      } else {
        resolvedSize = sx.fontSize;
      }
    }
    if (sx.color) {
      resolvedColor = typeof sx.color === 'string' ? sx.color.replace(/\s*!important/i, '').trim() : sx.color;
    }
    // Copy remaining CSS declarations from sx into inline style
    for (const [key, val] of Object.entries(sx)) {
      if (key !== 'fontSize' && key !== 'color') {
        mergedStyle[key] = val;
      }
    }
  }

  // Resolve MUI fontSize prop
  if (fontSize && !resolvedSize) {
    if (fontSize === 'small') resolvedSize = 18;
    else if (fontSize === 'medium') resolvedSize = 22;
    else if (fontSize === 'large') resolvedSize = 28;
    else if (typeof fontSize === 'number') resolvedSize = fontSize;
    else if (typeof fontSize === 'string') {
      const parsed = parseInt(fontSize, 10);
      resolvedSize = isNaN(parsed) ? 20 : parsed;
    }
  }

  // Sanitize resolvedSize to integer
  if (typeof resolvedSize === 'string') {
    const parsed = parseInt(resolvedSize, 10);
    resolvedSize = isNaN(parsed) ? 20 : parsed;
  }

  // Fallback default size
  resolvedSize = resolvedSize || 20;

  // Resolve theme color shortcuts
  if (resolvedColor) {
    if (typeof resolvedColor === 'string') {
      resolvedColor = resolvedColor.replace(/\s*!important/i, '').trim();
    }
    const colorMap = {
      'primary.main': '#2563eb',
      'secondary.main': '#7c3aed',
      'success.main': '#16a34a',
      'error.main': '#ef4444',
      'warning.main': '#f59e0b',
      'info.main': '#0284c7',
      'text.primary': 'var(--text-primary, #0f172a)',
      'text.secondary': 'var(--text-muted, #64748b)',
      'text.disabled': '#94a3b8'
    };
    if (colorMap[resolvedColor]) {
      resolvedColor = colorMap[resolvedColor];
    }
  }

  return {
    width: resolvedSize,
    height: resolvedSize,
    viewBox,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: `mpi-icon-base ${className}`.trim(),
    style: {
      width: `${resolvedSize}px`,
      height: `${resolvedSize}px`,
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...mergedStyle
    },
    resolvedColor,
    ...rest
  };
};

