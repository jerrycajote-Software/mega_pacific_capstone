import React from 'react';
import './customIcons.css';

/**
 * CustomLogisticStorePickupIcon
 * Simple, colorful static SVG icon for Logistics Overview "Store Counter Pickups" KPI card.
 * Features a violet storefront awning, pickup counter, and an amber order parcel.
 */
const CustomLogisticStorePickupIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      role="img"
      aria-label="Store Counter Pickups"
    >
      {/* Storefront Awning Canopy */}
      <path
        d="M4.5 5H19.5L21 9H3L4.5 5Z"
        fill="#8b5cf6"
        fillOpacity="0.32"
        stroke="#7c3aed"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* Awning Stripe Dividers */}
      <line x1="9.5" y1="5" x2="9" y2="9" stroke="#7c3aed" strokeWidth="1.4" />
      <line x1="14.5" y1="5" x2="15" y2="9" stroke="#7c3aed" strokeWidth="1.4" />

      {/* Storefront Pickup Frame */}
      <path
        d="M5 9V19.5H19V9"
        fill="#a78bfa"
        fillOpacity="0.12"
        stroke="#7c3aed"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pickup Parcel on Counter */}
      <rect
        x="8.5"
        y="13"
        width="7"
        height="6.5"
        rx="1"
        fill="#fbbf24"
        fillOpacity="0.48"
        stroke="#d97706"
        strokeWidth="1.6"
      />
      <line x1="12" y1="13" x2="12" y2="15.8" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />

      {/* Counter Ledge */}
      <line x1="3.5" y1="19.5" x2="20.5" y2="19.5" stroke="#6d28d9" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export default CustomLogisticStorePickupIcon;
