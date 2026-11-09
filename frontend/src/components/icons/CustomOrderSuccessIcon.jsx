import React from 'react';

/**
 * CustomOrderSuccessIcon
 * Celebratory icon for "Order Placed Successfully" screen.
 * Clean, simple, and colorful featuring vibrant emerald, warm sunshine gold,
 * sky blue, and coral accents with a crisp victory checkmark.
 */
const CustomOrderSuccessIcon = ({ size = 80, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Order Placed Successfully"
      {...props}
    >
      <defs>
        {/* Emerald Core Gradient */}
        <linearGradient id="mpiSuccEmeraldGrad" x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="35%" stopColor="#10b981" />
          <stop offset="85%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Golden Victory Bezel */}
        <linearGradient id="mpiSuccGoldRingGrad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="80%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Top-Right Golden Star Gradient */}
        <linearGradient id="mpiSuccGoldStarGrad" x1="44" y1="9" x2="52" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Drop Shadow for the Disc */}
        <filter id="mpiSuccDiscShadow" x="4" y="6" width="56" height="56" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#059669" floodOpacity="0.32" />
        </filter>
      </defs>

      {/* Outer Soft Mint Celebratory Halo */}
      <circle cx="32" cy="32" r="30" fill="#10b981" fillOpacity="0.12" />

      {/* Colorful Celebratory Accents */}
      {/* Top-Right Golden Sparkle Star */}
      <path
        d="M48 9 C48 12 45 13 45 13 C45 13 48 14 48 17 C48 14 51 13 51 13 C51 13 48 12 48 9 Z"
        fill="url(#mpiSuccGoldStarGrad)"
      />
      {/* Top-Left Azure Sky Spark */}
      <circle cx="16" cy="18" r="2.2" fill="#38bdf8" />
      {/* Bottom-Right Coral Dot */}
      <circle cx="49" cy="47" r="2.2" fill="#fb7185" />
      {/* Bottom-Left Mint Diamond Sparkle */}
      <path
        d="M14 43 C14 45.5 12 46.5 12 46.5 C12 46.5 14 47.5 14 50 C14 47.5 16 46.5 16 46.5 C16 46.5 14 45.5 14 43 Z"
        fill="#34d399"
      />

      {/* Main Disc Group with Subtle Elevation Shadow */}
      <g filter="url(#mpiSuccDiscShadow)">
        {/* Outer Golden Victory Bezel */}
        <circle cx="32" cy="32" r="22.5" fill="none" stroke="url(#mpiSuccGoldRingGrad)" strokeWidth="2.5" />

        {/* Inner Vibrant Emerald Disc */}
        <circle cx="32" cy="32" r="20" fill="url(#mpiSuccEmeraldGrad)" />

        {/* Upper Specular Light Arch */}
        <path
          d="M16 27 C18 19 26 15 32 15 C38 15 46 19 48 27"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />

        {/* Crisp White Victory Checkmark */}
        <path
          d="M23 32.5 L29 38.5 L41.5 24.5"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner Mint Checkmark Highlight */}
        <path
          d="M23 32.5 L29 38.5 L41.5 24.5"
          stroke="#dcfce7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.75"
        />
      </g>
    </svg>
  );
};

export default CustomOrderSuccessIcon;

