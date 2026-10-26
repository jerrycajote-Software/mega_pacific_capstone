import React from 'react';
import './customIcons.css';

/**
 * CustomGrossRevenueIcon
 * Full-color animated SVG icon for Gross Revenue KPI card.
 * Features ascending multi-tier emerald financial metric bars, soaring upward growth arrow,
 * gleaming Philippine Peso currency emblem, and live telemetry micro-motion.
 */
const CustomGrossRevenueIcon = ({ size = 22, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Gross Revenue"
    >
      <defs>
        <linearGradient id="mpiRevBarGrad1" x1="6" y1="28" x2="6" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="mpiRevBarGrad2" x1="12" y1="28" x2="12" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        <linearGradient id="mpiRevBarGrad3" x1="18" y1="28" x2="18" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>

        <linearGradient id="mpiRevArrowGrad" x1="5" y1="24" x2="27" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>

        <linearGradient id="mpiRevCoinGrad" x1="20" y1="18" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <filter id="mpiRevGlowFilter" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ascending Metric Bars */}
      <rect
        className="mpi-rev-bar-1"
        x="4"
        y="21"
        width="4"
        height="7"
        rx="1.5"
        fill="url(#mpiRevBarGrad1)"
        opacity="0.85"
      />
      <rect
        className="mpi-rev-bar-2"
        x="10"
        y="16"
        width="4"
        height="12"
        rx="1.5"
        fill="url(#mpiRevBarGrad2)"
        opacity="0.9"
      />
      <rect
        className="mpi-rev-bar-3"
        x="16"
        y="11"
        width="4"
        height="17"
        rx="1.5"
        fill="url(#mpiRevBarGrad3)"
        opacity="0.95"
      />

      {/* Upward Growth Trendline & Arrow */}
      <g className="mpi-rev-arrow" filter="url(#mpiRevGlowFilter)">
        <path
          d="M 4 23 Q 13 20 23 8"
          stroke="url(#mpiRevArrowGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 18 7 H 25 V 14"
          stroke="#4ade80"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Floating Gleaming Peso Coin Emblem */}
      <g className="mpi-rev-coin">
        <circle
          cx="24"
          cy="22"
          r="5"
          fill="url(#mpiRevCoinGrad)"
          stroke="#fbbf24"
          strokeWidth="1"
        />
        {/* Currency Peso Sign */}
        <text
          x="24"
          y="24.2"
          fontSize="5.5"
          fontWeight="800"
          textAnchor="middle"
          fill="#78350f"
          fontFamily="Arial, sans-serif"
        >
          ₱
        </text>
      </g>
    </svg>
  );
};

export default CustomGrossRevenueIcon;
