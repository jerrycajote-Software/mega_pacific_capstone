import React from 'react';
import './customIcons.css';

/**
 * CustomLogisticReadyToShipIcon
 * Simple, colorful static SVG icon for Logistics Overview "Orders Ready to Ship" KPI card.
 * Features a packed amber shipping parcel with sealing tape.
 */
const CustomLogisticReadyToShipIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      role="img"
      aria-label="Orders Ready to Ship"
    >
      {/* Box Top Lid */}
      <path
        d="M12 3L20 7.2L12 11.4L4 7.2L12 3Z"
        fill="#fbbf24"
        fillOpacity="0.45"
        stroke="#d97706"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* Box Left Face */}
      <path
        d="M4 7.2V16.8L12 21V11.4L4 7.2Z"
        fill="#f59e0b"
        fillOpacity="0.25"
        stroke="#d97706"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* Box Right Shaded Face */}
      <path
        d="M20 7.2V16.8L12 21V11.4L20 7.2Z"
        fill="#d97706"
        fillOpacity="0.14"
        stroke="#b45309"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* Sealing Tape Ribbon */}
      <path
        d="M8.2 5.05L15.8 9.25V12.8"
        stroke="#ea580c"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Shipping Label Lines */}
      <path
        d="M6.2 13.8L9.6 15.6M6.2 16L8.4 17.2"
        stroke="#b45309"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CustomLogisticReadyToShipIcon;
