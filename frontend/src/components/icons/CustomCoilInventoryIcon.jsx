import React from 'react';
import './customIcons.css';

/**
 * CustomCoilInventoryIcon
 * Clean, colored custom icon for Coil Inventory in Logistics layout.
 * Features an industrial master steel coil roll in high-tech sky blue and teal.
 */
const CustomCoilInventoryIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Coil Inventory Icon"
    >
      {/* Outer Master Coil Cylinder */}
      <circle
        cx="11.5"
        cy="11.5"
        r="8"
        stroke="#0ea5e9"
        strokeWidth="1.8"
        fill="#0ea5e9"
        fillOpacity="0.18"
      />

      {/* Concentric Layer Ring */}
      <circle
        cx="11.5"
        cy="11.5"
        r="5"
        stroke="#38bdf8"
        strokeWidth="1.3"
        fill="none"
      />

      {/* Center Arbor Spindle Hole */}
      <circle
        cx="11.5"
        cy="11.5"
        r="2.2"
        fill="#0284c7"
      />

      {/* Unfurled Steel Sheet Tail */}
      <path
        d="M11.5 19.5H19.5C20.6 19.5 21.5 18.6 21.5 17.5"
        stroke="#0284c7"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default CustomCoilInventoryIcon;
