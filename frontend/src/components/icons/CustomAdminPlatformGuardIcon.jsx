import React from 'react';
import './customIcons.css';

/**
 * CustomAdminPlatformGuardIcon
 * Full-color animated SVG icon for Settings "Platform Guard Status" card.
 * Features an emerald cybernetic sentinel hub with orbiting WebSocket telemetry nodes
 * and real-time infrastructure network heartbeat.
 */
const CustomAdminPlatformGuardIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Platform Guard Status"
    >
      <defs>
        <linearGradient id="mpiAdmPlatHubGrad" x1="10" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="mpiAdmPlatRingGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <filter id="mpiAdmPlatGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Orbiting Orbital Ring Lines */}
      <circle cx="16" cy="16" r="11" stroke="url(#mpiAdmPlatRingGrad)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

      {/* Orbiting Satellite Telemetry Nodes */}
      <g className="mpi-adm-plat-nodes">
        <circle cx="16" cy="5" r="2.2" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
        <circle cx="27" cy="16" r="2.2" fill="#34d399" stroke="#ffffff" strokeWidth="0.8" />
        <circle cx="16" cy="27" r="2.2" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
        <circle cx="5" cy="16" r="2.2" fill="#34d399" stroke="#ffffff" strokeWidth="0.8" />
      </g>

      {/* Interconnecting Telemetry Spokes */}
      <line x1="16" y1="10" x2="16" y2="6.5" stroke="#34d399" strokeWidth="1.2" />
      <line x1="22" y1="16" x2="25.5" y2="16" stroke="#34d399" strokeWidth="1.2" />
      <line x1="16" y1="22" x2="16" y2="25.5" stroke="#34d399" strokeWidth="1.2" />
      <line x1="10" y1="16" x2="6.5" y2="16" stroke="#34d399" strokeWidth="1.2" />

      {/* Central Cybersecurity Sentinel Core */}
      <g className="mpi-adm-plat-hub" filter="url(#mpiAdmPlatGlow)">
        <polygon
          points="16,9 22.5,12.5 22.5,19.5 16,23 9.5,19.5 9.5,12.5"
          fill="url(#mpiAdmPlatHubGrad)"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        {/* Core Heartbeat Center Node */}
        <circle cx="16" cy="16" r="2.5" fill="#ffffff" />
        <circle cx="16" cy="16" r="1.2" fill="#047857" />
      </g>
    </svg>
  );
};

export default CustomAdminPlatformGuardIcon;
