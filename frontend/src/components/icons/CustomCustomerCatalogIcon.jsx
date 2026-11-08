import React from 'react';
import './customIcons.css';

/**
 * CustomCustomerCatalogIcon
 * Full-color animated icon for Customer Portal Products / Catalog.
 * Features stacked pre-painted corrugated metal roofing sheets (Sapphire Blue & Forest Green),
 * an industrial dispatch crate base, golden security strap, and a gleaming diamond sparkle.
 */
const CustomCustomerCatalogIcon = ({ size = 22, className = '', isActive = false }) => {
  const activeClass = isActive ? 'mpi-icon-active' : '';

  return (
    <svg
      className={`mpi-icon-base mpi-cust-catalog-icon ${activeClass} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Products Catalog Icon"
    >
      <defs>
        <linearGradient id="mpiCustCatBlueSheet" x1="5" y1="5" x2="27" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <linearGradient id="mpiCustCatGreenSheet" x1="6" y1="9" x2="26" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>

        <linearGradient id="mpiCustCatBoxGrad" x1="4" y1="15" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="mpiCustCatStrapGrad" x1="14" y1="14" x2="18" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiCustCatSparkGrad" x1="22" y1="2" x2="28" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <filter id="mpiCustCatGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Primary Pre-Painted Steel Sheet (Sapphire Blue - Top Layer) */}
      <g className="mpi-cust-cat-sheet-1">
        <path
          d="M5 8.5C5 7.67157 5.67157 7 6.5 7H25.5C26.3284 7 27 7.67157 27 8.5L25.5 12.5C25.5 13.3284 24.8284 14 24 14H8C7.17157 14 6.5 13.3284 6.5 12.5L5 8.5Z"
          fill="url(#mpiCustCatBlueSheet)"
          stroke="#1d4ed8"
          strokeWidth="0.8"
        />
        {/* Trapezoidal Corrugation Ribs */}
        <path d="M9 7.5L8.2 13.5M13 7.5L12.4 13.5M17 7.5L16.6 13.5M21 7.5L20.8 13.5M24.5 7.5L24.8 13.5" stroke="#60a5fa" strokeWidth="0.75" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* Secondary Pre-Painted Steel Sheet (Emerald Green - Mid Layer) */}
      <g className="mpi-cust-cat-sheet-2">
        <path
          d="M6 12C6 11.1716 6.67157 10.5 7.5 10.5H24.5C25.3284 10.5 26 11.1716 26 12L24.8 15.5C24.8 16.3284 24.1284 17 23.3 17H8.7C7.87157 17 7.2 16.3284 7.2 15.5L6 12Z"
          fill="url(#mpiCustCatGreenSheet)"
          stroke="#15803d"
          strokeWidth="0.7"
        />
        {/* Green Profile Highlights */}
        <path d="M10 11L9.5 16M14 11L13.7 16M18 11L17.9 16M22 11L22.1 16" stroke="#86efac" strokeWidth="0.65" strokeLinecap="round" opacity="0.8" />
      </g>

      {/* Heavy-Duty Industrial Package Crate */}
      <rect x="4" y="15.5" width="24" height="12.5" rx="2.5" fill="url(#mpiCustCatBoxGrad)" stroke="#475569" strokeWidth="0.9" />

      {/* Crate Horizontal Reinforcement Ribs */}
      <line x1="4.5" y1="21" x2="27.5" y2="21" stroke="#334155" strokeWidth="1" />
      <circle cx="6.5" cy="18" r="0.6" fill="#94a3b8" />
      <circle cx="25.5" cy="18" r="0.6" fill="#94a3b8" />
      <circle cx="6.5" cy="24" r="0.6" fill="#94a3b8" />
      <circle cx="25.5" cy="24" r="0.6" fill="#94a3b8" />

      {/* Golden Strapping Band */}
      <rect x="14.2" y="15.5" width="3.6" height="12.5" fill="url(#mpiCustCatStrapGrad)" />
      {/* Mega Pacific Security Buckle Tag */}
      <rect x="13.2" y="19" width="5.6" height="4.5" rx="1.2" fill="#fef08a" stroke="#d97706" strokeWidth="0.7" />
      <path d="M14.6 21.2H17.4" stroke="#b45309" strokeWidth="0.7" strokeLinecap="round" />

      {/* Top Right Sparkle Star */}
      <path
        className="mpi-cust-cat-spark"
        d="M25 2.5L25.8 4.2L27.5 5L25.8 5.8L25 7.5L24.2 5.8L22.5 5L24.2 4.2Z"
        fill="url(#mpiCustCatSparkGrad)"
        filter="url(#mpiCustCatGlow)"
      />
    </svg>
  );
};

export default CustomCustomerCatalogIcon;

