import React from 'react';
import './customIcons.css';

/**
 * CustomDeliveriesIcon
 * Clean, colored custom icon for Deliveries in Logistics layout.
 * Features an industrial freight transport truck in azure blue and sky.
 */
const CustomDeliveriesIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Deliveries Icon"
    >
      {/* Cargo Bed Container */}
      <rect
        x="2.5"
        y="7.5"
        width="11"
        height="8.5"
        rx="1.5"
        stroke="#0284c7"
        strokeWidth="1.8"
        fill="#38bdf8"
        fillOpacity="0.22"
      />

      {/* Driver Cab Contour */}
      <path
        d="M13.5 10H17.5L20.5 13.5V16H13.5V10Z"
        stroke="#0369a1"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Driver Window */}
      <path
        d="M14.2 11.5H17.2L19 13.8H14.2V11.5Z"
        stroke="#0284c7"
        strokeWidth="1.2"
        fill="#38bdf8"
        fillOpacity="0.38"
      />

      {/* Front Chassis Connector */}
      <line
        x1="8.5"
        y1="16"
        x2="15"
        y2="16"
        stroke="#0369a1"
        strokeWidth="1.8"
      />

      {/* Rear Wheel */}
      <circle
        cx="6.5"
        cy="18"
        r="1.8"
        fill="#0369a1"
      />

      {/* Front Wheel */}
      <circle
        cx="17"
        cy="18"
        r="1.8"
        fill="#0369a1"
      />
    </svg>
  );
};

export default CustomDeliveriesIcon;
