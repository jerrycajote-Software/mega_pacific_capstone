import React from 'react';
import './customIcons.css';

/**
 * CustomCoilInventoryIcon
 * Full-color animated icon for Coil Inventory in Logistic layout.
 * Features an industrial prepainted steel master roll coil with wound metal laminates,
 * dynamic metallic luster reflection sweep, and an inventory stock tracking barcode tag.
 */
const CustomCoilInventoryIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Coil Inventory Icon"
    >
      <defs>
        <linearGradient id="mpiCoilBodyGrad" x1="3" y1="6" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="35%" stopColor="#2563eb" />
          <stop offset="70%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        <linearGradient id="mpiCoilSteelCoreGrad" x1="8" y1="10" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        <linearGradient id="mpiCoilTagGrad" x1="20" y1="3" x2="29" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        <radialGradient id="mpiCoilInnerHole" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="70%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
      </defs>

      {/* Industrial Steel Coil Outer Rim */}
      <circle cx="14" cy="16" r="11" fill="url(#mpiCoilBodyGrad)" stroke="#38bdf8" strokeWidth="1" />

      {/* Concentric Rolled Metal Layer Rings */}
      <circle cx="14" cy="16" r="8.8" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
      <circle cx="14" cy="16" r="6.8" fill="url(#mpiCoilSteelCoreGrad)" stroke="#e2e8f0" strokeWidth="0.8" />

      {/* Spindle Core Arbor Hole */}
      <circle cx="14" cy="16" r="3.6" fill="url(#mpiCoilInnerHole)" stroke="#334155" strokeWidth="0.8" />
      <circle cx="14" cy="16" r="1.4" fill="#020617" />

      {/* Dynamic Metallic Sheen Light Glint */}
      <path
        className="mpi-coil-core"
        d="M14 6C19.5228 6 24 10.4772 24 16"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Warehouse Inventory Barcode Stock Tag */}
      <g className="mpi-coil-tag">
        {/* Fastener Wire Line */}
        <line x1="19" y1="11" x2="23" y2="5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />

        {/* Hanging Asset Tag */}
        <rect
          x="21"
          y="4"
          width="8.5"
          height="12"
          rx="1.5"
          fill="url(#mpiCoilTagGrad)"
          stroke="#ca8a04"
          strokeWidth="0.8"
        />

        {/* Barcode Striping */}
        <line x1="23" y1="7.5" x2="23" y2="13.5" stroke="#1f2937" strokeWidth="1" />
        <line x1="25" y1="7.5" x2="25" y2="13.5" stroke="#1f2937" strokeWidth="0.8" />
        <line x1="27" y1="7.5" x2="27" y2="13.5" stroke="#1f2937" strokeWidth="1.2" />
        <circle cx="25.2" cy="5.2" r="0.7" fill="#713f12" />
      </g>
    </svg>
  );
};

export default CustomCoilInventoryIcon;
