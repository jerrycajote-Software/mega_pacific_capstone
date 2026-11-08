import React from 'react';
import './customIcons.css';

/**
 * CustomPaymentIcon
 * Clean, colored custom icon for Payments in Finance layout.
 * Features an electronic payment card in rich emerald green with a golden EMV chip.
 */
const CustomPaymentIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Payments Icon"
    >
      {/* Payment Card Frame */}
      <rect
        x="2.5"
        y="4.5"
        width="19"
        height="15"
        rx="3"
        stroke="#10b981"
        strokeWidth="1.8"
        fill="#10b981"
        fillOpacity="0.16"
      />

      {/* Card Magnetic Stripe */}
      <line
        x1="2.5"
        y1="8.5"
        x2="21.5"
        y2="8.5"
        stroke="#059669"
        strokeWidth="1.8"
      />

      {/* EMV Microchip in Gold */}
      <rect
        x="5.5"
        y="12"
        width="3.8"
        height="3"
        rx="0.8"
        stroke="#d97706"
        strokeWidth="1.2"
        fill="#fbbf24"
        fillOpacity="0.75"
      />

      {/* Payment Verified Checkmark */}
      <path
        d="M13.8 13.5L15.6 15.3L18.5 12"
        stroke="#059669"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomPaymentIcon;
