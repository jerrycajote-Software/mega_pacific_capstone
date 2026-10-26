import React from 'react';
import './customIcons.css';

/**
 * CustomDashboardIcon
 * Reusable full-color animated dashboard icon for all 5 layout sidebars.
 * Features multi-tile analytics panels, undulating live telemetry bars, and a pulsing status node.
 */
const CustomDashboardIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dashboard Icon"
    >
      <defs>
        <linearGradient id="mpiDashGradPrimary" x1="2" y1="2" x2="15" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="mpiDashGradSecondary" x1="17" y1="2" x2="30" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="mpiDashGradBottom" x1="2" y1="17" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        <linearGradient id="mpiDashGradBar" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <filter id="mpiDashGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Top Left Card - Telemetry Hub */}
      <rect x="2" y="3" width="13" height="11" rx="3" fill="url(#mpiDashGradPrimary)" />
      <circle cx="6.5" cy="7" r="1.8" fill="#ffffff" opacity="0.9" />
      <line x1="6.5" y1="11" x2="12" y2="11" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

      {/* Top Right Card - Live Activity Gauge with Pulsing Dot */}
      <rect x="17" y="3" width="13" height="11" rx="3" fill="url(#mpiDashGradSecondary)" />
      <path d="M19.5 9.5L22 7L24.5 9L27.5 5.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="mpi-dash-pulse-dot" cx="27.5" cy="5.5" r="2" fill="#fef08a" filter="url(#mpiDashGlow)" />

      {/* Bottom Wide Card - Metrics & Animated Undulating Bars */}
      <rect x="2" y="16" width="28" height="13" rx="3.5" fill="url(#mpiDashGradBottom)" opacity="0.95" />
      
      {/* Dynamic Animated Data Bars */}
      <rect className="mpi-dash-bar-1" x="6" y="21" width="3.5" height="5" rx="1.5" fill="#ffffff" opacity="0.9" />
      <rect className="mpi-dash-bar-2" x="11.5" y="18" width="3.5" height="8" rx="1.5" fill="#fef08a" opacity="0.95" />
      <rect className="mpi-dash-bar-3" x="17" y="20" width="3.5" height="6" rx="1.5" fill="#67e8f9" opacity="0.9" />
      
      {/* Metric Status Trend Line */}
      <path d="M22 24.5C24 23 26 21 28 22" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
};

export default CustomDashboardIcon;
