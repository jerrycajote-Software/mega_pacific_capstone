import React from 'react';
import './customIcons.css';

/**
 * CustomOrdersIcon
 * Clean, colored custom icon for Orders in Sales layout.
 * Features an industrial shopping cart in vibrant emerald green and mint.
 */
const CustomOrdersIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Orders Icon"
    >
      {/* Shopping Cart Carriage Basket */}
      <path
        d="M3 4H5.5L8 15H17.5L20 6.5H6.2"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#10b981"
        fillOpacity="0.18"
      />

      {/* Cart Shelf Line */}
      <line
        x1="7.2"
        y1="10.5"
        x2="18.8"
        y2="10.5"
        stroke="#34d399"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Left Wheel */}
      <circle
        cx="9"
        cy="19"
        r="1.6"
        fill="#059669"
      />

      {/* Right Wheel */}
      <circle
        cx="16.5"
        cy="19"
        r="1.6"
        fill="#059669"
      />

      {/* Verified Check Indicator */}
      <path
        d="M13.5 3.5L15.2 5.2L18.5 2"
        stroke="#059669"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomOrdersIcon;
