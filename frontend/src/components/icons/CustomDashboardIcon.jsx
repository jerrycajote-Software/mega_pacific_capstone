import React from 'react';
import './customIcons.css';

/**
 * CustomDashboardIcon
 * Clean, colored custom dashboard icon for all 5 portal layouts.
 * Features a cobalt blue and indigo bento grid with clean metric lines.
 */
const CustomDashboardIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dashboard Icon"
    >
      {/* Top Left Card - Telemetry Hub */}
      <rect
        x="3"
        y="3"
        width="7.5"
        height="9"
        rx="2"
        stroke="#3b82f6"
        strokeWidth="1.8"
        fill="rgba(59, 130, 246, 0.18)"
      />
      <line
        x1="5.5"
        y1="6.5"
        x2="8"
        y2="6.5"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Top Right Card - Status Gauge */}
      <rect
        x="13.5"
        y="3"
        width="7.5"
        height="5.5"
        rx="2"
        stroke="#6366f1"
        strokeWidth="1.8"
        fill="rgba(99, 102, 241, 0.18)"
      />

      {/* Bottom Left Card - Secondary Metric */}
      <rect
        x="3"
        y="15"
        width="7.5"
        height="6"
        rx="2"
        stroke="#6366f1"
        strokeWidth="1.8"
        fill="rgba(99, 102, 241, 0.18)"
      />

      {/* Bottom Right Card - Trend Tracker */}
      <rect
        x="13.5"
        y="11.5"
        width="7.5"
        height="9.5"
        rx="2"
        stroke="#3b82f6"
        strokeWidth="1.8"
        fill="rgba(59, 130, 246, 0.18)"
      />
      <path
        d="M15.5 17L17 15.5L18.5 16.5L20 14.5"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomDashboardIcon;
