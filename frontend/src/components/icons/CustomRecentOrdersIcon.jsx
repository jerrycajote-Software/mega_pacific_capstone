import React from 'react';
import './customIcons.css';

/**
 * CustomRecentOrdersIcon
 * Clean, colored custom icon for Recent Customer Orders in Sales layout.
 * Features an active order ledger clipboard with a glowing real-time clock indicator.
 */
const CustomRecentOrdersIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Recent Orders Icon"
    >
      {/* Clipboard Main Body */}
      <rect
        x="4"
        y="4"
        width="13"
        height="17"
        rx="2.5"
        stroke="#06b6d4"
        strokeWidth="1.8"
        fill="rgba(6, 182, 212, 0.16)"
      />

      {/* Top Clip Tab */}
      <rect
        x="7.5"
        y="2"
        width="6"
        height="3.5"
        rx="1"
        stroke="#0891b2"
        strokeWidth="1.5"
        fill="#e0f2fe"
      />

      {/* Order Entry Rows */}
      <line
        x1="7"
        y1="9"
        x2="13"
        y2="9"
        stroke="#0284c7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="12.5"
        x2="11.5"
        y2="12.5"
        stroke="#0284c7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="16"
        x2="10"
        y2="16"
        stroke="#0284c7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Recent / Live Clock Badge (Bottom Right) */}
      <circle
        cx="17.5"
        cy="16.5"
        r="4.5"
        stroke="#10b981"
        strokeWidth="1.7"
        fill="#ffffff"
      />
      <path
        d="M17.5 14.5V16.5L19 17.5"
        stroke="#10b981"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomRecentOrdersIcon;

