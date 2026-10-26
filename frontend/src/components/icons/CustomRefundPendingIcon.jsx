import React from 'react';
import './customIcons.css';

/**
 * CustomRefundPendingIcon
 * Full-color animated SVG icon for Refund Management "Pending Action" KPI card.
 * Features a golden precision hourglass with trickling sand particles,
 * circular payment reversal loop arrow, and pulsating amber alert beacon.
 */
const CustomRefundPendingIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Pending Action"
    >
      <defs>
        <linearGradient id="mpiRefPendGlassGrad" x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiRefPendSandGrad" x1="12" y1="6" x2="20" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="mpiRefPendLoopGrad" x1="4" y1="12" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <filter id="mpiRefPendGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Payment Reversal Return Loop Arc in Background */}
      <path
        className="mpi-ref-pend-loop"
        d="M 6 16 C 6 9.5 11 5 18 5 C 23.5 5 27 8.5 27 13"
        stroke="url(#mpiRefPendLoopGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="2.5 2"
        opacity="0.8"
      />
      {/* Return Arrow Head */}
      <path
        d="M 4 14 L 6 17 L 8.5 14.5"
        stroke="#f59e0b"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main Hourglass Structure */}
      <g className="mpi-ref-pend-glass" filter="url(#mpiRefPendGlow)">
        {/* Top Base Plate */}
        <rect x="9" y="5" width="14" height="2.5" rx="1.2" fill="#d97706" stroke="#fef08a" strokeWidth="0.6" />
        {/* Bottom Base Plate */}
        <rect x="9" y="24.5" width="14" height="2.5" rx="1.2" fill="#d97706" stroke="#fef08a" strokeWidth="0.6" />

        {/* Outer Glass Bulbs */}
        <path
          d="M 10.5 7.5 L 14.5 14.5 C 15.2 15.5 15.2 16.5 14.5 17.5 L 10.5 24.5 H 21.5 L 17.5 17.5 C 16.8 16.5 16.8 15.5 17.5 14.5 L 21.5 7.5 Z"
          fill="rgba(120, 53, 15, 0.25)"
          stroke="url(#mpiRefPendGlassGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Upper Sand Bulb (Draining) */}
        <path
          className="mpi-ref-pend-sand-top"
          d="M 12 9 L 14.8 14 H 17.2 L 20 9 Z"
          fill="url(#mpiRefPendSandGrad)"
        />

        {/* Trickling Center Sand Stream */}
        <line
          className="mpi-ref-pend-stream"
          x1="16"
          y1="14"
          x2="16"
          y2="21"
          stroke="#fef08a"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="2 1.5"
        />

        {/* Lower Sand Bulb (Accumulating Mound) */}
        <path
          className="mpi-ref-pend-sand-bottom"
          d="M 12 24.5 Q 16 19.5 20 24.5 Z"
          fill="url(#mpiRefPendSandGrad)"
        />
      </g>

      {/* Pulsating Amber Alert Beacon */}
      <g className="mpi-ref-pend-beacon">
        <circle cx="25" cy="7" r="2.5" fill="#f59e0b" opacity="0.35" />
        <circle cx="25" cy="7" r="1.4" fill="#fde047" stroke="#ffffff" strokeWidth="0.5" />
      </g>
    </svg>
  );
};

export default CustomRefundPendingIcon;
