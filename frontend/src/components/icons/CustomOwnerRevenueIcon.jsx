import React from 'react';
import './customIcons.css';

/**
 * CustomOwnerRevenueIcon
 * Executive gold/amber theme representing Owner Gross Revenue with ascending wealth pillars,
 * soaring profit trendline arrow, and gleaming 24K gold Philippine Peso (₱) medallion.
 * Strictly adheres to SOLID Single Responsibility Principle.
 */
const CustomOwnerRevenueIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-owner-rev-icon ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="mpiOwnerRevPillar1" x1="10" y1="26" x2="16" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="mpiOwnerRevPillar2" x1="18" y1="20" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="mpiOwnerRevPillar3" x1="26" y1="14" x2="32" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="mpiOwnerRevArrowGrad" x1="8" y1="30" x2="38" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="mpiOwnerRevCoinGrad" x1="26" y1="10" x2="44" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <filter id="mpiOwnerRevGlow" x="4" y="4" width="40" height="40" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#f59e0b" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Base Grid Platform */}
      <rect x="7" y="39" width="34" height="3" rx="1.5" fill="#d97706" fillOpacity="0.3" />

      {/* Ascending Wealth Pillars */}
      <rect x="9" y="27" width="6" height="12" rx="2" fill="url(#mpiOwnerRevPillar1)" className="mpi-owner-rev-bar-1" />
      <rect x="17" y="21" width="6" height="18" rx="2" fill="url(#mpiOwnerRevPillar2)" className="mpi-owner-rev-bar-2" />
      <rect x="25" y="15" width="6" height="24" rx="2" fill="url(#mpiOwnerRevPillar3)" className="mpi-owner-rev-bar-3" />

      {/* Soaring Upward Trendline */}
      <path
        d="M8 29L19 19L27 24L38 10"
        stroke="url(#mpiOwnerRevArrowGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#mpiOwnerRevGlow)"
        className="mpi-owner-rev-trend"
      />
      <path
        d="M32 10H38V16"
        stroke="url(#mpiOwnerRevArrowGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mpi-owner-rev-trend"
      />

      {/* Floating 24K Gold Coin Medallion with Peso Symbol */}
      <g className="mpi-owner-rev-coin" filter="url(#mpiOwnerRevGlow)">
        <circle cx="36" cy="18" r="8" fill="url(#mpiOwnerRevCoinGrad)" stroke="#fef08a" strokeWidth="1" />
        <circle cx="36" cy="18" r="6.2" stroke="#fffbeb" strokeWidth="0.6" strokeDasharray="1.5 1.5" opacity="0.8" />
        {/* Peso Symbol ₱ */}
        <text
          x="36"
          y="21"
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#ffffff"
        >
          ₱
        </text>
      </g>

      {/* Radiant Apex Sparkle */}
      <circle cx="42" cy="10" r="1.5" fill="#fef08a" className="mpi-owner-rev-spark" />
    </svg>
  );
};

export default CustomOwnerRevenueIcon;
