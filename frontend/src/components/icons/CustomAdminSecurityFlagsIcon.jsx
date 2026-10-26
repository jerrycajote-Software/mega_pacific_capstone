import React from 'react';
import './customIcons.css';

/**
 * CustomAdminSecurityFlagsIcon
 * Full-color animated SVG icon for Admin Dashboard "Security Flags" KPI card.
 * Features an amber cyber threat warning beacon with radar perimeter rings,
 * rounded sentinel hazard triangle, and pulsating alert node.
 */
const CustomAdminSecurityFlagsIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Security Flags"
    >
      <defs>
        <linearGradient id="mpiAdmSecTriGrad" x1="6" y1="6" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <linearGradient id="mpiAdmSecBorderGrad" x1="6" y1="6" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>

        <filter id="mpiAdmSecGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Cyber Perimeter Radar Scanning Rings */}
      <circle cx="16" cy="17" r="13" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />

      {/* Threat Hazard Warning Triangle */}
      <g className="mpi-adm-sec-flag" filter="url(#mpiAdmSecGlow)">
        <path
          d="M 14.2 6.5 C 15 5.2 17 5.2 17.8 6.5 L 27.5 23.2 C 28.3 24.6 27.3 26.5 25.7 26.5 L 6.3 26.5 C 4.7 26.5 3.7 24.6 4.5 23.2 Z"
          fill="url(#mpiAdmSecTriGrad)"
          stroke="url(#mpiAdmSecBorderGrad)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Inner Warning Core Sheen */}
        <path
          d="M 16 8.5 L 24.5 23.5 L 7.5 23.5 Z"
          fill="#ffffff"
          opacity="0.15"
        />

        {/* Exclamation Mark Stem and Point */}
        <g className="mpi-adm-sec-exclam">
          <line x1="16" y1="12" x2="16" y2="18.5" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="16" cy="22" r="1.3" fill="#1e293b" />
        </g>
      </g>
    </svg>
  );
};

export default CustomAdminSecurityFlagsIcon;
