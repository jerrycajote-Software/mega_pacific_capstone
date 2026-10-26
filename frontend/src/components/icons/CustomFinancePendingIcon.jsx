import React from 'react';
import './customIcons.css';

/**
 * CustomFinancePendingIcon
 * Full-color animated SVG icon for Finance Pending Payments KPI card.
 * Features an industrial golden chronometer with progress arc,
 * dynamic clock sweep hand, pending verification coin stack,
 * and pulsating amber telemetry alert beacon.
 */
const CustomFinancePendingIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Pending Payments"
    >
      <defs>
        <linearGradient id="mpiFinPendDialGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="40%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        <linearGradient id="mpiFinPendRingGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiFinPendArcGrad" x1="7" y1="7" x2="25" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <linearGradient id="mpiFinPendCoinGrad" x1="18" y1="20" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <filter id="mpiFinPendGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Outer Chronometer Bezel & Dial */}
      <g filter="url(#mpiFinPendGlow)">
        {/* Stopwatch Top Button / Crown */}
        <path d="M 14.5 3 H 17.5 V 5.5 H 14.5 Z" fill="#d97706" rx="0.5" />
        <path d="M 13 2.5 H 19 V 4 H 13 Z" fill="#fbbf24" rx="0.5" />

        {/* Outer Ring */}
        <circle
          cx="16"
          cy="17"
          r="12"
          fill="url(#mpiFinPendDialGrad)"
          stroke="url(#mpiFinPendRingGrad)"
          strokeWidth="1.8"
        />

        {/* Inner Radial Progress Arc (Active verification progress) */}
        <circle
          className="mpi-fin-pend-arc"
          cx="16"
          cy="17"
          r="9.5"
          fill="none"
          stroke="url(#mpiFinPendArcGrad)"
          strokeWidth="2.2"
          strokeDasharray="44 16"
          strokeLinecap="round"
          transform="rotate(-90 16 17)"
        />

        {/* Hour & Minute Index Marks */}
        <line x1="16" y1="8" x2="16" y2="9.5" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" />
        <line x1="25" y1="17" x2="23.5" y2="17" stroke="#fde047" strokeWidth="1" strokeLinecap="round" />
        <line x1="16" y1="26" x2="16" y2="24.5" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
        <line x1="7" y1="17" x2="8.5" y2="17" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Dynamic Sweep Clock Hand */}
      <g className="mpi-fin-pend-hand">
        {/* Hand Body */}
        <line
          x1="16"
          y1="17"
          x2="21.5"
          y2="11.5"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="drop-shadow(0 0 1px #000)"
        />
        {/* Accent Arrow Pointer Tip */}
        <circle cx="21.5" cy="11.5" r="1.3" fill="#fbbf24" />
        {/* Center Pivot Pivot Gem */}
        <circle cx="16" cy="17" r="2.2" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
        <circle cx="16" cy="17" r="0.9" fill="#78350f" />
      </g>

      {/* Escrow Token / Mini Coin Badge at Bottom Corner */}
      <g className="mpi-fin-pend-coin">
        <ellipse cx="23.5" cy="24" rx="4.5" ry="2" fill="#b45309" />
        <ellipse cx="23.5" cy="22.5" rx="4.5" ry="2" fill="url(#mpiFinPendCoinGrad)" stroke="#fef08a" strokeWidth="0.6" />
        <ellipse cx="23.5" cy="22.5" rx="3.3" ry="1.3" fill="none" stroke="#d97706" strokeWidth="0.4" />
      </g>

      {/* Pulsating Amber Telemetry Live Alert Beacon */}
      <g className="mpi-fin-pend-dot">
        <circle cx="7" cy="8" r="2.5" fill="#f59e0b" opacity="0.35" />
        <circle cx="7" cy="8" r="1.5" fill="#fde047" stroke="#ffffff" strokeWidth="0.5" />
      </g>
    </svg>
  );
};

export default CustomFinancePendingIcon;
