import React from 'react';
import './customIcons.css';

/**
 * CustomLogisticCompletedTodayIcon
 * Simple, colorful static SVG icon for Logistics Overview "Completed Today" KPI card.
 * Features a crisp emerald verification badge with a centered checkmark.
 */
const CustomLogisticCompletedTodayIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      role="img"
      aria-label="Completed Today"
    >
      {/* Outer Soft Ring */}
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="#10b981"
        fillOpacity="0.18"
        stroke="#10b981"
        strokeWidth="1.6"
      />

      {/* Inner Vibrant Emerald Circle */}
      <circle cx="12" cy="12" r="6.8" fill="#10b981" />

      {/* Crisp Checkmark */}
      <path
        d="M8.8 12.1L11 14.3L15.4 9.7"
        stroke="#ffffff"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomLogisticCompletedTodayIcon;
