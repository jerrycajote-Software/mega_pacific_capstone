import React from 'react';

/**
 * CustomFulfillmentPickupIcon
 * Industrial Metal & Steel Hardware theme for Ready for Pick-up at Store.
 * Features an industrial warehouse dispatch bay with corrugated steel gable roof,
 * commercial roll-up door, loading dock concrete platform with yellow hazard striping,
 * and a palletized sheet bundle secured with steel banding straps.
 */
const CustomFulfillmentPickupIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ready for Pick-up - Metal & Steel Hardware"
      {...props}
    >
      <defs>
        {/* Corrugated Warehouse Roof Cladding */}
        <linearGradient id="mpiPickRoofGrad" x1="4" y1="5" x2="32" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Industrial Roll-up Shutter Door */}
        <linearGradient id="mpiPickDoorGrad" x1="8" y1="14" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Staged Banded Steel Roofing Coil / Sheet Bundle */}
        <linearGradient id="mpiPickBundleGrad" x1="12" y1="21" x2="24" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        {/* Ready Beacon Lamp Glow */}
        <filter id="mpiPickBeaconGlow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#10b981" floodOpacity="0.8" />
        </filter>

        <filter id="mpiPickShadow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main Warehouse Structure Body */}
      <g filter="url(#mpiPickShadow)">
        {/* Concrete Plant Depot Side Pillars */}
        <rect x="5" y="13" width="26" height="18" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="1" />

        {/* Corrugated Gable Roof with Steel Rafter Profile */}
        <path
          d="M3 13L18 4L33 13H3Z"
          fill="url(#mpiPickRoofGrad)"
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Roof Rafter Slats */}
        <line x1="18" y1="4.5" x2="18" y2="12.5" stroke="#64748b" strokeWidth="1" />
        <line x1="11" y1="8" x2="11" y2="12.5" stroke="#64748b" strokeWidth="0.8" />
        <line x1="25" y1="8" x2="25" y2="12.5" stroke="#64748b" strokeWidth="0.8" />

        {/* Commercial Industrial Roll-Up Bay Shutter */}
        <rect
          x="8.5"
          y="13"
          width="19"
          height="14"
          fill="url(#mpiPickDoorGrad)"
          stroke="#475569"
          strokeWidth="0.8"
        />

        {/* Shutter Slats Horizontal Groove Lines */}
        <line x1="8.5" y1="16" x2="27.5" y2="16" stroke="#64748b" strokeWidth="0.8" />
        <line x1="8.5" y1="18.5" x2="27.5" y2="18.5" stroke="#64748b" strokeWidth="0.8" />
        <line x1="8.5" y1="21" x2="27.5" y2="21" stroke="#64748b" strokeWidth="0.8" />

        {/* Concrete Loading Dock Platform Base */}
        <rect x="4" y="27" width="28" height="5" rx="1" fill="#334155" stroke="#475569" strokeWidth="0.8" />

        {/* Yellow & Dark Industrial Safety Hazard Stripes Along Dock Curb */}
        <line x1="6" y1="29.5" x2="9" y2="29.5" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="12" y1="29.5" x2="15" y2="29.5" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="21" y1="29.5" x2="24" y2="29.5" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="27" y1="29.5" x2="30" y2="29.5" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />

        {/* Staged Wood Pallet & Banded Sheet Bundle at Dock Floor */}
        {/* Wood Pallet Footers */}
        <rect x="11.5" y="25" width="13" height="2" rx="0.4" fill="#b45309" stroke="#78350f" strokeWidth="0.5" />
        {/* Stacked Prepainted Steel Sheet Package */}
        <rect
          x="12"
          y="20.5"
          width="12"
          height="5"
          rx="1"
          fill="url(#mpiPickBundleGrad)"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />

        {/* High-Tensile Steel Banding Straps */}
        <line x1="15" y1="20.5" x2="15" y2="27" stroke="#fef08a" strokeWidth="1" />
        <line x1="21" y1="20.5" x2="21" y2="27" stroke="#fef08a" strokeWidth="1" />
      </g>

      {/* Industrial Emerald "Ready For Retrieval" Beacon Light on Roof Apex */}
      <g filter="url(#mpiPickBeaconGlow)">
        <circle cx="18" cy="4" r="2.2" fill="#10b981" />
        <circle cx="18" cy="4" r="1" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default CustomFulfillmentPickupIcon;
