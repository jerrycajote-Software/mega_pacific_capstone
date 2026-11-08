import React from 'react';
import './customIcons.css';

/**
 * CustomUsersIcon
 * Clean, colored custom icon for Users in Admin layout.
 * Features a dual customer user silhouette in vibrant azure blue and sky.
 */
const CustomUsersIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Users Icon"
    >
      {/* Front User Head */}
      <circle
        cx="9"
        cy="8"
        r="3.2"
        stroke="#2563eb"
        strokeWidth="1.8"
        fill="#38bdf8"
        fillOpacity="0.25"
      />

      {/* Front User Torso */}
      <path
        d="M3.5 19C3.5 15.68 6 13.5 9 13.5C12 13.5 14.5 15.68 14.5 19"
        stroke="#2563eb"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Background User Head */}
      <path
        d="M13.8 5.8C14.3 5.3 15 5 15.8 5C17.5 5 18.8 6.3 18.8 8C18.8 9.3 18 10.3 17 10.8"
        stroke="#0284c7"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Background User Torso */}
      <path
        d="M16.5 14.2C18.8 14.8 20.5 16.6 20.5 19"
        stroke="#0284c7"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default CustomUsersIcon;
