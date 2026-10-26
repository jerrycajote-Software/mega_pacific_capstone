import React from 'react';
import './customIcons.css';

/**
 * CustomOrderPipelineIcon
 * Full-color animated SVG icon for Order Pipeline KPI card.
 * Features an industrial amber chronometer timer gauge with rotating clock hand,
 * active manufacturing pipeline track, and flowing order queue telemetry capsules.
 */
const CustomOrderPipelineIcon = ({ size = 22, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Order Pipeline"
    >
      <defs>
        <linearGradient id="mpiPipeDialGrad" x1="6" y1="5" x2="26" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiPipeTrackGrad" x1="3" y1="26" x2="29" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="mpiPipeNodeGrad" x1="24" y1="23" x2="28" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <filter id="mpiPipeGlowFilter" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Main Chronometer Dial Body */}
      <circle
        cx="16"
        cy="14"
        r="9"
        fill="#1e1810"
        stroke="url(#mpiPipeDialGrad)"
        strokeWidth="2"
        filter="url(#mpiPipeGlowFilter)"
      />

      {/* Dial Ticks */}
      <circle cx="16" cy="7.5" r="0.75" fill="#fef08a" />
      <circle cx="22.5" cy="14" r="0.75" fill="#fef08a" />
      <circle cx="16" cy="20.5" r="0.75" fill="#fef08a" />
      <circle cx="9.5" cy="14" r="0.75" fill="#fef08a" />

      {/* Rotating Clock Hand */}
      <g className="mpi-pipe-clock-hand">
        <line
          x1="16"
          y1="14"
          x2="16"
          y2="8.5"
          stroke="#fef08a"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="14"
          x2="19.5"
          y2="14"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="14" r="1.5" fill="#fde047" />
      </g>

      {/* Bottom Pipeline Conveyor Track */}
      <path
        d="M 4 26 H 28"
        stroke="url(#mpiPipeTrackGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Flowing Pipeline Queue Capsules */}
      <circle
        className="mpi-pipe-flow-dot"
        cx="8"
        cy="26"
        r="2"
        fill="#f59e0b"
      />
      <circle
        className="mpi-pipe-flow-dot"
        cx="16"
        cy="26"
        r="2"
        fill="#fbbf24"
      />
      <circle
        className="mpi-pipe-node"
        cx="25"
        cy="26"
        r="2.5"
        fill="url(#mpiPipeNodeGrad)"
        stroke="#93c5fd"
        strokeWidth="0.8"
      />
    </svg>
  );
};

export default CustomOrderPipelineIcon;
