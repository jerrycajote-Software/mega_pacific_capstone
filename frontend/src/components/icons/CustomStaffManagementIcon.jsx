import React from 'react';
import './customIcons.css';

/**
 * CustomStaffManagementIcon
 * Clean, colored custom icon for Staff Management in Admin layout.
 * Features an authenticated personnel profile in royal indigo with an emerald badge.
 */
const CustomStaffManagementIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Staff Management Icon"
    >
      {/* Staff User Head */}
      <circle
        cx="10"
        cy="8"
        r="3.2"
        stroke="#6366f1"
        strokeWidth="1.8"
        fill="#818cf8"
        fillOpacity="0.25"
      />

      {/* Staff User Torso */}
      <path
        d="M4.5 19C4.5 15.68 7 13.5 10 13.5C11.6 13.5 13 14.1 14 15.1"
        stroke="#6366f1"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Security Authorization Badge Shield */}
      <path
        d="M17.5 12L21 13.5V16.8C21 19 19.3 20.6 17.5 21.2C15.7 20.6 14 19 14 16.8V13.5L17.5 12Z"
        stroke="#4f46e5"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="#818cf8"
        fillOpacity="0.25"
      />

      {/* Verified Staff Check Inside Shield */}
      <path
        d="M16.2 16.8L17.2 17.8L19 15.6"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomStaffManagementIcon;
