import React from 'react';
import './customIcons.css';

/**
 * CustomAdminCustomersIcon
 * Full-color animated SVG icon for Admin Dashboard & User Management "Registered Customers" KPI card.
 * Features an interconnected multi-tier customer directory network, primary executive avatar,
 * and pulsating sapphire telemetry synchronization beacon.
 */
const CustomAdminCustomersIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Registered Customers"
    >
      <defs>
        <linearGradient id="mpiAdmCustMainGrad" x1="10" y1="6" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <linearGradient id="mpiAdmCustSubGrad" x1="4" y1="10" x2="14" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <filter id="mpiAdmCustGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#2563eb" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Flanking Secondary Customer (Left) */}
      <g opacity="0.6">
        <circle cx="9" cy="11" r="3" fill="url(#mpiAdmCustSubGrad)" />
        <path
          d="M 4 23 C 4 19 6.5 16.5 10 16.5 C 11.2 16.5 12.3 17 13 17.8"
          stroke="url(#mpiAdmCustSubGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* Flanking Secondary Customer (Right) */}
      <g opacity="0.6">
        <circle cx="23" cy="11" r="3" fill="url(#mpiAdmCustSubGrad)" />
        <path
          d="M 19 17.8 C 19.7 17 20.8 16.5 22 16.5 C 25.5 16.5 28 19 28 23"
          stroke="url(#mpiAdmCustSubGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* Central Primary Customer Avatar */}
      <g className="mpi-adm-cust-avatar" filter="url(#mpiAdmCustGlow)">
        {/* Head */}
        <circle cx="16" cy="10" r="4.2" fill="url(#mpiAdmCustMainGrad)" stroke="#ffffff" strokeWidth="1" />
        {/* Face Sheen */}
        <path d="M 14.5 8 C 15 7.2 16.5 7.2 17.5 7.8" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
        {/* Torso */}
        <path
          d="M 9.5 24 C 9.5 19.5 12.2 16.8 16 16.8 C 19.8 16.8 22.5 19.5 22.5 24 Z"
          fill="url(#mpiAdmCustMainGrad)"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        {/* Collar Accent */}
        <path d="M 14 17.5 L 16 20.5 L 18 17.5" stroke="#ffffff" strokeWidth="0.8" fill="none" opacity="0.8" />
      </g>

      {/* Directory Synchronization Telemetry Beacon */}
      <g className="mpi-adm-cust-beacon">
        <circle cx="25" cy="7" r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
        <circle cx="25" cy="7" r="1.2" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default CustomAdminCustomersIcon;
