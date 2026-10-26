import React from 'react';
import './customIcons.css';

/**
 * CustomStaffManagementIcon
 * Full-color animated icon for Staff Management in Admin layout.
 * Features an executive employee access ID pass, pendulum lanyard swing motion,
 * holographic border, and a glittering golden authority star emblem.
 */
const CustomStaffManagementIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Staff Management Icon"
    >
      <defs>
        <linearGradient id="mpiStaffCardGrad" x1="5" y1="8" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        <linearGradient id="mpiStaffHoloBorder" x1="5" y1="8" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        <linearGradient id="mpiStaffStarGrad" x1="19" y1="16" x2="27" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <linearGradient id="mpiStaffClipGrad" x1="13" y1="2" x2="19" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* Static Lanyard Clip Anchor */}
      <rect x="13.5" y="2" width="5" height="4.5" rx="1.5" fill="url(#mpiStaffClipGrad)" stroke="#475569" strokeWidth="0.8" />
      <circle cx="16" cy="4.2" r="1" fill="#0f172a" />

      {/* Swinging Employee Access Badge Card */}
      <g className="mpi-staff-badge">
        {/* Lanyard Ring Connection */}
        <path d="M14.5 6.5C14.5 5.5 17.5 5.5 17.5 6.5V8.5H14.5V6.5Z" fill="#94a3b8" />

        {/* Card Body with Holographic Border */}
        <rect
          x="6"
          y="8.5"
          width="20"
          height="19.5"
          rx="3.5"
          fill="url(#mpiStaffCardGrad)"
          stroke="url(#mpiStaffHoloBorder)"
          strokeWidth="1.2"
        />

        {/* Header Color Band */}
        <rect x="7" y="9.5" width="18" height="4" rx="2" fill="#3b82f6" opacity="0.85" />

        {/* Staff Portrait Silhouette */}
        <circle cx="11.5" cy="17.5" r="2.8" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.6" />
        <path
          d="M8.5 24C8.5 22 10 20.8 11.5 20.8C13 20.8 14.5 22 14.5 24"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Information Data Lines */}
        <line x1="16.5" y1="16.5" x2="23.5" y2="16.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
        <line x1="16.5" y1="19.5" x2="21.5" y2="19.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        <line x1="16.5" y1="22.5" x2="20" y2="22.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

        {/* Gleaming Authority Star Emblem */}
        <g className="mpi-staff-star">
          <circle cx="22.5" cy="22" r="4.2" fill="url(#mpiStaffStarGrad)" stroke="#ffffff" strokeWidth="0.8" />
          <path
            d="M22.5 19.5L23.2 21.2L25 21.3L23.6 22.5L24.1 24.2L22.5 23.2L20.9 24.2L21.4 22.5L20 21.3L21.8 21.2L22.5 19.5Z"
            fill="#ffffff"
          />
        </g>
      </g>
    </svg>
  );
};

export default CustomStaffManagementIcon;
