import React from 'react';
import './customIcons.css';

/**
 * CustomLogisticCompletedTodayIcon
 * Full-color animated SVG icon for Logistics Overview "Completed Today" KPI card.
 * Features a dimensional emerald fulfillment rosette seal with beveled triumph checkmark,
 * success fulfillment ribbon, and radiant achievement gleam spark.
 */
const CustomLogisticCompletedTodayIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Completed Today"
    >
      <defs>
        <linearGradient id="mpiLogCompSealGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="mpiLogCompBorderGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="mpiLogCompCheckGrad" x1="9" y1="16" x2="22" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>

        <linearGradient id="mpiLogCompRibbonGrad" x1="8" y1="22" x2="24" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <filter id="mpiLogCompGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Rosette Fulfillment Seal */}
      <g className="mpi-log-comp-seal" filter="url(#mpiLogCompGlow)">
        {/* Scalloped Medallion Outer Points */}
        <path
          d="M 16 3 L 19.5 5.5 L 23.5 5 L 25.5 8.8 L 29.5 10.5 L 29.5 14.8 L 31.5 18 L 29.5 21.2 L 29.5 25.5 L 25.5 27.2 L 23.5 31 L 19.5 30.5 L 16 33 L 12.5 30.5 L 8.5 31 L 6.5 27.2 L 2.5 25.5 L 2.5 21.2 L 0.5 18 L 2.5 14.8 L 2.5 10.5 L 6.5 8.8 L 8.5 5 L 12.5 5.5 Z"
          fill="url(#mpiLogCompSealGrad)"
          opacity="0.25"
          transform="scale(0.85) translate(2.5, 2)"
        />

        {/* Circular Outer Seal Face */}
        <circle
          cx="16"
          cy="16"
          r="12.5"
          fill="url(#mpiLogCompSealGrad)"
          stroke="url(#mpiLogCompBorderGrad)"
          strokeWidth="1.6"
        />

        {/* Inner Concentric Glow Ring */}
        <circle
          cx="16"
          cy="16"
          r="10"
          stroke="#6ee7b7"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          opacity="0.8"
        />

        {/* Dimensional Beveled Bold Checkmark */}
        <path
          className="mpi-log-comp-check"
          d="M 10 16.5 L 14.5 21 L 22.5 11"
          stroke="url(#mpiLogCompCheckGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Achievement Radiant Sparkle Ping */}
      <g className="mpi-log-comp-sparkle">
        <path
          d="M 26 3 L 27 5.5 L 29.5 6.5 L 27 7.5 L 26 10 L 25 7.5 L 22.5 6.5 L 25 5.5 Z"
          fill="#fef08a"
          stroke="#fbbf24"
          strokeWidth="0.5"
        />
        <circle cx="26" cy="6.5" r="0.8" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default CustomLogisticCompletedTodayIcon;
