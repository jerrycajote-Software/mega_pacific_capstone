import React from 'react';
import './customIcons.css';

/**
 * CustomRefundCompletedIcon
 * Full-color animated SVG icon for Refund Management "Total Refunded" KPI card.
 * Features an emerald verification shield seal with dimensional checkmark,
 * orbiting currency refund tokens with Philippine Peso (₱) emblem, and radiant gleam.
 */
const CustomRefundCompletedIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Total Refunded"
    >
      <defs>
        <linearGradient id="mpiRefCompSealGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="mpiRefCompBorderGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="mpiRefCompCheckGrad" x1="10" y1="16" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>

        <linearGradient id="mpiRefCompCoinGrad" x1="20" y1="18" x2="29" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <filter id="mpiRefCompGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Main Verification Seal / Shield */}
      <g filter="url(#mpiRefCompGlow)">
        {/* Outer Circular Ring with Bevel */}
        <circle
          cx="16"
          cy="16"
          r="11.5"
          fill="url(#mpiRefCompSealGrad)"
          stroke="url(#mpiRefCompBorderGrad)"
          strokeWidth="1.8"
        />

        {/* Inner Guilloche Stitched Ring */}
        <circle
          cx="16"
          cy="16"
          r="9.5"
          fill="none"
          stroke="#6ee7b7"
          strokeWidth="0.8"
          strokeDasharray="2 1"
          opacity="0.8"
        />

        {/* Bold Dimensional Checkmark */}
        <path
          className="mpi-ref-comp-check"
          d="M 11.5 16.5 L 14.5 19.5 L 21 12.5"
          stroke="url(#mpiRefCompCheckGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 1px 2px rgba(4, 120, 87, 0.6))"
        />
      </g>

      {/* Returned Currency Token / Coin Badge at Bottom-Right */}
      <g className="mpi-ref-comp-coin">
        <ellipse cx="23.5" cy="23.5" rx="4.5" ry="2" fill="#92400e" />
        <ellipse cx="23.5" cy="22" rx="4.5" ry="2" fill="url(#mpiRefCompCoinGrad)" stroke="#fef08a" strokeWidth="0.6" />
        <ellipse cx="23.5" cy="22" rx="3.3" ry="1.3" fill="none" stroke="#d97706" strokeWidth="0.4" />
        <text
          x="23.5"
          y="23"
          textAnchor="middle"
          fontSize="3.2"
          fontWeight="900"
          fill="#78350f"
          fontFamily="Arial, sans-serif"
        >
          ₱
        </text>
      </g>

      {/* Radiant Sparkle */}
      <g className="mpi-ref-comp-sparkle">
        <path
          d="M 24 5 L 25 2.5 L 26 5 L 28.5 6 L 26 7 L 25 9.5 L 24 7 L 21.5 6 Z"
          fill="#6ee7b7"
          filter="drop-shadow(0 0 2px #34d399)"
        />
      </g>
    </svg>
  );
};

export default CustomRefundCompletedIcon;
