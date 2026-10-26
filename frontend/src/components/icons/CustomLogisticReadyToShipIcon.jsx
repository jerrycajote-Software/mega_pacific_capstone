import React from 'react';
import './customIcons.css';

/**
 * CustomLogisticReadyToShipIcon
 * Full-color animated SVG icon for Logistics Overview "Orders Ready to Ship" KPI card.
 * Features an industrial corrugated freight carton with reinforced banding straps,
 * courier dispatch barcode label, and pulsating amber readiness alert beacon.
 */
const CustomLogisticReadyToShipIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Orders Ready to Ship"
    >
      <defs>
        <linearGradient id="mpiLogReadyBoxGrad" x1="6" y1="10" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiLogReadyTopGrad" x1="6" y1="6" x2="26" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="mpiLogReadyStrapGrad" x1="14" y1="6" x2="18" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="mpiLogReadyTapeGrad" x1="6" y1="17" x2="26" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>

        <filter id="mpiLogReadyGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Cargo Box Floating Wrapper */}
      <g className="mpi-log-ready-box" filter="url(#mpiLogReadyGlow)">
        {/* Box Top Lid / Flaps in 3D Isometric View */}
        <polygon
          points="16,5 26,10 16,15 6,10"
          fill="url(#mpiLogReadyTopGrad)"
          stroke="#b45309"
          strokeWidth="0.8"
        />

        {/* Box Front Face */}
        <polygon
          points="6,10 16,15 16,27 6,22"
          fill="url(#mpiLogReadyBoxGrad)"
          stroke="#92400e"
          strokeWidth="0.8"
        />

        {/* Box Right Shaded Face */}
        <polygon
          points="16,15 26,10 26,22 16,27"
          fill="#b45309"
          stroke="#78350f"
          strokeWidth="0.8"
        />

        {/* Vertical Reinforced Security Strapping Band */}
        <polygon
          points="14.5,5.8 17.5,7.3 17.5,27 14.5,25.5"
          fill="url(#mpiLogReadyStrapGrad)"
          opacity="0.9"
        />

        {/* Horizontal Sealing Tape Shimmer */}
        <polygon
          className="mpi-log-ready-tape"
          points="6,15 16,20 16,18 6,13"
          fill="url(#mpiLogReadyTapeGrad)"
          opacity="0.85"
        />

        {/* Courier Dispatch Barcode Label Slip */}
        <rect
          x="8"
          y="16.5"
          width="6"
          height="4.5"
          rx="0.8"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="0.5"
          transform="skewY(24)"
        />
        {/* Barcode Mini Lines */}
        <line x1="9" y1="17.5" x2="9" y2="19.5" stroke="#1e293b" strokeWidth="0.6" transform="skewY(24)" />
        <line x1="10.5" y1="17.5" x2="10.5" y2="19.5" stroke="#1e293b" strokeWidth="0.6" transform="skewY(24)" />
        <line x1="12" y1="17.5" x2="12" y2="19.5" stroke="#1e293b" strokeWidth="0.6" transform="skewY(24)" />

        {/* Outbound Dispatch Arrow */}
        <path
          d="M 16 3 L 16 7 M 13.5 5 L 16 2.5 L 18.5 5"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Action Required Telemetry Amber Alert Beacon */}
      <circle
        className="mpi-log-ready-beacon"
        cx="26"
        cy="7"
        r="3"
        fill="#f59e0b"
        stroke="#ffffff"
        strokeWidth="1"
      />
      <circle
        cx="26"
        cy="7"
        r="1.2"
        fill="#ffffff"
      />
    </svg>
  );
};

export default CustomLogisticReadyToShipIcon;
