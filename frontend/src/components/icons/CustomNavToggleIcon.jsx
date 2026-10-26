import React from 'react';
import './customIcons.css';

/**
 * CustomNavToggleIcon
 * Full-color animated icon for Hide Navigation / Expand Navigation toggle button.
 * Features a miniature sidebar dock panel with glowing navigation rails,
 * and a directional toggle chevron that dynamically animates and flips between
 * expanded and collapsed sidebar states.
 *
 * @param {boolean} isCollapsed - Current collapsed status of the navigation sidebar
 * @param {number} size - Dimension of the icon in pixels
 * @param {string} className - Additional CSS class name
 */
const CustomNavToggleIcon = ({ isCollapsed = false, size = 19, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base mpi-toggle-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={isCollapsed ? 'Expand Navigation' : 'Hide Navigation'}
    >
      <defs>
        {/* Futuristic Gradient for Sidebar Outer Dock Frame */}
        <linearGradient id="mpiToggleFrameGrad" x1="2" y1="3" x2="30" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Gradient for Directional Chevron Arrows */}
        <linearGradient id="mpiToggleArrowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>

        {/* Glow Filter for Arrow and Status Rail */}
        <filter id="mpiToggleGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Dock Panel Boundary */}
      <rect
        x="3"
        y="4"
        width="26"
        height="24"
        rx="6"
        stroke="url(#mpiToggleFrameGrad)"
        strokeWidth="1.8"
        fill="rgba(15, 23, 42, 0.45)"
      />

      {/* Miniature Sidebar Header Partition Rail */}
      <line
        x1="11"
        y1="7"
        x2="11"
        y2="25"
        stroke="url(#mpiToggleFrameGrad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Miniature Sidebar Stacked Item Tabs (Left Column) */}
      <rect x="5.5" y="8" width="3.2" height="2" rx="1" fill="#38bdf8" opacity="0.9" />
      <rect x="5.5" y="12" width="3.2" height="2" rx="1" fill="#22c55e" opacity="0.9" />
      <rect x="5.5" y="16" width="3.2" height="2" rx="1" fill="#fbbf24" opacity="0.8" />
      <rect x="5.5" y="20" width="3.2" height="2" rx="1" fill="#818cf8" opacity="0.85" />

      {/* Dynamic Animated Toggle Arrow System */}
      {isCollapsed ? (
        /* EXPAND NAVIGATION STATE: Chevrons point outward to the right (>>), expanding the sidebar */
        <g className="mpi-toggle-arrow-collapsed" filter="url(#mpiToggleGlow)">
          {/* Primary Chevron */}
          <path
            d="M15 11L20 16L15 21"
            stroke="url(#mpiToggleArrowGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Secondary Trailing Chevron */}
          <path
            d="M20 11L25 16L20 21"
            stroke="#22d3ee"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        </g>
      ) : (
        /* HIDE NAVIGATION STATE: Chevrons point inward to the left (<<), retracting into the dock */
        <g className="mpi-toggle-arrow-expanded" filter="url(#mpiToggleGlow)">
          {/* Primary Inward Chevron */}
          <path
            d="M25 11L20 16L25 21"
            stroke="url(#mpiToggleArrowGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Secondary Trailing Inward Chevron */}
          <path
            d="M20 11L15 16L20 21"
            stroke="#22d3ee"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        </g>
      )}

      {/* Active Power Dot in Corner */}
      <circle
        cx="25"
        cy="7.5"
        r="1.4"
        fill={isCollapsed ? '#f59e0b' : '#22c55e'}
        filter="url(#mpiToggleGlow)"
      />
    </svg>
  );
};

export default CustomNavToggleIcon;
