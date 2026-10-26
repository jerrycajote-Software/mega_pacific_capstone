import React from 'react';
import './customIcons.css';

/**
 * CustomAdminConcurrencyIcon
 * Full-color animated SVG icon for Settings "Device Concurrency & Login Limits" card.
 * Features an administrative dual-device ecosystem (desktop monitor & smartphone)
 * with real-time biometric synchronization waves and concurrent session counter.
 */
const CustomAdminConcurrencyIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Device Concurrency"
    >
      <defs>
        <linearGradient id="mpiAdmDevMonitorGrad" x1="4" y1="6" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="mpiAdmDevScreenGrad" x1="5" y1="7" x2="21" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id="mpiAdmDevPhoneGrad" x1="19" y1="13" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f772d" />
          <stop offset="100%" stopColor="#1e3a10" />
        </linearGradient>

        <filter id="mpiAdmDevGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0284c7" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Synchronized Wireless Sync Radiation Wave */}
      <g className="mpi-adm-dev-sync">
        <path d="M 23 4 C 26 4 28 6 28 9" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 21 6 C 23 6 25 8 25 10" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Main Desktop Display Screen */}
      <g className="mpi-adm-dev-screen" filter="url(#mpiAdmDevGlow)">
        {/* Monitor Bezel */}
        <rect
          x="4"
          y="6"
          width="18"
          height="13"
          rx="1.5"
          fill="url(#mpiAdmDevMonitorGrad)"
          stroke="#475569"
          strokeWidth="0.8"
        />
        {/* Active Display Panel */}
        <rect x="5.5" y="7.5" width="15" height="10" rx="0.8" fill="url(#mpiAdmDevScreenGrad)" />
        {/* Screen Session Code Line */}
        <line x1="7" y1="10" x2="13" y2="10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <line x1="7" y1="13" x2="16" y2="13" stroke="#e0f2fe" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />

        {/* Monitor Stand Base */}
        <path d="M 11 19 L 10 23 L 16 23 L 15 19 Z" fill="#334155" />
        <rect x="8" y="23" width="10" height="1.5" rx="0.5" fill="#475569" />
      </g>

      {/* Connected Mobile Smartphone Device */}
      <g>
        <rect
          x="19"
          y="13"
          width="9"
          height="14"
          rx="1.8"
          fill="url(#mpiAdmDevPhoneGrad)"
          stroke="#4ade80"
          strokeWidth="0.8"
        />
        {/* Phone Glass Display */}
        <rect x="20.2" y="15" width="6.6" height="10" rx="0.8" fill="#15803d" />
        {/* Home Notch Bar */}
        <line x1="22.5" y1="26" x2="24.5" y2="26" stroke="#86efac" strokeWidth="0.8" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default CustomAdminConcurrencyIcon;
