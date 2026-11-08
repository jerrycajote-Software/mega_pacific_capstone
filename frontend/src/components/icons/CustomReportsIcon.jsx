import React from 'react';
import './customIcons.css';

/**
 * CustomReportsIcon
 * Clean, colored custom icon for Reports in Finance layout.
 * Features an analytical financial report sheet in electric indigo with ascending bars.
 */
const CustomReportsIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Reports Icon"
    >
      {/* Financial Document Sheet */}
      <path
        d="M6 3C4.9 3 4 3.9 4 5V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V8L15 3H6Z"
        stroke="#6366f1"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="#6366f1"
        fillOpacity="0.14"
      />

      {/* Folded Top Corner */}
      <path
        d="M14 3V8H19"
        stroke="#4f46e5"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Metric Bar 1 */}
      <rect
        x="7.5"
        y="14"
        width="2"
        height="4"
        rx="0.6"
        fill="#a5b4fc"
      />

      {/* Metric Bar 2 */}
      <rect
        x="11"
        y="11.5"
        width="2"
        height="6.5"
        rx="0.6"
        fill="#818cf8"
      />

      {/* Metric Bar 3 */}
      <rect
        x="14.5"
        y="9"
        width="2"
        height="9"
        rx="0.6"
        fill="#4f46e5"
      />
    </svg>
  );
};

export default CustomReportsIcon;
