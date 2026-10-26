import React from 'react';
import './customIcons.css';

/**
 * CustomCustomerTotalSpentIcon
 * Full-color animated vector icon for Customer "Total Spent" KPI.
 * Features an executive forest green leather wallet, protruding banknote,
 * a floating 3D cylindrical Philippine Peso (₱) gold coin, metallic clasp, and coin shimmer.
 */
const CustomCustomerTotalSpentIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-cust-spent-icon ${className}`}
      role="img"
      aria-label="Customer Total Spent"
      {...props}
    >
      <defs>
        <linearGradient id="mpiCustSpentWalletGrad" x1="6" y1="18" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f772d" />
          <stop offset="60%" stopColor="#2d4a19" />
          <stop offset="100%" stopColor="#14260b" />
        </linearGradient>

        <linearGradient id="mpiCustSpentFlapGrad" x1="18" y1="20" x2="42" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#659639" />
          <stop offset="100%" stopColor="#3d5c22" />
        </linearGradient>

        <linearGradient id="mpiCustSpentBillGrad" x1="12" y1="12" x2="34" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dcfce7" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>

        <linearGradient id="mpiCustSpentCoinGrad" x1="26" y1="6" x2="44" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <filter id="mpiCustSpentGlow" x="4" y="6" width="40" height="38" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#4f772d" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Protruding Banknote from Wallet Pocket */}
      <g>
        <path
          d="M11 15C11 13.8954 11.8954 13 13 13H33C34.1046 13 35 13.8954 35 15V22H11V15Z"
          fill="url(#mpiCustSpentBillGrad)"
          stroke="#4ade80"
          strokeWidth="0.8"
        />
        <circle cx="23" cy="17" r="2.2" stroke="#16a34a" strokeWidth="0.8" fill="none" />
        <line x1="14" y1="17" x2="18" y2="17" stroke="#16a34a" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="28" y1="17" x2="32" y2="17" stroke="#16a34a" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* Floating 3D Gold Coin with Philippine Peso (₱) Glyph */}
      <g className="mpi-cust-spent-coin">
        {/* Coin Cylinder Thickness Edge */}
        <circle cx="34" cy="15.5" r="7.5" fill="#92400e" />
        {/* Coin Front Face */}
        <circle cx="34" cy="14.5" r="7.2" fill="url(#mpiCustSpentCoinGrad)" stroke="#fef08a" strokeWidth="0.8" />
        {/* Coin Beveled Inner Rim */}
        <circle cx="34" cy="14.5" r="5.6" stroke="#fbbf24" strokeWidth="0.6" strokeDasharray="1.5 1" />
        {/* Philippine Peso (₱) Symbol */}
        <text
          x="34"
          y="18.2"
          textAnchor="middle"
          fontSize="9"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#78350f"
        >
          ₱
        </text>
      </g>

      {/* Main Leather Wallet Body */}
      <rect
        x="7"
        y="19"
        width="34"
        height="22"
        rx="4"
        fill="url(#mpiCustSpentWalletGrad)"
        stroke="#273e16"
        strokeWidth="1.2"
        filter="url(#mpiCustSpentGlow)"
      />

      {/* Decorative Perimeter Saddle Stitches */}
      <rect
        x="9"
        y="21"
        width="30"
        height="18"
        rx="3"
        fill="none"
        stroke="#84cc16"
        strokeWidth="0.9"
        strokeDasharray="2.5 1.5"
        opacity="0.65"
      />

      {/* Front Flap Pocket Strap */}
      <path
        d="M26 25H41V35H26C23.8 35 22 33.2 22 31V29C22 26.8 23.8 25 26 25Z"
        fill="url(#mpiCustSpentFlapGrad)"
        stroke="#223812"
        strokeWidth="1"
      />

      {/* Metallic Gold Clasp Snap Button */}
      <circle cx="26" cy="30" r="2.4" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
      <circle cx="26" cy="30" r="1.1" fill="#fef08a" />

      {/* Sparkle Gleam on Coin */}
      <g className="mpi-cust-spent-spark">
        <path
          d="M39 7L40 9.5L42.5 10.5L40 11.5L39 14L38 11.5L35.5 10.5L38 9.5L39 7Z"
          fill="#fef08a"
          stroke="#f59e0b"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
};

export default CustomCustomerTotalSpentIcon;
