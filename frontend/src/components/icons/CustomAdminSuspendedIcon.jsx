import React from 'react';
import './customIcons.css';

/**
 * CustomAdminSuspendedIcon
 * Full-color animated SVG icon for User Management "Suspended Accounts" KPI card.
 * Features an isolation security shield with prohibition slash and locked account perimeter ring.
 */
const CustomAdminSuspendedIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Suspended Accounts"
    >
      <defs>
        <linearGradient id="mpiAdmSuspGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>

        <filter id="mpiAdmSuspGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#ef4444" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Account Silhouette in Background */}
      <g opacity="0.35">
        <circle cx="16" cy="11" r="3.5" fill="#ef4444" />
        <path d="M 10 23 C 10 19.5 12.5 17.5 16 17.5 C 19.5 17.5 22 19.5 22 23 Z" fill="#ef4444" />
      </g>

      {/* Prohibition Slash Ring */}
      <g className="mpi-adm-susp-ring" filter="url(#mpiAdmSuspGlow)">
        <circle
          cx="16"
          cy="16"
          r="11.5"
          stroke="url(#mpiAdmSuspGrad)"
          strokeWidth="2.4"
          fill="none"
        />
        <line
          x1="8"
          y1="8"
          x2="24"
          y2="24"
          stroke="url(#mpiAdmSuspGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default CustomAdminSuspendedIcon;
