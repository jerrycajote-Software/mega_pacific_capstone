import React from 'react';

/**
 * CustomRegistrationSuccessIcon
 * Celebratory icon for "Registration Successful" modal.
 * Clean, simple, and colorful featuring a verified user silhouette,
 * golden victory bezel, vibrant emerald disc, and festive sparkles.
 */
const CustomRegistrationSuccessIcon = ({ size = 72, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Registration Successful"
      {...props}
    >
      <defs>
        {/* Emerald Core Gradient */}
        <linearGradient id="mpiRegEmeraldGrad" x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="35%" stopColor="#10b981" />
          <stop offset="85%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Golden Victory Bezel */}
        <linearGradient id="mpiRegGoldRingGrad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="80%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Top-Right Golden Star Gradient */}
        <linearGradient id="mpiRegGoldStarGrad" x1="44" y1="8" x2="52" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Verified Badge Gradient */}
        <linearGradient id="mpiRegBadgeGrad" x1="32" y1="32" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Disc Drop Shadow */}
        <filter id="mpiRegDiscShadow" x="4" y="6" width="56" height="56" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#059669" floodOpacity="0.32" />
        </filter>
      </defs>

      {/* Outer Soft Mint Celebratory Halo */}
      <circle cx="32" cy="32" r="30" fill="#10b981" fillOpacity="0.12" />

      {/* Colorful Festive Accents */}
      {/* Top-Right Golden Sparkle Star */}
      <path
        d="M48 8 C48 11 45 12 45 12 C45 12 48 13 48 16 C48 13 51 12 51 12 C51 12 48 11 48 8 Z"
        fill="url(#mpiRegGoldStarGrad)"
      />
      {/* Top-Left Azure Sky Spark */}
      <circle cx="15" cy="18" r="2.2" fill="#38bdf8" />
      {/* Bottom-Left Coral Dot */}
      <circle cx="14" cy="46" r="2.2" fill="#fb7185" />
      {/* Bottom-Right Mint Diamond Sparkle */}
      <path
        d="M50 43 C50 45.5 48 46.5 48 46.5 C48 46.5 50 47.5 50 50 C50 47.5 52 46.5 52 46.5 C52 46.5 50 45.5 50 43 Z"
        fill="#34d399"
      />

      {/* Main Disc Group */}
      <g filter="url(#mpiRegDiscShadow)">
        {/* Outer Golden Victory Bezel */}
        <circle cx="32" cy="32" r="22.5" fill="none" stroke="url(#mpiRegGoldRingGrad)" strokeWidth="2.5" />

        {/* Inner Vibrant Emerald Disc */}
        <circle cx="32" cy="32" r="20" fill="url(#mpiRegEmeraldGrad)" />

        {/* Upper Specular Light Arch */}
        <path
          d="M16 26 C18 19 25 15 32 15 C39 15 46 19 48 26"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />

        {/* User Profile Silhouette */}
        {/* User Head */}
        <circle cx="30" cy="23" r="5.5" fill="#ffffff" />
        {/* User Shoulders / Torso */}
        <path
          d="M19 38.5 C19 32.5 24 30.5 30 30.5 C34 30.5 37.5 31.5 39.5 34"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Verified Checkmark Badge Seal */}
        <circle cx="40" cy="38" r="7.5" fill="url(#mpiRegBadgeGrad)" stroke="#ffffff" strokeWidth="2" />
        <path
          d="M36.5 38 L39 40.5 L44 35.5"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default CustomRegistrationSuccessIcon;

