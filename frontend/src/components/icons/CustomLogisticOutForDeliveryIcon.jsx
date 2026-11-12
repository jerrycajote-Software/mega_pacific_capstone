import React from 'react';
import './customIcons.css';

/**
 * CustomLogisticOutForDeliveryIcon
 * Simple, colorful static SVG icon for Logistics Overview "Out for Delivery" KPI card.
 * Features a clean blue delivery freight truck with driver cab and dual wheels.
 */
const CustomLogisticOutForDeliveryIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      role="img"
      aria-label="Out for Delivery"
    >
      {/* Cargo Container */}
      <rect
        x="2.5"
        y="6.5"
        width="11.5"
        height="9.5"
        rx="1.6"
        fill="#3b82f6"
        fillOpacity="0.22"
        stroke="#2563eb"
        strokeWidth="1.7"
      />

      {/* Cargo Panel Lines */}
      <line x1="5" y1="10" x2="11.5" y2="10" stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5" y1="12.5" x2="9.8" y2="12.5" stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round" />

      {/* Driver Cab */}
      <path
        d="M14 9.5H18.2L21.2 12.8V16H14V9.5Z"
        fill="#60a5fa"
        fillOpacity="0.28"
        stroke="#1d4ed8"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* Cab Windshield */}
      <path
        d="M15.6 11H17.8L19.6 13H15.6V11Z"
        fill="#dbeafe"
        stroke="#2563eb"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Headlight Accent */}
      <circle cx="20.2" cy="14.3" r="0.8" fill="#fbbf24" />

      {/* Chassis Connector */}
      <line x1="9" y1="16" x2="15.2" y2="16" stroke="#1d4ed8" strokeWidth="1.7" />

      {/* Rear Wheel */}
      <circle cx="6.8" cy="17.5" r="2.2" fill="#1e3a8a" />
      <circle cx="6.8" cy="17.5" r="0.85" fill="#93c5fd" />

      {/* Front Wheel */}
      <circle cx="17.5" cy="17.5" r="2.2" fill="#1e3a8a" />
      <circle cx="17.5" cy="17.5" r="0.85" fill="#93c5fd" />
    </svg>
  );
};

export default CustomLogisticOutForDeliveryIcon;
