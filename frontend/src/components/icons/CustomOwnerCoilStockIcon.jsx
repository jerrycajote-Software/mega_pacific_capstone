import React from 'react';
import './customIcons.css';

/**
 * CustomOwnerCoilStockIcon
 * Industrial cyan/sky theme representing Owner Raw Coil Stock with master steel roll,
 * metallic cylindrical luster, hollow spindle arbor, and unfurled steel coil ribbon.
 * Adheres strictly to SOLID Single Responsibility Principle.
 */
const CustomOwnerCoilStockIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-owner-coil-icon ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="mpiOwnerCoilBodyGrad" x1="12" y1="12" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="mpiOwnerCoilFaceGrad" x1="10" y1="14" x2="26" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
        <linearGradient id="mpiOwnerCoilRibbonGrad" x1="20" y1="32" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="mpiOwnerCoilGlow" x="4" y="6" width="40" height="38" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0284c7" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Industrial Base Platform */}
      <rect x="6" y="40" width="36" height="3" rx="1.5" fill="#0284c7" fillOpacity="0.25" />

      {/* Unfurled Steel Sheet Ribbon Extending Outward */}
      <path
        d="M20 33C24 33 28 35 32 36L42 38C43 38.2 43.5 39 43 39.8C42.5 40.5 41.5 40.8 40.5 40.5L24 36.5C21 35.8 19 34.5 19 33.5Z"
        fill="url(#mpiOwnerCoilRibbonGrad)"
        className="mpi-owner-coil-ribbon"
      />

      {/* Master Cylindrical Coil Barrel */}
      <g filter="url(#mpiOwnerCoilGlow)">
        {/* Cylindrical Shell Side */}
        <path
          d="M18 12C24 12 36 15 36 24C36 33 24 36 18 36C18 36 34 33 34 24C34 15 18 12 18 12Z"
          fill="url(#mpiOwnerCoilBodyGrad)"
          opacity="0.9"
        />
        {/* Cylindrical Top/Side Connectors */}
        <path
          d="M18 12L32 15C36 16 38 19 38 24C38 29 36 32 32 33L18 36V12Z"
          fill="url(#mpiOwnerCoilBodyGrad)"
          className="mpi-owner-coil-body"
        />
        {/* Front Circular Face of Coil */}
        <ellipse
          cx="18"
          cy="24"
          rx="10"
          ry="12"
          fill="url(#mpiOwnerCoilFaceGrad)"
          stroke="#e0f2fe"
          strokeWidth="1.2"
        />

        {/* Concentric Steel Layer Rings */}
        <ellipse
          cx="18"
          cy="24"
          rx="7"
          ry="8.5"
          stroke="#7dd3fc"
          strokeWidth="1"
          strokeDasharray="3 2"
          className="mpi-owner-coil-spin"
        />

        {/* Core Hollow Spindle Arbor Hole */}
        <ellipse
          cx="18"
          cy="24"
          rx="4"
          ry="5"
          fill="#0c4a6e"
          stroke="#38bdf8"
          strokeWidth="1"
        />
        <ellipse
          cx="18"
          cy="24"
          rx="2"
          ry="2.5"
          fill="#082f49"
        />
      </g>

      {/* Metric Stock Telemetry Tag Badge */}
      <g className="mpi-owner-coil-badge">
        <rect x="30" y="8" width="13" height="12" rx="3" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1" />
        <path d="M33 12H40M33 15H38M33 17H36" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
        <circle cx="40" cy="11" r="1.5" fill="#38bdf8" />
      </g>
    </svg>
  );
};

export default CustomOwnerCoilStockIcon;
