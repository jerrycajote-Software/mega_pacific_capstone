import React from 'react';
import './customIcons.css';

/**
 * CustomSupportIcon
 * Clean, colored custom icon for Support in Sales layout.
 * Features an ergonomic customer service acoustic headset in warm rose and coral.
 */
const CustomSupportIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Support Icon"
    >
      {/* Headset Arch Band */}
      <path
        d="M4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12"
        stroke="#f43f5e"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left Earcup */}
      <rect
        x="2.5"
        y="11"
        width="3"
        height="6.5"
        rx="1.5"
        stroke="#f43f5e"
        strokeWidth="1.8"
        fill="#fb7185"
        fillOpacity="0.32"
      />

      {/* Right Earcup */}
      <rect
        x="18.5"
        y="11"
        width="3"
        height="6.5"
        rx="1.5"
        stroke="#f43f5e"
        strokeWidth="1.8"
        fill="#fb7185"
        fillOpacity="0.32"
      />

      {/* Microphone Boom */}
      <path
        d="M20 16V17.5C20 19.43 18.43 21 16.5 21H13"
        stroke="#e11d48"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Mic Tip Capsule */}
      <circle
        cx="11.5"
        cy="21"
        r="1.5"
        fill="#e11d48"
      />
    </svg>
  );
};

export default CustomSupportIcon;
