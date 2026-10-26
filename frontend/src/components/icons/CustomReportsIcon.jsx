import React from 'react';
import './customIcons.css';

/**
 * CustomReportsIcon
 * Full-color animated icon for Reports in Finance layout.
 * Features an analytical financial chart board, dynamically undulating performance bars,
 * and an upward trending prosperity arrow with glowing apex.
 */
const CustomReportsIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Reports Icon"
    >
      <defs>
        <linearGradient id="mpiReportBoardGrad" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="50%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="mpiReportClipGrad" x1="11" y1="2" x2="21" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        <linearGradient id="mpiReportBar1Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="mpiReportBar2Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <linearGradient id="mpiReportBar3Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      {/* Analytics Clipboard Board */}
      <rect x="4" y="4" width="24" height="24" rx="4" fill="url(#mpiReportBoardGrad)" stroke="#4338ca" strokeWidth="1" />

      {/* Clipboard Top Clip */}
      <rect x="11" y="2" width="10" height="4" rx="1.5" fill="url(#mpiReportClipGrad)" stroke="#64748b" strokeWidth="0.6" />

      {/* Grid Floor Line */}
      <line x1="7" y1="23.5" x2="25" y2="23.5" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />

      {/* Dynamic Animated Metric Bars */}
      <rect className="mpi-report-bar-1" x="8.5" y="16" width="3.5" height="7" rx="1" fill="url(#mpiReportBar1Grad)" />
      <rect className="mpi-report-bar-2" x="14.2" y="12" width="3.5" height="11" rx="1" fill="url(#mpiReportBar2Grad)" />
      <rect className="mpi-report-bar-3" x="20" y="8" width="3.5" height="15" rx="1" fill="url(#mpiReportBar3Grad)" />

      {/* Upward Growth Trendline & Pulsing Arrow */}
      <path
        d="M8.5 17L14.5 13L21.5 7.5"
        stroke="#4ade80"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g className="mpi-report-trend">
        <path
          d="M18.5 6.5H23V11"
          stroke="#4ade80"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="23" cy="6.5" r="1.5" fill="#fef08a" />
      </g>
    </svg>
  );
};

export default CustomReportsIcon;
