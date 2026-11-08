import React from 'react';
import './customIcons.css';

/**
 * CustomSettingsIcon
 * Clean, colored custom icon for Settings in Admin layout.
 * Features an industrial precision mechanical gear in steel slate and silver.
 */
const CustomSettingsIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Settings Icon"
    >
      {/* Precision 8-Tooth Industrial Gear */}
      <path
        d="M10.2 3.2L9.6 4.7C9.1 4.9 8.6 5.2 8.2 5.6L6.7 5.1L5.1 6.7L5.6 8.2C5.2 8.6 4.9 9.1 4.7 9.6L3.2 10.2V12.6L4.7 13.2C4.9 13.7 5.2 14.2 5.6 14.6L5.1 16.1L6.7 17.7L8.2 17.2C8.6 17.6 9.1 17.9 9.6 18.1L10.2 19.6H12.6L13.2 18.1C13.7 17.9 14.2 17.6 14.6 17.2L16.1 17.7L17.7 16.1L17.2 14.6C17.6 14.2 17.9 13.7 18.1 13.2L19.6 12.6V10.2L18.1 9.6C17.9 9.1 17.6 8.6 17.2 8.2L17.7 6.7L16.1 5.1L14.6 5.6C14.2 5.2 13.7 4.9 13.2 4.7L12.6 3.2H10.2Z"
        stroke="#64748b"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="#94a3b8"
        fillOpacity="0.22"
      />

      {/* Center Axle Spindle */}
      <circle
        cx="11.4"
        cy="11.4"
        r="3"
        stroke="#475569"
        strokeWidth="1.8"
        fill="#64748b"
        fillOpacity="0.35"
      />
    </svg>
  );
};

export default CustomSettingsIcon;
