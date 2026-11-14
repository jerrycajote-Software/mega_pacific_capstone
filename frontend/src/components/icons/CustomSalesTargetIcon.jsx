import React from 'react';
import './customIcons.css';

/* Custom colorful bullseye target icon used for the Sales Target and Owner Sales Quota tabs */
const CustomSalesTargetIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Business Sales Target Icon"
    >
      {/* Outer emerald target ring */}
      <circle
        cx="11.5"
        cy="12.5"
        r="8.5"
        stroke="#10b981"
        strokeWidth="1.8"
        fill="rgba(16, 185, 129, 0.14)"
      />

      {/* Middle sky-blue target ring */}
      <circle
        cx="11.5"
        cy="12.5"
        r="5"
        stroke="#0ea5e9"
        strokeWidth="1.7"
        fill="rgba(14, 165, 233, 0.14)"
      />

      {/* Center amber bullseye */}
      <circle
        cx="11.5"
        cy="12.5"
        r="2"
        fill="#f59e0b"
      />

      {/* Arrow pointing toward the bullseye center */}
      <path
        d="M20.5 3.5L13 11"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5H20.5V7.5"
        stroke="#f59e0b"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomSalesTargetIcon;
