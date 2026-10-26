import React from 'react';
import './customIcons.css';

/**
 * CustomLogisticsDetailsIcon
 * Full-color animated SVG icon for Quick Logistics Actions "View Details" button.
 * Features a digital logistics dispatch manifest docket with folded corner,
 * itemized order telemetry checklist lines, telemetry scan beam, and emerald verification badge.
 */
const CustomLogisticsDetailsIcon = ({ size = 18, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Dispatch Details"
    >
      <defs>
        <linearGradient id="mpiLogDocGrad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <linearGradient id="mpiLogDocBorderGrad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="mpiLogDocClipGrad" x1="11" y1="2" x2="21" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="mpiLogDocCheckGrad" x1="19" y1="18" x2="25" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <filter id="mpiLogDocGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#22c55e" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Manifest Docket Body */}
      <g className="mpi-log-detail-doc" filter="url(#mpiLogDocGlow)">
        {/* Document Sheet */}
        <path
          d="M 8 4 C 6.9 4 6 4.9 6 6 L 6 26 C 6 27.1 6.9 28 8 28 L 24 28 C 25.1 28 26 27.1 26 26 L 26 11 L 19 4 Z"
          fill="url(#mpiLogDocGrad)"
          stroke="url(#mpiLogDocBorderGrad)"
          strokeWidth="1.2"
        />

        {/* Folded Corner Flap */}
        <path
          d="M 19 4 L 19 10 C 19 10.6 19.4 11 20 11 L 26 11 Z"
          fill="#3b82f6"
          stroke="#60a5fa"
          strokeWidth="0.8"
        />

        {/* Top Metallic Dispatch Clasp */}
        <rect
          x="11"
          y="2.5"
          width="10"
          height="3.5"
          rx="1"
          fill="url(#mpiLogDocClipGrad)"
          stroke="#b45309"
          strokeWidth="0.5"
        />
        <circle cx="16" cy="4.2" r="0.8" fill="#78350f" />

        {/* Itemized Manifest Order Checklist Lines */}
        <line x1="9.5" y1="13" x2="16" y2="13" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="9.5" y1="17" x2="18" y2="17" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="9.5" y1="21" x2="15" y2="21" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="9.5" y1="25" x2="17" y2="25" stroke="#64748b" strokeWidth="0.9" strokeLinecap="round" />

        {/* Horizontal Telemetry Scan Beam */}
        <line
          className="mpi-log-detail-scan"
          x1="8.5"
          y1="15"
          x2="22"
          y2="15"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Verified Order Inspection Checkmark Seal */}
        <g className="mpi-log-detail-check">
          <circle cx="22" cy="22" r="4.5" fill="url(#mpiLogDocCheckGrad)" stroke="#ffffff" strokeWidth="0.8" />
          <path
            d="M 20 22 L 21.5 23.5 L 24 20.5"
            stroke="#ffffff"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
};

export default CustomLogisticsDetailsIcon;
