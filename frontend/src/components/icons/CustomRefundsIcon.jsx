import React from 'react';
import './customIcons.css';

/**
 * CustomRefundsIcon
 * Clean, colored custom icon for Refunds in Finance layout.
 * Features a circular payment reversal return loop in ocean cyan and teal.
 */
const CustomRefundsIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Refunds Icon"
    >
      {/* Reversal Circular Arc */}
      <path
        d="M19.5 12A7.5 7.5 0 1 1 15.5 5.2"
        stroke="#06b6d4"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Return Arrow Head */}
      <path
        d="M15.5 2V6H19.5"
        stroke="#0891b2"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Centered Currency Reversal Stem */}
      <path
        d="M11.5 9V15.5M11.5 9H13.5C14.6 9 15.2 9.7 15.2 10.6C15.2 11.5 14.6 12.2 13.5 12.2H11.5"
        stroke="#0891b2"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Currency Crossbars */}
      <line
        x1="9.5"
        y1="10.2"
        x2="14.5"
        y2="10.2"
        stroke="#06b6d4"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="9.5"
        y1="11.4"
        x2="14.5"
        y2="11.4"
        stroke="#06b6d4"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CustomRefundsIcon;
