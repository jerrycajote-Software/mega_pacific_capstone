import React from 'react';
import './customIcons.css';

/**
 * CustomAdminVerificationIcon
 * Full-color animated SVG icon for Admin Dashboard "Verification Health" KPI card.
 * Features an emerald cryptographic security verification shield, OTP biometric arcs,
 * and gleaming verified checkmark emblem.
 */
const CustomAdminVerificationIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Verification Health"
    >
      <defs>
        <linearGradient id="mpiAdmVerifShieldGrad" x1="5" y1="4" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="mpiAdmVerifBorderGrad" x1="5" y1="4" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="mpiAdmVerifCheckGrad" x1="10" y1="16" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>

        <filter id="mpiAdmVerifGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Security Biometric Signal Arcs */}
      <path
        d="M 5 12 C 5 7 9 4 16 4 C 23 4 27 7 27 12"
        stroke="#34d399"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        opacity="0.6"
      />

      {/* Main Verification Shield */}
      <g className="mpi-adm-verif-shield" filter="url(#mpiAdmVerifGlow)">
        <path
          d="M 16 5 L 26 8.5 C 26 18.5 21.5 25.5 16 28 C 10.5 25.5 6 18.5 6 8.5 Z"
          fill="url(#mpiAdmVerifShieldGrad)"
          stroke="url(#mpiAdmVerifBorderGrad)"
          strokeWidth="1.5"
        />

        {/* Inner Shield Bevel Accent */}
        <path
          d="M 16 7 L 24 9.8 C 24 17.5 20.5 23.5 16 25.8 Z"
          fill="#ffffff"
          opacity="0.15"
        />

        {/* Verified Bold Checkmark */}
        <path
          className="mpi-adm-verif-check"
          d="M 11 16 L 14.5 20 L 21.5 12.5"
          stroke="url(#mpiAdmVerifCheckGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Sparkling Trust Node */}
      <circle cx="25" cy="8" r="2" fill="#fef08a" />
      <circle cx="25" cy="8" r="0.8" fill="#ffffff" />
    </svg>
  );
};

export default CustomAdminVerificationIcon;
