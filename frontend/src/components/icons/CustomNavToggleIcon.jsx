import React from 'react';
import './customIcons.css';

/**
 * CustomNavToggleIcon
 * Clean, colored custom icon for Hide Navigation / Expand Navigation toggle button.
 * Features a modern window frame with a dedicated sidebar panel and directional chevron.
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
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={isCollapsed ? 'Expand Navigation' : 'Hide Navigation'}
    >
      {/* Outer Application Window Frame */}
      <rect
        x="2.5"
        y="3.5"
        width="19"
        height="17"
        rx="3.5"
        stroke="#3b82f6"
        strokeWidth="1.8"
        fill="rgba(59, 130, 246, 0.08)"
      />

      {/* Left Sidebar Partition Line */}
      <line
        x1="8.5"
        y1="3.5"
        x2="8.5"
        y2="20.5"
        stroke="#3b82f6"
        strokeWidth="1.8"
      />

      {/* Sidebar Panel Tint */}
      <path
        d="M2.5 7C2.5 5.067 4.067 3.5 6 3.5H8.5V20.5H6C4.067 20.5 2.5 18.933 2.5 17V7Z"
        fill="rgba(59, 130, 246, 0.22)"
      />

      {/* Directional Toggle Chevron */}
      {isCollapsed ? (
        /* EXPAND: Chevron points right (>) to expand sidebar */
        <path
          d="M13 9.5L16 12L13 14.5"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        /* HIDE: Chevron points left (<) to collapse sidebar */
        <path
          d="M16 9.5L13 12L16 14.5"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

export default CustomNavToggleIcon;
