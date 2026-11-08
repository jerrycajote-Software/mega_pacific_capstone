import React from 'react';

/**
 * CustomFulfillmentFabricatingIcon
 * Industrial Metal & Steel Hardware theme for Fabricating / Staging / Plant Production.
 * Features an industrial roll-forming gear press, 3D corrugated rib-type prepainted
 * steel roofing sheet profile with metallic sheen, and hot plasma sparks.
 */
const CustomFulfillmentFabricatingIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Fabricating & Staging - Metal & Steel Hardware"
      {...props}
    >
      <defs>
        {/* Prepainted Steel Blue Roofing Sheet Profile Top Face */}
        <linearGradient id="mpiFabSheetTop" x1="2" y1="20" x2="34" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="30%" stopColor="#0284c7" />
          <stop offset="70%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        {/* 3D Gauge Thickness Sheet Edge (Extruded Steel Edge) */}
        <linearGradient id="mpiFabSheetEdge" x1="2" y1="26" x2="34" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0c4a6e" />
          <stop offset="50%" stopColor="#075985" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        {/* Hardened Roll-Forming Steel Gear Gradient */}
        <linearGradient id="mpiFabGearGrad" x1="10" y1="2" x2="26" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="40%" stopColor="#64748b" />
          <stop offset="80%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Center Brass Bushing Arbor */}
        <radialGradient id="mpiFabBrassBushing" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>

        {/* Hot Spark Glow */}
        <filter id="mpiFabSparkGlow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.8" />
        </filter>

        <filter id="mpiFabDropShadow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Industrial Machine Roll-Former Gear Wheel (Top Center) */}
      <g filter="url(#mpiFabDropShadow)">
        {/* Gear Outer Teeth Rim */}
        <path
          d="M18 3L20 4.2L20.8 3L22.8 4.6L22.3 6L24.6 7.8L26 7.2L27.2 9.2L26 10L27.5 12.2L29 12L29.5 14.5L28 15L29 17.5L27 18H26.8"
          stroke="#475569"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Main Cast Steel Wheel Disc */}
        <circle
          cx="18"
          cy="10.5"
          r="6.8"
          fill="url(#mpiFabGearGrad)"
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        {/* Concentric Recessed Lathe Grooves */}
        <circle cx="18" cy="10.5" r="4.8" stroke="#1e293b" strokeWidth="0.8" fill="none" opacity="0.6" />

        {/* Central Brass Arbor Spindle Bushing */}
        <circle cx="18" cy="10.5" r="2.8" fill="url(#mpiFabBrassBushing)" stroke="#78350f" strokeWidth="0.6" />
        <circle cx="18" cy="10.5" r="1.1" fill="#020617" />
      </g>

      {/* 3D Corrugated / Rib-Type Prepainted Steel Sheet Profile Being Roll-Formed */}
      <g filter="url(#mpiFabDropShadow)">
        {/* Extruded Lower Gauge Depth Thickness Edge */}
        <path
          d="M3 24.5L7 20H11.5L15.5 25H20.5L24.5 20H29L33 24.5V28.5L29 24H24.5L20.5 29H15.5L11.5 24H7L3 28.5V24.5Z"
          fill="url(#mpiFabSheetEdge)"
          stroke="#082f49"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Top Metallic Pre-Painted Finish Face */}
        <path
          d="M3 23L7 18.5H11.5L15.5 23.5H20.5L24.5 18.5H29L33 23L33 25L29 20.5H24.5L20.5 25.5H15.5L11.5 20.5H7L3 25V23Z"
          fill="url(#mpiFabSheetTop)"
          stroke="#38bdf8"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />

        {/* Metallic Luster Specular Highlights Along Rib Crests */}
        <line x1="7" y1="18.5" x2="11.5" y2="18.5" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="24.5" y1="18.5" x2="29" y2="18.5" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="15.5" y1="23.5" x2="20.5" y2="23.5" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Hot Laser / Shearing Sparks Flying Off Cutting Point */}
      <g filter="url(#mpiFabSparkGlow)">
        {/* Left Sparks */}
        <circle cx="9.5" cy="15" r="1.1" fill="#fef08a" />
        <circle cx="6" cy="13.5" r="0.8" fill="#f97316" />
        <line x1="9" y1="15.5" x2="6.5" y2="13.5" stroke="#fbbf24" strokeWidth="0.8" strokeLinecap="round" />

        {/* Right Sparks */}
        <circle cx="26.5" cy="15" r="1.1" fill="#fef08a" />
        <circle cx="30" cy="13.5" r="0.8" fill="#f97316" />
        <line x1="27" y1="15.5" x2="29.5" y2="13.5" stroke="#fbbf24" strokeWidth="0.8" strokeLinecap="round" />

        {/* Central Roll Shear Flash */}
        <circle cx="18" cy="18" r="1.3" fill="#ffffff" />
        <circle cx="18" cy="18" r="0.7" fill="#fde047" />
      </g>
    </svg>
  );
};

export default CustomFulfillmentFabricatingIcon;
