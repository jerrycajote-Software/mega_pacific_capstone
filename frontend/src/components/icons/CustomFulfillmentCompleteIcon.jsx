import React from 'react';

/**
 * CustomFulfillmentCompleteIcon
 * Industrial Metal & Steel Hardware theme for Picked Up / Delivered / Handover Complete.
 * Features an industrial stainless steel medallion with 8 hex bolt studs,
 * 24K golden brass victory bezel, 3D emerald jewel checkmark, and metal gleam accents.
 */
const CustomFulfillmentCompleteIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Order Complete - Metal & Steel Hardware"
      {...props}
    >
      <defs>
        {/* Stainless Steel Outer Flange Plate */}
        <radialGradient id="mpiCompSteelFlange" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor="#cbd5e1" />
          <stop offset="85%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>

        {/* 24K Golden Brass Victory Bezel */}
        <linearGradient id="mpiCompGoldBezel" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Emerald Jewel Seal Core */}
        <radialGradient id="mpiCompJewelCore" cx="0.4" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="80%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064e3b" />
        </radialGradient>

        {/* Hex Bolt Stud Gradient */}
        <radialGradient id="mpiCompBoltGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>

        {/* Emerald Triumph Glow */}
        <filter id="mpiCompGlow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#mpiCompGlow)">
        {/* Outer Heavy Stainless Steel Flange Rim */}
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="url(#mpiCompSteelFlange)"
          stroke="#e2e8f0"
          strokeWidth="1.2"
        />

        {/* 8 Industrial Hex Bolt Studs Around Circumference */}
        {/* Top & Bottom */}
        <circle cx="18" cy="4.2" r="1.3" fill="url(#mpiCompBoltGrad)" stroke="#1e293b" strokeWidth="0.4" />
        <circle cx="18" cy="31.8" r="1.3" fill="url(#mpiCompBoltGrad)" stroke="#1e293b" strokeWidth="0.4" />
        {/* Left & Right */}
        <circle cx="4.2" cy="18" r="1.3" fill="url(#mpiCompBoltGrad)" stroke="#1e293b" strokeWidth="0.4" />
        <circle cx="31.8" cy="18" r="1.3" fill="url(#mpiCompBoltGrad)" stroke="#1e293b" strokeWidth="0.4" />
        {/* Diagonals */}
        <circle cx="8.3" cy="8.3" r="1.3" fill="url(#mpiCompBoltGrad)" stroke="#1e293b" strokeWidth="0.4" />
        <circle cx="27.7" cy="8.3" r="1.3" fill="url(#mpiCompBoltGrad)" stroke="#1e293b" strokeWidth="0.4" />
        <circle cx="8.3" cy="27.7" r="1.3" fill="url(#mpiCompBoltGrad)" stroke="#1e293b" strokeWidth="0.4" />
        <circle cx="27.7" cy="27.7" r="1.3" fill="url(#mpiCompBoltGrad)" stroke="#1e293b" strokeWidth="0.4" />

        {/* Inner 24K Golden Brass Victory Bezel */}
        <circle
          cx="18"
          cy="18"
          r="12.5"
          fill="url(#mpiCompGoldBezel)"
          stroke="#fef08a"
          strokeWidth="1"
        />

        {/* Deep Emerald Jewel Center Core */}
        <circle
          cx="18"
          cy="18"
          r="9.8"
          fill="url(#mpiCompJewelCore)"
          stroke="#064e3b"
          strokeWidth="0.8"
        />

        {/* Concentric Reflection Ring */}
        <circle
          cx="18"
          cy="18"
          r="8.5"
          stroke="#34d399"
          strokeWidth="0.6"
          strokeDasharray="3 2"
          opacity="0.8"
        />

        {/* Bold 3D Verified Checkmark with White Luster Highlight */}
        {/* Drop Shadow Under Checkmark */}
        <path
          d="M12.5 18.5L16.2 22.2L24.2 13.8"
          stroke="#064e3b"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Primary Crisp White Checkmark */}
        <path
          d="M12.5 17.8L16.2 21.5L24.2 13.2"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Specular Glint Reflection Star on Bevel */}
        <circle cx="15" cy="11.5" r="1.2" fill="#ffffff" opacity="0.9" />
      </g>
    </svg>
  );
};

export default CustomFulfillmentCompleteIcon;
