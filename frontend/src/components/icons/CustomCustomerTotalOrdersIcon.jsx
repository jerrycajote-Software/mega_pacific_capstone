import React from 'react';
import './customIcons.css';

/**
 * CustomCustomerTotalOrdersIcon
 * Full-color animated vector icon for Customer "Total Orders" KPI.
 * Features a commercial roofing tote order bag, protruding verified order docket,
 * arched metallic gold handles, front corrugation relief, and radiant gleam sparkles.
 */
const CustomCustomerTotalOrdersIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-cust-orders-icon ${className}`}
      role="img"
      aria-label="Customer Total Orders"
      {...props}
    >
      <defs>
        <linearGradient id="mpiCustOrdBagGrad" x1="10" y1="14" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <linearGradient id="mpiCustOrdHandleGrad" x1="16" y1="6" x2="32" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiCustOrdDocGrad" x1="14" y1="8" x2="34" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        <filter id="mpiCustOrdGlow" x="6" y="6" width="36" height="38" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#2563eb" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Arched Gold Handles (Back) */}
      <path
        d="M18 17V12C18 8.68629 20.6863 6 24 6C27.3137 6 30 12 30 17"
        stroke="url(#mpiCustOrdHandleGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Protruding Order Manifest Docket Slip */}
      <g className="mpi-cust-order-doc">
        <rect
          x="15"
          y="9"
          width="18"
          height="16"
          rx="2"
          fill="url(#mpiCustOrdDocGrad)"
          stroke="#cbd5e1"
          strokeWidth="0.8"
        />
        {/* Manifest Header Line */}
        <line x1="18" y1="13" x2="26" y2="13" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
        {/* Manifest Items */}
        <line x1="18" y1="16" x2="30" y2="16" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="18" y1="19" x2="28" y2="19" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <circle cx="28" cy="13" r="1.5" fill="#10b981" />
      </g>

      {/* Tote Bag Main Body */}
      <path
        d="M10 17H38L35.5 41C35.3 42.1 34.4 43 33.3 43H14.7C13.6 43 12.7 42.1 12.5 41L10 17Z"
        fill="url(#mpiCustOrdBagGrad)"
        stroke="#1e40af"
        strokeWidth="1.2"
        filter="url(#mpiCustOrdGlow)"
      />

      {/* Arched Gold Handles (Front Rim) */}
      <path
        d="M18 19V13.5C18 10.2 20.7 7.5 24 7.5C27.3 7.5 30 10.2 30 13.5V19"
        stroke="url(#mpiCustOrdHandleGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Front Bag Accent Stitches & Corrugated Steel Motif */}
      <path
        d="M13 22H35"
        stroke="#60a5fa"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M16 27L20 31L24 27L28 31L32 27"
        stroke="#93c5fd"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Bag Base Fold Shadow Line */}
      <path
        d="M13 38H35"
        stroke="#172554"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Gleam Sparkle Star */}
      <g className="mpi-cust-order-spark">
        <path
          d="M36 7L37 10L40 11L37 12L36 15L35 12L32 11L35 10L36 7Z"
          fill="#fef08a"
          stroke="#f59e0b"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
};

export default CustomCustomerTotalOrdersIcon;
