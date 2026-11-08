import React from 'react';
import './customIcons.css';

/**
 * CustomPreOrderIcon
 * Clean, colored custom icon for Pre-Order Products in Sales layout.
 * Features an industrial corrugated roofing package in warm amber and gold.
 */
const CustomPreOrderIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pre-Order Products Icon"
    >
      {/* Top Isometric Roof Face */}
      <path
        d="M12 3L20 7.5L12 12L4 7.5L12 3Z"
        stroke="#f59e0b"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="#fbbf24"
        fillOpacity="0.45"
      />

      {/* Left Shaded Flank */}
      <path
        d="M4 7.5V16.5L12 21V12L4 7.5Z"
        stroke="#f59e0b"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="#f59e0b"
        fillOpacity="0.22"
      />

      {/* Right Flank */}
      <path
        d="M20 7.5V16.5L12 21V12L20 7.5Z"
        stroke="#d97706"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="#d97706"
        fillOpacity="0.08"
      />

      {/* Center Seam */}
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="21"
        stroke="#d97706"
        strokeWidth="1.8"
      />

      {/* Top Ridge Rib Seam */}
      <line
        x1="8"
        y1="5.25"
        x2="16"
        y2="9.75"
        stroke="#fbbf24"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CustomPreOrderIcon;
