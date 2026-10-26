import React from 'react';
import './customIcons.css';

/**
 * CustomAdminStaffIcon
 * Full-color animated SVG icon for Admin Dashboard & User Management "Operational Staff" KPI card.
 * Features an executive departmental security ID pass with lanyard clip,
 * clearance photo frame, and gleaming Singleton 1:1 golden authority star.
 */
const CustomAdminStaffIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Operational Staff"
    >
      <defs>
        <linearGradient id="mpiAdmStaffBadgeGrad" x1="7" y1="8" x2="25" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f772d" />
          <stop offset="50%" stopColor="#3d5c22" />
          <stop offset="100%" stopColor="#1e3a10" />
        </linearGradient>

        <linearGradient id="mpiAdmStaffBorderGrad" x1="7" y1="8" x2="25" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>

        <linearGradient id="mpiAdmStaffLanyardGrad" x1="12" y1="2" x2="20" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="mpiAdmStaffStarGrad" x1="14" y1="18" x2="18" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <filter id="mpiAdmStaffGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#16a34a" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Security Badge Clasp & Ribbon Lanyard */}
      <path d="M 12 2 L 15 7 L 17 7 L 20 2" stroke="url(#mpiAdmStaffLanyardGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="14" y="6.5" width="4" height="2.5" rx="0.8" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.5" />

      {/* Hanging Executive ID Pass */}
      <g className="mpi-adm-staff-badge" filter="url(#mpiAdmStaffGlow)">
        {/* Badge Card */}
        <rect
          x="7.5"
          y="8.5"
          width="17"
          height="21"
          rx="2.5"
          fill="url(#mpiAdmStaffBadgeGrad)"
          stroke="url(#mpiAdmStaffBorderGrad)"
          strokeWidth="1.2"
        />

        {/* Lanyard Hole Slot */}
        <rect x="13.5" y="10" width="5" height="1.5" rx="0.75" fill="#0f172a" opacity="0.6" />

        {/* Staff Portrait Silhouette */}
        <circle cx="16" cy="15.5" r="3" fill="#ffffff" opacity="0.9" />
        <path
          d="M 11.5 22.5 C 11.5 19.8 13.5 19 16 19 C 18.5 19 20.5 19.8 20.5 22.5 Z"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* Singleton 1:1 Authority Golden Star Emblem */}
        <g className="mpi-adm-staff-star">
          <path
            d="M 16 23.5 L 17 25.5 L 19.2 25.8 L 17.6 27.3 L 18 29.5 L 16 28.4 L 14 29.5 L 14.4 27.3 L 12.8 25.8 L 15 25.5 Z"
            fill="url(#mpiAdmStaffStarGrad)"
            stroke="#ffffff"
            strokeWidth="0.5"
          />
        </g>
      </g>
    </svg>
  );
};

export default CustomAdminStaffIcon;
