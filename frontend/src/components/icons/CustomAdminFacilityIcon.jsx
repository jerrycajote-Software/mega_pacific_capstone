import React from 'react';
import './customIcons.css';

/**
 * CustomAdminFacilityIcon
 * Full-color animated SVG icon for Settings "Manufacturing & Operating Facility" card.
 * Features an industrial roofing fabrication plant with sawtooth roofs,
 * active manufacturing chimneys, and rotating metallurgical precision gearwheel.
 */
const CustomAdminFacilityIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Manufacturing Facility"
    >
      <defs>
        <linearGradient id="mpiAdmFacRoofGrad" x1="4" y1="10" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiAdmFacGearGrad" x1="18" y1="17" x2="28" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <filter id="mpiAdmFacGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Chimney Vapor Puffs */}
      <g className="mpi-adm-fac-smoke">
        <circle cx="8" cy="7" r="1.5" fill="#fef08a" opacity="0.6" />
        <circle cx="9" cy="4.5" r="1.8" fill="#fef08a" opacity="0.4" />
      </g>

      {/* Manufacturing Plant Body */}
      <g filter="url(#mpiAdmFacGlow)">
        {/* Left Chimney Stack */}
        <rect x="7" y="9" width="3" height="6" fill="#78350f" />

        {/* Sawtooth Factory Roofline & Facility Facade */}
        <path
          d="M 5 26 L 5 15 L 10 11 L 10 15 L 16 11 L 16 15 L 22 11 L 22 18 L 27 18 L 27 26 Z"
          fill="url(#mpiAdmFacRoofGrad)"
          stroke="#92400e"
          strokeWidth="0.8"
        />

        {/* Factory Windows */}
        <rect x="7.5" y="18" width="2.5" height="4" rx="0.5" fill="#fef08a" opacity="0.85" />
        <rect x="12" y="18" width="2.5" height="4" rx="0.5" fill="#fef08a" opacity="0.85" />
        <rect x="16.5" y="18" width="2.5" height="4" rx="0.5" fill="#fef08a" opacity="0.85" />

        {/* Main Plant Industrial Dispatch Roll-up Door */}
        <rect x="11.5" y="22.5" width="4.5" height="3.5" fill="#451a03" />
        <line x1="11.5" y1="24" x2="16" y2="24" stroke="#d97706" strokeWidth="0.5" />
        <line x1="11.5" y1="25" x2="16" y2="25" stroke="#d97706" strokeWidth="0.5" />
      </g>

      {/* Rotating Precision Gearwheel */}
      <g className="mpi-adm-fac-gear">
        <circle cx="23" cy="22" r="5" fill="url(#mpiAdmFacGearGrad)" stroke="#78350f" strokeWidth="0.8" />
        <circle cx="23" cy="22" r="2" fill="#1e293b" />
        {/* Gear Teeth */}
        <rect x="22" y="16" width="2" height="1.8" rx="0.4" fill="#fde047" />
        <rect x="22" y="26.2" width="2" height="1.8" rx="0.4" fill="#fde047" />
        <rect x="17" y="21" width="1.8" height="2" rx="0.4" fill="#fde047" />
        <rect x="27.2" y="21" width="1.8" height="2" rx="0.4" fill="#fde047" />
      </g>
    </svg>
  );
};

export default CustomAdminFacilityIcon;
